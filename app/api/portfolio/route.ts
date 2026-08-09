import { proxyToPortfolioApi } from "@/lib/portfolio-proxy";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return proxyToPortfolioApi(req, {
    targetPath: "/api/notion/experiences",
    requireAuth: true,
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
