import React from 'react';
import { ArrowRight, RotateCcw, UserCheck } from 'lucide-react';
import { ApplicantProfile, Language } from '../types/scholarship';
import { t } from '../i18n/translations';
import {
  SAMPLE_APPLICANT_BORDERLINE,
  SAMPLE_APPLICANT_ELIGIBLE,
} from '../data/sampleScholarships';

interface ApplicantFormPanelProps {
  lang: Language;
  applicant: ApplicantProfile;
  onChangeApplicant: (profile: ApplicantProfile) => void;
  onNextStep: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Maharashtra',
  'Kerala',
  'Odisha',
  'Delhi',
  'Uttar Pradesh',
  'West Bengal',
  'Other State / UT',
];

const CATEGORIES = ['SC', 'ST', 'BC', 'OBC', 'EBC', 'EWS', 'OC', 'Kapu', 'Minority'];

const EDUCATION_LEVELS = [
  'Pre-Matric (Class 9-10)',
  'Post-Matric (Class 11-12 / ITI / Polytechnic)',
  'Undergraduate',
  'Postgraduate',
  'PhD / Research',
];

export const ApplicantFormPanel: React.FC<ApplicantFormPanelProps> = ({
  lang,
  applicant,
  onChangeApplicant,
  onNextStep,
}) => {
  const copy = t(lang);

  const updateField = <K extends keyof ApplicantProfile>(
    key: K,
    value: ApplicantProfile[K]
  ) => {
    onChangeApplicant({
      ...applicant,
      [key]: value,
      isSampleProfile: false,
    });
  };

  const handleClear = () => {
    onChangeApplicant({
      fullName: '',
      guardianName: '',
      domicileState: 'Andhra Pradesh',
      category: 'BC',
      gender: 'Female',
      age: '',
      educationLevel: 'Undergraduate',
      previousMarksPercent: '',
      annualFamilyIncomeInr: '',
      attendancePercent: '',
      isPwd: false,
      aadhaarSeededBank: true,
      isSampleProfile: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {copy.applicantSection.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">
            {copy.applicantSection.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>{copy.applicantSection.saveAndCheckBtn}</span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </div>

      {/* Quick Sample Profile Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {copy.applicantSection.sampleProfilesTitle}
          </div>
          {applicant.isSampleProfile && (
            <div className="text-xs text-amber-700 font-medium mt-0.5">
              {copy.banners.sampleDataBadge}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onChangeApplicant(SAMPLE_APPLICANT_ELIGIBLE)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-800 hover:bg-blue-100 cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5 shrink-0" />
            <span>{copy.applicantSection.loadEligibleSample}</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeApplicant(SAMPLE_APPLICANT_BORDERLINE)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <span>{copy.applicantSection.loadMismatchSample}</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span>{copy.applicantSection.resetForm}</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onNextStep();
        }}
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="applicant-full-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.fullName}
            </label>
            <input
              id="applicant-full-name"
              type="text"
              value={applicant.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="e.g., Kondapuram Naga Rani"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <p className="mt-1 text-xs text-slate-500">
              {copy.applicantSection.fullNameHint}
            </p>
          </div>

          {/* Guardian Name */}
          <div>
            <label
              htmlFor="applicant-guardian"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.guardianName}
            </label>
            <input
              id="applicant-guardian"
              type="text"
              value={applicant.guardianName}
              onChange={(e) => updateField('guardianName', e.target.value)}
              placeholder="e.g., Kondapuram Srinivasa Rao"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Domicile State */}
          <div>
            <label
              htmlFor="applicant-state"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.domicileState}
            </label>
            <select
              id="applicant-state"
              value={applicant.domicileState}
              onChange={(e) => updateField('domicileState', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="applicant-category"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.category}
            </label>
            <select
              id="applicant-category"
              value={applicant.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="applicant-gender"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.gender}
            </label>
            <select
              id="applicant-gender"
              value={applicant.gender}
              onChange={(e) =>
                updateField('gender', e.target.value as ApplicantProfile['gender'])
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Age */}
          <div>
            <label
              htmlFor="applicant-age"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.age}
            </label>
            <input
              id="applicant-age"
              type="number"
              min={10}
              max={60}
              value={applicant.age}
              onChange={(e) =>
                updateField('age', e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Education Level */}
          <div>
            <label
              htmlFor="applicant-education"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.educationLevel}
            </label>
            <select
              id="applicant-education"
              value={applicant.educationLevel}
              onChange={(e) => updateField('educationLevel', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Previous Marks */}
          <div>
            <label
              htmlFor="applicant-marks"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.previousMarks}
            </label>
            <input
              id="applicant-marks"
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={applicant.previousMarksPercent}
              onChange={(e) =>
                updateField(
                  'previousMarksPercent',
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Annual Family Income */}
          <div>
            <label
              htmlFor="applicant-income"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.annualIncome}
            </label>
            <input
              id="applicant-income"
              type="number"
              min={0}
              step={1000}
              value={applicant.annualFamilyIncomeInr}
              onChange={(e) =>
                updateField(
                  'annualFamilyIncomeInr',
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Attendance */}
          <div>
            <label
              htmlFor="applicant-attendance"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              {copy.applicantSection.attendance}
            </label>
            <input
              id="applicant-attendance"
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={applicant.attendancePercent}
              onChange={(e) =>
                updateField(
                  'attendancePercent',
                  e.target.value === '' ? '' : Number(e.target.value)
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Boolean Toggles */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50">
            <span className="text-sm font-medium text-slate-800">
              {copy.applicantSection.aadhaarSeeded}
            </span>
            <input
              type="checkbox"
              checked={applicant.aadhaarSeededBank}
              onChange={(e) => updateField('aadhaarSeededBank', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50">
            <span className="text-sm font-medium text-slate-800">
              {copy.applicantSection.isPwd}
            </span>
            <input
              type="checkbox"
              checked={applicant.isPwd}
              onChange={(e) => updateField('isPwd', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <span>{copy.applicantSection.saveAndCheckBtn}</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </form>
    </div>
  );
};
