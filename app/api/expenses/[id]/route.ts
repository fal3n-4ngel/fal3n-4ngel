import { updateExpense } from "@/lib/integrations/expenses";
import { corsHeaders, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/expenses/[id]
 * Updates one or more fields of an existing expense.
 * Auth: Authorization: Bearer <api_key>
 *
 * Body (JSON) — all fields optional, only provided fields are updated:
 *   title    string
 *   amount   number
 *   category string  — Food | Transport | Shopping | Entertainment | Health | Utilities | Other
 *   date     string  — YYYY-MM-DD
 *   notes    string
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const { id: pageId } = await params;

  if (!pageId) {
    return NextResponse.json(
      { error: "Bad Request", message: "Page ID is required in the URL." },
      { status: 400, headers: corsHeaders() }
    );
  }

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

  if (Object.keys(body).length === 0) {
    return NextResponse.json(
      { error: "Bad Request", message: "At least one field to update is required." },
      { status: 400, headers: corsHeaders() }
    );
  }

  if (amount !== undefined && (typeof amount !== "number" || isNaN(amount))) {
    return NextResponse.json(
      { error: "Bad Request", message: "`amount` must be a number." },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (amount !== undefined) updates.amount = amount;
    if (category !== undefined) updates.category = category;
    if (date !== undefined) updates.date = date;
    if (notes !== undefined) updates.notes = notes;

    const result = await updateExpense(pageId, updates);
    return NextResponse.json(
      { success: true, message: "Expense updated.", ...result },
      { headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update expense.", message: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
