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

async function fetchJson<T>(
  url: string,
  init: RequestInit,
  options?: { skipUnauthorized?: boolean },
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch {
    throw new TypeError('Failed to fetch');
  }

  if (
    response.status === 401 &&
    onUnauthorized &&
    !options?.skipUnauthorized
  ) {
    onUnauthorized();
  }

  if (!response.ok) {
    let messages = [`Request failed with status ${response.status}`];
    try {
      const error = (await response.json()) as ApiError;
      if (error.message) {
        messages = Array.isArray(error.message)
          ? error.message
          : [error.message];
      }
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

  return fetchJson<T>(url.toString(), { headers: buildHeaders() });
}

export async function apiPost<T, B = unknown>(
  path: string,
  body: B,
  options?: { auth?: boolean },
): Promise<T> {
  const skipUnauthorized = options?.auth === false;
  return fetchJson<T>(
    `${API_BASE}${path}`,
    {
      method: 'POST',
      headers: buildHeaders(
        { 'Content-Type': 'application/json' },
        !skipUnauthorized,
      ),
      body: JSON.stringify(body),
    },
    { skipUnauthorized },
  );
}

export async function apiPatch<T, B = unknown>(
  path: string,
  body: B,
): Promise<T> {
  return fetchJson<T>(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return fetchJson<T>(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  return fetchJson<T>(`${API_BASE}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: formData,
  });
}
