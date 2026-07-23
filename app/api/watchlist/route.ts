import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse, corsHeaders, parseJsonBody } from "@/lib/expenses-auth";
import { phubProxyRequest } from "@/lib/integrations/phub";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorizedResponse();

  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const data = await phubProxyRequest("/api/watchlist", "GET", undefined, searchParams);
  
  if (data === null) {
    return NextResponse.json({ error: "Failed to fetch watchlist from dashboard" }, { status: 500, headers: corsHeaders() });
  }
  return NextResponse.json(data, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorizedResponse();

  const body = await parseJsonBody(req);
  const data = await phubProxyRequest("/api/watchlist", "POST", body);

  if (data === null) {
    return NextResponse.json({ error: "Failed to add watchlist item to dashboard" }, { status: 500, headers: corsHeaders() });
  }
  return NextResponse.json(data, { headers: corsHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
