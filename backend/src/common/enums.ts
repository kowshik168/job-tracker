export const RESUME_TYPE_LABELS = {
  BACKEND_SDE: 'Backend SDE',
  SRE_DEVOPS: 'SRE / DevOps',
  GENERAL_SWE: 'General SWE',
  OTHER: 'Other',
} as const;

export const SOURCE_LABELS = {
  LINKEDIN: 'LinkedIn',
  COMPANY_WEBSITE: 'Company Website',
  REFERRAL: 'Referral',
  WELLFOUND: 'Wellfound',
  NAUKRI: 'Naukri',
  INSTAHYRE: 'Instahyre',
  OTHER: 'Other',
} as const;

export const STATUS_LABELS = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  OA: 'OA',
  RECRUITER_SCREEN: 'Recruiter Screen',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
} as const;

export const CURRENT_ROUND_LABELS = {
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
} as const;

export type ResumeType = keyof typeof RESUME_TYPE_LABELS;
export type Source = keyof typeof SOURCE_LABELS;
export type ApplicationStatus = keyof typeof STATUS_LABELS;
export type CurrentRound = keyof typeof CURRENT_ROUND_LABELS;
