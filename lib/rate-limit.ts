import { NextRequest } from "next/server";

// Using globalThis to persist the rate limit memory store across dev hot-reloads
const globalStore = globalThis as any;
if (!globalStore.rateLimitStore) {
  globalStore.rateLimitStore = new Map<string, number[]>();
}

const store = globalStore.rateLimitStore as Map<string, number[]>;

// Configuration: 100 requests per 15 minutes
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 100;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // clean old IPs every 5 minutes

let lastCleanup = Date.now();

function cleanupStore() {
  const now = Date.now();
  for (const [ip, timestamps] of store.entries()) {
    const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);
    if (validTimestamps.length === 0) {
      store.delete(ip);
    } else {
      store.set(ip, validTimestamps);
    }
  }
}

export function rateLimit(req: NextRequest): {
  limitReached: boolean;
  headers: HeadersInit;
} {
  const now = Date.now();

  // Run lazy cleanup occasionally
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    cleanupStore();
  }

  // Extract client IP address
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const timestamps = store.get(ip) || [];
  
  // Filter out timestamps older than the window
  const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  const requestCount = validTimestamps.length;
  const remaining = Math.max(0, LIMIT - requestCount - 1);
  const resetTime = validTimestamps.length > 0 ? validTimestamps[0]! + WINDOW_MS : now + WINDOW_MS;

  const headers: HeadersInit = {
    "X-RateLimit-Limit": String(LIMIT),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
  };

  if (requestCount >= LIMIT) {
    return {
      limitReached: true,
      headers: {
        ...headers,
        "Retry-After": String(Math.ceil((resetTime - now) / 1000)),
      },
    };
  }

  validTimestamps.push(now);
  store.set(ip, validTimestamps);

  return {
    limitReached: false,
    headers,
  };
}
