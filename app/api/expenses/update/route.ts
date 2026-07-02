import { updateExpense } from "@/lib/integrations/expenses";
import { corsHeaders, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses/update
 *
 * Query params:
 *   api_key   (required) – your EXPENSES_API_KEY
 *   page_id   (required) – Notion page ID returned by the create endpoint
 *   title     (optional) – new title
 *   amount    (optional) – new amount
 *   category  (optional) – Food | Transport | Shopping | Entertainment | Health | Utilities | Other
 *   date      (optional) – ISO date YYYY-MM-DD
 *   notes     (optional) – new notes
 *
 * Only the fields you pass will be updated; the rest remain unchanged.
 */
export async function GET(req: NextRequest) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const p = req.nextUrl.searchParams;
  const pageId = p.get("page_id");

  if (!pageId) {
    return NextResponse.json(
      { error: "Bad Request", message: "`page_id` is required." },
      { status: 400, headers: corsHeaders() }
    );
  }

  const updates: Record<string, any> = {};

  if (p.has("title")) updates.title = p.get("title")!;
  if (p.has("category")) updates.category = p.get("category")!;
  if (p.has("date")) updates.date = p.get("date")!;
  if (p.has("notes")) updates.notes = p.get("notes")!;

  if (p.has("amount")) {
    const amount = parseFloat(p.get("amount")!);
    if (isNaN(amount)) {
      return NextResponse.json(
        { error: "Bad Request", message: "`amount` must be a number." },
        { status: 400, headers: corsHeaders() }
      );
    }
    updates.amount = amount;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Bad Request", message: "At least one field to update is required." },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
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
