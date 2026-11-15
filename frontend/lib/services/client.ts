// Every call goes to `/api/*`; in development next.config.ts rewrites it to
// the Spring Boot backend (backend/, port 8080).
import type { AuthSession } from "../types";

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

/** What the client needs from the session owner (AuthProvider) to refresh tokens. */
export interface SessionHooks {
  /** Refresh token of the current session, or null when nobody is logged in. */
  refreshToken: () => string | null;
  /** Called with the new session after A-5 succeeded. */
  onRefreshed: (session: AuthSession) => void;
  /** Called when A-5 failed, so the UI can log the user out. */
  onExpired: () => void;
}

let accessToken: string | null = null;
let hooks: SessionHooks | null = null;
let refreshing: Promise<boolean> | null = null;
let markSessionLoaded: () => void = () => {};
// The first render after a page load cannot read localStorage yet, so effects
// of that render would call the API as a guest and get 401/404 for their own
// orders. Calls wait here until AuthProvider has read the saved session.
const sessionLoaded = new Promise<void>((resolve) => {
  markSessionLoaded = resolve;
});

/**
 * Lets queued API calls go out. AuthProvider calls it once the saved session
 * has been read from localStorage, after `setAccessToken`.
 */
export function setSessionLoaded() {
  markSessionLoaded();
}

/**
 * Stores the access token sent as `Authorization: Bearer` on later calls.
 * AuthProvider calls it whenever the session starts or ends.
 *
 * @param token - JWT from A-1/A-2/A-4/A-5, or `null` after logout
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

/**
 * Lets the client renew an expired access token with A-5 and report the result.
 *
 * @param next - callbacks of the session owner, or `null` to stop refreshing
 */
export function setSessionHooks(next: SessionHooks | null) {
  hooks = next;
}

interface Problem {
  title?: string;
  detail?: string;
  rule?: string;
  code?: string;
  [key: string]: unknown;
}

/** Calls that must not trigger a refresh: they are the login and refresh calls themselves. */
const NO_REFRESH = /^\/(customer\/login|v1\/auth\/)/;

/**
 * Exchanges the refresh token for a new session (A-5). Calls made at the same
 * time share one refresh, because the backend revokes every session when a
 * refresh token is used twice.
 *
 * @returns true when a new access token is stored
 */
function refreshSession(): Promise<boolean> {
  const token = hooks?.refreshToken();
  if (!token) return Promise.resolve(false);
  refreshing ??= (async () => {
    try {
      const res = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: token }),
      });
      if (!res.ok) {
        accessToken = null;
        hooks?.onExpired();
        return false;
      }
      const session = (await res.json()) as AuthSession;
      accessToken = session.accessToken;
      hooks?.onRefreshed(session);
      return true;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/**
 * Sends a request and returns the raw response. A 401 on a signed-in call is
 * retried once after refreshing the session (docs/05-api.md §3).
 *
 * @param method - HTTP method, e.g. `"GET"`, `"PUT"`
 * @param path - path after `/api`, e.g. `"/v1/orders"`
 * @param body - request body, serialised as JSON; omit for GET
 * @param headers - extra headers, e.g. `Idempotency-Key`, `If-None-Match`
 * @returns the response; 2xx or 304
 * @throws {ApiError} for any other status; `code` comes from the problem
 *   body's `rule` or `code`, else `HTTP_<status>`
 */
export async function apiFetch(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<Response> {
  await sessionLoaded;
  const send = () =>
    fetch(`/api${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  let res = await send();
  if (
    res.status === 401 &&
    accessToken &&
    !NO_REFRESH.test(path) &&
    (await refreshSession())
  )
    res = await send();
  if (!res.ok && res.status !== 304) {
    const problem = (await res.json().catch(() => ({}))) as Problem;
    throw new ApiError(
      res.status,
      problem.rule ?? problem.code ?? `HTTP_${res.status}`,
      problem.detail ?? problem.title ?? res.statusText,
      problem,
    );
  }
  return res;
}

/**
 * Sends a JSON request to the backend and parses the JSON answer.
 *
 * @param method - HTTP method, e.g. `"GET"`, `"PUT"`
 * @param path - path after `/api`, e.g. `"/v1/orders"`
 * @param body - request body, serialised as JSON; omit for GET
 * @param headers - extra headers, e.g. `Idempotency-Key`
 * @returns the parsed response body; `undefined` for `204 No Content`
 *   (A-6, A-9 and the DELETE calls of group C)
 * @throws {ApiError} when the status is not 2xx
 */
export async function apiRequest<TResponse>(
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<TResponse> {
  const res = await apiFetch(method, path, body, headers);
  if (res.status === 204) return undefined as TResponse;
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

/**
 * Builds a query string, skipping empty values.
 *
 * @param params - query parameters
 * @returns `"?a=1&b=2"`, or `""` when nothing is set
 */
export function query(
  params: Record<string, string | number | undefined | null>,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}
