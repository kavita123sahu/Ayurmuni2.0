import { ChatApiError } from '../types/chat';

export async function parseApiError(response: Response): Promise<ChatApiError> {
  let body: Record<string, unknown> = {};
  try {
    body = await response.json();
  } catch {
    // ignore parse failure
  }

  const message =
    (typeof body.message === 'string' && body.message) ||
    `Request failed with status ${response.status}`;

  const error = new Error(message) as ChatApiError;
  error.httpStatus = response.status;
  error.code = typeof body.code === 'string' ? body.code : undefined;
  error.errors =
    body.errors && typeof body.errors === 'object'
      ? (body.errors as Record<string, unknown>)
      : undefined;
  return error;
}
