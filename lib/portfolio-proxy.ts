import { NextRequest, NextResponse } from "next/server";

const TARGET_BASE_URL = process.env.PORTFOLIO_API_URL || "https://api.adithyakrishnan.com";
const API_KEY = process.env.API_KEY || "expenses_adi_secret_9k2mXp7vLqR4";

/**
 * Proxy helper forwarding requests from Next.js serverless to standalone Spring Boot portfolio-api on GCP Cloud Run
 */
export async function proxyToPortfolioApi(req: NextRequest, customPath?: string) {
  const path = customPath || req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const targetUrl = `${TARGET_BASE_URL}${path}${search}`;

  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${API_KEY}`);
  headers.delete("host");

  try {
    const init: RequestInit = {
      method: req.method,
      headers,
      cache: "no-store",
    };

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      init.body = await req.text();
    }

    const res = await fetch(targetUrl, init);
    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
        "cache-control": res.headers.get("cache-control") || "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Bad Gateway", message: `Failed to proxy to portfolio-api: ${err.message}` },
      { status: 502 }
    );
  }
}
