import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "./lib/rate-limit";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to /api routes
  if (pathname.startsWith("/api")) {
    const { limitReached, headers } = rateLimit(request);

    if (limitReached) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Pass the rate limit headers down to the response
    const response = NextResponse.next();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  return NextResponse.next();
}

// Configure middleware to only run on API routes to avoid overhead on static pages
export const config = {
  matcher: "/api/:path*",
};
