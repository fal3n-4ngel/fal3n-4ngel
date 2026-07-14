import { buildAlertEmailHtml, runHealthChecks, sendAlertEmail } from "@/lib/monitoring";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/monitor/test-email
 * Instantly triggers an alert email showing the actual current health status of all services.
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

  // Run the actual health checks to get real-time status
  const realReport = await runHealthChecks();

  const emailSent = await sendAlertEmail(
    `🧪 Portfolio Test Alert: Real-time Health Check Status (Overall: ${realReport.ok ? "OK" : "OUTAGE"})`,
    buildAlertEmailHtml(realReport)
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
