export type Language = 'en' | 'te';

export interface OtherEligibilityRule {
  id: string;
  title: string;
  titleTe: string;
  description: string;
  descriptionTe: string;
}

export interface EligibilityCriteria {
  maxFamilyIncomeInr: number | null;
  minPercentage: number | null;
  allowedCategories: string[];
  allowedStates: string[];
  educationLevels: string[];
  genderRequirement: 'All' | 'Female' | 'Male' | 'Other';
  ageMin: number | null;
  ageMax: number | null;
  minAttendancePercent: number | null;
  domicileRequired: boolean;
  aadhaarSeedingRequired: boolean;
  otherRules: OtherEligibilityRule[];
}

export interface RequiredDocument {
  id: string;
  name: string;
  nameTe: string;
  mandatory: boolean;
  category: string;
  notes: string;
  notesTe: string;
  issuingOffice: string;
  issuingOfficeTe: string;
}

export interface SchemeDeadline {
  id: string;
  label: string;
  labelTe: string;
  dateText: string;
  isoDate: string | null;
  isUrgent: boolean;
}

export interface ScholarshipAnalysis {
  id: string;
  isSampleData: boolean;
  sourceFileName: string;
  schemeName: string;
  schemeNameTe: string;
  issuingAuthority: string;
  issuingAuthorityTe: string;
  academicYear: string;
  benefitAmount: string;
  benefitAmountTe: string;
  officialPortalUrl: string;
  summary: string;
  summaryTe: string;
  extractedText: string;
  pageCount: number;
  extractionMethod: 'pdf-text' | 'gemini-ocr' | 'sample-dataset';
  eligibilityCriteria: EligibilityCriteria;
  requiredDocuments: RequiredDocument[];
  deadlines: SchemeDeadline[];
}

export interface ApplicantProfile {
  fullName: string;
  guardianName: string;
  domicileState: string;
  category: string;
  gender: 'Female' | 'Male' | 'Other';
  age: number | '';
  educationLevel: string;
  previousMarksPercent: number | '';
  annualFamilyIncomeInr: number | '';
  attendancePercent: number | '';
  isPwd: boolean;
  aadhaarSeededBank: boolean;
  isSampleProfile?: boolean;
}

export type RuleStatus = 'pass' | 'fail' | 'review';

export interface EligibilityRuleCheck {
  id: string;
  criterionEn: string;
  criterionTe: string;
  requiredEn: string;
  requiredTe: string;
  applicantValueEn: string;
  applicantValueTe: string;
  status: RuleStatus;
  explanationEn: string;
  explanationTe: string;
}

export interface EligibilityEvaluationResult {
  overallVerdict: 'eligible' | 'needs-review' | 'ineligible';
  passedCount: number;
  failedCount: number;
  reviewCount: number;
  totalRules: number;
  checks: EligibilityRuleCheck[];
}

export interface DocumentChecklistState {
  [docId: string]: {
    isReady: boolean;
    notes?: string;
  };
}

export interface UploadedApplicantDocument {
  id: string;
  docType: string;
  docTypeTe: string;
  fileName: string;
  extractedName: string;
  guardianNameOnDoc?: string;
  isSampleDocument: boolean;
  rawSnippet?: string;
}

export type MismatchSeverity =
  | 'exact'
  | 'initial_or_order'
  | 'spacing_variation'
  | 'spelling_mismatch'
  | 'critical_mismatch';

export interface NameMismatchAuditItem {
  docId: string;
  docType: string;
  docTypeTe: string;
  fileName: string;
  isSampleDocument: boolean;
  expectedName: string;
  extractedName: string;
  similarityScore: number;
  severity: MismatchSeverity;
  statusLabelEn: string;
  statusLabelTe: string;
  recommendationEn: string;
  recommendationTe: string;
}
