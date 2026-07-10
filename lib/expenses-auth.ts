import crypto from "crypto";
import { NextRequest } from "next/server";

const EXPENSES_API_KEY = process.env.EXPENSES_API_KEY;

/** Constant-time string comparison to avoid leaking key prefixes via timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validates the Authorization: Bearer <token> header against EXPENSES_API_KEY.
 * Returns true if valid, false otherwise.
 */
export function validateExpensesApiKey(req: NextRequest): boolean {
  if (!EXPENSES_API_KEY) {
    console.warn("⚠️  EXPENSES_API_KEY env var is not set — rejecting all requests.");
    return false;
  }
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return safeEqual(token, EXPENSES_API_KEY);
}

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
export function badRequest(message: string) {
  return Response.json(
    { error: "Bad Request", message },
    { status: 400, headers: corsHeaders() }
  );
}

/** Standard 500 response */
export function serverError(error: string, err: unknown) {
  return Response.json(
    { error, message: err instanceof Error ? err.message : String(err) },
    { status: 500, headers: corsHeaders() }
  );
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
