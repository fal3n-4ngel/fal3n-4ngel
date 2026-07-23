import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const CATEGORIES_DB_ID = process.env.NOTION_CATEGORIES_DB_ID || "f21a1feb-b4f5-4504-94b8-7a1b1dfe10ba";
const EXPENSES_DB_ID = process.env.NOTION_EXPENSES_DB_ID || null;

// Notion allows ~3 requests/second — keep batch writes below that burst.
const BATCH_CONCURRENCY = 3;
// Hard cap on pagination so a runaway query can't loop forever (1000 rows).
const MAX_QUERY_PAGES = 10;

const EXPENSES_TIMEZONE = process.env.EXPENSES_TIMEZONE || "Asia/Kolkata";

/**
 * Today's date (YYYY-MM-DD) in the expense-tracking timezone.
 * Using UTC here shifted late-night entries to the previous day.
 */
export function todayISODate(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: EXPENSES_TIMEZONE }).format(new Date());
}

/** Strict YYYY-MM-DD validation (rejects e.g. 2026-02-30). */
export function isValidISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export async function getExpenseFromNotion(pageId: string): Promise<ExpenseRecord | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId }) as any;
    const categoryId = page.properties.Category?.relation?.[0]?.id || null;
    let categoryName = null;
    if (categoryId) {
      const categories = await getCategories();
      const match = categories.find((c) => c.id === categoryId);
      categoryName = match ? match.name : null;
    }
    return {
      id: page.id,
      url: page.url,
      title: page.properties.Title?.title?.[0]?.plain_text || "",
      amount: page.properties.Amount?.number ?? null,
      category_id: categoryId,
      category: categoryName,
      date: page.properties.Date?.date?.start || null,
      notes: page.properties.Notes?.rich_text?.[0]?.plain_text || null,
      currentCycle: page.properties["Current Cycle"]?.formula?.boolean ?? null,
    };
  } catch (error) {
    console.error("❌ Notion Retrieve Page Error:", error);
    return null;
  }
}

/**
 * Returns the production expenses database ID.
 *
 * Previously this silently created a brand-new "Expenses Tracker" DB whenever
 * NOTION_EXPENSES_DB_ID was unset — on serverless that meant a new, empty,
 * schema-incomplete DB per cold start, scattering prod data. Now it fails loudly.
 */
export async function getOrCreateExpensesDb(): Promise<string> {
  if (EXPENSES_DB_ID) return EXPENSES_DB_ID;
  throw new Error(
    "NOTION_EXPENSES_DB_ID is not configured. Refusing to auto-create a new database — set the env var to the production Expenses Tracker database ID."
  );
}

/** Queries a Notion database, following pagination cursors (up to MAX_QUERY_PAGES). */
async function queryAllPages(params: Parameters<typeof notion.databases.query>[0]) {
  const results: any[] = [];
  let cursor: string | undefined = undefined;

  for (let page = 0; page < MAX_QUERY_PAGES; page++) {
    const response = await notion.databases.query({
      ...params,
      ...(cursor && { start_cursor: cursor }),
    });
    results.push(...response.results);
    if (!response.has_more || !response.next_cursor) break;
    cursor = response.next_cursor;
  }

  return results;
}

let cachedCategories: { id: string; name: string }[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export async function getCategories() {
  const now = Date.now();
  if (cachedCategories && now - lastFetchTime < CACHE_TTL) {
    return cachedCategories;
  }

  try {
    const pages = await queryAllPages({ database_id: CATEGORIES_DB_ID });

    const categories = pages.map((page: any) => {
      const name = page.properties.Name?.title?.[0]?.plain_text || "";
      return {
        id: page.id,
        name: name.trim(),
      };
    });

    cachedCategories = categories;
    lastFetchTime = now;
    return categories;
  } catch (error) {
    console.error("❌ Notion Fetch Categories Error:", error);
    return cachedCategories || [];
  }
}

export async function resolveCategoryId(categoryNameOrId: string): Promise<string | null> {
  if (!categoryNameOrId) return null;

  const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  if (uuidRegex.test(categoryNameOrId)) {
    return categoryNameOrId;
  }

  const categories = await getCategories();
  const nameLower = categoryNameOrId.toLowerCase().trim();

  // Exact match
  let match = categories.find((c) => c.name.toLowerCase() === nameLower);
  if (match) return match.id;

  // Category name contains the input (e.g. "food" → "Food & Dining")
  match = categories.find((c) => c.name.toLowerCase().includes(nameLower));
  if (match) return match.id;

  // Input contains the category name (e.g. "food delivery" → "Food").
  // Require ≥3 chars so short names like "EMI" can't hijack unrelated inputs.
  match = categories.find(
    (c) => c.name.length >= 3 && nameLower.includes(c.name.toLowerCase())
  );
  if (match) return match.id;

  return null;
}

export interface ExpenseEntry {
  title: string;
  amount: number;
  category?: string;     // Category Name or ID (relation)
  date?: string;         // ISO date: YYYY-MM-DD
  notes?: string;
}

/**
 * Adds a new expense row to the Notion Expenses database.
 * When a category was requested, the result includes `category_id`
 * (null if it could not be resolved) so callers can surface a warning.
 */
export async function createExpense(entry: ExpenseEntry) {
  const dbId = await getOrCreateExpensesDb();

  const properties: Record<string, any> = {
    Title: { title: [{ text: { content: entry.title } }] },
    Amount: { number: entry.amount },
  };

  let resolvedId: string | null = null;
  if (entry.category) {
    resolvedId = await resolveCategoryId(entry.category);
    if (resolvedId) {
      properties.Category = { relation: [{ id: resolvedId }] };
    }
  }

  if (entry.date) {
    properties.Date = { date: { start: entry.date } };
  }

  if (entry.notes) {
    properties.Notes = { rich_text: [{ text: { content: entry.notes } }] };
  }

  const page = await notion.pages.create({
    parent: { database_id: dbId },
    properties,
  });

  return {
    id: page.id,
    url: (page as any).url,
    ...(entry.category ? { category_id: resolvedId } : {}),
  };
}

/** Runs tasks with bounded concurrency, preserving input order in the results. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      try {
        results[i] = { status: "fulfilled", value: await fn(items[i]!) };
      } catch (reason) {
        results[i] = { status: "rejected", reason };
      }
    }
  });

  await Promise.all(workers);
  return results;
}

/**
 * Creates multiple expenses with bounded concurrency (Notion rate limit is ~3 rps;
 * firing 50 requests at once produced 429 failures).
 * Returns an array of results with id, url, title, and success/error per entry.
 */
export async function createExpenseBatch(entries: ExpenseEntry[]) {
  const results = await mapWithConcurrency(entries, BATCH_CONCURRENCY, createExpense);
  return results.map((r, i) => {
    const entry = entries[i]!;
    if (r.status === "fulfilled") {
      return { success: true, title: entry.title, ...r.value };
    } else {
      return { success: false, title: entry.title, error: (r.reason as Error)?.message || "Unknown error" };
    }
  });
}

/**
 * Updates an existing expense row by Notion page ID.
 * Only the fields provided will be updated.
 */
export async function updateExpense(
  pageId: string,
  entry: Partial<ExpenseEntry>
) {
  const properties: Record<string, any> = {};

  if (entry.title !== undefined) {
    properties.Title = { title: [{ text: { content: entry.title } }] };
  }

  if (entry.amount !== undefined) {
    properties.Amount = { number: entry.amount };
  }

  if (entry.category !== undefined) {
    if (entry.category) {
      const resolvedId = await resolveCategoryId(entry.category);
      properties.Category = resolvedId
        ? { relation: [{ id: resolvedId }] }
        : { relation: [] };
    } else {
      properties.Category = { relation: [] }; // clear relation
    }
  }

  if (entry.date !== undefined) {
    properties.Date = { date: { start: entry.date } };
  }

  if (entry.notes !== undefined) {
    properties.Notes = { rich_text: [{ text: { content: entry.notes } }] };
  }

  const page = await notion.pages.update({
    page_id: pageId,
    properties,
  });

  return { id: page.id, url: (page as any).url };
}

/**
 * Archives (soft-deletes) an expense row. The page moves to Notion's trash
 * and can be restored from there — no data is destroyed.
 */
export async function archiveExpense(pageId: string) {
  const page = await notion.pages.update({
    page_id: pageId,
    archived: true,
  });
  return { id: page.id };
}

export interface ListExpensesFilters {
  category?: string;    // Name or ID
  from?: string;        // YYYY-MM-DD
  to?: string;          // YYYY-MM-DD
  currentCycle?: boolean; // filter to current billing cycle
  q?: string;           // text search across Title and Notes
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseRecord {
  id: string;
  url: string;
  title: string;
  amount: number | null;
  category_id: string | null;
  category: string | null;
  date: string | null;
  notes: string | null;
  currentCycle: boolean | null;
}

/**
 * Lists expenses from the Notion Expenses database (all pages, newest first).
 * Optionally filter by category, date range, current cycle, text query, or amount range.
 */
export async function listExpenses(filters?: ListExpensesFilters): Promise<ExpenseRecord[]> {
  const dbId = await getOrCreateExpensesDb();

  const notionFilters: any[] = [];

  if (filters?.category) {
    const resolvedId = await resolveCategoryId(filters.category);
    if (resolvedId) {
      notionFilters.push({
        property: "Category",
        relation: { contains: resolvedId },
      });
    }
  }

  if (filters?.from) {
    notionFilters.push({
      property: "Date",
      date: { on_or_after: filters.from },
    });
  }

  if (filters?.to) {
    notionFilters.push({
      property: "Date",
      date: { on_or_before: filters.to },
    });
  }

  if (filters?.currentCycle) {
    notionFilters.push({
      property: "Current Cycle",
      formula: { checkbox: { equals: true } },
    });
  }

  if (filters?.q) {
    notionFilters.push({
      or: [
        { property: "Title", title: { contains: filters.q } },
        { property: "Notes", rich_text: { contains: filters.q } },
      ],
    });
  }

  if (filters?.minAmount !== undefined) {
    notionFilters.push({
      property: "Amount",
      number: { greater_than_or_equal_to: filters.minAmount },
    });
  }

  if (filters?.maxAmount !== undefined) {
    notionFilters.push({
      property: "Amount",
      number: { less_than_or_equal_to: filters.maxAmount },
    });
  }

  const pages = await queryAllPages({
    database_id: dbId,
    sorts: [{ property: "Date", direction: "descending" }],
    ...(notionFilters.length > 0 && {
      filter:
        notionFilters.length === 1
          ? notionFilters[0]
          : { and: notionFilters },
    }),
  });

  const categories = await getCategories();
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  return pages.map((page: any) => {
    const categoryId = page.properties.Category?.relation?.[0]?.id || null;
    const categoryName = categoryId ? catMap.get(categoryId) || null : null;

    return {
      id: page.id,
      url: page.url,
      title: page.properties.Title?.title?.[0]?.plain_text || "",
      amount: page.properties.Amount?.number ?? null,
      category_id: categoryId,
      category: categoryName,
      date: page.properties.Date?.date?.start || null,
      notes: page.properties.Notes?.rich_text?.[0]?.plain_text || null,
      currentCycle: page.properties["Current Cycle"]?.formula?.boolean ?? null,
    };
  });
}
