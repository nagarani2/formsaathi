import React from 'react';
import {
  ApplicantProfile,
  DocumentChecklistState,
  EligibilityEvaluationResult,
  Language,
  NameMismatchAuditItem,
  ScholarshipAnalysis,
} from '../types/scholarship';
import { t } from '../i18n/translations';

interface PdfReportTemplateProps {
  lang: Language;
  scholarship: ScholarshipAnalysis;
  applicant: ApplicantProfile;
  eligibility: EligibilityEvaluationResult;
  checklistState: DocumentChecklistState;
  nameAudit: NameMismatchAuditItem[];
  priorityActions: string[];
}

export const PdfReportTemplate: React.FC<PdfReportTemplateProps> = ({
  lang,
  scholarship,
  applicant,
  eligibility,
  checklistState,
  nameAudit,
  priorityActions,
}) => {
  const copy = t(lang);
  const mandatoryDocs = scholarship.requiredDocuments.filter((d) => d.mandatory);
  const readyMandatoryCount = mandatoryDocs.filter(
    (d) => checklistState[d.id]?.isReady
  ).length;
  const mismatchIssues = nameAudit.filter((n) => n.severity !== 'exact');

  const todayStr = new Date().toLocaleDateString(
    lang === 'te' ? 'te-IN' : 'en-IN',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const schemeTitle =
    lang === 'te' ? scholarship.schemeNameTe || scholarship.schemeName : scholarship.schemeName;
  const authorityTitle =
    lang === 'te'
      ? scholarship.issuingAuthorityTe || scholarship.issuingAuthority
      : scholarship.issuingAuthority;

  return (
    <div
      style={{
        width: '794px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: '"Public Sans", "Noto Sans Telugu", sans-serif',
        padding: '28px 32px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#1d4ed8',
          color: '#ffffff',
          padding: '20px 24px',
          borderRadius: '8px',
          marginBottom: '18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 700 }}>
            FormSaathi — {copy.reportSection.title}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.9 }}>
            {copy.reportSection.generatedOn}: {todayStr}
          </span>
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600 }}>{schemeTitle}</div>
        <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '2px' }}>
          {authorityTitle} · {scholarship.academicYear}
        </div>
      </div>

      {/* Disclaimers */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '11px',
          color: '#1e3a8a',
          marginBottom: '16px',
          lineHeight: 1.5,
        }}
      >
        <strong>{copy.banners.preliminaryNoticeTitle}:</strong>{' '}
        {copy.banners.preliminaryNoticeBody}
        {(scholarship.isSampleData || applicant.isSampleProfile) && (
          <div style={{ marginTop: '4px', fontWeight: 600 }}>
            [{copy.banners.sampleDataBadge}] {copy.banners.sampleDataNotice}
          </div>
        )}
      </div>

      {/* Summary Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '10px 12px',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>
            {copy.reportSection.kpiEligibility}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            {eligibility.passedCount} / {eligibility.totalRules}{' '}
            {copy.eligibilitySection.criteriaPassed}
          </div>
        </div>
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '10px 12px',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>
            {copy.reportSection.kpiDocuments}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            {readyMandatoryCount} / {mandatoryDocs.length}{' '}
            {copy.eligibilitySection.markMissing}
          </div>
        </div>
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '10px 12px',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '4px' }}>
            {copy.reportSection.kpiMismatch}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            {nameAudit.length === 0
              ? '0 Docs'
              : `${mismatchIssues.length} / ${nameAudit.length} Issues`}
          </div>
        </div>
      </div>

      {/* Applicant Profile */}
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#1e3a8a',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '4px',
          marginBottom: '8px',
        }}
      >
        {copy.reportSection.applicantSummaryTitle}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          fontSize: '11px',
          marginBottom: '16px',
        }}
      >
        <div>
          <strong>{copy.applicantSection.fullName}:</strong> {applicant.fullName || '—'}
        </div>
        <div>
          <strong>{copy.applicantSection.domicileState}:</strong>{' '}
          {applicant.domicileState || '—'}
        </div>
        <div>
          <strong>{copy.applicantSection.category}:</strong> {applicant.category || '—'}
        </div>
        <div>
          <strong>{copy.applicantSection.educationLevel}:</strong>{' '}
          {applicant.educationLevel || '—'}
        </div>
        <div>
          <strong>{copy.applicantSection.previousMarks}:</strong>{' '}
          {applicant.previousMarksPercent !== '' ? `${applicant.previousMarksPercent}%` : '—'}
        </div>
        <div>
          <strong>{copy.applicantSection.annualIncome}:</strong>{' '}
          {applicant.annualFamilyIncomeInr !== ''
            ? `₹${Number(applicant.annualFamilyIncomeInr).toLocaleString('en-IN')}`
            : '—'}
        </div>
      </div>

      {/* Eligibility Table */}
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#1e3a8a',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '4px',
          marginBottom: '8px',
        }}
      >
        {copy.reportSection.eligibilitySummaryTitle}
      </h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '10.5px',
          marginBottom: '16px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
              {copy.eligibilitySection.tableCriterion}
            </th>
            <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
              {copy.eligibilitySection.tableRequired}
            </th>
            <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
              {copy.eligibilitySection.tableApplicant}
            </th>
            <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
              {copy.eligibilitySection.tableStatus}
            </th>
          </tr>
        </thead>
        <tbody>
          {eligibility.checks.map((chk) => (
            <tr key={chk.id}>
              <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                {lang === 'te' ? chk.criterionTe : chk.criterionEn}
              </td>
              <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                {lang === 'te' ? chk.requiredTe : chk.requiredEn}
              </td>
              <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                {lang === 'te' ? chk.applicantValueTe : chk.applicantValueEn}
              </td>
              <td
                style={{
                  padding: '6px 8px',
                  border: '1px solid #e2e8f0',
                  fontWeight: 600,
                  color:
                    chk.status === 'pass'
                      ? '#15803d'
                      : chk.status === 'fail'
                        ? '#b91c1c'
                        : '#b45309',
                }}
              >
                {chk.status === 'pass'
                  ? copy.eligibilitySection.statusPass
                  : chk.status === 'fail'
                    ? copy.eligibilitySection.statusFail
                    : copy.eligibilitySection.statusReview}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Documents Checklist */}
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#1e3a8a',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '4px',
          marginBottom: '8px',
        }}
      >
        {copy.reportSection.documentsSummaryTitle}
      </h3>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '10.5px',
          marginBottom: '16px',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
              {copy.mismatchSection.tableDoc}
            </th>
            <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
              {copy.eligibilitySection.issuingOffice}
            </th>
            <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
              {copy.eligibilitySection.tableStatus}
            </th>
          </tr>
        </thead>
        <tbody>
          {scholarship.requiredDocuments.map((doc) => {
            const ready = Boolean(checklistState[doc.id]?.isReady);
            return (
              <tr key={doc.id}>
                <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                  {lang === 'te' ? doc.nameTe || doc.name : doc.name} (
                  {doc.mandatory
                    ? copy.uploadSection.mandatory
                    : copy.uploadSection.optional}
                  )
                </td>
                <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                  {lang === 'te'
                    ? doc.issuingOfficeTe || doc.issuingOffice
                    : doc.issuingOffice}
                </td>
                <td
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #e2e8f0',
                    fontWeight: 600,
                    color: ready ? '#15803d' : doc.mandatory ? '#b91c1c' : '#64748b',
                  }}
                >
                  {ready
                    ? copy.eligibilitySection.markMissing
                    : copy.eligibilitySection.filterMissing}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Name Mismatch Table */}
      {nameAudit.length > 0 && (
        <>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#1e3a8a',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '4px',
              marginBottom: '8px',
            }}
          >
            {copy.reportSection.nameAuditSummaryTitle}
          </h3>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '10.5px',
              marginBottom: '16px',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                  {copy.mismatchSection.tableDoc}
                </th>
                <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                  {copy.mismatchSection.tablePrintedName}
                </th>
                <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                  {copy.mismatchSection.tableSimilarity}
                </th>
                <th style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                  {copy.mismatchSection.tableSeverity}
                </th>
              </tr>
            </thead>
            <tbody>
              {nameAudit.map((item) => (
                <tr key={item.docId}>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                    {lang === 'te' ? item.docTypeTe || item.docType : item.docType}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                    {item.extractedName}
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                    {item.similarityScore}%
                  </td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}>
                    {lang === 'te' ? item.statusLabelTe : item.statusLabelEn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Priority Action Plan */}
      <h3
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#1e3a8a',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '4px',
          marginBottom: '8px',
        }}
      >
        {copy.reportSection.priorityPlanTitle}
      </h3>
      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', lineHeight: 1.6 }}>
        {priorityActions.length > 0 ? (
          priorityActions.map((act, i) => <li key={i}>{act}</li>)
        ) : (
          <li>{copy.reportSection.noBlockersMessage}</li>
        )}
      </ul>
    </div>
  );
};
