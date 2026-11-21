import {
  ApplicantProfile,
  EligibilityCriteria,
  EligibilityEvaluationResult,
  EligibilityRuleCheck,
} from '../types/scholarship';

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function normalizeCategory(cat: string): string {
  const c = cat.trim().toUpperCase();
  if (c === 'OBC' || c.startsWith('BC')) return 'BC/OBC';
  if (c === 'GENERAL' || c === 'OC' || c === 'OPEN') return 'OC/General';
  return c;
}

export function evaluateEligibility(
  criteria: EligibilityCriteria,
  applicant: ApplicantProfile
): EligibilityEvaluationResult {
  const checks: EligibilityRuleCheck[] = [];

  // 1. Annual Family Income
  if (criteria.maxFamilyIncomeInr !== null && criteria.maxFamilyIncomeInr > 0) {
    const hasIncome = applicant.annualFamilyIncomeInr !== '';
    const incomeVal = Number(applicant.annualFamilyIncomeInr);
    const passed = hasIncome && incomeVal <= criteria.maxFamilyIncomeInr;
    checks.push({
      id: 'chk-income',
      criterionEn: 'Annual Family Income',
      criterionTe: 'వార్షిక కుటుంబ ఆదాయం',
      requiredEn: `≤ ${formatInr(criteria.maxFamilyIncomeInr)}`,
      requiredTe: `≤ ${formatInr(criteria.maxFamilyIncomeInr)}`,
      applicantValueEn: hasIncome ? formatInr(incomeVal) : 'Not entered',
      applicantValueTe: hasIncome ? formatInr(incomeVal) : 'నమోదు చేయలేదు',
      status: !hasIncome ? 'review' : passed ? 'pass' : 'fail',
      explanationEn: !hasIncome
        ? 'Enter annual family income to verify the income ceiling.'
        : passed
          ? 'Family income is within the maximum allowed limit.'
          : `Exceeds the ceiling by ${formatInr(incomeVal - criteria.maxFamilyIncomeInr)}.`,
      explanationTe: !hasIncome
        ? 'ఆదాయ పరిమితిని తనిఖీ చేయడానికి కుటుంబ వార్షిక ఆదాయాన్ని నమోదు చేయండి.'
        : passed
          ? 'కుటుంబ ఆదాయం అనుమతించిన గరిష్ట పరిమితి లోపు ఉంది.'
          : `పరిమితి కంటే ${formatInr(incomeVal - criteria.maxFamilyIncomeInr)} ఎక్కువగా ఉంది.`,
    });
  }

  // 2. Minimum Qualifying Marks
  if (criteria.minPercentage !== null && criteria.minPercentage > 0) {
    const hasMarks = applicant.previousMarksPercent !== '';
    const marks = Number(applicant.previousMarksPercent);
    const passed = hasMarks && marks >= criteria.minPercentage;
    checks.push({
      id: 'chk-marks',
      criterionEn: 'Previous Qualifying Marks',
      criterionTe: 'గత అర్హత పరీక్ష మార్కులు',
      requiredEn: `≥ ${criteria.minPercentage}%`,
      requiredTe: `≥ ${criteria.minPercentage}%`,
      applicantValueEn: hasMarks ? `${marks}%` : 'Not entered',
      applicantValueTe: hasMarks ? `${marks}%` : 'నమోదు చేయలేదు',
      status: !hasMarks ? 'review' : passed ? 'pass' : 'fail',
      explanationEn: !hasMarks
        ? 'Enter previous exam percentage to verify academic merit.'
        : passed
          ? 'Meets or exceeds the minimum qualifying marks requirement.'
          : `Below the required ${criteria.minPercentage}% threshold.`,
      explanationTe: !hasMarks
        ? 'మార్కుల అర్హతను తనిఖీ చేయడానికి గత పరీక్ష శాతాన్ని నమోదు చేయండి.'
        : passed
          ? 'కనీస అర్హత మార్కుల షరతును పూర్తి చేస్తోంది.'
          : `కనీస అవసరమైన ${criteria.minPercentage}% కంటే తక్కువగా ఉంది.`,
    });
  }

  // 3. Domicile State
  const allowedStates = criteria.allowedStates || [];
  const isAllIndia =
    allowedStates.length === 0 ||
    allowedStates.some((s) => s.toLowerCase().includes('all india'));
  if (!isAllIndia) {
    const hasState = Boolean(applicant.domicileState);
    const matched = allowedStates.some(
      (s) => s.trim().toLowerCase() === applicant.domicileState.trim().toLowerCase()
    );
    checks.push({
      id: 'chk-state',
      criterionEn: 'Domicile State',
      criterionTe: 'నివాస రాష్ట్రం',
      requiredEn: allowedStates.join(', '),
      requiredTe: allowedStates.join(', '),
      applicantValueEn: applicant.domicileState || 'Not selected',
      applicantValueTe: applicant.domicileState || 'ఎంచుకోలేదు',
      status: !hasState ? 'review' : matched ? 'pass' : 'fail',
      explanationEn: matched
        ? 'Applicant domicile matches the scheme state requirement.'
        : `Scheme is restricted to domicile residents of ${allowedStates.join(', ')}.`,
      explanationTe: matched
        ? 'దరఖాస్తుదారుని నివాస రాష్ట్రం పథకం నియమాలకు సరిపోతోంది.'
        : `ఈ పథకం ${allowedStates.join(', ')} స్థానికులకు మాత్రమే వర్తిస్తుంది.`,
    });
  }

  // 4. Social Category
  const allowedCats = criteria.allowedCategories || [];
  const isAllCategories =
    allowedCats.length === 0 ||
    allowedCats.some((c) => c.trim().toLowerCase() === 'all');
  if (!isAllCategories) {
    const appNorm = normalizeCategory(applicant.category);
    const matched = allowedCats.some(
      (c) =>
        normalizeCategory(c) === appNorm ||
        c.trim().toLowerCase() === applicant.category.trim().toLowerCase()
    );
    checks.push({
      id: 'chk-category',
      criterionEn: 'Social Category',
      criterionTe: 'సామాజిక వర్గం',
      requiredEn: allowedCats.join(' / '),
      requiredTe: allowedCats.join(' / '),
      applicantValueEn: applicant.category || 'Not selected',
      applicantValueTe: applicant.category || 'ఎంచుకోలేదు',
      status: !applicant.category ? 'review' : matched ? 'pass' : 'fail',
      explanationEn: matched
        ? 'Applicant category is eligible under this notification.'
        : `Category ${applicant.category} is not listed among eligible categories (${allowedCats.join(', ')}).`,
      explanationTe: matched
        ? 'దరఖాస్తుదారుని సామాజిక వర్గం ఈ పథకానికి అర్హమైనది.'
        : `${applicant.category} వర్గం ఈ నోటిఫికేషన్ అర్హత జాబితాలో లేదు.`,
    });
  }

  // 5. Education Level
  const allowedLevels = criteria.educationLevels || [];
  const isAllLevels =
    allowedLevels.length === 0 ||
    allowedLevels.some((l) => l.trim().toLowerCase() === 'all');
  if (!isAllLevels) {
    const matched = allowedLevels.some(
      (l) =>
        l.toLowerCase().includes(applicant.educationLevel.toLowerCase()) ||
        applicant.educationLevel.toLowerCase().includes(l.toLowerCase())
    );
    checks.push({
      id: 'chk-edu',
      criterionEn: 'Education / Course Level',
      criterionTe: 'విద్యా స్థాయి',
      requiredEn: allowedLevels.join(', '),
      requiredTe: allowedLevels.join(', '),
      applicantValueEn: applicant.educationLevel || 'Not selected',
      applicantValueTe: applicant.educationLevel || 'ఎంచుకోలేదు',
      status: !applicant.educationLevel ? 'review' : matched ? 'pass' : 'fail',
      explanationEn: matched
        ? 'Current education level is covered by the scheme.'
        : 'Current education level does not match the notified course tiers.',
      explanationTe: matched
        ? 'ప్రస్తుత విద్యా స్థాయి ఈ పథకం పరిధిలో ఉంది.'
        : 'ప్రస్తుత కోర్సు స్థాయి నోటిఫికేషన్ నియమాలకు సరిపోలలేదు.',
    });
  }

  // 6. Gender Requirement
  if (criteria.genderRequirement && criteria.genderRequirement !== 'All') {
    const matched =
      applicant.gender.toLowerCase() === criteria.genderRequirement.toLowerCase();
    checks.push({
      id: 'chk-gender',
      criterionEn: 'Gender Criterion',
      criterionTe: 'లింగ నియమం',
      requiredEn: criteria.genderRequirement,
      requiredTe: criteria.genderRequirement,
      applicantValueEn: applicant.gender,
      applicantValueTe: applicant.gender,
      status: matched ? 'pass' : 'fail',
      explanationEn: matched
        ? 'Meets gender eligibility criterion.'
        : `Scheme is exclusively reserved for ${criteria.genderRequirement} applicants.`,
      explanationTe: matched
        ? 'లింగ నియమానికి సరిపోతోంది.'
        : `ఈ పథకం ${criteria.genderRequirement} అభ్యర్థులకు మాత్రమే ప్రత్యేకించబడింది.`,
    });
  }

  // 7. Age Limit
  if (criteria.ageMin !== null || criteria.ageMax !== null) {
    const hasAge = applicant.age !== '';
    const ageVal = Number(applicant.age);
    const minOk = criteria.ageMin === null || ageVal >= criteria.ageMin;
    const maxOk = criteria.ageMax === null || ageVal <= criteria.ageMax;
    const rangeLabel =
      criteria.ageMin !== null && criteria.ageMax !== null
        ? `${criteria.ageMin}–${criteria.ageMax} yrs`
        : criteria.ageMin !== null
          ? `≥ ${criteria.ageMin} yrs`
          : `≤ ${criteria.ageMax} yrs`;

    checks.push({
      id: 'chk-age',
      criterionEn: 'Age Range',
      criterionTe: 'వయోపరిమితి',
      requiredEn: rangeLabel,
      requiredTe: rangeLabel,
      applicantValueEn: hasAge ? `${ageVal} yrs` : 'Not entered',
      applicantValueTe: hasAge ? `${ageVal} సం.` : 'నమోదు చేయలేదు',
      status: !hasAge ? 'review' : minOk && maxOk ? 'pass' : 'fail',
      explanationEn: !hasAge
        ? 'Enter applicant age to verify age limits.'
        : minOk && maxOk
          ? 'Applicant age is within the permitted bracket.'
          : `Applicant age (${ageVal}) falls outside ${rangeLabel}.`,
      explanationTe: !hasAge
        ? 'వయోపరిమితి తనిఖీ కోసం వయస్సు నమోదు చేయండి.'
        : minOk && maxOk
          ? 'వయస్సు అనుమతించిన పరిమితి లోపు ఉంది.'
          : `వయస్సు (${ageVal}) అనుమతించిన పరిమితి (${rangeLabel}) వెలుపల ఉంది.`,
    });
  }

  // 8. Minimum Attendance
  if (criteria.minAttendancePercent !== null && criteria.minAttendancePercent > 0) {
    const hasAtt = applicant.attendancePercent !== '';
    const att = Number(applicant.attendancePercent);
    const passed = hasAtt && att >= criteria.minAttendancePercent;
    checks.push({
      id: 'chk-attendance',
      criterionEn: 'Academic Attendance',
      criterionTe: 'కళాశాల హాజరు శాతం',
      requiredEn: `≥ ${criteria.minAttendancePercent}%`,
      requiredTe: `≥ ${criteria.minAttendancePercent}%`,
      applicantValueEn: hasAtt ? `${att}%` : 'Not entered',
      applicantValueTe: hasAtt ? `${att}%` : 'నమోదు చేయలేదు',
      status: !hasAtt ? 'review' : passed ? 'pass' : 'fail',
      explanationEn: !hasAtt
        ? 'Provide current attendance percentage.'
        : passed
          ? 'Meets mandatory attendance requirement.'
          : `Attendance (${att}%) is below the mandatory ${criteria.minAttendancePercent}% threshold.`,
      explanationTe: !hasAtt
        ? 'ప్రస్తుత హాజరు శాతాన్ని నమోదు చేయండి.'
        : passed
          ? 'తప్పనిసరి హాజరు నియమాన్ని పూర్తి చేస్తోంది.'
          : `హాజరు (${att}%) కనీస ${criteria.minAttendancePercent}% కంటే తక్కువగా ఉంది.`,
    });
  }

  // 9. Aadhaar-NPCI Bank Seeding
  if (criteria.aadhaarSeedingRequired) {
    checks.push({
      id: 'chk-npci',
      criterionEn: 'Aadhaar-NPCI Bank Seeding',
      criterionTe: 'ఆధార్-NPCI బ్యాంక్ సీడింగ్',
      requiredEn: 'Active DBT Mapping Required',
      requiredTe: 'యాక్టివ్ DBT మ్యాపింగ్ అవసరం',
      applicantValueEn: applicant.aadhaarSeededBank ? 'Seeded & Active' : 'Not Seeded',
      applicantValueTe: applicant.aadhaarSeededBank ? 'సీడింగ్ ఉంది' : 'సీడింగ్ లేదు',
      status: applicant.aadhaarSeededBank ? 'pass' : 'fail',
      explanationEn: applicant.aadhaarSeededBank
        ? 'Bank account is ready for Direct Benefit Transfer (DBT).'
        : 'Link Aadhaar to bank account via NPCI mapper at your bank branch; DBT disbursements fail without seeding.',
      explanationTe: applicant.aadhaarSeededBank
        ? 'బ్యాంక్ ఖాతా డైరెక్ట్ బెనిఫిట్ ట్రాన్స్‌ఫర్ (DBT)కు సిద్ధంగా ఉంది.'
        : 'బ్యాంక్ శాఖలో NPCI ద్వారా ఆధార్ సీడింగ్ చేయించండి; లేకపోతే స్కాలర్‌షిప్ జమ కాదు.',
    });
  }

  const passedCount = checks.filter((c) => c.status === 'pass').length;
  const failedCount = checks.filter((c) => c.status === 'fail').length;
  const reviewCount = checks.filter((c) => c.status === 'review').length;

  let overallVerdict: 'eligible' | 'needs-review' | 'ineligible' = 'eligible';
  if (failedCount > 0) {
    overallVerdict = 'ineligible';
  } else if (reviewCount > 0) {
    overallVerdict = 'needs-review';
  }

  return {
    overallVerdict,
    passedCount,
    failedCount,
    reviewCount,
    totalRules: checks.length,
    checks,
  };
}
