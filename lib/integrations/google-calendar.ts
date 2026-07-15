"use server";

import { google } from "googleapis";
import { unstable_cache, updateTag } from "next/cache";




const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const API_KEY = process.env.GOOGLE_API_KEY;
const READONLY_CALENDAR_IDS = process.env.GOOGLE_READONLY_CALENDAR_IDS;


export interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  isBusy: boolean;
}

export interface AvailabilityStatus {
  status: "Available" | "Busy";
  currentEvent?: string;
}

async function fetchCalendarEventsRaw(start?: string, end?: string): Promise<CalendarEvent[]> {
  try {
    const timeMin = start || new Date().toISOString();
    const timeMax = end || new Date(new Date(timeMin).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ahead


    if (!CALENDAR_ID) {
      console.warn("⚠️ GOOGLE_CALENDAR_ID env var is missing. Google Calendar integration is disabled.");
      return [];
    }

    // Option A: Private Calendar via Google Service Account (OAuth JWT)
    if (SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY) {
      const formattedKey = PRIVATE_KEY.replace(/\\n/g, "\n");
      const auth = new google.auth.JWT({
        email: SERVICE_ACCOUNT_EMAIL,
        key: formattedKey,
        scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      });

      const calendar = google.calendar({ version: "v3", auth });

      // Determine the list of calendar IDs to query for availability
      let calendarIds = [CALENDAR_ID];
      if (READONLY_CALENDAR_IDS) {
        const extraIds = READONLY_CALENDAR_IDS.split(",")
          .map((id) => id.replace(/\r?\n|\r/g, "").trim())
          .filter((id) => id.length > 0);
        calendarIds = Array.from(new Set([...calendarIds, ...extraIds]));
      }



      // Fetch upcoming events from all discovered calendars concurrently
      const eventFetches = calendarIds.map(async (id) => {
        try {
          const response = await calendar.events.list({
            calendarId: id,
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 15,
          });
          const items = response.data.items || [];
          return items.map((item) => {
            const start = item.start?.dateTime || item.start?.date || "";
            const end = item.end?.dateTime || item.end?.date || "";
            const isBusy = item.transparency !== "transparent";
            return {
              summary: item.summary || "Busy",
              start,
              end,
              isBusy,
            };
          });
        } catch (err) {
          console.error(`❌ Failed to fetch events for calendar ID: ${id}`, err);
          return [];
        }
      });

      const results = await Promise.all(eventFetches);
      const allEvents = results.flat();

      // Sort merged events chronologically
      allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      return allEvents;
    }


    // Option B: Public Calendar via Google API Key
    if (API_KEY) {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        CALENDAR_ID
      )}/events?key=${API_KEY}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(
        timeMax
      )}&singleEvents=true&orderBy=startTime&maxResults=15`;

      const response = await fetch(url, { next: { revalidate: 120 } });
      if (!response.ok) {
        throw new Error(`Google Calendar Public Fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      const items = data.items || [];
      return items.map((item: any) => {
        const start = item.start?.dateTime || item.start?.date || "";
        const end = item.end?.dateTime || item.end?.date || "";
        const isBusy = item.transparency !== "transparent";
        return {
          summary: item.summary || "Busy",
          start,
          end,
          isBusy,
        };
      });
    }

    console.warn("⚠️ Missing Google Calendar credentials. Configure either Service Account (GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY) or API Key (GOOGLE_API_KEY).");
    return [];
  } catch (error) {
    console.error("❌ Failed to fetch calendar events from Google:", error);
    return [];
  }
}

/**
 * Cached function to fetch calendar events. Revalidates every 120 seconds.
 */
export const getCalendarEvents = unstable_cache(
  async (start?: string, end?: string): Promise<CalendarEvent[]> => {
    return fetchCalendarEventsRaw(start, end);
  },
  ["google-calendar-events-v2"],
  { revalidate: 120, tags: ["calendar"] }
);


/**
 * Computes current availability (Available vs Busy) based on active calendar events.
 */
export async function getAvailabilityStatus(events: CalendarEvent[]): Promise<AvailabilityStatus> {
  const now = Date.now();

  // Find any active event occurring right now that marks the user as busy
  const activeEvent = events.find((event) => {
    if (!event.isBusy) return false;
    const start = new Date(event.start).getTime();
    const end = new Date(event.end).getTime();
    return now >= start && now <= end;
  });

  if (activeEvent) {
    return {
      status: "Busy",
      currentEvent: activeEvent.summary,
    };
  }

  return {
    status: "Available",
  };
}

export async function getCalendarAvailabilityStatus(): Promise<AvailabilityStatus> {
  const events = await getCalendarEvents();
  return await getAvailabilityStatus(events);
}

export async function createCalendarEvent(data: {
  summary: string;
  start: string;
  end: string;
  description?: string;
}): Promise<CalendarEvent & { id: string }> {
  if (!CALENDAR_ID) {
    throw new Error("GOOGLE_CALENDAR_ID is missing.");
  }
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY) are required for write operations.");
  }

  const formattedKey = PRIVATE_KEY.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  const response = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: data.summary,
      description: data.description,
      start: {
        dateTime: data.start,
      },
      end: {
        dateTime: data.end,
      },
    },
  });

  const item = response.data;
  
  // Invalidate the cache tag so that the new event is fetched immediately
  updateTag("calendar");


  return {
    id: item.id || "",
    summary: item.summary || data.summary,
    start: item.start?.dateTime || item.start?.date || data.start,
    end: item.end?.dateTime || item.end?.date || data.end,
    isBusy: item.transparency !== "transparent",
  };
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (!CALENDAR_ID) {
    throw new Error("GOOGLE_CALENDAR_ID is missing.");
  }
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY) are required for write operations.");
  }

  const formattedKey = PRIVATE_KEY.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId: eventId,
  });

  // Invalidate the cache tag so that the deleted event is removed from cache immediately
  updateTag("calendar");

}




