import { NextRequest, NextResponse } from "next/server";
import { searchTrakt } from "@/lib/integrations/trakt";
import {
  badRequest,
  logRequest,
  serverError,
  unauthorizedResponse,
  validateApiKey,
} from "@/lib/expenses-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  logRequest(req);
  if (!validateApiKey(req)) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type");

  if (!query) return badRequest("Missing query parameter 'q'.");
  if (!type || (type !== "movie" && type !== "show")) {
    return badRequest("Missing or invalid type parameter. Must be 'movie' or 'show'.");
  }

  try {
    const results = await searchTrakt(query, type as "movie" | "show");
    return NextResponse.json(results);
  } catch (err: any) {
    return serverError("Failed to search Trakt", err);
  }
}
