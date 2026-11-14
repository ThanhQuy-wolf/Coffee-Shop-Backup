// Every call goes to `/api/*`; in dev next.config.ts rewrites it to the
// backend. Only `POST /api/customer/login` exists there today, so the other
// service functions answer from lib/mock-data until their endpoint ships.

/**
 * Error thrown by every service function. It is parsed from the backend's
 * `application/problem+json` body (docs/05-api.md §3).
 *
 * Pick the UI text from `code`, never from `message`: see `errorMessage()` in
 * lib/utils/errors.ts.
 *
 * @param status - HTTP status, e.g. 409
 * @param code - business rule (`"BR-22"`) or generic code (`"NOT_FOUND"`)
 * @param message - server text, only a fallback for the UI
 * @param details - the rest of the problem body, e.g. `errors[]` per cart line
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

/**
 * Stores the access token sent as `Authorization: Bearer` on later calls.
 * AuthProvider calls it whenever the session starts or ends.
 *
 * @param token - JWT from A-1/A-2/A-4, or `null` after logout
 */
export function setAccessToken(token: string | null) {
  accessToken = token;
}

/**
 * Returns the access token of the current session.
 *
 * @returns the token, or `null` when nobody is logged in
 */
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

/**
 * Sends a JSON request to the backend and parses the JSON answer.
 *
 * @param method - HTTP method, e.g. `"GET"`, `"PUT"`
 * @param path - path after `/api`, e.g. `"/v1/orders"`
 * @param body - request body, serialised as JSON; omit for GET
 * @param headers - extra headers, e.g. `Idempotency-Key`
 * @returns the parsed response body
 * @throws {ApiError} when the status is not 2xx; `code` comes from the
 *   problem body's `rule` or `code`, else `HTTP_<status>`
 */
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

/**
 * Shortcut for `apiRequest("POST", path, body)`.
 *
 * @param path - path after `/api`
 * @param body - request body, serialised as JSON
 * @returns the parsed response body
 * @throws {ApiError} when the status is not 2xx
 */
export function apiPost<TResponse>(path: string, body: unknown) {
  return apiRequest<TResponse>("POST", path, body);
}
