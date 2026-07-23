import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse, corsHeaders, parseJsonBody } from "@/lib/expenses-auth";
import { phubProxyRequest } from "@/lib/integrations/phub";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validateApiKey(req)) return unauthorizedResponse();

  const { id } = await params;
  const body = await parseJsonBody(req);
  const data = await phubProxyRequest(`/api/watchlist/${id}`, "PATCH", body);

  if (data === null) {
    return NextResponse.json({ error: "Failed to update watchlist item in dashboard" }, { status: 500, headers: corsHeaders() });
  }
  return NextResponse.json(data, { headers: corsHeaders() });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!validateApiKey(req)) return unauthorizedResponse();

  const { id } = await params;
  const data = await phubProxyRequest(`/api/watchlist/${id}`, "DELETE");

  if (data === null) {
    return NextResponse.json({ error: "Failed to delete watchlist item from dashboard" }, { status: 500, headers: corsHeaders() });
  }
  return NextResponse.json(data, { headers: corsHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
