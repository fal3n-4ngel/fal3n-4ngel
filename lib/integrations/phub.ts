import { ExpenseEntry, ExpenseRecord } from "./expenses";

const PHUB_API_URL = process.env.PHUB_API_URL || "https://phub-dashboard.vercel.app";
const PHUB_API_KEY = process.env.PHUB_API_KEY;

async function phubFetch(path: string, options: RequestInit = {}) {
  if (!PHUB_API_KEY) {
    console.warn("⚠️ PHUB_API_KEY not configured. Skipping dashboard sync.");
    return null;
  }

  const url = `${PHUB_API_URL.replace(/\/$/, "")}${path}`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${PHUB_API_KEY}`,
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Vercel Dashboard API Error [${res.status}] for ${path}:`, errText);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`❌ Vercel Dashboard Fetch Exception for ${path}:`, error);
    return null;
  }
}

/** Logs an expense to the dashboard */
export async function phubCreateExpense(entry: ExpenseEntry) {
  return phubFetch("/api/expenses", {
    method: "POST",
    body: JSON.stringify({
      title: entry.title,
      amount: entry.amount,
      category: entry.category || undefined,
      date: entry.date || undefined,
      notes: entry.notes || undefined,
    }),
  });
}

/** Logs batch expenses to the dashboard */
export async function phubCreateExpenseBatch(entries: ExpenseEntry[]) {
  return phubFetch("/api/expenses", {
    method: "POST",
    body: JSON.stringify({
      items: entries.map((entry) => ({
        title: entry.title,
        amount: entry.amount,
        category: entry.category || undefined,
        date: entry.date || undefined,
        notes: entry.notes || undefined,
      })),
    }),
  });
}

/** Finds a matching expense in the dashboard by date, title, and amount */
async function findMatchingPhubExpense(title: string, amount: number, date: string | null): Promise<string | null> {
  if (!date) return null;

  // Query expenses for the specific date to limit result size
  const res = await phubFetch(`/api/expenses?from=${date}&to=${date}`);
  if (!res || !Array.isArray(res)) return null;

  const match = res.find(
    (e: any) =>
      e.title?.toLowerCase().trim() === title?.toLowerCase().trim() &&
      Math.abs((e.amount ?? 0) - amount) < 0.01
  );

  return match ? match.id : null;
}

/** Updates an expense on the dashboard */
export async function phubUpdateExpense(
  oldExpense: ExpenseRecord,
  updates: Partial<ExpenseEntry>
) {
  if (!oldExpense.date || oldExpense.amount === null) return null;

  const dashboardId = await findMatchingPhubExpense(oldExpense.title, oldExpense.amount, oldExpense.date);
  if (!dashboardId) {
    console.warn(`⚠️ Could not find matching expense on dashboard to update: "${oldExpense.title}"`);
    return null;
  }

  // Build patched object
  const patchData: any = {};
  if (updates.title !== undefined) patchData.title = updates.title;
  if (updates.amount !== undefined) patchData.amount = updates.amount;
  if (updates.category !== undefined) patchData.category = updates.category;
  if (updates.date !== undefined) patchData.date = updates.date;
  if (updates.notes !== undefined) patchData.notes = updates.notes;

  return phubFetch(`/api/expenses/${dashboardId}`, {
    method: "PATCH",
    body: JSON.stringify(patchData),
  });
}

/** Deletes/archives an expense on the dashboard */
export async function phubDeleteExpense(oldExpense: ExpenseRecord) {
  if (!oldExpense.date || oldExpense.amount === null) return null;

  const dashboardId = await findMatchingPhubExpense(oldExpense.title, oldExpense.amount, oldExpense.date);
  if (!dashboardId) {
    console.warn(`⚠️ Could not find matching expense on dashboard to delete: "${oldExpense.title}"`);
    return null;
  }

  return phubFetch(`/api/expenses/${dashboardId}`, {
    method: "DELETE",
  });
}

/** General proxy helper for other endpoints */
export async function phubProxyRequest(
  path: string,
  method: string,
  body?: any,
  searchParams?: Record<string, string>
) {
  let finalPath = path;
  if (searchParams) {
    const params = new URLSearchParams(searchParams);
    finalPath += `?${params.toString()}`;
  }

  return phubFetch(finalPath, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
