import { createExpense, isValidISODate, listExpenses, todayISODate } from "@/lib/integrations/expenses";
import { phubCreateExpense } from "@/lib/integrations/phub";
import {
  badRequest,
  corsHeaders,
  logRequest,
  parseJsonBody,
  serverError,
  unauthorizedResponse,
  validateExpensesApiKey,
} from "@/lib/expenses-auth";

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses
 * Lists expenses sorted by date (newest first).
 * Auth: Authorization: Bearer <api_key>
 *
 * Optional query params:
 *   ?category=Name-or-ID
 *   ?from=YYYY-MM-DD
 *   ?to=YYYY-MM-DD
 *   ?current_cycle=true   — only expenses in the current billing cycle (25th–24th)
 */
export async function GET(req: NextRequest) {
  logRequest(req);
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();


  const p = req.nextUrl.searchParams;
  const from = p.get("from") || undefined;
  const to = p.get("to") || undefined;

  if (from && !isValidISODate(from)) return badRequest("`from` must be a valid YYYY-MM-DD date.");
  if (to && !isValidISODate(to)) return badRequest("`to` must be a valid YYYY-MM-DD date.");

  const filters = {
    category: p.get("category") || undefined,
    from,
    to,
    currentCycle: p.get("current_cycle") === "true" ? true : undefined,
  };

  try {
    const expenses = await listExpenses(filters);
    const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
    return NextResponse.json(
      { success: true, count: expenses.length, total, expenses },
      { headers: corsHeaders() }
    );
  } catch (err) {
    return serverError("Failed to fetch expenses.", err);
  }
}

/**
 * POST /api/expenses
 * Creates a new expense entry.
 * Auth: Authorization: Bearer <api_key>
 *
 * Body (JSON):
 *   title       string  (required)
 *   amount      number  (required)
 *   category    string  (optional) — Category Name or Notion page ID
 *   category_id string  (optional) — Notion page ID of the category (deprecated, use category)
 *   date        string  (optional) — YYYY-MM-DD, defaults to today
 *   notes       string  (optional)
 */
export async function POST(req: NextRequest) {
  logRequest(req);
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();


  const body = await parseJsonBody(req);
  if (!body) return badRequest("Request body must be valid JSON.");

  const { title, amount, category, category_id, date, notes } = body;

  if (!title || amount === undefined) {
    return badRequest("`title` and `amount` are required.");
  }

  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return badRequest("`amount` must be a finite number.");
  }

  if (date !== undefined && !isValidISODate(date)) {
    return badRequest("`date` must be a valid YYYY-MM-DD date.");
  }

  const requestedCategory = category || category_id;

  try {
    const finalDate = date || todayISODate();
    const result = await createExpense({
      title,
      amount,
      category: requestedCategory,
      date: finalDate,
      notes,
    });

    // Sync to phub dashboard in background
    phubCreateExpense({
      title,
      amount,
      category: requestedCategory,
      date: finalDate,
      notes,
    }).catch((e) => console.error("❌ Failed to sync createExpense to Vercel:", e));

    const warning =
      requestedCategory && result.category_id === null
        ? `Category "${requestedCategory}" was not found — expense saved without a category. Use GET /api/expenses/categories to list valid names.`
        : undefined;

    return NextResponse.json(
      { success: true, message: "Expense created.", ...result, ...(warning && { warning }) },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err) {
    return serverError("Failed to create expense.", err);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
