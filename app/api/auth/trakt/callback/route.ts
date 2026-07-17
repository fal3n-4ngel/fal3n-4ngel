import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/integrations/trakt";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code." }, { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    return NextResponse.json(tokens);
  } catch (error: any) {
    console.error("❌ Trakt auth callback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
