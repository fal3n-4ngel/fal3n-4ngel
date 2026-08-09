import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse, badRequest } from "@/lib/expenses-auth";

const TARGET_BASE_URL = process.env.PORTFOLIO_API_URL || "https://api.adithyakrishnan.com";
const DEFAULT_API_KEY = process.env.API_KEY || "expenses_adi_secret_9k2mXp7vLqR4";

export interface ProxyOptions {
  requireAuth?: boolean;
  defaultAuth?: boolean;
  targetPath?: string;
  cacheControl?: string;
}

export async function proxyToPortfolioApi(req: NextRequest, options?: ProxyOptions) {
  if (options?.requireAuth && !validateApiKey(req)) {
    return unauthorizedResponse();
  }

  const path = options?.targetPath || req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const targetUrl = `${TARGET_BASE_URL}${path}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  // Attach default API key if defaultAuth is enabled or if requireAuth is not set
  const hasAuth = headers.has("authorization");
  if (!hasAuth && (options?.defaultAuth || !options?.requireAuth)) {
    headers.set("Authorization", `Bearer ${DEFAULT_API_KEY}`);
  }

  try {
    const init: RequestInit = {
      method: req.method,
      headers,
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      try {
        const textBody = await req.text();
        init.body = textBody;

        // Input validation for POST /api/expenses
        if (req.method === "POST" && (path === "/api/expenses" || path.endsWith("/api/expenses"))) {
          if (textBody) {
            try {
              const jsonBody = JSON.parse(textBody);
              if (!jsonBody.title || jsonBody.amount === undefined) {
                return badRequest("`title` and `amount` are required.");
              }
              if (typeof jsonBody.amount !== "number" || !Number.isFinite(jsonBody.amount)) {
                return badRequest("`amount` must be a finite number.");
              }
            } catch {
              return badRequest("Request body must be valid JSON.");
            }
          }
        }
      } catch {
        // Empty body
      }
    }

    const res = await fetch(targetUrl, init);
    const body = await res.arrayBuffer();

    const responseHeaders: Record<string, string> = {
      "content-type": res.headers.get("content-type") || "application/json",
    };

    const cacheHeader = options?.cacheControl || res.headers.get("cache-control");
    if (cacheHeader) {
      responseHeaders["cache-control"] = cacheHeader;
    }

    return new NextResponse(body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Bad Gateway", message: `Failed to proxy to portfolio-api: ${err.message}` },
      { status: 502 }
    );
  }
}
