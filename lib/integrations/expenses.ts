import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID!;

let _expensesDbId: string | null = process.env.NOTION_EXPENSES_DB_ID || null;

/**
 * Returns the expenses database ID, creating the DB in Notion if it doesn't exist yet.
 */
export async function getOrCreateExpensesDb(): Promise<string> {
  if (_expensesDbId) return _expensesDbId;

  // Create the database under the portfolio parent page
  const db = await notion.databases.create({
    parent: { type: "page_id", page_id: PARENT_PAGE_ID },
    title: [{ type: "text", text: { content: "Expenses Tracker" } }],
    properties: {
      Title: { title: {} },
      Amount: { number: { format: "rupee" } },
      Category: {
        select: {
          options: [
            { name: "Food", color: "orange" },
            { name: "Transport", color: "blue" },
            { name: "Shopping", color: "pink" },
            { name: "Entertainment", color: "purple" },
            { name: "Health", color: "green" },
            { name: "Utilities", color: "gray" },
            { name: "Other", color: "default" },
          ],
        },
      },
      Date: { date: {} },
      Notes: { rich_text: {} },
    },
  });

  _expensesDbId = db.id;
  return db.id;
}

export interface ExpenseEntry {
  title: string;
  amount: number;
  category?: string;
  date?: string; // ISO date: YYYY-MM-DD
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
    properties.Category = { select: { name: entry.category } };
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
  const results = await Promise.allSettled(entries.map((e) => createExpense(e)));
  return results.map((r, i) => {
    if (r.status === "fulfilled") {
      return { success: true, title: entries[i].title, ...r.value };
    } else {
      return { success: false, title: entries[i].title, error: r.reason?.message || "Unknown error" };
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
    properties.Category = { select: { name: entry.category } };
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
  category?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

/**
 * Lists expenses from the Notion Expenses database.
 * Optionally filter by category and/or date range.
 */
export async function listExpenses(filters?: ListExpensesFilters) {
  const dbId = await getOrCreateExpensesDb();

  const notionFilters: any[] = [];

  if (filters?.category) {
    notionFilters.push({
      property: "Category",
      select: { equals: filters.category },
    });
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

  return response.results.map((page: any) => ({
    id: page.id,
    url: page.url,
    title: page.properties.Title?.title?.[0]?.plain_text || "",
    amount: page.properties.Amount?.number ?? null,
    category: page.properties.Category?.select?.name || null,
    date: page.properties.Date?.date?.start || null,
    notes: page.properties.Notes?.rich_text?.[0]?.plain_text || null,
  }));
}
