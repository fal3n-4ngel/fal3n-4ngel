/**
 * Structured logger for Vercel.
 * Every log line is a single JSON object so Vercel's log viewer can parse,
 * filter, and search them easily.
 *
 * Usage:
 *   logger.info("request", { route: "/api/expenses", method: "GET" });
 *   logger.warn("auth_fail", { reason: "missing_header", route: "/api/expenses" });
 *   logger.error("notion_error", { message: err.message, route: "/api/expenses" });
 */

type LogLevel = "info" | "warn" | "error" | "debug";

function emit(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  };
  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info:  (event: string, data?: Record<string, unknown>) => emit("info",  event, data),
  warn:  (event: string, data?: Record<string, unknown>) => emit("warn",  event, data),
  error: (event: string, data?: Record<string, unknown>) => emit("error", event, data),
  debug: (event: string, data?: Record<string, unknown>) => emit("debug", event, data),
};

/**
 * Mask a bearer token for safe logging — shows first 6 chars only.
 * e.g. "expenses_adi_secret_9k2mXp7vLqR4" → "expens…"
 */
export function maskKey(token: string | null | undefined): string {
  if (!token) return "(none)";
  return token.length > 6 ? `${token.slice(0, 6)}…` : "(short)";
}
