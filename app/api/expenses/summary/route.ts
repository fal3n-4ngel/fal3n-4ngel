import { listExpenses, todayISODate } from "@/lib/integrations/expenses";
import {
  currentMonth,
  groupByCategory,
  isValidMonth,
  lastNMonths,
  monthRange,
  round2,
} from "@/lib/expenses-analytics";
import { badRequest, corsHeaders, logRequest, serverError, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses/summary
 * Monthly spending summary computed from the existing Expenses database.
 * Auth: Authorization: Bearer <api_key>
 *
 * Optional query params:
 *   ?month=YYYY-MM   — summarize a single month (default: current month)
 *   ?months=N        — include the last N months ending at `month` (1–12, default 1)
 *
 * Response: per-month total, count, average per day, top category, and
 * category breakdown. One Notion query covers the whole range.
 */
export async function GET(req: NextRequest) {
  logRequest(req);
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();


  const p = req.nextUrl.searchParams;
  const month = p.get("month") || currentMonth();
  const monthsParam = p.get("months") || "1";

  if (!isValidMonth(month)) return badRequest("`month` must be in YYYY-MM format.");
  const months = Number(monthsParam);
  if (!Number.isInteger(months) || months < 1 || months > 12) {
    return badRequest("`months` must be an integer between 1 and 12.");
  }

  const monthList = lastNMonths(month, months);
  const from = monthRange(monthList[0]!).from;
  const to = monthRange(monthList[monthList.length - 1]!).to;

  try {
    const expenses = await listExpenses({ from, to });
    const today = todayISODate();

    const summaries = monthList.map((m) => {
      const inMonth = expenses.filter((e) => e.date?.startsWith(m));
      const total = round2(inMonth.reduce((sum, e) => sum + (e.amount ?? 0), 0));
      const byCategory = groupByCategory(inMonth);

      // For the current month, average over elapsed days, not the full month.
      const { to: monthEnd } = monthRange(m);
      const lastCountedDay = today < monthEnd && today.startsWith(m) ? Number(today.slice(8, 10)) : Number(monthEnd.slice(8, 10));
      const daysElapsed = Math.max(1, lastCountedDay);

      return {
        month: m,
        total,
        count: inMonth.length,
        average_per_day: round2(total / daysElapsed),
        top_category: byCategory[0]?.category ?? null,
        by_category: byCategory,
      };
    });

    const grandTotal = round2(summaries.reduce((sum, s) => sum + s.total, 0));

    return NextResponse.json(
      { success: true, from, to, grand_total: grandTotal, months: summaries },
      { headers: corsHeaders() }
    );
  } catch (err) {
    return serverError("Failed to compute summary.", err);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
