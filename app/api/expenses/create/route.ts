import { createExpense } from "@/lib/integrations/expenses";
import { corsHeaders, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses/create
 *
 * Query params:
 *   api_key  (required) – your EXPENSES_API_KEY
 *   title    (required) – expense name/description
 *   amount   (required) – numeric amount (e.g. 250.50)
 *   category (optional) – Food | Transport | Shopping | Entertainment | Health | Utilities | Other
 *   date     (optional) – ISO date YYYY-MM-DD (defaults to today)
 *   notes    (optional) – extra notes
 */
export async function GET(req: NextRequest) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const p = req.nextUrl.searchParams;

  const title = p.get("title");
  const amountRaw = p.get("amount");

  if (!title || !amountRaw) {
    return NextResponse.json(
      { error: "Bad Request", message: "`title` and `amount` are required." },
      { status: 400, headers: corsHeaders() }
    );
  }

  const amount = parseFloat(amountRaw);
  if (isNaN(amount)) {
    return NextResponse.json(
      { error: "Bad Request", message: "`amount` must be a number." },
      { status: 400, headers: corsHeaders() }
    );
  }

  const date = p.get("date") || new Date().toISOString().slice(0, 10);
  const category = p.get("category") || undefined;
  const notes = p.get("notes") || undefined;

  try {
    const result = await createExpense({ title, amount, category, date, notes });
    return NextResponse.json(
      { success: true, message: "Expense created.", ...result },
      { headers: corsHeaders() }
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
