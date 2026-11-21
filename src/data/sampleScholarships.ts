import { jsPDF } from 'jspdf';
import {
  ApplicantProfile,
  ScholarshipAnalysis,
  UploadedApplicantDocument,
} from '../types/scholarship';

export const SAMPLE_SCHOLARSHIPS: ScholarshipAnalysis[] = [
  {
    id: 'sample-ap-vidya-deevena',
    isSampleData: true,
    sourceFileName: 'Sample_AP_PostMatric_VidyaDeevena_2026.pdf',
    schemeName: 'Post-Matric Scholarship (Vidya Deevena — Sample Scheme)',
    schemeNameTe: 'పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ (విద్యా దీవెన — నమూనా పథకం)',
    issuingAuthority:
      'Department of Social Welfare & Higher Education, Govt. of Andhra Pradesh (Sample)',
    issuingAuthorityTe:
      'సాంఘిక సంక్షేమ & ఉన్నత విద్యా శాఖ, ఆంధ్రప్రదేశ్ ప్రభుత్వం (నమూనా)',
    academicYear: '2026–2027',
    benefitAmount: '100% Tuition & Special Fee Reimbursement (Direct to Mother/Student Bank)',
    benefitAmountTe: '100% ట్యూషన్ & ప్రత్యేక ఫీజు రీయింబర్స్‌మెంట్ (తల్లి/విద్యార్థి బ్యాంక్ ఖాతాకు)',
    officialPortalUrl: 'https://jnanabhumi.ap.gov.in',
    summary:
      'Sample scholarship notification representing State Post-Matric fee reimbursement for SC, ST, BC, EBC, Kapu, and Minority students pursuing Polytechnic, ITI, Degree, Engineering, or PG courses in recognized institutions.',
    summaryTe:
      'గుర్తింపు పొందిన కళాశాలల్లో పాలిటెక్నిక్, ఐటీఐ, డిగ్రీ, ఇంజనీరింగ్ లేదా పీజీ చదువుతున్న SC, ST, BC, EBC, కాపు మరియు మైనారిటీ విద్యార్థుల కోసం రాష్ట్ర పోస్ట్-మెట్రిక్ ఫీజు రీయింబర్స్‌మెంట్ నమూనా నోటిఫికేషన్.',
    pageCount: 2,
    extractionMethod: 'sample-dataset',
    extractedText: `GOVERNMENT OF ANDHRA PRADESH — SAMPLE SCHOLARSHIP NOTIFICATION (2026-27)
Scheme: Post-Matric Scholarship (Vidya Deevena Fee Reimbursement — Sample Data)
Portal: https://jnanabhumi.ap.gov.in

1. ELIGIBILITY CRITERIA:
- Domicile: Applicant must be a permanent resident (domicile) of Andhra Pradesh.
- Social Category: Students belonging to SC, ST, BC, EBC, Kapu, and Minority communities.
- Education Level: Enrolled in Post-Matric courses (ITI, Polytechnic, Undergraduate Degree/B.Tech, Postgraduate).
- Family Income Limit: Total annual family income from all sources shall not exceed Rs. 2,50,000/- per annum.
- Minimum Academic Marks: Minimum 50% marks in the previous qualifying examination.
- Attendance Requirement: Minimum 75% aggregate attendance is mandatory in each semester/academic year.
- Bank Account: Mother's or Student's bank account must be Aadhaar-seeded and NPCI mapped for DBT.

2. REQUIRED DOCUMENTS:
1. Aadhaar Card of Student and Mother (Mandatory)
2. Integrated Caste / Community Certificate issued via MeeSeva (Mandatory for SC/ST/BC/Kapu)
3. Latest Income Certificate / Rice Card issued by Tahsildar / Grama Sachivalayam (Mandatory)
4. SSC / 10th Class Marks Memo & Previous Qualifying Exam Marks Sheet (Mandatory)
5. College Bonafide / Study Certificate & Fee Structure Letter (Mandatory)
6. Bank Passbook First Page showing Aadhaar-NPCI Seeding Status (Mandatory)
7. Disability Certificate (UDID / SADAREM) if applying under PwD quota (Optional / Conditional)

3. IMPORTANT DEADLINES (SAMPLE SCHEDULE):
- Online Fresh & Renewal Registration Opens: 15 October 2026
- Last Date for Student Application Submission: 15 December 2026
- Last Date for College Biometric e-KYC & Verification: 28 December 2026`,
    eligibilityCriteria: {
      maxFamilyIncomeInr: 250000,
      minPercentage: 50,
      allowedCategories: ['SC', 'ST', 'BC', 'OBC', 'EBC', 'Kapu', 'Minority'],
      allowedStates: ['Andhra Pradesh'],
      educationLevels: [
        'Post-Matric (Class 11-12 / ITI / Polytechnic)',
        'Undergraduate',
        'Postgraduate',
      ],
      genderRequirement: 'All',
      ageMin: 15,
      ageMax: 35,
      minAttendancePercent: 75,
      domicileRequired: true,
      aadhaarSeedingRequired: true,
      otherRules: [
        {
          id: 'rule-ap-land',
          title: 'Agricultural & Property Ceiling',
          titleTe: 'వ్యవసాయ భూమి & ఆస్తి పరిమితి',
          description:
            'Total wetland should be below 10 acres or dry land below 25 acres; no family member should be a permanent government employee.',
          descriptionTe:
            'కుటుంబానికి 10 ఎకరాల లోపు మాగాణి లేదా 25 ఎకరాల లోపు మెట్ట భూమి ఉండాలి; ప్రభుత్వ శాశ్వత ఉద్యోగి ఉండకూడదు.',
        },
        {
          id: 'rule-ap-biometric',
          title: 'Grama/Ward Sachivalayam e-KYC',
          titleTe: 'గ్రామ/వార్డు సచివాలయ e-KYC',
          description:
            'Biometric authentication of both student and mother must be completed at the college or Sachivalayam before sanction.',
          descriptionTe:
            'విద్యార్థి మరియు తల్లి యొక్క బయోమెట్రిక్ e-KYC కళాశాల లేదా సచివాలయంలో పూర్తి చేయాలి.',
        },
      ],
    },
    requiredDocuments: [
      {
        id: 'doc-aadhaar',
        name: 'Student & Mother Aadhaar Card',
        nameTe: 'విద్యార్థి & తల్లి ఆధార్ కార్డు',
        mandatory: true,
        category: 'Identity',
        notes: 'Name and Date of Birth must match SSC Memo exactly.',
        notesTe: 'పేరు మరియు పుట్టిన తేదీ 10వ తరగతి మెమోతో ఖచ్చితంగా సరిపోలాలి.',
        issuingOffice: 'UIDAI / Aadhaar Seva Kendra',
        issuingOfficeTe: 'UIDAI / ఆధార్ సేవా కేంద్రం',
      },
      {
        id: 'doc-income',
        name: 'Latest Income Certificate / White Ration Card',
        nameTe: 'తాజా ఆదాయ ధృవీకరణ పత్రం / రైస్ కార్డు',
        mandatory: true,
        category: 'Financial',
        notes: 'Must show annual family income ≤ ₹2,50,000 for FY 2026-27.',
        notesTe: '2026-27 సంవత్సరానికి కుటుంబ వార్షిక ఆదాయం ₹2,50,000 లోపు ఉండాలి.',
        issuingOffice: 'MeeSeva / Tahsildar (MRO)',
        issuingOfficeTe: 'మీసేవ / తహసీల్దార్ కార్యాలయం',
      },
      {
        id: 'doc-caste',
        name: 'Integrated Caste / Community Certificate',
        nameTe: 'కులం / సామాజిక వర్గ ధృవీకరణ పత్రం',
        mandatory: true,
        category: 'Category',
        notes: 'Permanent MeeSeva certificate for SC/ST/BC/Kapu/EBC.',
        notesTe: 'SC/ST/BC/కాపు/EBC విద్యార్థులకు మీసేవ నుండి జారీ చేసిన శాశ్వత కుల ధృవీకరణ పత్రం.',
        issuingOffice: 'MeeSeva / Tahsildar (MRO)',
        issuingOfficeTe: 'మీసేవ / తహసీల్దార్ కార్యాలయం',
      },
      {
        id: 'doc-ssc',
        name: 'SSC (10th) & Previous Qualifying Marks Memo',
        nameTe: '10వ తరగతి & గత అర్హత పరీక్ష మార్కుల మెమో',
        mandatory: true,
        category: 'Academic',
        notes: 'Minimum 50% aggregate required in last qualifying examination.',
        notesTe: 'గత అర్హత పరీక్షలో కనీసం 50% మార్కులు తప్పనిసరి.',
        issuingOffice: 'Board / Previous Institution',
        issuingOfficeTe: 'విద్యా బోర్డు / గత కళాశాల',
      },
      {
        id: 'doc-bonafide',
        name: 'College Bonafide & Fee Structure Certificate',
        nameTe: 'కళాశాల బోనఫైడ్ & ఫీజు వివరాల పత్రం',
        mandatory: true,
        category: 'Academic',
        notes: 'Signed by Principal with current academic year admission number.',
        notesTe: 'ప్రస్తుత విద్యా సంవత్సర అడ్మిషన్ నంబర్‌తో ప్రిన్సిపాల్ సంతకం ఉండాలి.',
        issuingOffice: 'Current College Principal',
        issuingOfficeTe: 'ప్రస్తుత కళాశాల ప్రిన్సిపాల్',
      },
      {
        id: 'doc-bank',
        name: 'Bank Passbook (Aadhaar-NPCI Seeded)',
        nameTe: 'బ్యాంక్ పాస్‌బుక్ (ఆధార్-NPCI లింక్ చేయబడినది)',
        mandatory: true,
        category: 'Banking',
        notes: 'Active nationalized/scheduled bank account with DBT enabled.',
        notesTe: 'DBT సక్రియంగా ఉన్న యాక్టివ్ బ్యాంక్ ఖాతా మొదటి పేజీ కాపీ.',
        issuingOffice: 'Bank Branch / NPCI Mapper',
        issuingOfficeTe: 'బ్యాంక్ శాఖ / NPCI మ్యాపర్',
      },
      {
        id: 'doc-pwd',
        name: 'SADAREM / UDID Disability Certificate',
        nameTe: 'సదరం / UDID దివ్యాంగ ధృవీకరణ పత్రం',
        mandatory: false,
        category: 'Special Quota',
        notes: 'Required only if claiming Person with Disability (≥40%) relaxation.',
        notesTe: 'దివ్యాంగ కోటా (≥40%) కింద దరఖాస్తు చేసేవారికి మాత్రమే అవసరం.',
        issuingOffice: 'District Medical Board / UDID',
        issuingOfficeTe: 'జిల్లా వైద్య మండలి / UDID',
      },
    ],
    deadlines: [
      {
        id: 'dl-ap-1',
        label: 'Online Application Submission Closing Date',
        labelTe: 'ఆన్‌లైన్ దరఖాస్తు సమర్పణ చివరి తేదీ',
        dateText: '15 December 2026',
        isoDate: '2026-12-15',
        isUrgent: true,
      },
      {
        id: 'dl-ap-2',
        label: 'College Verification & Biometric e-KYC',
        labelTe: 'కళాశాల ధృవీకరణ & బయోమెట్రిక్ e-KYC చివరి తేదీ',
        dateText: '28 December 2026',
        isoDate: '2026-12-28',
        isUrgent: false,
      },
    ],
  },
  {
    id: 'sample-ts-epass',
    isSampleData: true,
    sourceFileName: 'Sample_Telangana_ePass_PostMatric_2026.pdf',
    schemeName: 'Telangana ePASS Post-Matric Scholarship (Sample Scheme)',
    schemeNameTe: 'తెలంగాణ ePASS పోస్ట్-మెట్రిక్ స్కాలర్‌షిప్ (నమూనా పథకం)',
    issuingAuthority:
      'Department of Scheduled Castes Development & Welfare, Govt. of Telangana (Sample)',
    issuingAuthorityTe:
      'షెడ్యూల్డ్ కులాల అభివృద్ధి & సంక్షేమ శాఖ, తెలంగాణ ప్రభుత్వం (నమూనా)',
    academicYear: '2026–2027',
    benefitAmount: 'RTF (Tuition Fee) + MTF (Maintenance ₹500–₹1,500/month)',
    benefitAmountTe: 'RTF (ట్యూషన్ ఫీజు) + MTF (నిర్వహణ భత్యం నెలకు ₹500–₹1,500)',
    officialPortalUrl: 'https://telanganaepass.cgg.gov.in',
    summary:
      'Sample notification for Telangana Post-Matric Tuition Fee (RTF) and Maintenance Fee (MTF) assistance for SC, ST, BC, EBC, and Minority students domiciled in Telangana.',
    summaryTe:
      'తెలంగాణ స్థానిక SC, ST, BC, EBC మరియు మైనారిటీ విద్యార్థులకు ట్యూషన్ ఫీజు (RTF) మరియు నిర్వహణ భత్యం (MTF) అందించే నమూనా పోస్ట్-మెట్రిక్ పథకం నోటిఫికేషన్.',
    pageCount: 2,
    extractionMethod: 'sample-dataset',
    extractedText: `GOVERNMENT OF TELANGANA — SAMPLE ePASS SCHOLARSHIP NOTIFICATION (2026-27)
Scheme: Telangana ePASS Post-Matric Scholarship (RTF & MTF — Sample Data)
Portal: https://telanganaepass.cgg.gov.in

1. ELIGIBILITY CRITERIA:
- Domicile: Permanent resident of Telangana State studying in recognized Telangana institutions.
- Categories: SC, ST, BC, EBC, Minority, and Disabled Welfare students.
- Family Income Ceiling: Rs. 2,00,000/- per annum for SC/ST (and Rs. 1,50,000/- for BC/EBC/Minority rural; capped at Rs. 2,00,000/- overall threshold for screening).
- Minimum Marks: Pass in previous qualifying exam (minimum 45% for renewal/admission merit).
- Attendance: Minimum 75% attendance at the end of each quarter.

2. MANDATORY DOCUMENTS:
- Aadhaar Card
- MeeSeva Income Certificate (generated after 01 April 2026)
- MeeSeva Caste Certificate
- CET Allotment Order / College Bonafide Certificate
- SSC Hall Ticket / Marks Memo
- Nationalized Bank Account Passbook linked with Aadhaar

3. DEADLINES:
- Fresh & Renewal Registration Deadline: 31 December 2026`,
    eligibilityCriteria: {
      maxFamilyIncomeInr: 200000,
      minPercentage: 45,
      allowedCategories: ['SC', 'ST', 'BC', 'OBC', 'EBC', 'Minority'],
      allowedStates: ['Telangana'],
      educationLevels: [
        'Post-Matric (Class 11-12 / ITI / Polytechnic)',
        'Undergraduate',
        'Postgraduate',
      ],
      genderRequirement: 'All',
      ageMin: 15,
      ageMax: 35,
      minAttendancePercent: 75,
      domicileRequired: true,
      aadhaarSeedingRequired: true,
      otherRules: [
        {
          id: 'rule-ts-cet',
          title: 'Convener Quota Admission',
          titleTe: 'కన్వీనర్ కోటా ప్రవేశం',
          description:
            'For professional courses (B.Tech/MBA/MCA), admission must be through State Convener CET allotment.',
          descriptionTe:
            'వృత్తిపరమైన కోర్సులకు (B.Tech/MBA/MCA) రాష్ట్ర కన్వీనర్ CET కౌన్సెలింగ్ ద్వారా ప్రవేశం పొంది ఉండాలి.',
        },
      ],
    },
    requiredDocuments: [
      {
        id: 'doc-ts-aadhaar',
        name: 'Student Aadhaar Card',
        nameTe: 'విద్యార్థి ఆధార్ కార్డు',
        mandatory: true,
        category: 'Identity',
        notes: 'Must match SSC certificate name and DOB.',
        notesTe: 'పేరు మరియు పుట్టిన తేదీ SSC మెమోతో సరిపోలాలి.',
        issuingOffice: 'UIDAI',
        issuingOfficeTe: 'UIDAI',
      },
      {
        id: 'doc-ts-income',
        name: 'MeeSeva Income Certificate (Current FY)',
        nameTe: 'మీసేవ తాజా ఆదాయ ధృవీకరణ పత్రం',
        mandatory: true,
        category: 'Financial',
        notes: 'Issued on or after 01 April 2026; income ≤ ₹2,00,000.',
        notesTe: '01 ఏప్రిల్ 2026 తర్వాత జారీ చేయబడినది; ఆదాయం ≤ ₹2,00,000.',
        issuingOffice: 'Telangana MeeSeva / Tahsildar',
        issuingOfficeTe: 'తెలంగాణ మీసేవ / తహసీల్దార్',
      },
      {
        id: 'doc-ts-caste',
        name: 'MeeSeva Caste Certificate',
        nameTe: 'మీసేవ కుల ధృవీకరణ పత్రం',
        mandatory: true,
        category: 'Category',
        notes: 'Verify barcode/application number on MeeSeva portal.',
        notesTe: 'మీసేవ పోర్టల్‌లో బార్‌కోడ్/నెంబర్ సరిచూసుకోండి.',
        issuingOffice: 'Telangana MeeSeva',
        issuingOfficeTe: 'తెలంగాణ మీసేవ',
      },
      {
        id: 'doc-ts-cet',
        name: 'CET Allotment Order & Study Bonafide',
        nameTe: 'CET అలాట్‌మెంట్ ఆర్డర్ & స్టడీ బోనఫైడ్',
        mandatory: true,
        category: 'Academic',
        notes: 'Last 7 years study certificates for local status verification.',
        notesTe: 'స్థానికత నిర్ధారణకు గత 7 సంవత్సరాల స్టడీ సర్టిఫికెట్లు.',
        issuingOffice: 'CET Convener / College',
        issuingOfficeTe: 'CET కన్వీనర్ / కళాశాల',
      },
      {
        id: 'doc-ts-bank',
        name: 'Student Bank Passbook (Aadhaar Seeded)',
        nameTe: 'విద్యార్థి బ్యాంక్ పాస్‌బుక్ (ఆధార్ లింక్)',
        mandatory: true,
        category: 'Banking',
        notes: 'Account must not be joint or dormant.',
        notesTe: 'ఖాతా యాక్టివ్‌గా ఉండాలి మరియు ఆధార్‌తో లింక్ అయి ఉండాలి.',
        issuingOffice: 'Bank Branch',
        issuingOfficeTe: 'బ్యాంక్ శాఖ',
      },
    ],
    deadlines: [
      {
        id: 'dl-ts-1',
        label: 'Fresh & Renewal Application Deadline',
        labelTe: 'కొత్త & పునరుద్ధరణ దరఖాస్తు చివరి తేదీ',
        dateText: '31 December 2026',
        isoDate: '2026-12-31',
        isUrgent: true,
      },
    ],
  },
  {
    id: 'sample-nsp-csss',
    isSampleData: true,
    sourceFileName: 'Sample_NSP_CentralSector_Scholarship_2026.pdf',
    schemeName: 'PM-USP Central Sector Scheme of Scholarship (NSP Sample)',
    schemeNameTe: 'PM-USP సెంట్రల్ సెక్టార్ కాలేజీ స్కాలర్‌షిప్ (NSP నమూనా)',
    issuingAuthority: 'Ministry of Education, Dept. of Higher Education, Govt. of India (Sample)',
    issuingAuthorityTe: 'విద్యా మంత్రిత్వ శాఖ, ఉన్నత విద్యా విభాగం, భారత ప్రభుత్వం (నమూనా)',
    academicYear: '2026–2027',
    benefitAmount: '₹12,000/year (UG First 3 Years) & ₹20,000/year (PG / 4th–5th Year)',
    benefitAmountTe: 'సంవత్సరానికి ₹12,000 (UG మొదటి 3 ఏళ్లు) & ₹20,000 (PG / 4–5వ ఏట)',
    officialPortalUrl: 'https://scholarships.gov.in',
    summary:
      'Sample nationwide merit-cum-means Central Sector scholarship for top 20th percentile Class 12 pass-outs enrolled in regular undergraduate or postgraduate degree programs across India.',
    summaryTe:
      'భారతదేశవ్యాప్తంగా 12వ తరగతిలో టాప్ 20వ పర్సంటైల్ సాధించి రెగ్యులర్ డిగ్రీ లేదా పీజీ చదువుతున్న విద్యార్థుల కోసం జాతీయ మెరిట్-కమ్-మీన్స్ నమూనా స్కాలర్‌షిప్.',
    pageCount: 2,
    extractionMethod: 'sample-dataset',
    extractedText: `MINISTRY OF EDUCATION, GOVERNMENT OF INDIA — SAMPLE NOTIFICATION
Scheme: PM-USP Central Sector Scheme of Scholarship for College & University Students
Portal: https://scholarships.gov.in (National Scholarship Portal)

1. ELIGIBILITY CRITERIA:
- Geography: All India (Indian Citizens domiciled in any State/UT).
- Social Category: Open to All Categories (General/OC, EWS, OBC/BC, SC, ST).
- Academic Merit: Minimum 80% marks (or above 80th percentile) in Class 12 Board Exam.
- Course Level: Regular full-time Undergraduate or Postgraduate course (not distance/correspondence).
- Family Income Limit: Gross parental/family income must not exceed Rs. 4,50,000/- per annum.
- Age Limit: Between 18 and 25 years for fresh applicants.
- Aadhaar & OTR: One Time Registration (OTR) on NSP with Aadhaar-seeded bank account mandatory.

2. REQUIRED DOCUMENTS:
- Aadhaar Card (for NSP OTR & Face Auth)
- Class 12th Board Marks Statement
- Family Income Certificate issued by Competent Authority
- College Bonafide / Institute Verification Form
- Aadhaar-Seeded Bank Passbook

3. DEADLINES:
- Student Application Closing Date: 30 November 2026
- Institute Verification Deadline: 15 December 2026`,
    eligibilityCriteria: {
      maxFamilyIncomeInr: 450000,
      minPercentage: 80,
      allowedCategories: ['All'],
      allowedStates: ['All India'],
      educationLevels: ['Undergraduate', 'Postgraduate'],
      genderRequirement: 'All',
      ageMin: 17,
      ageMax: 25,
      minAttendancePercent: 75,
      domicileRequired: false,
      aadhaarSeedingRequired: true,
      otherRules: [
        {
          id: 'rule-nsp-regular',
          title: 'Regular Full-Time Enrollment',
          titleTe: 'రెగ్యులర్ ఫుల్-టైమ్ కోర్సు',
          description:
            'Must be pursuing a regular degree course recognized by AICTE/UGC; distance or correspondence courses are ineligible.',
          descriptionTe:
            'AICTE/UGC గుర్తింపు పొందిన రెగ్యులర్ డిగ్రీ కోర్సు చదువుతుండాలి; దూరవిద్య అభ్యర్థులు అనర్హులు.',
        },
      ],
    },
    requiredDocuments: [
      {
        id: 'doc-nsp-aadhaar',
        name: 'Aadhaar Card (with NSP OTR)',
        nameTe: 'ఆధార్ కార్డు (NSP OTR తో పాటు)',
        mandatory: true,
        category: 'Identity',
        notes: 'Face authentication via NSP OTR mobile app required.',
        notesTe: 'NSP OTR యాప్ ద్వారా ఫేస్ అథెంటికేషన్ అవసరం.',
        issuingOffice: 'UIDAI / NSP Portal',
        issuingOfficeTe: 'UIDAI / NSP పోర్టల్',
      },
      {
        id: 'doc-nsp-12th',
        name: 'Class 12 / Intermediate Board Marks Memo',
        nameTe: 'ఇంటర్మీడియట్ / 12వ తరగతి మార్కుల మెమో',
        mandatory: true,
        category: 'Academic',
        notes: 'Must demonstrate ≥ 80% or top 20th percentile score.',
        notesTe: 'కనీసం 80% మార్కులు లేదా టాప్ 20వ పర్సంటైల్ ఉండాలి.',
        issuingOffice: 'State / CBSE / ISC Board',
        issuingOfficeTe: 'ఇంటర్మీడియట్ / CBSE బోర్డు',
      },
      {
        id: 'doc-nsp-income',
        name: 'Annual Family Income Certificate (≤ ₹4.5 Lakhs)',
        nameTe: 'వార్షిక కుటుంబ ఆదాయ ధృవీకరణ పత్రం (≤ ₹4.5 లక్షలు)',
        mandatory: true,
        category: 'Financial',
        notes: 'Issued by Revenue Authority (Tahsildar/SDM).',
        notesTe: 'రెవెన్యూ అధికారి (తహసీల్దార్) ద్వారా జారీ చేయబడినది.',
        issuingOffice: 'Tahsildar / Revenue Office',
        issuingOfficeTe: 'తహసీల్దార్ / రెవెన్యూ కార్యాలయం',
      },
      {
        id: 'doc-nsp-bonafide',
        name: 'Institute Bonafide Verification Form',
        nameTe: 'కళాశాల బోనఫైడ్ ధృవీకరణ ఫారమ్',
        mandatory: true,
        category: 'Academic',
        notes: 'Stamped and signed by College Nodal Officer.',
        notesTe: 'కళాశాల నోడల్ అధికారి సంతకం & స్టాంప్ ఉండాలి.',
        issuingOffice: 'College Nodal Officer',
        issuingOfficeTe: 'కళాశాల నోడల్ అధికారి',
      },
      {
        id: 'doc-nsp-bank',
        name: 'NPCI Aadhaar-Seeded Bank Account',
        nameTe: 'NPCI ఆధార్ సీడెడ్ బ్యాంక్ ఖాతా',
        mandatory: true,
        category: 'Banking',
        notes: 'DBT payments fail if NPCI mapper status is inactive.',
        notesTe: 'NPCI మ్యాపర్ యాక్టివ్‌గా లేకపోతే DBT చెల్లింపు నిలిచిపోతుంది.',
        issuingOffice: 'Bank Branch',
        issuingOfficeTe: 'బ్యాంక్ శాఖ',
      },
    ],
    deadlines: [
      {
        id: 'dl-nsp-1',
        label: 'Student Online Application Closing Date',
        labelTe: 'విద్యార్థి ఆన్‌లైన్ దరఖాస్తు చివరి తేదీ',
        dateText: '30 November 2026',
        isoDate: '2026-11-30',
        isUrgent: true,
      },
      {
        id: 'dl-nsp-2',
        label: 'Institute Nodal Officer Verification',
        labelTe: 'కళాశాల నోడల్ అధికారి ధృవీకరణ గడువు',
        dateText: '15 December 2026',
        isoDate: '2026-12-15',
        isUrgent: false,
      },
    ],
  },
];

export const SAMPLE_APPLICANT_ELIGIBLE: ApplicantProfile = {
  fullName: 'Kondapuram Naga Rani',
  guardianName: 'Kondapuram Srinivasa Rao',
  domicileState: 'Andhra Pradesh',
  category: 'BC',
  gender: 'Female',
  age: 20,
  educationLevel: 'Undergraduate',
  previousMarksPercent: 84.5,
  annualFamilyIncomeInr: 185000,
  attendancePercent: 88,
  isPwd: false,
  aadhaarSeededBank: true,
  isSampleProfile: true,
};

export const SAMPLE_APPLICANT_BORDERLINE: ApplicantProfile = {
  fullName: 'Rapolu Venkata Sai Kumar',
  guardianName: 'Rapolu Narasimha Murthy',
  domicileState: 'Telangana',
  category: 'OC',
  gender: 'Male',
  age: 21,
  educationLevel: 'Undergraduate',
  previousMarksPercent: 72.0,
  annualFamilyIncomeInr: 280000,
  attendancePercent: 71,
  isPwd: false,
  aadhaarSeededBank: false,
  isSampleProfile: true,
};

export const SAMPLE_UPLOADED_DOCUMENTS: UploadedApplicantDocument[] = [
  {
    id: 'sdoc-aadhaar',
    docType: 'Aadhaar Card',
    docTypeTe: 'ఆధార్ కార్డు',
    fileName: 'Sample_Aadhaar_Card.pdf',
    extractedName: 'KONDAPURAM NAGARANI',
    guardianNameOnDoc: 'D/O Kondapuram Srinivasa Rao',
    isSampleDocument: true,
    rawSnippet: 'UIDAI Sample Record — Name: KONDAPURAM NAGARANI',
  },
  {
    id: 'sdoc-ssc',
    docType: 'SSC / 10th Marks Memo',
    docTypeTe: '10వ తరగతి మార్కుల మెమో',
    fileName: 'Sample_SSC_Memo.pdf',
    extractedName: 'K. Naga Rani',
    guardianNameOnDoc: 'Kondapuram Srinivasa Rao',
    isSampleDocument: true,
    rawSnippet: 'Board of Secondary Education — Candidate: K. Naga Rani',
  },
  {
    id: 'sdoc-income',
    docType: 'MeeSeva Income Certificate',
    docTypeTe: 'మీసేవ ఆదాయ ధృవీకరణ పత్రం',
    fileName: 'Sample_Income_Certificate.pdf',
    extractedName: 'Kondapuram Naga Rani',
    guardianNameOnDoc: 'Kondapuram Srinivasa Rao',
    isSampleDocument: true,
    rawSnippet: 'Certified Annual Income Rs. 1,85,000 — Applicant: Kondapuram Naga Rani',
  },
  {
    id: 'sdoc-bank',
    docType: 'Bank Passbook Front Page',
    docTypeTe: 'బ్యాంక్ పాస్‌బుక్ మొదటి పేజీ',
    fileName: 'Sample_Bank_Passbook.jpg',
    extractedName: 'Nagarani Kondapuram',
    isSampleDocument: true,
    rawSnippet: 'SBI Savings Account — Holder: Nagarani Kondapuram',
  },
  {
    id: 'sdoc-caste',
    docType: 'Caste / Community Certificate',
    docTypeTe: 'కుల ధృవీకరణ పత్రం',
    fileName: 'Sample_Caste_Certificate.pdf',
    extractedName: 'Kondapuram Nagaranii',
    isSampleDocument: true,
    rawSnippet: 'MeeSeva BC-B Certificate — Name: Kondapuram Nagaranii',
  },
];

export function downloadSampleNotificationPdf(scholarship: ScholarshipAnalysis) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 44;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 52;

  doc.setFillColor(29, 78, 216);
  doc.rect(0, 0, pageWidth, 84, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SAMPLE SCHOLARSHIP NOTIFICATION (FOR TESTING)', margin, 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Generated by FormSaathi · ${scholarship.sourceFileName}`, margin, 56);

  y = 114;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(scholarship.schemeName, maxLineWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 18 + 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(51, 65, 85);

  const paragraphs = scholarship.extractedText.split('\n');
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      y += 8;
      continue;
    }
    const wrapped = doc.splitTextToSize(trimmed, maxLineWidth);
    if (y + wrapped.length * 14 > 780) {
      doc.addPage();
      y = 50;
    }
    doc.text(wrapped, margin, y);
    y += wrapped.length * 14 + 4;
  }

  doc.save(scholarship.sourceFileName);
}
