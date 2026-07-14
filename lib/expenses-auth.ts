import crypto from "crypto";
import { NextRequest } from "next/server";
import { logger, maskKey } from "@/lib/logger";

const API_KEY = process.env.API_KEY || process.env.EXPENSES_API_KEY;

/** Constant-time string comparison to avoid leaking key prefixes via timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validates the Authorization: Bearer <token> header against API_KEY.
 * Returns true if valid, false otherwise.
 */
export function validateApiKey(req: NextRequest): boolean {
  if (!API_KEY) {
    logger.warn("auth_fail", { reason: "api_key_env_not_set" });
    return false;
  }
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("auth_fail", {
      reason: "missing_or_malformed_header",
      got: authHeader ? "non-bearer" : "(none)",
      path: req.nextUrl.pathname,
    });
    return false;
  }
  const token = authHeader.slice(7);
  const valid = safeEqual(token, API_KEY);
  if (!valid) {
    logger.warn("auth_fail", {
      reason: "invalid_key",
      key_prefix: maskKey(token),
      path: req.nextUrl.pathname,
    });
  }
  return valid;
}

/** @deprecated Use validateApiKey instead */
export const validateExpensesApiKey = validateApiKey;

/** Standard unauthorized response */
export function unauthorizedResponse() {
  return Response.json(
    { error: "Unauthorized", message: "Valid Authorization: Bearer <api_key> header is required." },
    {
      status: 401,
      headers: corsHeaders(),
    }
  );
}

/** Standard 400 response */
export function badRequest(message: string, context?: Record<string, unknown>) {
  logger.warn("bad_request", { message, ...context });
  return Response.json(
    { error: "Bad Request", message },
    { status: 400, headers: corsHeaders() }
  );
}

/** Standard 500 response — always logs the full error */
export function serverError(error: string, err: unknown, context?: Record<string, unknown>) {
  logger.error("server_error", {
    message: error,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    ...context,
  });
  return Response.json(
    { error, message: err instanceof Error ? err.message : String(err) },
    { status: 500, headers: corsHeaders() }
  );
}

/** Log an incoming request — call at the top of each route handler */
export function logRequest(req: NextRequest, extra?: Record<string, unknown>) {
  logger.info("request", {
    method: req.method,
    path: req.nextUrl.pathname,
    query: Object.fromEntries(req.nextUrl.searchParams.entries()),
    ...extra,
  });
}

/** Parses the JSON body, returning null when it is missing/invalid. */
export async function parseJsonBody(req: NextRequest): Promise<any | null> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Standard CORS headers so ChatGPT can call these endpoints */
export function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
