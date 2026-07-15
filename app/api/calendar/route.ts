import { verifyOAuth } from "@/lib/auth";
import { getCalendarEvents, getAvailabilityStatus, createCalendarEvent } from "@/lib/integrations/google-calendar";
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
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyOAuth(req))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Valid OAuth Bearer token required" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { summary, start, end, description } = body;

    // Validate fields
    if (!summary || typeof summary !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "String field 'summary' is required" },
        { status: 400 }
      );
    }
    if (!start || typeof start !== "string" || isNaN(Date.parse(start))) {
      return NextResponse.json(
        { error: "Bad Request", message: "Valid ISO date string 'start' is required" },
        { status: 400 }
      );
    }
    if (!end || typeof end !== "string" || isNaN(Date.parse(end))) {
      return NextResponse.json(
        { error: "Bad Request", message: "Valid ISO date string 'end' is required" },
        { status: 400 }
      );
    }
    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'description' must be a string" },
        { status: 400 }
      );
    }

    const created = await createCalendarEvent({ summary, start, end, description });

    return NextResponse.json(created, {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create calendar event", message: error.message },
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

