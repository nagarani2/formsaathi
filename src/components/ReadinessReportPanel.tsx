import React from 'react';
import {
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Loader2,
} from 'lucide-react';
import {
  ApplicantProfile,
  DocumentChecklistState,
  EligibilityEvaluationResult,
  Language,
  NameMismatchAuditItem,
  ScholarshipAnalysis,
} from '../types/scholarship';
import { t } from '../i18n/translations';

interface ReadinessReportPanelProps {
  lang: Language;
  scholarship: ScholarshipAnalysis;
  applicant: ApplicantProfile;
  eligibility: EligibilityEvaluationResult;
  checklistState: DocumentChecklistState;
  nameAudit: NameMismatchAuditItem[];
  priorityActions: string[];
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export const ReadinessReportPanel: React.FC<ReadinessReportPanelProps> = ({
  lang,
  scholarship,
  applicant,
  eligibility,
  checklistState,
  nameAudit,
  priorityActions,
  onDownloadPdf,
  isGeneratingPdf,
}) => {
  const copy = t(lang);

  const mandatoryDocs = scholarship.requiredDocuments.filter((d) => d.mandatory);
  const readyMandatoryCount = mandatoryDocs.filter(
    (d) => checklistState[d.id]?.isReady
  ).length;
  const missingMandatoryCount = mandatoryDocs.length - readyMandatoryCount;
  const mismatchCount = nameAudit.filter((n) => n.severity !== 'exact').length;
  const criticalMismatchCount = nameAudit.filter(
    (n) => n.severity === 'critical_mismatch'
  ).length;

  let readinessStatus: 'ready' | 'action' | 'high-risk' = 'ready';
  if (eligibility.failedCount > 0 || criticalMismatchCount > 0) {
    readinessStatus = 'high-risk';
  } else if (
    missingMandatoryCount > 0 ||
    mismatchCount > 0 ||
    eligibility.reviewCount > 0
  ) {
    readinessStatus = 'action';
  }

  const nextDeadline = scholarship.deadlines[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {copy.reportSection.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
            {copy.reportSection.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 shrink-0" />
            <span>{copy.reportSection.printReportBtn}</span>
          </button>

          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={onDownloadPdf}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {isGeneratingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <Download className="h-4 w-4 shrink-0" />
            )}
            <span>
              {isGeneratingPdf
                ? copy.topbar.downloading
                : copy.reportSection.downloadPdfBtn}
            </span>
          </button>
        </div>
      </div>

      {/* Overall Readiness Banner */}
      <div
        className={`rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          readinessStatus === 'ready'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
            : readinessStatus === 'action'
              ? 'border-amber-200 bg-amber-50 text-amber-950'
              : 'border-red-200 bg-red-50 text-red-950'
        }`}
      >
        <div className="flex items-start gap-3">
          {readinessStatus === 'ready' ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-700 shrink-0 mt-0.5" />
          ) : readinessStatus === 'action' ? (
            <AlertTriangle className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-6 w-6 text-red-700 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="text-lg font-bold">
              {readinessStatus === 'ready'
                ? copy.reportSection.statusReady
                : readinessStatus === 'action'
                  ? copy.reportSection.statusAction
                  : copy.reportSection.statusHighRisk}
            </div>
            <p className="mt-0.5 text-xs opacity-90">
              {copy.banners.preliminaryNoticeBody}
            </p>
          </div>
        </div>
      </div>

      {/* 4-Column Verifiable Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">{copy.reportSection.kpiEligibility}</div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900">
            {eligibility.passedCount} / {eligibility.totalRules}
          </div>
          <div className="mt-0.5 text-xs text-slate-600">
            {eligibility.overallVerdict === 'eligible'
              ? copy.eligibilitySection.verdictEligible
              : eligibility.overallVerdict === 'needs-review'
                ? copy.eligibilitySection.verdictReview
                : copy.eligibilitySection.verdictIneligible}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">{copy.reportSection.kpiDocuments}</div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900">
            {readyMandatoryCount} / {mandatoryDocs.length}
          </div>
          <div className="mt-0.5 text-xs text-slate-600">
            {missingMandatoryCount}{' '}
            {lang === 'te' ? 'తప్పనిసరి లోటు' : 'mandatory missing'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">{copy.reportSection.kpiMismatch}</div>
          <div className="mt-1 text-xl font-bold font-mono tabular-nums text-slate-900">
            {mismatchCount} / {nameAudit.length}
          </div>
          <div className="mt-0.5 text-xs text-slate-600">
            {nameAudit.length === 0
              ? lang === 'te'
                ? 'పత్రాలు లోడ్ కాలేదు'
                : 'No documents audited'
              : mismatchCount === 0
                ? lang === 'te'
                  ? 'అన్ని పేర్లు సరిపోలాయి'
                  : 'All names consistent'
                : lang === 'te'
                  ? 'వ్యత్యాసాలు గుర్తించబడ్డాయి'
                  : 'Variations detected'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">{copy.reportSection.kpiDeadline}</div>
          <div className="mt-1 text-base font-bold font-mono tabular-nums text-blue-800 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{nextDeadline ? nextDeadline.dateText : '—'}</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-600 truncate">
            {nextDeadline
              ? lang === 'te'
                ? nextDeadline.labelTe || nextDeadline.label
                : nextDeadline.label
              : '—'}
          </div>
        </div>
      </div>

      {/* Priority Action Plan */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-900 mb-3">
          {copy.reportSection.priorityPlanTitle}
        </h2>
        {priorityActions.length === 0 ? (
          <div className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            {copy.reportSection.noBlockersMessage}
          </div>
        ) : (
          <ol className="space-y-2.5 list-decimal list-inside text-sm text-slate-700">
            {priorityActions.map((action, idx) => (
              <li key={idx} className="leading-relaxed">
                {action}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* Two-Column Detail Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200">
            {copy.reportSection.schemeSummaryTitle}
          </h2>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div>
              <dt className="text-xs text-slate-500">{copy.uploadSection.schemeLabel}</dt>
              <dd className="font-semibold text-slate-900">
                {lang === 'te'
                  ? scholarship.schemeNameTe || scholarship.schemeName
                  : scholarship.schemeName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.uploadSection.authorityLabel}</dt>
              <dd className="text-slate-700">
                {lang === 'te'
                  ? scholarship.issuingAuthorityTe || scholarship.issuingAuthority
                  : scholarship.issuingAuthority}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.uploadSection.benefitLabel}</dt>
              <dd className="text-blue-800 font-medium">
                {lang === 'te'
                  ? scholarship.benefitAmountTe || scholarship.benefitAmount
                  : scholarship.benefitAmount}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-200">
            {copy.reportSection.applicantSummaryTitle}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500">{copy.applicantSection.fullName}</dt>
              <dd className="font-semibold text-slate-900">
                {applicant.fullName || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.applicantSection.domicileState}</dt>
              <dd className="text-slate-800">{applicant.domicileState}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.applicantSection.category}</dt>
              <dd className="text-slate-800">{applicant.category}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.applicantSection.annualIncome}</dt>
              <dd className="font-mono tabular-nums text-slate-900">
                {applicant.annualFamilyIncomeInr !== ''
                  ? `₹${Number(applicant.annualFamilyIncomeInr).toLocaleString('en-IN')}`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.applicantSection.previousMarks}</dt>
              <dd className="font-mono tabular-nums text-slate-900">
                {applicant.previousMarksPercent !== ''
                  ? `${applicant.previousMarksPercent}%`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{copy.applicantSection.educationLevel}</dt>
              <dd className="text-slate-800">{applicant.educationLevel}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
};
