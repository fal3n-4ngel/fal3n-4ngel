import { isValidISODate, listExpenses } from "@/lib/integrations/expenses";
import { csvCell } from "@/lib/expenses-analytics";
import { badRequest, corsHeaders, serverError, unauthorizedResponse, validateExpensesApiKey } from "@/lib/expenses-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/expenses/export
 * Exports expenses as CSV (default) or JSON.
 * Auth: Authorization: Bearer <api_key>
 *
 * Optional query params:
 *   ?format=csv|json     — default csv
 *   ?category=Name-or-ID
 *   ?from=YYYY-MM-DD
 *   ?to=YYYY-MM-DD
 *   ?current_cycle=true
 */
export async function GET(req: NextRequest) {
  if (!validateExpensesApiKey(req)) return unauthorizedResponse();

  const p = req.nextUrl.searchParams;
  const format = (p.get("format") || "csv").toLowerCase();
  const from = p.get("from") || undefined;
  const to = p.get("to") || undefined;

  if (format !== "csv" && format !== "json") return badRequest("`format` must be csv or json.");
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

    if (format === "json") {
      return NextResponse.json(
        { success: true, count: expenses.length, expenses },
        { headers: corsHeaders() }
      );
    }

    const header = ["date", "title", "amount", "category", "notes", "id", "url"];
    const rows = expenses.map((e) =>
      [e.date, e.title, e.amount, e.category, e.notes, e.id, e.url].map(csvCell).join(",")
    );
    const csv = [header.join(","), ...rows].join("\r\n") + "\r\n";

    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        ...corsHeaders(),
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expenses-${stamp}.csv"`,
      },
    });
  } catch (err) {
    return serverError("Failed to export expenses.", err);
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
