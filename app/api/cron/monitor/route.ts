import { buildAlertEmailHtml, runHealthChecks, sendAlertEmail, sendWebhookEvent } from "@/lib/monitoring";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Best-effort alert cooldown so a sustained outage doesn't email every run.
// Module state resets on cold start, so worst case is one extra email — acceptable.
const ALERT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
let lastAlertAt = 0;

/**
 * GET /api/cron/monitor
 * Runs all health checks; on failure sends an email (Resend) and an optional
 * webhook event. Triggered by Vercel Cron (vercel.json) or the GitHub Actions
 * workflow in .github/workflows/health-monitor.yml.
 *
 * Auth: Authorization: Bearer <CRON_SECRET> (Vercel sends this automatically
 * when the CRON_SECRET env var is set). If CRON_SECRET is unset, the endpoint
 * still runs checks but never sends alerts, to avoid abuse as an email cannon.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("Authorization");
  const authorized = !!secret && authHeader === `Bearer ${secret}`;

  if (secret && !authorized) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Valid Authorization: Bearer <CRON_SECRET> header required." },
      { status: 401 }
    );
  }

  const report = await runHealthChecks();
  let alerted = false;

  if (!report.ok && authorized) {
    const now = Date.now();
    if (now - lastAlertAt >= ALERT_COOLDOWN_MS) {
      const failed = report.services.filter((s) => !s.ok).map((s) => s.service);
      const [emailSent, webhookSent] = await Promise.all([
        sendAlertEmail(
          `🚨 Portfolio alert: ${failed.join(", ")} down`,
          buildAlertEmailHtml(report)
        ),
        sendWebhookEvent(report),
      ]);
      alerted = emailSent || webhookSent;
      if (alerted) lastAlertAt = now;
    }
  }

  return NextResponse.json(
    { ...report, alerted },
    { status: report.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
