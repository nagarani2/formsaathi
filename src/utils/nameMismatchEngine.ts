import {
  MismatchSeverity,
  NameMismatchAuditItem,
  UploadedApplicantDocument,
} from '../types/scholarship';

function cleanName(raw: string): string {
  return raw
    .replace(/\b(mr|mrs|ms|miss|shri|sri|smt|kum|km|dr)\b\.?/gi, ' ')
    .replace(/[.,/_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function phoneticNormalize(token: string): string {
  return token
    .replace(/ph/g, 'f')
    .replace(/sh/g, 's')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/w/g, 'v')
    .replace(/(.)\1+/g, '$1');
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function stringSimilarity(a: string, b: string): number {
  if (!a && !b) return 100;
  if (!a || !b) return 0;
  if (a === b) return 100;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100));
}

function compareIndianNames(expectedRaw: string, docRaw: string): {
  similarity: number;
  severity: MismatchSeverity;
} {
  const normExpected = cleanName(expectedRaw);
  const normDoc = cleanName(docRaw);

  if (!normExpected || !normDoc) {
    return { severity: 'critical_mismatch', similarity: 0 };
  }

  // Exact match ignoring case/punctuation
  if (normExpected === normDoc) {
    return { severity: 'exact', similarity: 100 };
  }

  // Joined spacing match (e.g., "Naga Rani" vs "Nagarani")
  const joinedExpected = normExpected.replace(/\s+/g, '');
  const joinedDoc = normDoc.replace(/\s+/g, '');
  if (joinedExpected === joinedDoc) {
    return { severity: 'spacing_variation', similarity: 96 };
  }

  const tokensA = normExpected.split(' ');
  const tokensB = normDoc.split(' ');

  // Same tokens re-ordered (e.g., "Kondapuram Nagarani" vs "Nagarani Kondapuram")
  const sortedA = [...tokensA].sort().join(' ');
  const sortedB = [...tokensB].sort().join(' ');
  if (sortedA === sortedB || sortedA.replace(/\s+/g, '') === sortedB.replace(/\s+/g, '')) {
    return { severity: 'initial_or_order', similarity: 92 };
  }

  // Check initial matching (e.g., "K Naga Rani" vs "Kondapuram Naga Rani")
  let matchedCount = 0;
  let hasInitialMatch = false;
  const usedB = new Set<number>();

  for (const tA of tokensA) {
    let bestIdx = -1;
    let bestScore = 0;
    for (let j = 0; j < tokensB.length; j++) {
      if (usedB.has(j)) continue;
      const tB = tokensB[j];
      if (tA === tB) {
        bestIdx = j;
        bestScore = 100;
        break;
      }
      if (
        (tA.length === 1 && tB.startsWith(tA)) ||
        (tB.length === 1 && tA.startsWith(tB))
      ) {
        bestIdx = j;
        bestScore = 88;
        hasInitialMatch = true;
      } else {
        const sim = stringSimilarity(tA, tB);
        if (sim > bestScore && sim >= 75) {
          bestIdx = j;
          bestScore = sim;
        }
      }
    }
    if (bestIdx !== -1) {
      usedB.add(bestIdx);
      matchedCount += bestScore / 100;
    }
  }

  // Also check split-token match inside joined strings (e.g. ["k", "naga", "rani"] vs ["kondapuram", "nagarani"])
  const directSim = stringSimilarity(joinedExpected, joinedDoc);
  const phoneticSim = stringSimilarity(
    phoneticNormalize(joinedExpected),
    phoneticNormalize(joinedDoc)
  );
  const tokenCoverage = Math.round(
    (matchedCount / Math.max(tokensA.length, tokensB.length)) * 100
  );

  // Check if one side is an initial + rest matches joined string
  const restA = tokensA.filter((t) => t.length > 1).join('');
  const restB = tokensB.filter((t) => t.length > 1).join('');
  const hasSingleInitial =
    tokensA.some((t) => t.length === 1) || tokensB.some((t) => t.length === 1);

  if (hasSingleInitial && (restA === restB || stringSimilarity(restA, restB) >= 90)) {
    return {
      severity: 'initial_or_order',
      similarity: Math.max(88, tokenCoverage),
    };
  }

  if (hasInitialMatch && tokenCoverage >= 75) {
    return {
      severity: 'initial_or_order',
      similarity: Math.max(85, tokenCoverage),
    };
  }

  const combinedSim = Math.max(directSim, Math.round((directSim + tokenCoverage) / 2));

  if (combinedSim >= 82 || phoneticSim >= 88) {
    return {
      severity: 'spelling_mismatch',
      similarity: combinedSim,
    };
  }

  return {
    severity: 'critical_mismatch',
    similarity: combinedSim,
  };
}

export function auditDocumentNames(
  baselineName: string,
  documents: UploadedApplicantDocument[]
): NameMismatchAuditItem[] {
  return documents.map((doc) => {
    const { severity, similarity } = compareIndianNames(
      baselineName,
      doc.extractedName
    );

    const metadata: Record<
      MismatchSeverity,
      {
        labelEn: string;
        labelTe: string;
        recEn: string;
        recTe: string;
      }
    > = {
      exact: {
        labelEn: 'Verified Exact Match',
        labelTe: 'ఖచ్చితంగా సరిపోలింది',
        recEn: 'No correction needed. Ready for portal e-KYC.',
        recTe: 'సవరణ అవసరం లేదు. పోర్టల్ e-KYCకు సిద్ధంగా ఉంది.',
      },
      spacing_variation: {
        labelEn: 'Spacing / Split-Name Variation',
        labelTe: 'స్పేస్ / పేరు విభజన వ్యత్యాసం',
        recEn:
          'Automated portals may flag split spaces (e.g., "Naga Rani" vs "Nagarani"). Verify Aadhaar matches SSC memo spacing.',
        recTe:
          'పోర్టల్ ఆటో-చెక్‌లో స్పేస్ వ్యత్యాసం (ఉదా: "Naga Rani" vs "Nagarani") అభ్యంతరం రావచ్చు. ఆధార్ & 10వ మెమోలో ఒకేలా ఉండేలా చూడండి.',
      },
      initial_or_order: {
        labelEn: 'Initial / Name Order Difference',
        labelTe: 'ఇనిషియల్ / పేరు క్రమం వ్యత్యాసం',
        recEn:
          'Expand surname initials to match Aadhaar/Bank passbook, or keep a "One and Same Person" self-declaration/affidavit ready.',
        recTe:
          'ఇనిషియల్స్ బదులు పూర్తి ఇంటిపేరు ఆధార్/బ్యాంక్‌తో సరిపోయేలా ఉంచండి లేదా "One and Same Person" అఫిడవిట్ సిద్ధం చేసుకోండి.',
      },
      spelling_mismatch: {
        labelEn: 'Spelling Discrepancy Detected',
        labelTe: 'అక్షర దోష వ్యత్యాసం గుర్తించబడింది',
        recEn:
          'Minor spelling difference can cause DBT/e-KYC rejection. Apply for correction at MeeSeva / Aadhaar Kendra before submission.',
        recTe:
          'చిన్న అక్షర దోషం వల్ల DBT/e-KYC తిరస్కరించబడవచ్చు. దరఖాస్తుకు ముందు మీసేవ / ఆధార్ కేంద్రంలో సవరణ చేయించండి.',
      },
      critical_mismatch: {
        labelEn: 'Critical Name Mismatch',
        labelTe: 'తీవ్రమైన పేరు వ్యత్యాసం',
        recEn:
          'High rejection risk. Correct the document name against SSC Memo & Aadhaar or attach a Gazette / Magistrate Affidavit.',
        recTe:
          'దరఖాస్తు తిరస్కరణకు అధిక అవకాశం ఉంది. SSC మెమో & ఆధార్ ప్రకారం పేరును మార్చండి లేదా గెజిట్/నోటరీ అఫిడవిట్ జతచేయండి.',
      },
    };

    const info = metadata[severity];

    return {
      docId: doc.id,
      docType: doc.docType,
      docTypeTe: doc.docTypeTe,
      fileName: doc.fileName,
      isSampleDocument: doc.isSampleDocument,
      expectedName: baselineName,
      extractedName: doc.extractedName,
      similarityScore: similarity,
      severity,
      statusLabelEn: info.labelEn,
      statusLabelTe: info.labelTe,
      recommendationEn: info.recEn,
      recommendationTe: info.recTe,
    };
  });
}
