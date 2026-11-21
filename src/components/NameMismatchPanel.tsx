import React, { useRef, useState } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Loader2,
  FileSearch,
  AlertCircle,
} from 'lucide-react';
import {
  Language,
  NameMismatchAuditItem,
  UploadedApplicantDocument,
} from '../types/scholarship';
import { t } from '../i18n/translations';
import { SAMPLE_UPLOADED_DOCUMENTS } from '../data/sampleScholarships';

interface NameMismatchPanelProps {
  lang: Language;
  baselineName: string;
  documents: UploadedApplicantDocument[];
  auditResults: NameMismatchAuditItem[];
  onChangeDocuments: (docs: UploadedApplicantDocument[]) => void;
  onNextStep: () => void;
}

export const NameMismatchPanel: React.FC<NameMismatchPanelProps> = ({
  lang,
  baselineName,
  documents,
  auditResults,
  onChangeDocuments,
  onNextStep,
}) => {
  const copy = t(lang);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualDocType, setManualDocType] = useState('');
  const [manualPrintedName, setManualPrintedName] = useState('');

  const handleUploadSupportingDoc = async (file: File) => {
    setScanError(null);
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/extract-document-info', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to read supporting document.');
      }

      const newDoc: UploadedApplicantDocument = {
        id: `doc-up-${Date.now()}`,
        docType: data.documentType || file.name,
        docTypeTe: data.documentTypeTe || data.documentType || file.name,
        fileName: data.fileName || file.name,
        extractedName: data.extractedName || '',
        guardianNameOnDoc: data.guardianName || '',
        isSampleDocument: false,
        rawSnippet: data.rawSnippet || '',
      };

      onChangeDocuments([...documents, newDoc]);
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : 'Unable to extract name from document.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDocType.trim() || !manualPrintedName.trim()) return;
    const newDoc: UploadedApplicantDocument = {
      id: `doc-man-${Date.now()}`,
      docType: manualDocType.trim(),
      docTypeTe: manualDocType.trim(),
      fileName: 'Manual Entry',
      extractedName: manualPrintedName.trim(),
      isSampleDocument: false,
    };
    onChangeDocuments([...documents, newDoc]);
    setManualDocType('');
    setManualPrintedName('');
  };

  const handleUpdateExtractedName = (docId: string, updatedName: string) => {
    onChangeDocuments(
      documents.map((d) =>
        d.id === docId ? { ...d, extractedName: updatedName } : d
      )
    );
  };

  const handleRemoveDoc = (docId: string) => {
    onChangeDocuments(documents.filter((d) => d.id !== docId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {copy.mismatchSection.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
            {copy.mismatchSection.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{copy.mismatchSection.continueReportBtn}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </div>

      {/* Baseline & Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">
            {copy.mismatchSection.baselineNameLabel}
          </div>
          <div className="mt-0.5 text-base font-bold text-slate-900 font-mono">
            {baselineName || '—'}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onChangeDocuments(SAMPLE_UPLOADED_DOCUMENTS)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-800 hover:bg-blue-100 cursor-pointer"
          >
            <FileSearch className="h-3.5 w-3.5 shrink-0" />
            <span>{copy.mismatchSection.loadSampleDocsBtn}</span>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUploadSupportingDoc(f);
              e.target.value = '';
            }}
          />

          <button
            type="button"
            disabled={isScanning}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 cursor-pointer"
          >
            {isScanning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            ) : (
              <Upload className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>
              {isScanning
                ? copy.mismatchSection.scanningDoc
                : copy.mismatchSection.uploadDocBtn}
            </span>
          </button>

          {documents.length > 0 && (
            <button
              type="button"
              onClick={() => onChangeDocuments([])}
              className="px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {copy.mismatchSection.clearDocsBtn}
            </button>
          )}
        </div>
      </div>

      {scanError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{scanError}</span>
        </div>
      )}

      {/* Manual Entry Bar */}
      <form
        onSubmit={handleAddManual}
        className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5"
      >
        <div className="text-xs font-semibold text-slate-700 mb-3">
          {copy.mismatchSection.addManualDocBtn}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <input
            type="text"
            value={manualDocType}
            onChange={(e) => setManualDocType(e.target.value)}
            placeholder={copy.mismatchSection.docTypePlaceholder}
            className="sm:col-span-5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
          <input
            type="text"
            value={manualPrintedName}
            onChange={(e) => setManualPrintedName(e.target.value)}
            placeholder={copy.mismatchSection.docNamePlaceholder}
            className="sm:col-span-5 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
          />
          <button
            type="submit"
            className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span>{copy.mismatchSection.addEntry}</span>
          </button>
        </div>
      </form>

      {/* Audit Comparison Table */}
      {auditResults.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <h2 className="text-base font-bold text-slate-900">
            {copy.mismatchSection.noDocsTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-lg mx-auto">
            {copy.mismatchSection.noDocsBody}
          </p>
        </div>
      ) : (
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">{copy.mismatchSection.tableDoc}</th>
                  <th className="py-3 px-4">{copy.mismatchSection.tablePrintedName}</th>
                  <th className="py-3 px-4">{copy.mismatchSection.tableSimilarity}</th>
                  <th className="py-3 px-4">{copy.mismatchSection.tableSeverity}</th>
                  <th className="py-3 px-4">{copy.mismatchSection.tableAction}</th>
                  <th className="py-3 px-4 text-right">
                    <span className="sr-only">{copy.mismatchSection.removeDoc}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {auditResults.map((item) => {
                  const isExact = item.severity === 'exact';
                  const isCritical = item.severity === 'critical_mismatch';
                  return (
                    <tr key={item.docId} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-900">
                          {lang === 'te' ? item.docTypeTe || item.docType : item.docType}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500 font-mono">
                          {item.fileName}
                          {item.isSampleDocument && (
                            <>
                              {' · '}
                              <span className="text-amber-700 font-sans font-medium">
                                {copy.mismatchSection.sampleTag}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <input
                          type="text"
                          value={item.extractedName}
                          onChange={(e) =>
                            handleUpdateExtractedName(item.docId, e.target.value)
                          }
                          aria-label={`${item.docType} name`}
                          className="w-full min-w-[180px] rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-xs font-mono font-medium text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                        />
                      </td>

                      <td className="py-3.5 px-4 align-top font-mono text-xs font-bold tabular-nums text-slate-900">
                        {item.similarityScore}%
                      </td>

                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {isExact ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>
                              {lang === 'te' ? item.statusLabelTe : item.statusLabelEn}
                            </span>
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                            <XCircle className="h-4 w-4 shrink-0" />
                            <span>
                              {lang === 'te' ? item.statusLabelTe : item.statusLabelEn}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>
                              {lang === 'te' ? item.statusLabelTe : item.statusLabelEn}
                            </span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top text-xs text-slate-600 max-w-xs leading-relaxed">
                        {lang === 'te' ? item.recommendationTe : item.recommendationEn}
                      </td>

                      <td className="py-3.5 px-4 align-top text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveDoc(item.docId)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title={copy.mismatchSection.removeDoc}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
