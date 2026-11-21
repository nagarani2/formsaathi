import { useMemo, useRef, useState } from 'react';
import { Database, Info } from 'lucide-react';
import {
  ApplicantProfile,
  DocumentChecklistState,
  Language,
  ScholarshipAnalysis,
  UploadedApplicantDocument,
} from './types/scholarship';
import {
  SAMPLE_APPLICANT_ELIGIBLE,
  SAMPLE_SCHOLARSHIPS,
  SAMPLE_UPLOADED_DOCUMENTS,
} from './data/sampleScholarships';
import { evaluateEligibility } from './utils/eligibilityEngine';
import { auditDocumentNames } from './utils/nameMismatchEngine';
import { generateReadinessPdf } from './utils/pdfReportGenerator';
import { t } from './i18n/translations';
import { Sidebar, WorkspaceStep } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { NotificationUploadPanel } from './components/NotificationUploadPanel';
import { ApplicantFormPanel } from './components/ApplicantFormPanel';
import { EligibilityChecklistPanel } from './components/EligibilityChecklistPanel';
import { NameMismatchPanel } from './components/NameMismatchPanel';
import { ReadinessReportPanel } from './components/ReadinessReportPanel';
import { PdfReportTemplate } from './components/PdfReportTemplate';

function buildInitialChecklist(scheme: ScholarshipAnalysis): DocumentChecklistState {
  const state: DocumentChecklistState = {};
  scheme.requiredDocuments.forEach((doc, idx) => {
    // Pre-mark first 3 docs ready in sample mode so missing checklist immediately shows actionable items
    state[doc.id] = {
      isReady: scheme.isSampleData ? idx < 3 : false,
    };
  });
  return state;
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeStep, setActiveStep] = useState<WorkspaceStep>('upload');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [scholarship, setScholarship] = useState<ScholarshipAnalysis>(
    SAMPLE_SCHOLARSHIPS[0]
  );
  const [applicant, setApplicant] = useState<ApplicantProfile>(
    SAMPLE_APPLICANT_ELIGIBLE
  );
  const [checklistState, setChecklistState] = useState<DocumentChecklistState>(() =>
    buildInitialChecklist(SAMPLE_SCHOLARSHIPS[0])
  );
  const [uploadedDocs, setUploadedDocs] = useState<UploadedApplicantDocument[]>(
    SAMPLE_UPLOADED_DOCUMENTS
  );

  const pdfRef = useRef<HTMLDivElement | null>(null);
  const copy = t(lang);

  const handleUpdateScholarship = (nextScheme: ScholarshipAnalysis) => {
    setScholarship(nextScheme);
    setChecklistState(buildInitialChecklist(nextScheme));
  };

  const handleToggleDocument = (docId: string) => {
    setChecklistState((prev) => ({
      ...prev,
      [docId]: {
        isReady: !prev[docId]?.isReady,
      },
    }));
  };

  const handleLoadFullSample = () => {
    setScholarship(SAMPLE_SCHOLARSHIPS[0]);
    setApplicant(SAMPLE_APPLICANT_ELIGIBLE);
    setChecklistState(buildInitialChecklist(SAMPLE_SCHOLARSHIPS[0]));
    setUploadedDocs(SAMPLE_UPLOADED_DOCUMENTS);
  };

  const eligibilityResult = useMemo(
    () => evaluateEligibility(scholarship.eligibilityCriteria, applicant),
    [scholarship.eligibilityCriteria, applicant]
  );

  const nameAudit = useMemo(
    () => auditDocumentNames(applicant.fullName, uploadedDocs),
    [applicant.fullName, uploadedDocs]
  );

  const priorityActions = useMemo(() => {
    const actions: string[] = [];

    // 1. Failed eligibility criteria
    eligibilityResult.checks
      .filter((c) => c.status === 'fail')
      .forEach((c) => {
        actions.push(
          lang === 'te'
            ? `[అర్హత లోపం] ${c.criterionTe}: ${c.explanationTe}`
            : `[Eligibility Blocker] ${c.criterionEn}: ${c.explanationEn}`
        );
      });

    // 2. Missing mandatory documents
    scholarship.requiredDocuments
      .filter((d) => d.mandatory && !checklistState[d.id]?.isReady)
      .forEach((d) => {
        actions.push(
          lang === 'te'
            ? `[తప్పనిసరి పత్రం] "${d.nameTe || d.name}" సేకరించండి (${d.issuingOfficeTe || d.issuingOffice}).`
            : `[Missing Mandatory Document] Obtain "${d.name}" from ${d.issuingOffice}.`
        );
      });

    // 3. Name mismatch discrepancies
    nameAudit
      .filter((n) => n.severity !== 'exact')
      .forEach((n) => {
        actions.push(
          lang === 'te'
            ? `[పేరు వ్యత్యాసం — ${n.docTypeTe || n.docType}] "${n.extractedName}" vs "${n.expectedName}": ${n.recommendationTe}`
            : `[Name Discrepancy — ${n.docType}] "${n.extractedName}" vs "${n.expectedName}": ${n.recommendationEn}`
        );
      });

    return actions;
  }, [eligibilityResult, scholarship.requiredDocuments, checklistState, nameAudit, lang]);

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setIsGeneratingPdf(true);
    try {
      await generateReadinessPdf(pdfRef.current, scholarship.schemeName);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const readyDocsCount = scholarship.requiredDocuments.filter(
    (d) => checklistState[d.id]?.isReady
  ).length;
  const mismatchCount = nameAudit.filter((n) => n.severity !== 'exact').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar
        lang={lang}
        activeStep={activeStep}
        onSelectStep={setActiveStep}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onLoadQuickSample={handleLoadFullSample}
        stepMeta={{
          hasScheme: Boolean(scholarship.schemeName),
          schemeShortName: scholarship.isSampleData ? 'Sample' : 'Live PDF',
          isSampleScheme: scholarship.isSampleData,
          eligibleVerdict: eligibilityResult.overallVerdict,
          readyDocs: readyDocsCount,
          totalDocs: scholarship.requiredDocuments.length,
          mismatchCount,
        }}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          lang={lang}
          onChangeLang={setLang}
          activeStep={activeStep}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Global Sample Data & Preliminary Guidance Strip */}
          {(scholarship.isSampleData ||
            applicant.isSampleProfile ||
            uploadedDocs.some((d) => d.isSampleDocument)) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 flex items-start gap-3 text-xs text-amber-950">
              <Database className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{copy.banners.sampleDataBadge}: </span>
                <span>{copy.banners.sampleDataNotice}</span>
              </div>
            </div>
          )}

          {activeStep === 'upload' && (
            <NotificationUploadPanel
              lang={lang}
              scholarship={scholarship}
              onUpdateScholarship={handleUpdateScholarship}
              onNextStep={() => setActiveStep('applicant')}
            />
          )}

          {activeStep === 'applicant' && (
            <ApplicantFormPanel
              lang={lang}
              applicant={applicant}
              onChangeApplicant={setApplicant}
              onNextStep={() => setActiveStep('eligibility')}
            />
          )}

          {activeStep === 'eligibility' && (
            <EligibilityChecklistPanel
              lang={lang}
              scholarship={scholarship}
              eligibility={eligibilityResult}
              checklistState={checklistState}
              onToggleDocument={handleToggleDocument}
              onNextStep={() => setActiveStep('mismatch')}
            />
          )}

          {activeStep === 'mismatch' && (
            <NameMismatchPanel
              lang={lang}
              baselineName={applicant.fullName}
              documents={uploadedDocs}
              auditResults={nameAudit}
              onChangeDocuments={setUploadedDocs}
              onNextStep={() => setActiveStep('report')}
            />
          )}

          {activeStep === 'report' && (
            <ReadinessReportPanel
              lang={lang}
              scholarship={scholarship}
              applicant={applicant}
              eligibility={eligibilityResult}
              checklistState={checklistState}
              nameAudit={nameAudit}
              priorityActions={priorityActions}
              onDownloadPdf={handleDownloadPdf}
              isGeneratingPdf={isGeneratingPdf}
            />
          )}

          {/* Subtle Footer Notice */}
          <footer className="pt-4 pb-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{copy.banners.preliminaryNoticeBody}</span>
            </div>
            <span className="font-mono shrink-0">FormSaathi · EN / తెలుగు</span>
          </footer>
        </main>
      </div>

      {/* Offscreen A4 PDF Export Template */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          pointerEvents: 'none',
        }}
      >
        <div ref={pdfRef}>
          <PdfReportTemplate
            lang={lang}
            scholarship={scholarship}
            applicant={applicant}
            eligibility={eligibilityResult}
            checklistState={checklistState}
            nameAudit={nameAudit}
            priorityActions={priorityActions}
          />
        </div>
      </div>
    </div>
  );
}
