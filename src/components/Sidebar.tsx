import React from 'react';
import {
  FileText,
  UserCheck,
  CheckSquare,
  FileSearch,
  ClipboardCheck,
  X,
  Database,
} from 'lucide-react';
import { Language } from '../types/scholarship';
import { t } from '../i18n/translations';

export type WorkspaceStep = 'upload' | 'applicant' | 'eligibility' | 'mismatch' | 'report';

interface SidebarProps {
  lang: Language;
  activeStep: WorkspaceStep;
  onSelectStep: (step: WorkspaceStep) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  stepMeta: {
    hasScheme: boolean;
    schemeShortName: string;
    isSampleScheme: boolean;
    eligibleVerdict: 'eligible' | 'needs-review' | 'ineligible';
    readyDocs: number;
    totalDocs: number;
    mismatchCount: number;
  };
  onLoadQuickSample: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  activeStep,
  onSelectStep,
  mobileOpen,
  onCloseMobile,
  stepMeta,
  onLoadQuickSample,
}) => {
  const copy = t(lang);

  const navItems: Array<{
    id: WorkspaceStep;
    label: string;
    icon: React.ReactNode;
    metaText: string;
  }> = [
    {
      id: 'upload',
      label: copy.navSteps.upload,
      icon: <FileText className="h-4 w-4 shrink-0" />,
      metaText: stepMeta.hasScheme ? stepMeta.schemeShortName : 'PDF',
    },
    {
      id: 'applicant',
      label: copy.navSteps.applicant,
      icon: <UserCheck className="h-4 w-4 shrink-0" />,
      metaText: lang === 'te' ? 'వివరాలు' : 'Profile',
    },
    {
      id: 'eligibility',
      label: copy.navSteps.eligibility,
      icon: <CheckSquare className="h-4 w-4 shrink-0" />,
      metaText: `${stepMeta.readyDocs}/${stepMeta.totalDocs}`,
    },
    {
      id: 'mismatch',
      label: copy.navSteps.mismatch,
      icon: <FileSearch className="h-4 w-4 shrink-0" />,
      metaText:
        stepMeta.mismatchCount > 0
          ? `${stepMeta.mismatchCount} ${lang === 'te' ? 'లోపాలు' : 'flags'}`
          : lang === 'te'
            ? 'సరిచూడు'
            : 'Audit',
    },
    {
      id: 'report',
      label: copy.navSteps.report,
      icon: <ClipboardCheck className="h-4 w-4 shrink-0" />,
      metaText: 'PDF',
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200">
      <div>
        {/* Brand Block */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white font-bold text-sm tracking-tight">
                FS
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                {copy.brandName}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 leading-snug">
              {copy.brandTagline}
            </p>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Steps */}
        <nav className="px-3 py-4 space-y-1" aria-label="Workflow steps">
          {navItems.map((item) => {
            const isActive = activeStep === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectStep(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? 'text-blue-700' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </span>
                <span
                  className={`text-xs font-mono tabular-nums shrink-0 max-w-[82px] truncate ${
                    isActive ? 'text-blue-700' : 'text-slate-400'
                  }`}
                >
                  {item.metaText}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sample Reset Action */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="text-xs font-semibold text-slate-700 mb-1">
          {lang === 'te' ? 'సంపూర్ణ నమూనా డెమో' : 'Quick Full Demo Setup'}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          {lang === 'te'
            ? 'నమూనా స్కాలర్‌షిప్, దరఖాస్తుదారు & పత్రాలతో అన్ని దశలను పరీక్షించండి.'
            : 'Load sample scheme, applicant profile, and sample documents in one click.'}
        </p>
        <button
          type="button"
          onClick={() => {
            onLoadQuickSample();
            onCloseMobile();
          }}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-blue-200 bg-white text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <Database className="h-3.5 w-3.5 shrink-0" />
          <span className="whitespace-nowrap">
            {lang === 'te' ? 'నమూనా డెమో లోడ్ చేయి' : 'Reset / Load Full Sample'}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-68 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
