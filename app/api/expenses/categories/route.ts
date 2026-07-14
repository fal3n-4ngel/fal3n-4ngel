import { getCategories } from "@/lib/integrations/expenses";
import { corsHeaders, logRequest, serverError, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses/categories
 * Retrieves all valid categories from the Categories Notion database.
 * Auth: Authorization: Bearer <api_key>
 */
export async function GET(req: NextRequest) {
  logRequest(req);
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();


  try {
    const categories = await getCategories();
    return NextResponse.json(
      { success: true, count: categories.length, categories },
      { headers: corsHeaders() }
    );
  } catch (err) {
    return serverError("Failed to fetch categories.", err);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
