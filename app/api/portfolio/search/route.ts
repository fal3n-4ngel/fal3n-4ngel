import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse, corsHeaders } from "@/lib/expenses-auth";
import { phubProxyRequest } from "@/lib/integrations/phub";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorizedResponse();

  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const data = await phubProxyRequest("/api/portfolio/search", "GET", undefined, searchParams);
  
  if (data === null) {
    return NextResponse.json({ error: "Failed to search symbols from dashboard" }, { status: 500, headers: corsHeaders() });
  }
  return NextResponse.json(data, { headers: corsHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
