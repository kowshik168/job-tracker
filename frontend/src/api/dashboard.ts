import { apiGet } from './client';
import type {
  ApplicationTrendItem,
  AttentionResponse,
  DashboardStats,
  FollowUpsResponse,
  ResumeTypeBreakdownItem,
  StatusBreakdownItem,
} from '../types';

export function getDashboardStats() {
  return apiGet<DashboardStats>('/dashboard/stats');
}

export function getStatusBreakdown() {
  return apiGet<StatusBreakdownItem[]>('/dashboard/status-breakdown');
}

export function getResumeTypeBreakdown() {
  return apiGet<ResumeTypeBreakdownItem[]>('/dashboard/resume-type-breakdown');
}

export function getApplicationTrend() {
  return apiGet<ApplicationTrendItem[]>('/dashboard/application-trend');
}

export function getFollowUps() {
  return apiGet<FollowUpsResponse>('/dashboard/follow-ups');
}

export function getAttention() {
  return apiGet<AttentionResponse>('/dashboard/attention');
}
