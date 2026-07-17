import { NextRequest, NextResponse } from "next/server";
import { syncBatchToTrakt } from "@/lib/integrations/trakt";
import {
  badRequest,
  logRequest,
  parseJsonBody,
  serverError,
  unauthorizedResponse,
  validateApiKey,
} from "@/lib/expenses-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  logRequest(req);
  if (!validateApiKey(req)) return unauthorizedResponse();

  const body = await parseJsonBody(req);
  if (!body || !Array.isArray(body.items)) {
    return badRequest("Missing or invalid 'items' array in request body.");
  }

  try {
    const result = await syncBatchToTrakt(body.items);
    return NextResponse.json(result);
  } catch (err: any) {
    return serverError("Failed to sync batch to Trakt", err);
  }
}
