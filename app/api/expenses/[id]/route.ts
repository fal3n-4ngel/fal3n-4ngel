import { archiveExpense, getExpenseFromNotion, isValidISODate, updateExpense } from "@/lib/integrations/expenses";
import { phubDeleteExpense, phubUpdateExpense } from "@/lib/integrations/phub";
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
 * PATCH /api/expenses/[id]
 * Updates one or more fields of an existing expense.
 * Auth: Authorization: Bearer <api_key>
 *
 * Body (JSON) — all fields optional, only provided fields are updated:
 *   title       string
 *   amount      number
 *   category    string  — Category Name or Notion page ID (pass "" to clear)
 *   category_id string  — Notion page ID of the category (pass "" to clear)
 *   date        string  — YYYY-MM-DD
 *   notes       string
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  logRequest(req, { expense_id: (await params).id });
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const { id: pageId } = await params;


  if (!pageId) {
    return badRequest("Page ID is required in the URL.");
  }

  const body = await parseJsonBody(req);
  if (!body) return badRequest("Request body must be valid JSON.");

  const { title, amount, category, category_id, date, notes } = body;

  if (Object.keys(body).length === 0) {
    return badRequest("At least one field to update is required.");
  }

  if (amount !== undefined && (typeof amount !== "number" || !Number.isFinite(amount))) {
    return badRequest("`amount` must be a finite number.");
  }

  if (date !== undefined && !isValidISODate(date)) {
    return badRequest("`date` must be a valid YYYY-MM-DD date.");
  }

  try {
    const oldExpense = await getExpenseFromNotion(pageId);

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (amount !== undefined) updates.amount = amount;
    if (category !== undefined) updates.category = category;
    else if (category_id !== undefined) updates.category = category_id;
    if (date !== undefined) updates.date = date;
    if (notes !== undefined) updates.notes = notes;

    const result = await updateExpense(pageId, updates);

    if (oldExpense) {
      phubUpdateExpense(oldExpense, updates).catch((e) =>
        console.error("❌ Failed to sync updateExpense to Vercel:", e)
      );
    }

    return NextResponse.json(
      { success: true, message: "Expense updated.", ...result },
      { headers: corsHeaders() }
    );
  } catch (err) {
    return serverError("Failed to update expense.", err);
  }
}

/**
 * DELETE /api/expenses/[id]
 * Archives (soft-deletes) an expense. The row moves to Notion's trash and
 * can be restored from there — nothing is permanently destroyed.
 * Auth: Authorization: Bearer <api_key>
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  logRequest(req, { expense_id: (await params).id });
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const { id: pageId } = await params;


  if (!pageId) {
    return badRequest("Page ID is required in the URL.");
  }

  try {
    const oldExpense = await getExpenseFromNotion(pageId);

    const result = await archiveExpense(pageId);

    if (oldExpense) {
      phubDeleteExpense(oldExpense).catch((e) =>
        console.error("❌ Failed to sync deleteExpense to Vercel:", e)
      );
    }

    return NextResponse.json(
      { success: true, message: "Expense archived (recoverable from Notion trash).", ...result },
      { headers: corsHeaders() }
    );
  } catch (err) {
    return serverError("Failed to archive expense.", err);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
