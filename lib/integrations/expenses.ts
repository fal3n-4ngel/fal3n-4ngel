import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID!;
const CATEGORIES_DB_ID = process.env.NOTION_CATEGORIES_DB_ID || "f21a1feb-b4f5-4504-94b8-7a1b1dfe10ba";

let _expensesDbId: string | null = process.env.NOTION_EXPENSES_DB_ID || null;

/**
 * Returns the expenses database ID, creating the DB in Notion if it doesn't exist yet.
 */
export async function getOrCreateExpensesDb(): Promise<string> {
  if (_expensesDbId) return _expensesDbId;

  const db = await notion.databases.create({
    parent: { type: "page_id", page_id: PARENT_PAGE_ID },
    title: [{ type: "text", text: { content: "Expenses Tracker" } }],
    properties: {
      Title: { title: {} },
      Amount: { number: { format: "rupee" } },
      Date: { date: {} },
      Notes: { rich_text: {} },
    },
  });

  _expensesDbId = db.id;
  return db.id;
}

let cachedCategories: { id: string; name: string }[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export async function getCategories() {
  const now = Date.now();
  if (cachedCategories && (now - lastFetchTime < CACHE_TTL)) {
    return cachedCategories;
  }

  try {
    const response = await notion.databases.query({
      database_id: CATEGORIES_DB_ID,
    });

    const categories = response.results.map((page: any) => {
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
  let match = categories.find(c => c.name.toLowerCase() === nameLower);
  if (match) return match.id;

  // Fuzzy match
  match = categories.find(c => c.name.toLowerCase().includes(nameLower) || nameLower.includes(c.name.toLowerCase()));
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
 */
export async function createExpense(entry: ExpenseEntry) {
  const dbId = await getOrCreateExpensesDb();

  const properties: Record<string, any> = {
    Title: { title: [{ text: { content: entry.title } }] },
    Amount: { number: entry.amount },
  };

  if (entry.category) {
    const resolvedId = await resolveCategoryId(entry.category);
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

  return { id: page.id, url: (page as any).url };
}

/**
 * Creates multiple expenses in parallel.
 * Returns an array of results with id, url, title, and success/error per entry.
 */
export async function createExpenseBatch(entries: ExpenseEntry[]) {
  const tagged = entries.map((entry) => ({ entry, promise: createExpense(entry) }));
  const results = await Promise.allSettled(tagged.map((t) => t.promise));
  return results.map((r, i) => {
    const entry = tagged[i]!.entry;
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

export interface ListExpensesFilters {
  category?: string;    // Name or ID
  from?: string;        // YYYY-MM-DD
  to?: string;          // YYYY-MM-DD
  currentCycle?: boolean; // filter to current billing cycle
}

/**
 * Lists expenses from the Notion Expenses database.
 * Optionally filter by category, date range, or current cycle.
 */
export async function listExpenses(filters?: ListExpensesFilters) {
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

  const response = await notion.databases.query({
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
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  return response.results.map((page: any) => {
    const categoryId = page.properties.Category?.relation?.[0]?.id || null;
    const categoryName = categoryId ? (catMap.get(categoryId) || null) : null;
    
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
