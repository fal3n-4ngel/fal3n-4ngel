import { ExpenseRecord, todayISODate } from "@/lib/integrations/expenses";

export interface CategoryBreakdownRow {
  category_id: string | null;
  category: string;
  total: number;
  count: number;
  percent: number;
}

/** Groups expenses by category, sorted by total spend (descending). */
export function groupByCategory(expenses: ExpenseRecord[]): CategoryBreakdownRow[] {
  const grandTotal = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const groups = new Map<string, { category_id: string | null; category: string; total: number; count: number }>();

  for (const e of expenses) {
    const key = e.category_id ?? "__uncategorized__";
    const existing = groups.get(key) ?? {
      category_id: e.category_id,
      category: e.category ?? "Uncategorized",
      total: 0,
      count: 0,
    };
    existing.total += e.amount ?? 0;
    existing.count += 1;
    groups.set(key, existing);
  }

  return [...groups.values()]
    .sort((a, b) => b.total - a.total)
    .map((g) => ({
      ...g,
      total: round2(g.total),
      percent: grandTotal > 0 ? round2((g.total / grandTotal) * 100) : 0,
    }));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Validates a YYYY-MM month string. */
export function isValidMonth(s: string): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(s)) return false;
  return true;
}

/** First and last day (YYYY-MM-DD) of a YYYY-MM month. */
export function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y!, m!, 0)).getUTCDate();
  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

/** The current month (YYYY-MM) in the expense-tracking timezone. */
export function currentMonth(): string {
  return todayISODate().slice(0, 7);
}

/** The N months ending at (and including) the given YYYY-MM month, oldest first. */
export function lastNMonths(endMonth: string, n: number): string[] {
  const [y, m] = endMonth.split("-").map(Number);
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y!, m! - 1 - i, 1));
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

/** Escapes a value for a CSV cell (quotes, commas, newlines). */
export function csvCell(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
