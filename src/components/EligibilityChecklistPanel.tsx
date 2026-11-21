import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Info,
  Check,
  Square,
} from 'lucide-react';
import {
  DocumentChecklistState,
  EligibilityEvaluationResult,
  Language,
  ScholarshipAnalysis,
} from '../types/scholarship';
import { t } from '../i18n/translations';

interface EligibilityChecklistPanelProps {
  lang: Language;
  scholarship: ScholarshipAnalysis;
  eligibility: EligibilityEvaluationResult;
  checklistState: DocumentChecklistState;
  onToggleDocument: (docId: string) => void;
  onNextStep: () => void;
}

export const EligibilityChecklistPanel: React.FC<EligibilityChecklistPanelProps> = ({
  lang,
  scholarship,
  eligibility,
  checklistState,
  onToggleDocument,
  onNextStep,
}) => {
  const copy = t(lang);
  const [docFilter, setDocFilter] = useState<'all' | 'missing' | 'ready'>('all');

  const mandatoryDocs = scholarship.requiredDocuments.filter((d) => d.mandatory);
  const readyCount = scholarship.requiredDocuments.filter(
    (d) => checklistState[d.id]?.isReady
  ).length;
  const missingMandatoryCount = mandatoryDocs.filter(
    (d) => !checklistState[d.id]?.isReady
  ).length;

  const filteredDocs = scholarship.requiredDocuments.filter((doc) => {
    const isReady = Boolean(checklistState[doc.id]?.isReady);
    if (docFilter === 'missing') return !isReady;
    if (docFilter === 'ready') return isReady;
    return true;
  });

  const verdictBannerStyle =
    eligibility.overallVerdict === 'eligible'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : eligibility.overallVerdict === 'needs-review'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-red-200 bg-red-50 text-red-900';

  const verdictLabel =
    eligibility.overallVerdict === 'eligible'
      ? copy.eligibilitySection.verdictEligible
      : eligibility.overallVerdict === 'needs-review'
        ? copy.eligibilitySection.verdictReview
        : copy.eligibilitySection.verdictIneligible;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {copy.eligibilitySection.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
            {copy.eligibilitySection.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{copy.eligibilitySection.nextToMismatchBtn}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </div>

      {/* Preliminary Assessment Disclaimer */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3.5 flex items-start gap-3">
        <Info className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-950 leading-relaxed">
          <span className="font-bold">{copy.banners.preliminaryNoticeTitle}: </span>
          <span>{copy.banners.preliminaryNoticeBody}</span>
        </div>
      </div>

      {/* Verdict & KPI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${verdictBannerStyle}`}>
          {eligibility.overallVerdict === 'eligible' ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-700 shrink-0" />
          ) : eligibility.overallVerdict === 'needs-review' ? (
            <AlertTriangle className="h-6 w-6 text-amber-700 shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 text-red-700 shrink-0" />
          )}
          <div>
            <div className="text-xs font-medium opacity-80">
              {copy.banners.preliminaryNoticeTitle}
            </div>
            <div className="text-base font-bold">{verdictLabel}</div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">{copy.eligibilitySection.criteriaPassed}</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-700">
            {eligibility.passedCount} / {eligibility.totalRules}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">{copy.eligibilitySection.criteriaFailed}</div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-red-700">
            {eligibility.failedCount}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">
            {copy.eligibilitySection.missingMandatoryLabel}
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-blue-800">
            {missingMandatoryCount}
          </div>
        </div>
      </div>

      {/* Rule-by-Rule Evaluation Table */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">{copy.eligibilitySection.tableCriterion}</th>
                <th className="py-3 px-4">{copy.eligibilitySection.tableRequired}</th>
                <th className="py-3 px-4">{copy.eligibilitySection.tableApplicant}</th>
                <th className="py-3 px-4">{copy.eligibilitySection.tableStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {eligibility.checks.map((chk) => (
                <tr key={chk.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-semibold text-slate-900">
                      {lang === 'te' ? chk.criterionTe : chk.criterionEn}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {lang === 'te' ? chk.explanationTe : chk.explanationEn}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono text-xs text-slate-700 tabular-nums">
                    {lang === 'te' ? chk.requiredTe : chk.requiredEn}
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono text-xs font-medium text-slate-900 tabular-nums">
                    {lang === 'te' ? chk.applicantValueTe : chk.applicantValueEn}
                  </td>
                  <td className="py-3.5 px-4 align-top whitespace-nowrap">
                    {chk.status === 'pass' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{copy.eligibilitySection.statusPass}</span>
                      </span>
                    ) : chk.status === 'fail' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span>{copy.eligibilitySection.statusFail}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{copy.eligibilitySection.statusReview}</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Missing Document Checklist */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {copy.eligibilitySection.checklistTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {copy.eligibilitySection.checklistSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-700 tabular-nums">
              {readyCount} / {scholarship.requiredDocuments.length}{' '}
              {copy.eligibilitySection.readyCountLabel}
            </span>

            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setDocFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  docFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {copy.eligibilitySection.filterAll}
              </button>
              <button
                type="button"
                onClick={() => setDocFilter('missing')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  docFilter === 'missing'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {copy.eligibilitySection.filterMissing}
              </button>
              <button
                type="button"
                onClick={() => setDocFilter('ready')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  docFilter === 'ready'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {copy.eligibilitySection.filterReady}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-200">
          {filteredDocs.map((doc) => {
            const isReady = Boolean(checklistState[doc.id]?.isReady);
            return (
              <div
                key={doc.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleDocument(doc.id)}
                    aria-pressed={isReady}
                    className={`mt-0.5 h-5 w-5 rounded flex items-center justify-center border transition-colors shrink-0 cursor-pointer ${
                      isReady
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'bg-white border-slate-300 text-transparent hover:border-blue-500'
                    }`}
                  >
                    {isReady ? <Check className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                  </button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isReady ? 'text-slate-700 line-through decoration-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {lang === 'te' ? doc.nameTe || doc.name : doc.name}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">
                        ·
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          doc.mandatory ? 'text-blue-700' : 'text-slate-500'
                        }`}
                      >
                        {doc.mandatory
                          ? copy.uploadSection.mandatory
                          : copy.uploadSection.optional}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {lang === 'te' ? doc.notesTe || doc.notes : doc.notes}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {copy.eligibilitySection.issuingOffice}:{' '}
                      <span className="font-medium text-slate-700">
                        {lang === 'te'
                          ? doc.issuingOfficeTe || doc.issuingOffice
                          : doc.issuingOffice}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleDocument(doc.id)}
                  className={`self-start sm:self-center px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isReady
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : doc.mandatory
                        ? 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {isReady
                    ? copy.eligibilitySection.markMissing
                    : copy.eligibilitySection.markReady}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
