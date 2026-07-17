import { NextResponse } from "next/server";
import { getTraktAuthUrl } from "@/lib/integrations/trakt";

export async function GET() {
  return NextResponse.redirect(getTraktAuthUrl());
}
