import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, unauthorizedResponse, corsHeaders } from "@/lib/expenses-auth";
import { listExpenses, createExpenseBatch, ExpenseEntry } from "@/lib/integrations/expenses";
import { phubProxyRequest, phubCreateExpenseBatch } from "@/lib/integrations/phub";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) return unauthorizedResponse();

  try {
    // 1. Fetch expenses from Notion
    const notionExpenses = await listExpenses();

    // 2. Fetch expenses from Vercel (phub)
    const vercelExpenses = await phubProxyRequest("/api/expenses", "GET");
    if (!vercelExpenses || !Array.isArray(vercelExpenses)) {
      return NextResponse.json(
        { error: "Failed to fetch remote expenses from Vercel dashboard" },
        { status: 502, headers: corsHeaders() }
      );
    }

    // Helper to generate unique key to match entries
    const makeKey = (title: string, amount: number | null, date: string | null) => {
      const t = (title || "").toLowerCase().trim();
      const a = amount !== null ? amount.toFixed(2) : "0.00";
      const d = date || "no-date";
      return `${t}_${a}_${d}`;
    };

    // Build sets of keys
    const notionKeys = new Set<string>();
    notionExpenses.forEach((e) => {
      if (e.amount !== null) {
        notionKeys.add(makeKey(e.title, e.amount, e.date));
      }
    });

    const vercelKeys = new Set<string>();
    vercelExpenses.forEach((e: any) => {
      if (e.amount !== null) {
        vercelKeys.add(makeKey(e.title, e.amount, e.date));
      }
    });

    // 3. Find items in Notion that are missing in Vercel
    const missingInVercel: ExpenseEntry[] = [];
    notionExpenses.forEach((e) => {
      if (e.amount !== null) {
        const key = makeKey(e.title, e.amount, e.date);
        if (!vercelKeys.has(key)) {
          missingInVercel.push({
            title: e.title,
            amount: e.amount,
            category: e.category || undefined,
            date: e.date || undefined,
            notes: e.notes || undefined,
          });
        }
      }
    });

    // 4. Find items in Vercel that are missing in Notion
    const missingInNotion: ExpenseEntry[] = [];
    vercelExpenses.forEach((e: any) => {
      if (e.amount !== null) {
        const key = makeKey(e.title, e.amount, e.date);
        if (!notionKeys.has(key)) {
          missingInNotion.push({
            title: e.title,
            amount: e.amount,
            category: e.category || undefined,
            date: e.date || undefined,
            notes: e.notes || undefined,
          });
        }
      }
    });

    let vercelAddedCount = 0;
    let notionAddedCount = 0;

    // 5. Batch insert to Vercel
    if (missingInVercel.length > 0) {
      const res = await phubCreateExpenseBatch(missingInVercel);
      if (res && res.added !== undefined) {
        vercelAddedCount = res.added;
      } else if (res && res.success) {
        vercelAddedCount = missingInVercel.length;
      }
    }

    // 6. Batch insert to Notion
    if (missingInNotion.length > 0) {
      const res = await createExpenseBatch(missingInNotion);
      notionAddedCount = res.filter((r) => r.success).length;
    }

    return NextResponse.json(
      {
        success: true,
        summary: `Synchronized ${vercelAddedCount + notionAddedCount} expenses.`,
        details: {
          addedToVercel: vercelAddedCount,
          addedToNotion: notionAddedCount,
          totalSyncedFromNotion: missingInVercel.length,
          totalSyncedFromVercel: missingInNotion.length,
        },
      },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("❌ Two-Way Sync Expenses Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during sync", message: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
