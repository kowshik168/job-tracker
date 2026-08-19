export type ResumeType =
  | 'BACKEND_SDE'
  | 'SRE_DEVOPS'
  | 'GENERAL_SWE'
  | 'OTHER';

export type Source =
  | 'LINKEDIN'
  | 'COMPANY_WEBSITE'
  | 'REFERRAL'
  | 'WELLFOUND'
  | 'NAUKRI'
  | 'INSTAHYRE'
  | 'OTHER';

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'OA'
  | 'RECRUITER_SCREEN'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'ON_HOLD';

export type CurrentRound =
  | 'NONE'
  | 'OA'
  | 'RECRUITER_SCREEN'
  | 'TECHNICAL_ROUND_1'
  | 'TECHNICAL_ROUND_2'
  | 'SYSTEM_DESIGN'
  | 'MANAGERIAL'
  | 'HR'
  | 'FINAL'
  | 'OTHER';

export interface ResumeSummary {
  id: string;
  name: string;
  resumeType: ResumeType;
  fileName: string;
  fileSize: number;
}

export interface ResumeLearning {
  id: string;
  content: string;
  resumeId: string;
  applicationId: string | null;
  createdAt: string;
  application?: {
    id: string;
    company: string;
    role: string;
    status: ApplicationStatus;
  } | null;
}

export interface Resume extends ResumeSummary {
  mimeType: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
    learnings: number;
  };
  applications?: {
    id: string;
    company: string;
    role: string;
    status: ApplicationStatus;
    appliedAt: string;
  }[];
  learnings?: ResumeLearning[];
}

export interface Application {
  id: string;
  company: string;
  role: string;
  jobUrl: string | null;
  appliedAt: string;
  source: Source | null;
  referral: string | null;
  resumeType: ResumeType;
  resumeId: string | null;
  resume: ResumeSummary | null;
  status: ApplicationStatus;
  currentRound: CurrentRound;
  recruiterName: string | null;
  recruiterContact: string | null;
  followUpDate: string | null;
  notes: string | null;
  lastActivityAt: string;
  noResponseAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  company: string;
  role: string;
  jobUrl?: string;
  appliedAt: string;
  source?: Source;
  referral?: string;
  resumeType: ResumeType;
  resumeId?: string;
  status: ApplicationStatus;
  currentRound?: CurrentRound;
  recruiterName?: string;
  recruiterContact?: string;
  followUpDate?: string;
  notes?: string;
}

export type UpdateApplicationInput = Partial<CreateApplicationInput> & {
  followUpDate?: string | null;
  noResponse?: boolean;
};

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalApplications: number;
  applicationsThisWeek: number;
  oas: number;
  interviews: number;
  offers: number;
  rejections: number;
  needsAction: number;
  noResponse: number;
  noResponseRate: number;
  staleAfterDays: number;
}

export interface StatusBreakdownItem {
  status: ApplicationStatus;
  count: number;
}

export interface ResumeTypeBreakdownItem {
  resumeType: ResumeType;
  count: number;
}

export interface ApplicationTrendItem {
  month: string;
  count: number;
}

export interface FollowUpsResponse {
  dueToday: Application[];
  overdue: Application[];
  upcoming: Application[];
}

export interface AttentionResponse {
  needsAction: Application[];
  noResponse: Application[];
  staleAfterDays: number;
}

export interface ApiError {
  statusCode: number;
  message: string[];
  error: string;
}

export interface ApplicationQueryParams {
  search?: string;
  status?: ApplicationStatus;
  resumeType?: ResumeType;
  source?: Source;
  sortBy?: 'appliedAt' | 'followUpDate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
