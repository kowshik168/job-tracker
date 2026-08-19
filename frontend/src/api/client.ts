import type { ApiError } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export class ApiRequestError extends Error {
  statusCode: number;
  messages: string[];

  constructor(statusCode: number, messages: string[]) {
    super(messages.join(', '));
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.messages = messages;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  if (!response.ok) {
    let messages = [`Request failed with status ${response.status}`];
    try {
      const error = (await response.json()) as ApiError;
      if (error.message) messages = error.message;
    } catch {
      // ignore parse errors
    }
    throw new ApiRequestError(response.status, messages);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildHeaders(
  extra?: Record<string, string>,
  includeAuth = true,
): Record<string, string> {
  const token = localStorage.getItem('job_tracker_token');
  return {
    ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: buildHeaders(),
  });
  return handleResponse<T>(response);
}

export async function apiPost<T, B = unknown>(
  path: string,
  body: B,
  options?: { auth?: boolean },
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders(
      { 'Content-Type': 'application/json' },
      options?.auth !== false,
    ),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T, B = unknown>(
  path: string,
  body: B,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  return handleResponse<T>(response);
}
