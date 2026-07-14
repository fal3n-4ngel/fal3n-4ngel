import { buildAlertEmailHtml, sendAlertEmail } from "@/lib/monitoring";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/monitor/test-email
 * Instantly triggers a mock alert email to test Resend configuration.
 *
 * Auth: Authorization: Bearer <CRON_SECRET> or <API_KEY>
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const apiKey = process.env.API_KEY || process.env.EXPENSES_API_KEY;
  const authHeader = req.headers.get("Authorization");

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (apiKey && authHeader === `Bearer ${apiKey}`);

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Valid Authorization: Bearer <CRON_SECRET> or <API_KEY> is required." },
      { status: 401 }
    );
  }

  const mockReport = {
    ok: false,
    timestamp: new Date().toISOString(),
    services: [
      { service: "notion-api", ok: true, latency_ms: 120, status: 200, error: undefined },
      { service: "github-api", ok: true, latency_ms: 95, status: 200, error: undefined },
      { service: "spotify-api", ok: false, latency_ms: 0, status: 504, error: "Mock failure: API timed out (test check)" },
      { service: "portfolio-site", ok: true, latency_ms: 80, status: 200, error: undefined },
    ],
  };


  const emailSent = await sendAlertEmail(
    "🧪 Portfolio Test Alert: Resend Email Integration Verified",
    buildAlertEmailHtml(mockReport)
  );

  if (emailSent) {
    return NextResponse.json({
      success: true,
      message: "Mock alert email sent successfully via Resend.",
      to: process.env.ALERT_EMAIL_TO || "(none)",
    });
  } else {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send mock alert email. Verify RESEND_API_KEY and ALERT_EMAIL_TO in env variables.",
      },
      { status: 500 }
    );
  }
}
