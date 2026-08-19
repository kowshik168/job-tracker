import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from './client';
import type { Resume, ResumeLearning } from '../types';

export function getResumes() {
  return apiGet<Resume[]>('/resumes');
}

export function getResume(id: string) {
  return apiGet<Resume>(`/resumes/${id}`);
}

export function uploadResume(formData: FormData) {
  return apiUpload<Resume>('/resumes', formData);
}

export function updateResume(
  id: string,
  data: { name?: string; resumeType?: Resume['resumeType']; notes?: string },
) {
  return apiPatch<Resume>(`/resumes/${id}`, data);
}

export function deleteResume(id: string) {
  return apiDelete<{ message: string }>(`/resumes/${id}`);
}

export function addResumeLearning(
  resumeId: string,
  data: { content: string; applicationId?: string },
) {
  return apiPost<ResumeLearning>(`/resumes/${resumeId}/learnings`, data);
}

export function deleteResumeLearning(resumeId: string, learningId: string) {
  return apiDelete<{ message: string }>(
    `/resumes/${resumeId}/learnings/${learningId}`,
  );
}

export async function downloadResumeFile(id: string) {
  const file = await apiGet<{
    fileName: string;
    mimeType: string;
    data: string;
  }>(`/resumes/${id}/file`);

  const bytes = Uint8Array.from(atob(file.data), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
