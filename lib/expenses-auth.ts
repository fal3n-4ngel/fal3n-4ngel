import { NextRequest } from "next/server";

const EXPENSES_API_KEY = process.env.EXPENSES_API_KEY;

/**
 * Validates the ?api_key= query parameter against the EXPENSES_API_KEY env var.
 * Returns true if valid, false otherwise.
 */
export function validateExpensesApiKey(req: NextRequest): boolean {
  if (!EXPENSES_API_KEY) {
    console.warn("⚠️  EXPENSES_API_KEY env var is not set — rejecting all requests.");
    return false;
  }
  const key = req.nextUrl.searchParams.get("api_key");
  return key === EXPENSES_API_KEY;
}

/** Standard unauthorized response */
export function unauthorizedResponse() {
  return Response.json(
    { error: "Unauthorized", message: "Valid ?api_key= is required." },
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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
