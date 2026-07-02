import { NextRequest } from "next/server";

const EXPENSES_API_KEY = process.env.EXPENSES_API_KEY;

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
  return token === EXPENSES_API_KEY;
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

/** Standard CORS headers so ChatGPT can call these endpoints */
export function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
