import React from 'react';
import { Download, Menu, Globe } from 'lucide-react';
import { Language } from '../types/scholarship';
import { t } from '../i18n/translations';
import { WorkspaceStep } from './Sidebar';

interface TopBarProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  activeStep: WorkspaceStep;
  onOpenMobileNav: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  lang,
  onChangeLang,
  activeStep,
  onOpenMobileNav,
  onDownloadPdf,
  isGeneratingPdf,
}) => {
  const copy = t(lang);

  const stepLabels: Record<WorkspaceStep, string> = {
    upload: copy.navSteps.upload,
    applicant: copy.navSteps.applicant,
    eligibility: copy.navSteps.eligibility,
    mismatch: copy.navSteps.mismatch,
    report: copy.navSteps.report,
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      {/* Left Zone: Mobile toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="font-display font-bold text-slate-900 whitespace-nowrap">
            {copy.brandName}
          </span>
          <span className="text-slate-300" aria-hidden="true">
            /
          </span>
          <span className="font-medium text-blue-700 truncate">
            {stepLabels[activeStep]}
          </span>
        </div>
      </div>

      {/* Right Zone: Segmented Language Switcher + Primary Download PDF Action */}
      <div className="flex items-center gap-3 shrink-0">
        <div
          className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200"
          role="group"
          aria-label="Language switch"
        >
          <Globe className="h-3.5 w-3.5 text-slate-500 ml-1.5 mr-1 hidden sm:block shrink-0" />
          <button
            type="button"
            onClick={() => onChangeLang('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              lang === 'en'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {copy.topbar.langEn}
          </button>
          <button
            type="button"
            onClick={() => onChangeLang('te')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              lang === 'te'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {copy.topbar.langTe}
          </button>
        </div>

        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {isGeneratingPdf ? copy.topbar.downloading : copy.topbar.downloadPdf}
          </span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>
    </header>
  );
};
