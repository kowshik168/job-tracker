import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import type {
  Application,
  ApplicationQueryParams,
  CreateApplicationInput,
  PaginatedResponse,
  UpdateApplicationInput,
} from '../types';

export function getApplications(params?: ApplicationQueryParams) {
  return apiGet<PaginatedResponse<Application>>(
    '/applications',
    params as Record<string, string | number | undefined>,
  );
}

export function getApplication(id: string) {
  return apiGet<Application>(`/applications/${id}`);
}

export function createApplication(data: CreateApplicationInput) {
  return apiPost<Application>('/applications', data);
}

export function updateApplication(id: string, data: UpdateApplicationInput) {
  return apiPatch<Application>(`/applications/${id}`, data);
}

export function deleteApplication(id: string) {
  return apiDelete<{ message: string }>(`/applications/${id}`);
}
