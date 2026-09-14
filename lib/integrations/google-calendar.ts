"use server";

import { google } from "googleapis";
import { unstable_cache, revalidateTag } from "next/cache";

function safeRevalidateTag(tag: string) {
  try {
    revalidateTag(tag, "default");
  } catch (error) {
    console.warn(`Failed to revalidate tag "${tag}":`, error);
  }
}




const sanitizeEnv = (val?: string) => {
  if (!val) return undefined;
  let clean = val.trim();
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  return clean.replace(/\r?\n|\r/g, "");
};

const getCalendarId = () => sanitizeEnv(process.env.GOOGLE_CALENDAR_ID);
const getServiceAccountEmail = () => sanitizeEnv(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
const getReadOnlyCalendarIds = () => {
  const raw = sanitizeEnv(process.env.GOOGLE_READONLY_CALENDAR_IDS);
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => sanitizeEnv(id.replace(/\r?\n|\r/g, "")))
    .filter((id): id is string => !!id && id.length > 0);
};

let hasWarnedCredentials = false;

const getFormattedPrivateKey = () => {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!privateKey) return undefined;
  let cleanKey = privateKey.trim();
  if (cleanKey.startsWith("{") && cleanKey.endsWith("}")) {
    try {
      const parsed = JSON.parse(cleanKey);
      if (parsed.private_key) {
        cleanKey = parsed.private_key;
      }
    } catch {
      // ignore
    }
  }
  if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
    cleanKey = cleanKey.slice(1, -1);
  }
  if (cleanKey.startsWith("'") && cleanKey.endsWith("'")) {
    cleanKey = cleanKey.slice(1, -1);
  }
  return cleanKey.replace(/\\n/g, "\n");
};


export interface CalendarEvent {
  id?: string;
  summary: string;
  start: string;
  end: string;
  isBusy: boolean;
  description?: string;
  recurrence?: string[];
  recurringEventId?: string;
}

export interface AvailabilityStatus {
  status: "Available" | "Busy";
  currentEvent?: string;
}

async function fetchCalendarEventsRaw(start?: string, end?: string): Promise<CalendarEvent[]> {
  try {
    const timeMin = start || new Date().toISOString();
    const timeMax = end || new Date(new Date(timeMin).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const calendarId = getCalendarId();
    const serviceAccountEmail = getServiceAccountEmail();
    const formattedKey = getFormattedPrivateKey();
    const apiKey = sanitizeEnv(process.env.GOOGLE_API_KEY);

    if (!calendarId) {
      console.warn("⚠️ GOOGLE_CALENDAR_ID env var is missing. Google Calendar integration is disabled.");
      return [];
    }

    if (serviceAccountEmail && formattedKey) {
      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: formattedKey,
        scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      });

      const calendar = google.calendar({ version: "v3", auth });

      let calendarIds = [calendarId];
      const extraIds = getReadOnlyCalendarIds();
      if (extraIds.length > 0) {
        calendarIds = Array.from(new Set([...calendarIds, ...extraIds]));
      }

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
              id: item.id || undefined,
              summary: item.summary || "Busy",
              start,
              end,
              isBusy,
              description: item.description || undefined,
              recurrence: item.recurrence || undefined,
              recurringEventId: item.recurringEventId || undefined,
            };
          });
        } catch (err) {
          console.error(`❌ Failed to fetch events for calendar ID: ${id}`, err);
          return [];
        }
      });

      const results = await Promise.all(eventFetches);
      const allEvents = results.flat();

      allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      return allEvents;
    }

    if (apiKey) {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId
      )}/events?key=${apiKey}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(
        timeMax
      )}&singleEvents=true&orderBy=startTime&maxResults=15`;

      const response = await fetch(url, { next: { revalidate: 120 } });
      if (!response.ok) {
        throw new Error(`Google Calendar Public Fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      interface CalendarApiItem {
        id?: string;
        summary?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        transparency?: string;
        description?: string;
        recurrence?: string[];
        recurringEventId?: string;
      }
      const items = (data.items || []) as CalendarApiItem[];
      return items.map((item) => {
        const start = item.start?.dateTime || item.start?.date || "";
        const end = item.end?.dateTime || item.end?.date || "";
        const isBusy = item.transparency !== "transparent";
        return {
          id: item.id || undefined,
          summary: item.summary || "Busy",
          start,
          end,
          isBusy,
          description: item.description || undefined,
          recurrence: item.recurrence || undefined,
          recurringEventId: item.recurringEventId || undefined,
        };
      });
    }

    if (!hasWarnedCredentials) {
      console.warn("⚠️ Missing Google Calendar credentials. Configure either Service Account (GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY) or API Key (GOOGLE_API_KEY).");
      hasWarnedCredentials = true;
    }
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


export async function getAvailabilityStatus(events: CalendarEvent[]): Promise<AvailabilityStatus> {
  const now = Date.now();

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
  recurrence?: string[];
  timeZone?: string;
}): Promise<CalendarEvent & { id: string }> {
  const calendarId = getCalendarId();
  const serviceAccountEmail = getServiceAccountEmail();
  const formattedKey = getFormattedPrivateKey();

  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID environment variable is missing.");
  }
  if (!serviceAccountEmail || !formattedKey) {
    throw new Error("Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY) are required for write operations.");
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  try {
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: data.summary,
        description: data.description,
        start: {
          dateTime: data.start,
          timeZone: data.timeZone,
        },
        end: {
          dateTime: data.end,
          timeZone: data.timeZone,
        },
        recurrence: data.recurrence,
      },
    });

    const item = response.data;
    safeRevalidateTag("calendar");

    return {
      id: item.id || "",
      summary: item.summary || data.summary,
      start: item.start?.dateTime || item.start?.date || data.start,
      end: item.end?.dateTime || item.end?.date || data.end,
      isBusy: item.transparency !== "transparent",
      description: item.description || undefined,
      recurrence: item.recurrence || undefined,
    };
  } catch (err: unknown) {
    const gError = err as {
      code?: number;
      response?: { data?: { error?: { message?: string; errors?: unknown[] } } };
      message?: string;
    };
    const detailMsg = gError.response?.data?.error?.message || gError.message || "Unknown error";
    console.error(`❌ Google Calendar events.insert failed for calendarId [${calendarId}]:`, detailMsg);

    if (gError.code === 404 || detailMsg.toLowerCase().includes("not found")) {
      throw new Error(
        `Calendar [${calendarId}] not found (404). Ensure this calendar exists and that the Service Account (${serviceAccountEmail}) is added under "Share with specific people or groups" in Google Calendar settings with "Make changes to events" permission.`
      );
    }
    throw new Error(`Google Calendar API error: ${detailMsg}`);
  }
}

export async function updateCalendarEvent(
  eventId: string,
  data: {
    summary?: string;
    start?: string;
    end?: string;
    description?: string;
    recurrence?: string[];
    timeZone?: string;
  }
): Promise<CalendarEvent & { id: string }> {
  const calendarId = getCalendarId();
  const serviceAccountEmail = getServiceAccountEmail();
  const formattedKey = getFormattedPrivateKey();

  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID environment variable is missing.");
  }
  if (!serviceAccountEmail || !formattedKey) {
    throw new Error("Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY) are required for write operations.");
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  try {
    const response = await calendar.events.patch({
      calendarId,
      eventId: eventId,
      requestBody: {
        summary: data.summary,
        description: data.description,
        ...(data.start ? { start: { dateTime: data.start, timeZone: data.timeZone } } : {}),
        ...(data.end ? { end: { dateTime: data.end, timeZone: data.timeZone } } : {}),
        recurrence: data.recurrence,
      },
    });

    const item = response.data;
    safeRevalidateTag("calendar");

    return {
      id: item.id || eventId,
      summary: item.summary || "",
      start: item.start?.dateTime || item.start?.date || "",
      end: item.end?.dateTime || item.end?.date || "",
      isBusy: item.transparency !== "transparent",
      description: item.description || undefined,
      recurrence: item.recurrence || undefined,
      recurringEventId: item.recurringEventId || undefined,
    };
  } catch (err: unknown) {
    const gError = err as {
      code?: number;
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };
    const detailMsg = gError.response?.data?.error?.message || gError.message || "Unknown error";
    console.error(`❌ Google Calendar events.patch failed for calendarId [${calendarId}]:`, detailMsg);
    throw new Error(`Google Calendar API error: ${detailMsg}`);
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const calendarId = getCalendarId();
  const serviceAccountEmail = getServiceAccountEmail();
  const formattedKey = getFormattedPrivateKey();

  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID environment variable is missing.");
  }
  if (!serviceAccountEmail || !formattedKey) {
    throw new Error("Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY) are required for write operations.");
  }

  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: formattedKey,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const calendar = google.calendar({ version: "v3", auth });
  try {
    await calendar.events.delete({
      calendarId,
      eventId: eventId,
    });

    safeRevalidateTag("calendar");
  } catch (err: unknown) {
    const gError = err as {
      code?: number;
      response?: { data?: { error?: { message?: string } } };
      message?: string;
    };
    const detailMsg = gError.response?.data?.error?.message || gError.message || "Unknown error";
    console.error(`❌ Google Calendar events.delete failed for calendarId [${calendarId}]:`, detailMsg);
    throw new Error(`Google Calendar API error: ${detailMsg}`);
  }
}




