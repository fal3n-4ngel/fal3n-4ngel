import { proxyToPortfolioApi } from "@/lib/portfolio-proxy";
import { badRequest } from "@/lib/expenses-auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const start = req.nextUrl.searchParams.get("start");
  if (start && isNaN(Date.parse(start))) {
    return badRequest("Invalid start date parameter");
  }

  return proxyToPortfolioApi(req, {
    targetPath: "/api/calendar/events",
    requireAuth: true,
    cacheControl: "public, s-maxage=60, stale-while-revalidate=30",
  });
}

export async function POST(req: NextRequest) {
  return proxyToPortfolioApi(req, {
    targetPath: "/api/calendar/events",
    requireAuth: true,
  });
}

export async function PATCH(req: NextRequest) {
  return proxyToPortfolioApi(req, {
    targetPath: "/api/calendar/events",
    requireAuth: true,
  });
}

export async function DELETE(req: NextRequest) {
  return proxyToPortfolioApi(req, {
    targetPath: "/api/calendar/events",
    requireAuth: true,
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
