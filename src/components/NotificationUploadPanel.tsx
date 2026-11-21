import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ArrowRight,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Language, ScholarshipAnalysis } from '../types/scholarship';
import { t } from '../i18n/translations';
import {
  SAMPLE_SCHOLARSHIPS,
  downloadSampleNotificationPdf,
} from '../data/sampleScholarships';

interface NotificationUploadPanelProps {
  lang: Language;
  scholarship: ScholarshipAnalysis;
  onUpdateScholarship: (s: ScholarshipAnalysis) => void;
  onNextStep: () => void;
}

export const NotificationUploadPanel: React.FC<NotificationUploadPanelProps> = ({
  lang,
  scholarship,
  onUpdateScholarship,
  onNextStep,
}) => {
  const copy = t(lang);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStage, setUploadStage] = useState<'idle' | 'extracting' | 'analyzing'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const analyzeExtractedText = async (
    extractedText: string,
    fileName: string,
    pageCount: number,
    extractionMethod: 'pdf-text' | 'gemini-ocr'
  ) => {
    setUploadStage('analyzing');
    const analyzeRes = await fetch('/api/analyze-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: extractedText, fileName }),
    });

    const analyzed = await analyzeRes.json();
    if (!analyzeRes.ok) {
      throw new Error(analyzed.error || 'Failed to analyze scholarship notification.');
    }

    const updated: ScholarshipAnalysis = {
      id: `uploaded-${Date.now()}`,
      isSampleData: false,
      sourceFileName: fileName,
      schemeName: analyzed.schemeName || fileName,
      schemeNameTe: analyzed.schemeNameTe || analyzed.schemeName || fileName,
      issuingAuthority: analyzed.issuingAuthority || 'Not specified',
      issuingAuthorityTe:
        analyzed.issuingAuthorityTe || analyzed.issuingAuthority || 'పేర్కొనబడలేదు',
      academicYear: analyzed.academicYear || '2026–2027',
      benefitAmount: analyzed.benefitAmount || 'See notification',
      benefitAmountTe:
        analyzed.benefitAmountTe || analyzed.benefitAmount || 'నోటిఫికేషన్ చూడండి',
      officialPortalUrl: analyzed.officialPortalUrl || '',
      summary: analyzed.summary || '',
      summaryTe: analyzed.summaryTe || analyzed.summary || '',
      extractedText,
      pageCount,
      extractionMethod,
      eligibilityCriteria: analyzed.eligibilityCriteria,
      requiredDocuments: analyzed.requiredDocuments || [],
      deadlines: analyzed.deadlines || [],
    };

    onUpdateScholarship(updated);
    setSuccessMsg(copy.uploadSection.analyzeSuccess);
  };

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      setErrorMsg(
        lang === 'te'
          ? 'దయచేసి చెల్లుబాటు అయ్యే .pdf ఫైల్‌ను మాత్రమే అప్‌లోడ్ చేయండి.'
          : 'Please upload a valid .pdf file.'
      );
      return;
    }

    try {
      setUploadStage('extracting');
      const formData = new FormData();
      formData.append('file', file);

      const extractRes = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });
      const extractData = await extractRes.json();

      if (!extractRes.ok) {
        throw new Error(extractData.error || 'PDF text extraction failed.');
      }

      // Immediately reflect extracted PDF text even before AI structuring finishes
      onUpdateScholarship({
        ...scholarship,
        id: `extracting-${Date.now()}`,
        isSampleData: false,
        sourceFileName: extractData.fileName,
        extractedText: extractData.extractedText,
        pageCount: extractData.pageCount,
        extractionMethod: extractData.extractionMethod,
      });
      setShowRawText(true);

      await analyzeExtractedText(
        extractData.extractedText,
        extractData.fileName,
        extractData.pageCount,
        extractData.extractionMethod
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to process the uploaded PDF notification.'
      );
    } finally {
      setUploadStage('idle');
    }
  };

  const handleReAnalyze = async () => {
    if (!scholarship.extractedText) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await analyzeExtractedText(
        scholarship.extractedText,
        scholarship.sourceFileName,
        scholarship.pageCount,
        scholarship.extractionMethod === 'gemini-ocr' ? 'gemini-ocr' : 'pdf-text'
      );
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Failed to re-run analysis.'
      );
    } finally {
      setUploadStage('idle');
    }
  };

  const handleCopyRaw = async () => {
    await navigator.clipboard.writeText(scholarship.extractedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 1800);
  };

  const schemeTitle =
    lang === 'te' ? scholarship.schemeNameTe || scholarship.schemeName : scholarship.schemeName;
  const authorityTitle =
    lang === 'te'
      ? scholarship.issuingAuthorityTe || scholarship.issuingAuthority
      : scholarship.issuingAuthority;
  const benefitText =
    lang === 'te'
      ? scholarship.benefitAmountTe || scholarship.benefitAmount
      : scholarship.benefitAmount;
  const summaryText =
    lang === 'te' ? scholarship.summaryTe || scholarship.summary : scholarship.summary;

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {copy.uploadSection.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
            {copy.uploadSection.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{copy.uploadSection.continueBtn}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) handleFileProcess(dropped);
        }}
        className={`rounded-xl border-2 border-dashed p-6 sm:p-8 transition-colors bg-white ${
          isDragging
            ? 'border-blue-600 bg-blue-50/50'
            : 'border-slate-300 hover:border-blue-400'
        }`}
      >
        <div className="flex flex-col items-center text-center max-w-xl mx-auto">
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-3">
            {uploadStage === 'idle' ? (
              <Upload className="h-6 w-6" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
          </div>

          <h2 className="text-base font-semibold text-slate-900">
            {uploadStage === 'extracting'
              ? copy.uploadSection.extracting
              : uploadStage === 'analyzing'
                ? copy.uploadSection.analyzing
                : copy.uploadSection.dropTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{copy.uploadSection.dropHint}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileProcess(file);
              e.target.value = '';
            }}
          />

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={uploadStage !== 'idle'}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap cursor-pointer"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>{copy.uploadSection.browseBtn}</span>
            </button>

            {!scholarship.isSampleData && scholarship.extractedText && (
              <button
                type="button"
                disabled={uploadStage !== 'idle'}
                onClick={handleReAnalyze}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 transition-colors whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 shrink-0" />
                <span>{copy.uploadSection.reAnalyzeBtn}</span>
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2.5">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Sample Scholarship Datasets */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">
            {copy.uploadSection.sampleHeading}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {copy.uploadSection.sampleSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_SCHOLARSHIPS.map((sample) => {
            const isSelected = scholarship.id === sample.id;
            return (
              <div
                key={sample.id}
                className={`rounded-lg border p-4 flex flex-col justify-between transition-colors ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40'
                    : 'border-slate-200 bg-slate-50/40 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
                    <span className="font-mono">Sample Data</span>
                    {isSelected && (
                      <span className="font-semibold text-blue-700">
                        {copy.uploadSection.activeSampleTag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {lang === 'te' ? sample.schemeNameTe : sample.schemeName}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">
                    {lang === 'te' ? sample.issuingAuthorityTe : sample.issuingAuthority}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateScholarship(sample);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-blue-700 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {copy.uploadSection.loadSampleBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSampleNotificationPdf(sample)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap cursor-pointer"
                    title={copy.uploadSection.downloadSamplePdfBtn}
                  >
                    <Download className="h-3.5 w-3.5 shrink-0" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Extracted Raw PDF Text Drawer */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/60">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {copy.uploadSection.rawTextTitle}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
              <span>{scholarship.sourceFileName}</span>
              <span aria-hidden="true">·</span>
              <span>
                {scholarship.pageCount} {copy.uploadSection.pagesLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {scholarship.extractedText.length.toLocaleString()} {copy.uploadSection.charsLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {copy.uploadSection.methodLabel}: {scholarship.extractionMethod}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyRaw}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {copiedText ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>
                {copiedText ? copy.uploadSection.copied : copy.uploadSection.copyText}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowRawText((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
            >
              <span>
                {showRawText ? copy.uploadSection.hideRawText : copy.uploadSection.showRawText}
              </span>
              {showRawText ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {showRawText && (
          <pre className="p-5 text-xs font-mono text-slate-700 bg-slate-50 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {scholarship.extractedText}
          </pre>
        )}
      </section>

      {/* Structured Overview Grid */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-700">
              {copy.uploadSection.extractedSummaryTitle}
            </span>
            {scholarship.isSampleData && (
              <span className="text-xs font-medium text-amber-700">
                {copy.banners.sampleDataBadge}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{schemeTitle}</h2>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">{summaryText}</p>

          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-sm">
            <div>
              <dt className="text-xs text-slate-500">{copy.uploadSection.authorityLabel}</dt>
              <dd className="mt-0.5 font-medium text-slate-900">{authorityTitle}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.uploadSection.yearLabel}</dt>
              <dd className="mt-0.5 font-mono font-medium text-slate-900 tabular-nums">
                {scholarship.academicYear}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.uploadSection.benefitLabel}</dt>
              <dd className="mt-0.5 font-medium text-blue-800">{benefitText}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.uploadSection.portalLabel}</dt>
              <dd className="mt-0.5 font-mono text-xs text-slate-700 truncate">
                {scholarship.officialPortalUrl || copy.uploadSection.noLimit}
              </dd>
            </div>
          </dl>
        </div>

        {/* Criteria + Deadlines Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Extracted Criteria */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              {copy.uploadSection.criteriaHeading}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-xs text-slate-500">{copy.uploadSection.incomeLimit}</div>
                <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                  {scholarship.eligibilityCriteria.maxFamilyIncomeInr
                    ? `≤ ₹${scholarship.eligibilityCriteria.maxFamilyIncomeInr.toLocaleString('en-IN')}`
                    : copy.uploadSection.noLimit}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-xs text-slate-500">{copy.uploadSection.minMarks}</div>
                <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                  {scholarship.eligibilityCriteria.minPercentage !== null
                    ? `≥ ${scholarship.eligibilityCriteria.minPercentage}%`
                    : copy.uploadSection.noLimit}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-xs text-slate-500">{copy.uploadSection.categories}</div>
                <div className="mt-0.5 font-medium text-slate-900">
                  {scholarship.eligibilityCriteria.allowedCategories.join(', ') || 'All'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-xs text-slate-500">{copy.uploadSection.states}</div>
                <div className="mt-0.5 font-medium text-slate-900">
                  {scholarship.eligibilityCriteria.allowedStates.join(', ') || 'All India'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-xs text-slate-500">{copy.uploadSection.education}</div>
                <div className="mt-0.5 font-medium text-slate-900">
                  {scholarship.eligibilityCriteria.educationLevels.join(', ') || 'All'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                <div className="text-xs text-slate-500">{copy.uploadSection.attendance}</div>
                <div className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                  {scholarship.eligibilityCriteria.minAttendancePercent !== null
                    ? `≥ ${scholarship.eligibilityCriteria.minAttendancePercent}%`
                    : copy.uploadSection.noLimit}
                </div>
              </div>
            </div>

            {scholarship.eligibilityCriteria.otherRules.length > 0 && (
              <div className="mt-4 space-y-2">
                {scholarship.eligibilityCriteria.otherRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs text-slate-700"
                  >
                    <span className="font-semibold text-slate-900">
                      {lang === 'te' ? rule.titleTe || rule.title : rule.title}:{' '}
                    </span>
                    <span>
                      {lang === 'te'
                        ? rule.descriptionTe || rule.description
                        : rule.description}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deadlines */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              {copy.uploadSection.deadlinesHeading}
            </h3>
            <div className="space-y-3">
              {scholarship.deadlines.map((dl) => (
                <div
                  key={dl.id}
                  className={`rounded-lg border p-3.5 ${
                    dl.isUrgent
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1">
                    <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-slate-900 tabular-nums">
                      <Calendar className="h-3.5 w-3.5 text-blue-700" />
                      {dl.dateText}
                    </span>
                    {dl.isUrgent && (
                      <span className="font-semibold text-amber-800">
                        {copy.uploadSection.urgent}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700">
                    {lang === 'te' ? dl.labelTe || dl.label : dl.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extracted Required Documents Summary */}
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            {copy.uploadSection.documentsHeading} ({scholarship.requiredDocuments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {scholarship.requiredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {lang === 'te' ? doc.nameTe || doc.name : doc.name}
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {lang === 'te' ? doc.notesTe || doc.notes : doc.notes}
                  </div>
                </div>
                <span
                  className={`shrink-0 font-semibold ${
                    doc.mandatory ? 'text-blue-700' : 'text-slate-500'
                  }`}
                >
                  {doc.mandatory
                    ? copy.uploadSection.mandatory
                    : copy.uploadSection.optional}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
