import { verifyOAuth } from "@/lib/auth";
import { getCalendarEvents, getAvailabilityStatus } from "@/lib/integrations/google-calendar";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (!(await verifyOAuth(req))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Valid OAuth Bearer token required" },
        { status: 401 }
      );
    }

    const events = await getCalendarEvents();
    const availability = await getAvailabilityStatus(events);


    return NextResponse.json(
      {
        availability,
        events,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch calendar events", message: error.message },
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
