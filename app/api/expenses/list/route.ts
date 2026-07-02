import { listExpenses } from "@/lib/integrations/expenses";
import { corsHeaders, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses/list
 *
 * Query params:
 *   api_key  (required) – your EXPENSES_API_KEY
 *
 * Returns all expenses sorted by date (newest first).
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

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
