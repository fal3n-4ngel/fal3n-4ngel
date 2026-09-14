import { getCalendarEvents, createCalendarEvent } from "@/lib/integrations/google-calendar";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const start = req.nextUrl.searchParams.get("start") || new Date().toISOString();
    const end = req.nextUrl.searchParams.get("end") || new Date(new Date(start).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    if (isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid date parameters" },
        { status: 400 }
      );
    }

    const events = await getCalendarEvents(start, end);
    const busySlots = events
      .filter((event) => event.isBusy)
      .map((event) => ({
        start: event.start,
        end: event.end,
      }));

    return NextResponse.json(busySlots, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch busy slots", message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Bad Request", message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { name, email, dateTime, description, duration } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'name' is required" },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Bad Request", message: "A valid email address is required" },
        { status: 400 }
      );
    }
    if (!dateTime || typeof dateTime !== "string" || isNaN(Date.parse(dateTime))) {
      return NextResponse.json(
        { error: "Bad Request", message: "A valid ISO date string 'dateTime' is required" },
        { status: 400 }
      );
    }
    const meetingDuration = Number(duration) || 30;
    if (meetingDuration !== 15 && meetingDuration !== 30 && meetingDuration !== 60) {
      return NextResponse.json(
        { error: "Bad Request", message: "Duration must be 15, 30, or 60 minutes" },
        { status: 400 }
      );
    }
    if (description !== undefined && typeof description !== "string") {
      return NextResponse.json(
        { error: "Bad Request", message: "Field 'description' must be a string" },
        { status: 400 }
      );
    }

    const startReq = new Date(dateTime).getTime();
    const endReq = startReq + meetingDuration * 60 * 1000;
    const now = Date.now();

    if (startReq < now - 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "Bad Request", message: "Cannot book a meeting in the past" },
        { status: 400 }
      );
    }

    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(startReq + istOffset);
    const istDay = istTime.getUTCDay();
    const istHour = istTime.getUTCHours();
    const istMin = istTime.getUTCMinutes();

    if (istDay === 0 || istDay === 6) {
      return NextResponse.json(
        { error: "Bad Request", message: "Meetings can only be scheduled on weekdays (Monday to Friday) IST." },
        { status: 400 }
      );
    }

    const startMinutesIST = istHour * 60 + istMin;
    const workStartIST = 9 * 60;
    const workEndIST = 24 * 60;

    if (startMinutesIST < workStartIST || (startMinutesIST + meetingDuration) > workEndIST) {
      return NextResponse.json(
        { error: "Bad Request", message: "Meetings must be scheduled between 9:00 AM and 12:00 AM (midnight) IST." },
        { status: 400 }
      );
    }

    const queryStart = new Date(startReq - 2 * 60 * 60 * 1000).toISOString();
    const queryEnd = new Date(endReq + 2 * 60 * 60 * 1000).toISOString();

    const events = await getCalendarEvents(queryStart, queryEnd);
    const overlap = events.some((event) => {
      if (!event.isBusy) return false;
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();
      return startReq < eventEnd && endReq > eventStart;
    });

    if (overlap) {
      return NextResponse.json(
        { error: "Conflict", message: "The selected time slot overlaps with an existing appointment. Please select another time." },
        { status: 409 }
      );
    }

    const created = await createCalendarEvent({
      summary: `Portfolio Meeting: ${name}`,
      start: new Date(startReq).toISOString(),
      end: new Date(endReq).toISOString(),
      description: `Client booking via Portfolio Website.\n\nName: ${name}\nEmail: ${email}\nNotes: ${description || "None"}`,
      timeZone: "Asia/Kolkata",
    });

    return NextResponse.json({ success: true, event: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to book meeting", message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
