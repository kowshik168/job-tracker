import { apiPost } from './client';

interface LoginResponse {
  accessToken: string;
}

export function login(password: string) {
  return apiPost<LoginResponse>('/auth/login', { password }, { auth: false });
}
