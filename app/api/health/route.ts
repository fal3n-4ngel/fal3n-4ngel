import { runHealthChecks } from "@/lib/monitoring";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Public health check: pings GitHub, Notion, Spotify, and this site's own
 * API surface. Returns 200 when everything is up, 503 otherwise.
 * Useful for uptime monitors (UptimeRobot, BetterStack, cron-job.org).
 */
export async function GET() {
  const report = await runHealthChecks();
  return NextResponse.json(report, {
    status: report.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
