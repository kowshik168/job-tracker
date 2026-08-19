import { ApiRequestError } from '../api/client';

const GENERIC_BACKEND = new Set([
  'Unauthorized',
  'UNAUTHORIZED',
  'Forbidden',
  'Bad Request',
  'Internal Server Error',
  'Internal server error',
]);

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network request failed') ||
      msg.includes('load failed')
    );
  }
  return false;
}

export function getErrorMessage(
  err: unknown,
  fallback: string,
): string {
  if (isNetworkError(err)) {
    return 'Cannot reach the server. It may be waking up — wait a few seconds and try again.';
  }

  if (err instanceof ApiRequestError) {
    if (err.statusCode === 401) {
      const first = err.messages[0];
      if (first && !GENERIC_BACKEND.has(first)) return first;
      return fallback;
    }

    if (err.statusCode === 403) {
      return 'You do not have permission to do that.';
    }

    if (err.statusCode === 404) {
      const first = err.messages[0];
      if (first && !GENERIC_BACKEND.has(first)) return first;
      return 'We could not find what you were looking for.';
    }

    if (err.statusCode === 400 || err.statusCode === 422) {
      const details = err.messages.filter((m) => !GENERIC_BACKEND.has(m));
      if (details.length) return details.join('. ');
      return 'Please check the form and try again.';
    }

    if (err.statusCode >= 500) {
      return 'Something went wrong on the server. Please try again in a moment.';
    }

    const first = err.messages[0];
    if (first && !GENERIC_BACKEND.has(first)) return first;
  }

  if (err instanceof Error && err.message && !GENERIC_BACKEND.has(err.message)) {
    return err.message;
  }

  return fallback;
}
