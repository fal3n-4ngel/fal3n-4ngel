import { proxyToPortfolioApi } from "@/lib/portfolio-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return proxyToPortfolioApi(req, "/api/calendar/events");
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
