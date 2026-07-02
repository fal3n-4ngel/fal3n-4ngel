import { createExpenseBatch, ExpenseEntry } from "@/lib/integrations/expenses";
import { corsHeaders, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/expenses/batch
 * Creates multiple expense entries at once in parallel.
 * Auth: Authorization: Bearer <api_key>
 *
 * Body (JSON):
 * {
 *   "expenses": [
 *     { "title": "Lunch", "amount": 250, "date": "2026-07-02" },
 *     { "title": "Uber", "amount": 130 },
 *     ...
 *   ]
 * }
 *
 * Each item: title and amount required, date and notes optional.
 * Returns results for each item individually — partial success is possible.
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

  const { expenses } = body;

  if (!Array.isArray(expenses) || expenses.length === 0) {
    return NextResponse.json(
      { error: "Bad Request", message: "`expenses` must be a non-empty array." },
      { status: 400, headers: corsHeaders() }
    );
  }

  if (expenses.length > 50) {
    return NextResponse.json(
      { error: "Bad Request", message: "Maximum 50 expenses per batch." },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Validate each entry
  const today = new Date().toISOString().slice(0, 10);
  const entries: ExpenseEntry[] = [];

  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];
    if (!e.title || e.amount === undefined) {
      return NextResponse.json(
        { error: "Bad Request", message: `Item at index ${i} is missing required fields: title, amount.` },
        { status: 400, headers: corsHeaders() }
      );
    }
    if (typeof e.amount !== "number" || isNaN(e.amount)) {
      return NextResponse.json(
        { error: "Bad Request", message: `Item at index ${i}: amount must be a number.` },
        { status: 400, headers: corsHeaders() }
      );
    }
    entries.push({
      title: e.title,
      amount: e.amount,
      category: e.category || e.category_id,
      date: e.date || today,
      notes: e.notes,
    });
  }

  try {
    const results = await createExpenseBatch(entries);
    const succeeded = results.filter((r) => r.success).length;
    const failed = results.length - succeeded;

    return NextResponse.json(
      {
        success: failed === 0,
        message: `${succeeded} created${failed > 0 ? `, ${failed} failed` : ""}.`,
        results,
      },
      { status: failed === results.length ? 500 : 201, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create expenses.", message: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
