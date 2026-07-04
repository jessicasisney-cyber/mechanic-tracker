const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

const hits = new Map<string, { count: number; resetAt: number }>();

// Best-effort only — resets on cold start and isn't shared across serverless
// instances. Good enough to blunt casual abuse of a public, paid-API-backed
// endpoint without adding infrastructure (Redis, etc.) for a low-traffic site.
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

export function clientKeyFromHeaders(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}
