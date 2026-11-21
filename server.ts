import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { extractText } from 'unpdf';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'GEMINI_API_KEY is not configured. Add a valid key in Settings > Secrets.'
    ) as Error & { statusCode?: number };
    err.statusCode = 400;
    throw err;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function handleApiError(res: express.Response, error: unknown) {
  console.error('[FormSaathi API Error]', error);
  const errObj = error as { status?: number; statusCode?: number; message?: string };
  const status = errObj?.statusCode || errObj?.status || 500;
  const message =
    errObj?.message || 'An unexpected server error occurred while processing the request.';
  res.status(status >= 400 && status < 600 ? status : 500).json({
    error: message,
  });
}

// 1. Extract raw text from uploaded PDF file
app.post('/api/extract-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const isPdf =
      req.file.mimetype === 'application/pdf' ||
      req.file.originalname.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return res.status(400).json({ error: 'Please upload a valid .pdf file.' });
    }

    const uint8Array = new Uint8Array(req.file.buffer);
    let extractedText = '';
    let pageCount = 1;
    let extractionMethod: 'pdf-text' | 'gemini-ocr' = 'pdf-text';

    try {
      const result = await extractText(uint8Array, { mergePages: true });
      extractedText = (result.text || '').trim();
      pageCount = result.totalPages || 1;
    } catch (pdfErr) {
      console.warn('[unpdf] Direct PDF text extraction warning:', pdfErr);
    }

    // If PDF appears to be scanned / image-based (very little text), try Gemini PDF OCR
    if (extractedText.length < 80) {
      const ai = getGeminiClient();
      const ocrResponse = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: req.file.buffer.toString('base64'),
              },
            },
            {
              text: 'Extract all readable text accurately from this Indian scholarship or government scheme notification PDF. Preserve headings, eligibility rules, income limits, document lists, and dates verbatim.',
            },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
      extractedText = (ocrResponse.text || '').trim();
      extractionMethod = 'gemini-ocr';
    }

    if (!extractedText) {
      return res.status(422).json({
        error:
          'Could not extract readable text from this PDF. Please verify the file is not corrupted or password-protected.',
      });
    }

    return res.json({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      pageCount,
      extractedText,
      extractionMethod,
    });
  } catch (error) {
    return handleApiError(res, error);
  }
});

// 2. Analyze extracted notification text into structured bilingual criteria, documents, and deadlines
app.post('/api/analyze-notification', async (req, res) => {
  try {
    const { text, fileName } = req.body as { text?: string; fileName?: string };
    if (!text || typeof text !== 'string' || text.trim().length < 30) {
      return res
        .status(400)
        .json({ error: 'Extracted notification text is too short or missing.' });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Analyze the following Indian scholarship or government scheme notification text and extract structured information in both English and Telugu (te).

For categories, normalize common Indian categories when mentioned (e.g., "SC", "ST", "BC", "OBC", "EBC", "EWS", "OC", "Minority", "Kapu", "All").
For educationLevels, normalize from: ["Pre-Matric (Class 9-10)", "Post-Matric (Class 11-12 / ITI / Polytechnic)", "Undergraduate", "Postgraduate", "PhD / Research", "All"] where applicable.
For states, use standard Indian state names (e.g., "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", or "All India" if nationwide).
For maxFamilyIncomeInr, extract numeric annual INR integer (e.g., 250000 for Rs. 2.50 Lakhs), or null if not stated.
For minPercentage, extract numeric percentage (e.g., 75 or 60), or null if not stated.
For minAttendancePercent, extract numeric attendance percentage (e.g., 75), or null if not stated.
Provide natural, accurate Telugu translations (*Te fields) for scheme name, authority, summary, rules, document names/notes/issuing offices, and deadline labels.

NOTIFICATION TEXT (${fileName || 'uploaded-notification.pdf'}):
"""
${text.slice(0, 32000)}
"""`,
      config: {
        systemInstruction:
          'You are an expert Indian government scholarship & welfare scheme analyst fluent in English and Telugu. Extract only verifiable facts from the notification text without inventing deadlines or income limits not supported by the text.',
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schemeName: { type: Type.STRING },
            schemeNameTe: { type: Type.STRING },
            issuingAuthority: { type: Type.STRING },
            issuingAuthorityTe: { type: Type.STRING },
            academicYear: { type: Type.STRING },
            benefitAmount: { type: Type.STRING },
            benefitAmountTe: { type: Type.STRING },
            officialPortalUrl: { type: Type.STRING },
            summary: { type: Type.STRING },
            summaryTe: { type: Type.STRING },
            eligibilityCriteria: {
              type: Type.OBJECT,
              properties: {
                maxFamilyIncomeInr: { type: Type.NUMBER, nullable: true },
                minPercentage: { type: Type.NUMBER, nullable: true },
                allowedCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
                allowedStates: { type: Type.ARRAY, items: { type: Type.STRING } },
                educationLevels: { type: Type.ARRAY, items: { type: Type.STRING } },
                genderRequirement: { type: Type.STRING },
                ageMin: { type: Type.NUMBER, nullable: true },
                ageMax: { type: Type.NUMBER, nullable: true },
                minAttendancePercent: { type: Type.NUMBER, nullable: true },
                domicileRequired: { type: Type.BOOLEAN },
                aadhaarSeedingRequired: { type: Type.BOOLEAN },
                otherRules: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      titleTe: { type: Type.STRING },
                      description: { type: Type.STRING },
                      descriptionTe: { type: Type.STRING },
                    },
                    required: ['id', 'title', 'titleTe', 'description', 'descriptionTe'],
                  },
                },
              },
              required: [
                'allowedCategories',
                'allowedStates',
                'educationLevels',
                'genderRequirement',
                'domicileRequired',
                'aadhaarSeedingRequired',
                'otherRules',
              ],
            },
            requiredDocuments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  nameTe: { type: Type.STRING },
                  mandatory: { type: Type.BOOLEAN },
                  category: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  notesTe: { type: Type.STRING },
                  issuingOffice: { type: Type.STRING },
                  issuingOfficeTe: { type: Type.STRING },
                },
                required: [
                  'id',
                  'name',
                  'nameTe',
                  'mandatory',
                  'category',
                  'notes',
                  'notesTe',
                  'issuingOffice',
                  'issuingOfficeTe',
                ],
              },
            },
            deadlines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  labelTe: { type: Type.STRING },
                  dateText: { type: Type.STRING },
                  isoDate: { type: Type.STRING, nullable: true },
                  isUrgent: { type: Type.BOOLEAN },
                },
                required: ['id', 'label', 'labelTe', 'dateText', 'isUrgent'],
              },
            },
          },
          required: [
            'schemeName',
            'schemeNameTe',
            'issuingAuthority',
            'issuingAuthorityTe',
            'academicYear',
            'benefitAmount',
            'benefitAmountTe',
            'officialPortalUrl',
            'summary',
            'summaryTe',
            'eligibilityCriteria',
            'requiredDocuments',
            'deadlines',
          ],
        },
      },
    });

    const rawJson = (response.text || '{}').trim();
    const parsed = JSON.parse(rawJson);

    return res.json(parsed);
  } catch (error) {
    return handleApiError(res, error);
  }
});

// 3. Extract holder name & document metadata from an uploaded supporting document (PDF, Image, or TXT)
app.post('/api/extract-document-info', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded.' });
    }

    const mime = req.file.mimetype;
    const lowerName = req.file.originalname.toLowerCase();

    let rawText = '';
    if (mime === 'text/plain' || lowerName.endsWith('.txt')) {
      rawText = req.file.buffer.toString('utf-8');
    } else if (mime === 'application/pdf' || lowerName.endsWith('.pdf')) {
      try {
        const resPdf = await extractText(new Uint8Array(req.file.buffer), {
          mergePages: true,
        });
        rawText = (resPdf.text || '').trim();
      } catch {
        rawText = '';
      }
    }

    // If we have plain text, try Gemini structured extraction or fallback to pattern parsing if image/PDF
    const ai = getGeminiClient();

    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    if (rawText.length >= 15) {
      parts.push({
        text: `Extract the document type, applicant/holder full name exactly as printed on the document, and father/guardian name (if shown) from this Indian certificate/ID text:\n\n${rawText.slice(0, 8000)}`,
      });
    } else if (
      mime.startsWith('image/') ||
      mime === 'application/pdf' ||
      lowerName.endsWith('.pdf')
    ) {
      parts.push({
        inlineData: {
          mimeType: mime === 'application/octet-stream' ? 'application/pdf' : mime,
          data: req.file.buffer.toString('base64'),
        },
      });
      parts.push({
        text: 'Read this Indian identity or scholarship supporting document (Aadhaar, SSC Memo, Income Certificate, Caste Certificate, Bank Passbook, etc.) and extract the document type, holder full name EXACTLY as spelled/cased on the document, and father/guardian name if visible.',
      });
    } else {
      return res.status(400).json({
        error: 'Unsupported document format. Please upload PDF, PNG, JPG, or TXT.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: { type: Type.STRING },
            documentTypeTe: { type: Type.STRING },
            extractedName: { type: Type.STRING },
            guardianName: { type: Type.STRING },
            rawSnippet: { type: Type.STRING },
          },
          required: ['documentType', 'documentTypeTe', 'extractedName'],
        },
      },
    });

    const data = JSON.parse((response.text || '{}').trim());
    return res.json({
      fileName: req.file.originalname,
      ...data,
    });
  } catch (error) {
    return handleApiError(res, error);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FormSaathi server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
