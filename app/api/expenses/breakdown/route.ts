import { isValidISODate, listExpenses } from "@/lib/integrations/expenses";
import { currentMonth, groupByCategory, monthRange, round2 } from "@/lib/expenses-analytics";
import { badRequest, corsHeaders, serverError, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses/breakdown
 * Category-wise spend breakdown (totals, counts, percentages).
 * Auth: Authorization: Bearer <api_key>
 *
 * Optional query params:
 *   ?from=YYYY-MM-DD
 *   ?to=YYYY-MM-DD
 *   ?current_cycle=true — use the billing cycle (25th–24th) instead of dates
 *
 * Defaults to the current calendar month when no range is given.
 */
export async function GET(req: NextRequest) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const p = req.nextUrl.searchParams;
  const currentCycle = p.get("current_cycle") === "true";
  let from = p.get("from") || undefined;
  let to = p.get("to") || undefined;

  if (from && !isValidISODate(from)) return badRequest("`from` must be a valid YYYY-MM-DD date.");
  if (to && !isValidISODate(to)) return badRequest("`to` must be a valid YYYY-MM-DD date.");

  // Default window: current calendar month (unless the billing-cycle flag is used).
  if (!currentCycle && !from && !to) {
    const range = monthRange(currentMonth());
    from = range.from;
    to = range.to;
  }

  try {
    const expenses = await listExpenses(
      currentCycle ? { currentCycle: true } : { from, to }
    );
    const total = round2(expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0));
    const breakdown = groupByCategory(expenses);

    return NextResponse.json(
      {
        success: true,
        ...(currentCycle ? { current_cycle: true } : { from, to }),
        total,
        count: expenses.length,
        breakdown,
      },
      { headers: corsHeaders() }
    );
  } catch (err) {
    return serverError("Failed to compute breakdown.", err);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
