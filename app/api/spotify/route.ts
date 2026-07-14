import { verifyOAuth } from "@/lib/auth";
import { getNowPlaying } from "@/lib/integrations/spotify";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (authHeader && !(await verifyOAuth(req))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid Bearer token" },
        { status: 401 }
      );
    }
    const data = await getNowPlaying();
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=10, s-maxage=10, stale-while-revalidate=5",
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch Spotify data", message: error.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
