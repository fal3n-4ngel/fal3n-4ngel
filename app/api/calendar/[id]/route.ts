import { verifyOAuth } from "@/lib/auth";
import { deleteCalendarEvent, updateCalendarEvent } from "@/lib/integrations/google-calendar";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyOAuth(req))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Valid OAuth Bearer token required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Bad Request", message: "Event ID is required" },
        { status: 400 }
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

    const { summary, start, end, description, recurrence, timeZone } = body;

    // Validate fields if provided
    if (summary !== undefined && (typeof summary !== "string" || !summary.trim())) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'summary' must be a non-empty string" },
        { status: 400 }
      );
    }
    if (start !== undefined && (typeof start !== "string" || isNaN(Date.parse(start)))) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'start' must be a valid ISO date string" },
        { status: 400 }
      );
    }
    if (end !== undefined && (typeof end !== "string" || isNaN(Date.parse(end)))) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'end' must be a valid ISO date string" },
        { status: 400 }
      );
    }
    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'description' must be a string" },
        { status: 400 }
      );
    }
    if (recurrence !== undefined) {
      if (!Array.isArray(recurrence) || recurrence.some((r) => typeof r !== "string")) {
        return NextResponse.json(
          { error: "Bad Request", message: "Field 'recurrence' must be an array of strings" },
          { status: 400 }
        );
      }
    }
    if (timeZone !== undefined && typeof timeZone !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'timeZone' must be a string" },
        { status: 400 }
      );
    }

    const updated = await updateCalendarEvent(id, {
      summary,
      start,
      end,
      description,
      recurrence,
      timeZone,
    });

    return NextResponse.json(updated, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update calendar event", message: error.message },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyOAuth(req))) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Valid OAuth Bearer token required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Bad Request", message: "Event ID is required" },
        { status: 400 }
      );
    }

    await deleteCalendarEvent(id);

    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete calendar event", message: error.message },
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
      "Access-Control-Allow-Methods": "DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
