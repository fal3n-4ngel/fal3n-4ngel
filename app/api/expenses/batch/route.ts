import {
  createExpenseBatch,
  ExpenseEntry,
  isValidISODate,
  todayISODate,
} from "@/lib/integrations/expenses";
import {
  badRequest,
  corsHeaders,
  parseJsonBody,
  serverError,
  unauthorizedResponse,
  validateExpensesApiKey,
} from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/expenses/batch
 * Creates multiple expense entries at once (bounded concurrency).
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
 * Each item: title and amount required; category, date, and notes optional.
 * Returns results for each item individually — partial success is possible.
 */
export async function POST(req: NextRequest) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const body = await parseJsonBody(req);
  if (!body) return badRequest("Request body must be valid JSON.");

  const { expenses } = body;

  if (!Array.isArray(expenses) || expenses.length === 0) {
    return badRequest("`expenses` must be a non-empty array.");
  }

  if (expenses.length > 50) {
    return badRequest("Maximum 50 expenses per batch.");
  }

  // Validate each entry
  const today = todayISODate();
  const entries: ExpenseEntry[] = [];

  for (let i = 0; i < expenses.length; i++) {
    const e = expenses[i];
    if (!e.title || e.amount === undefined) {
      return badRequest(`Item at index ${i} is missing required fields: title, amount.`);
    }
    if (typeof e.amount !== "number" || !Number.isFinite(e.amount)) {
      return badRequest(`Item at index ${i}: amount must be a finite number.`);
    }
    if (e.date !== undefined && !isValidISODate(e.date)) {
      return badRequest(`Item at index ${i}: date must be a valid YYYY-MM-DD date.`);
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
  } catch (err) {
    return serverError("Failed to create expenses.", err);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
