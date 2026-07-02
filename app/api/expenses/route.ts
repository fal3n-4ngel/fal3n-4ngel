import { createExpense, listExpenses } from "@/lib/integrations/expenses";
import { corsHeaders, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses
 * Lists expenses sorted by date (newest first).
 * Auth: Authorization: Bearer <api_key>
 *
 * Optional query params:
 *   ?category=Food
 *   ?from=YYYY-MM-DD
 *   ?to=YYYY-MM-DD
 */
export async function GET(req: NextRequest) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const p = req.nextUrl.searchParams;
  const filters = {
    category: p.get("category") || undefined,
    from: p.get("from") || undefined,
    to: p.get("to") || undefined,
  };

  try {
    const expenses = await listExpenses(filters);
    const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
    return NextResponse.json(
      { success: true, count: expenses.length, total, expenses },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch expenses.", message: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * POST /api/expenses
 * Creates a new expense entry.
 * Auth: Authorization: Bearer <api_key>
 *
 * Body (JSON):
 *   title    string  (required)
 *   amount   number  (required)
 *   category string  (optional) — Food | Transport | Shopping | Entertainment | Health | Utilities | Other
 *   date     string  (optional) — YYYY-MM-DD, defaults to today
 *   notes    string  (optional)
 */
export async function POST(req: NextRequest) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Bad Request", message: "Request body must be valid JSON." },
      { status: 400, headers: corsHeaders() }
    );
  }

  const { title, amount, category, date, notes } = body;

  if (!title || amount === undefined) {
    return NextResponse.json(
      { error: "Bad Request", message: "`title` and `amount` are required." },
      { status: 400, headers: corsHeaders() }
    );
  }

  if (typeof amount !== "number" || isNaN(amount)) {
    return NextResponse.json(
      { error: "Bad Request", message: "`amount` must be a number." },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    const result = await createExpense({
      title,
      amount,
      category,
      date: date || new Date().toISOString().slice(0, 10),
      notes,
    });
    return NextResponse.json(
      { success: true, message: "Expense created.", ...result },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create expense.", message: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
