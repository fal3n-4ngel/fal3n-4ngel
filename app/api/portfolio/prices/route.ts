import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse, corsHeaders, parseJsonBody } from "@/lib/expenses-auth";
import { phubProxyRequest } from "@/lib/integrations/phub";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorizedResponse();

  const body = await parseJsonBody(req);
  const data = await phubProxyRequest("/api/portfolio/prices", "POST", body);

  if (data === null) {
    return NextResponse.json({ error: "Failed to refresh portfolio prices in dashboard" }, { status: 500, headers: corsHeaders() });
  }
  return NextResponse.json(data, { headers: corsHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
