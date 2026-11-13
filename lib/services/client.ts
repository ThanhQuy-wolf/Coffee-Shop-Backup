// ─── HTTP client ─────────────────────────────────────────────────────────────
//
// All calls go to `/api/*`. In dev, next.config.ts rewrites them to the
// backend (host.docker.internal:32080). Keep fetch details here so contexts
// and pages never call fetch directly.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiPost<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return (await res.json()) as TResponse;
}
