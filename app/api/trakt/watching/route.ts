import { NextResponse } from "next/server";
import { getCurrentlyWatching } from "@/lib/integrations/trakt";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await getCurrentlyWatching();
    return NextResponse.json(status, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=10",
      },
    });
  } catch (err: any) {
    console.error("❌ Error fetching Trakt status:", err);
    return NextResponse.json({ isWatching: false }, { status: 500 });
  }
}
