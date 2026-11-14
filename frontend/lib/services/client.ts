// All calls go to `/api/*`. In dev, next.config.ts rewrites them to the
// backend. Only `POST /api/customer/login` exists on the backend today; every
// other service function answers from lib/mock-data until its endpoint ships.

/**
 * Error from the API, parsed from application/problem+json (docs/05-api.md §3).
 * `code` is the BR-xx rule or a generic code such as NOT_FOUND. Pick the UI
 * message from `code`, never from `message`.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

let accessToken: string | null = null;

/** Set by AuthProvider whenever the session changes. */
export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

interface Problem {
  title?: string;
  detail?: string;
  rule?: string;
  code?: string;
  [key: string]: unknown;
}

export async function apiRequest<TResponse>(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<TResponse> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const problem = (await res.json().catch(() => ({}))) as Problem;
    throw new ApiError(
      res.status,
      problem.rule ?? problem.code ?? `HTTP_${res.status}`,
      problem.detail ?? problem.title ?? res.statusText,
      problem,
    );
  }
  return (await res.json()) as TResponse;
}

export function apiPost<TResponse>(path: string, body: unknown) {
  return apiRequest<TResponse>("POST", path, body);
}
