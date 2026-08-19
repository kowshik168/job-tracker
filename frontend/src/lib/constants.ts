import type {
  ApplicationStatus,
  CurrentRound,
  ResumeType,
  Source,
} from '../types';

export const RESUME_TYPE_LABELS: Record<ResumeType, string> = {
  BACKEND_SDE: 'Backend SDE',
  SRE_DEVOPS: 'SRE / DevOps',
  GENERAL_SWE: 'General SWE',
  OTHER: 'Other',
};

export const SOURCE_LABELS: Record<Source, string> = {
  LINKEDIN: 'LinkedIn',
  COMPANY_WEBSITE: 'Company Website',
  REFERRAL: 'Referral',
  WELLFOUND: 'Wellfound',
  NAUKRI: 'Naukri',
  INSTAHYRE: 'Instahyre',
  OTHER: 'Other',
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  OA: 'OA',
  RECRUITER_SCREEN: 'Recruiter Screen',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
};

export const CURRENT_ROUND_LABELS: Record<CurrentRound, string> = {
  NONE: 'None',
  OA: 'OA',
  RECRUITER_SCREEN: 'Recruiter Screen',
  TECHNICAL_ROUND_1: 'Technical Round 1',
  TECHNICAL_ROUND_2: 'Technical Round 2',
  SYSTEM_DESIGN: 'System Design',
  MANAGERIAL: 'Managerial',
  HR: 'HR',
  FINAL: 'Final',
  OTHER: 'Other',
};

export const RESUME_TYPES = Object.keys(RESUME_TYPE_LABELS) as ResumeType[];
export const SOURCES = Object.keys(SOURCE_LABELS) as Source[];
export const STATUSES = Object.keys(STATUS_LABELS) as ApplicationStatus[];
export const CURRENT_ROUNDS = Object.keys(CURRENT_ROUND_LABELS) as CurrentRound[];

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SAVED: 'bg-slate-100 text-slate-700 border-slate-200',
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  OA: 'bg-purple-50 text-purple-700 border-purple-200',
  RECRUITER_SCREEN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  INTERVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  OFFER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  ON_HOLD: 'bg-orange-50 text-orange-700 border-orange-200',
};

export const CHART_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#64748b',
  '#db2777',
];
