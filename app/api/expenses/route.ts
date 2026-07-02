import { createExpense, listExpenses } from "@/lib/integrations/expenses";
import { corsHeaders, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses
 * Lists all expenses sorted by date (newest first).
 * Auth: Authorization: Bearer <api_key>
 */
export async function GET(req: NextRequest) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  try {
    const expenses = await listExpenses();
    return NextResponse.json(
      { success: true, count: expenses.length, expenses },
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
