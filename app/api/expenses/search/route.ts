import { isValidISODate, listExpenses } from "@/lib/integrations/expenses";
import { round2 } from "@/lib/expenses-analytics";
import { badRequest, corsHeaders, serverError, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses/search
 * Searches expenses by text and/or filters. All filters combine with AND.
 * Auth: Authorization: Bearer <api_key>
 *
 * Query params (at least one required):
 *   ?q=coffee            — matches Title or Notes (contains, case-insensitive)
 *   ?category=Name-or-ID
 *   ?min_amount=100
 *   ?max_amount=500
 *   ?from=YYYY-MM-DD
 *   ?to=YYYY-MM-DD
 *   ?limit=N             — cap the number of results (default: all)
 */
export async function GET(req: NextRequest) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const p = req.nextUrl.searchParams;
  const q = p.get("q") || undefined;
  const category = p.get("category") || undefined;
  const from = p.get("from") || undefined;
  const to = p.get("to") || undefined;
  const minAmountParam = p.get("min_amount");
  const maxAmountParam = p.get("max_amount");
  const limitParam = p.get("limit");

  if (!q && !category && !from && !to && !minAmountParam && !maxAmountParam) {
    return badRequest("Provide at least one search parameter: q, category, min_amount, max_amount, from, to.");
  }

  if (from && !isValidISODate(from)) return badRequest("`from` must be a valid YYYY-MM-DD date.");
  if (to && !isValidISODate(to)) return badRequest("`to` must be a valid YYYY-MM-DD date.");

  const minAmount = minAmountParam !== null ? Number(minAmountParam) : undefined;
  const maxAmount = maxAmountParam !== null ? Number(maxAmountParam) : undefined;
  if (minAmount !== undefined && !Number.isFinite(minAmount)) return badRequest("`min_amount` must be a number.");
  if (maxAmount !== undefined && !Number.isFinite(maxAmount)) return badRequest("`max_amount` must be a number.");

  let limit: number | undefined;
  if (limitParam !== null) {
    limit = Number(limitParam);
    if (!Number.isInteger(limit) || limit < 1) return badRequest("`limit` must be a positive integer.");
  }

  try {
    let expenses = await listExpenses({ q, category, from, to, minAmount, maxAmount });
    const totalMatched = expenses.length;
    const total = round2(expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0));
    if (limit) expenses = expenses.slice(0, limit);

    return NextResponse.json(
      { success: true, count: totalMatched, returned: expenses.length, total, expenses },
      { headers: corsHeaders() }
    );
  } catch (err) {
    return serverError("Failed to search expenses.", err);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
