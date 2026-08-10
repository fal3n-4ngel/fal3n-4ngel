/**
 * Lightweight service monitoring.
 *
 * Checks the external services this site depends on (GitHub API, Notion API,
 * Spotify, and the deployed website's own API routes) and sends alerts via
 * email (Resend) and an optional generic webhook when something is down.
 *
 * Env vars:
 *   SITE_URL           — deployed base URL (default https://www.adithyakrishnan.com)
 *   RESEND_API_KEY     — Resend API key; email alerts are skipped if unset
 *   ALERT_EMAIL_TO     — recipient address for alerts
 *   ALERT_EMAIL_FROM   — sender (default onboarding@resend.dev, works without domain setup)
 *   ALERT_WEBHOOK_URL  — optional webhook (Discord webhook URLs are auto-formatted)
 *   CRON_SECRET        — shared secret protecting /api/cron/monitor
 */

const SITE_URL = process.env.SITE_URL || "https://www.adithyakrishnan.com";
const CHECK_TIMEOUT_MS = 15000;

export interface ServiceStatus {
  service: string;
  ok: boolean;
  status?: number;
  latency_ms: number;
  error?: string;
}

export interface HealthReport {
  ok: boolean;
  timestamp: string;
  services: ServiceStatus[];
}

async function checkService(
  service: string,
  url: string,
  init: RequestInit = {},
  // A service is "up" if it answered at all with an acceptable status.
  acceptStatus: (status: number) => boolean = (s) => s < 500
): Promise<ServiceStatus> {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });
    const latency = Date.now() - started;
    if (acceptStatus(res.status)) {
      return { service, ok: true, status: res.status, latency_ms: latency };
    }
    return {
      service,
      ok: false,
      status: res.status,
      latency_ms: latency,
      error: `Unexpected status ${res.status}`,
    };
  } catch (err) {
    return {
      service,
      ok: false,
      latency_ms: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** GitHub REST API. /rate_limit is free (does not consume quota). */
export function checkGithub() {
  return checkService("github-api", "https://api.github.com/rate_limit", {
    headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "Portfolio-Monitor" },
  });
}

/** Notion API with the real token — catches revoked tokens, not just outages. */
export function checkNotion() {
  return checkService(
    "notion-api",
    "https://api.notion.com/v1/users/me",
    {
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
      },
    },
    (s) => s === 200
  );
}

/** Spotify accounts service. A 400 (no credentials) still proves it's reachable. */
export function checkSpotify() {
  return checkService("spotify-api", "https://accounts.spotify.com/api/token", { method: "POST" });
}

/** The deployed website itself. */
export function checkWebsite() {
  return checkService("website", SITE_URL, {}, (s) => s === 200);
}

/** Standalone GCP Cloud Run Portfolio API Service. */
export function checkExpensesApi() {
  const apiUrl = process.env.PORTFOLIO_API_URL || "https://api.adithyakrishnan.com";
  return checkService(
    "portfolio-api",
    `${apiUrl}/health`,
    {},
    (s) => s === 200
  );
}

export async function runHealthChecks(): Promise<HealthReport> {
  const services = await Promise.all([
    checkGithub(),
    checkNotion(),
    checkSpotify(),
    checkWebsite(),
    checkExpensesApi(),
  ]);

  return {
    ok: services.every((s) => s.ok),
    timestamp: new Date().toISOString(),
    services,
  };
}

/** Sends an alert email through Resend. No-ops (with a warning) when unconfigured. */
export async function sendAlertEmail(subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;
  if (!apiKey || !to) {
    console.warn("⚠️ RESEND_API_KEY / ALERT_EMAIL_TO not set — skipping email alert.");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.ALERT_EMAIL_FROM || "Portfolio Monitor <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("❌ Resend email failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("❌ Resend email error:", err);
    return false;
  }
}

/** Posts the failure event to an optional webhook (Discord URLs get {content}). */
export async function sendWebhookEvent(report: HealthReport): Promise<boolean> {
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return false;

  const failed = report.services.filter((s) => !s.ok);
  const text = `🚨 Portfolio monitor: ${failed.length} service(s) down — ${failed
    .map((s) => `${s.service} (${s.error ?? s.status})`)
    .join(", ")} at ${report.timestamp}`;

  const body = url.includes("discord.com/api/webhooks")
    ? { content: text }
    : { event: "service_down", message: text, report };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });
    return res.ok;
  } catch (err) {
    console.error("❌ Webhook event error:", err);
    return false;
  }
}

export function buildAlertEmailHtml(report: HealthReport): string {
  const serviceCards = report.services
    .map(
      (s) => `
      <div style="background-color: #18181b; border: 1px solid ${s.ok ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.3)"}; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle;">
              <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; font-weight: 600; color: #ffffff;">
                ${s.service}
              </span>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${s.ok ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.2)"}; color: ${s.ok ? "#34d399" : "#f87171"}; border: 1px solid ${s.ok ? "rgba(52, 211, 153, 0.3)" : "rgba(248, 113, 113, 0.3)"};">
                ${s.ok ? "Healthy" : "Down"}
              </span>
            </td>
          </tr>
        </table>
        
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 12px; color: rgba(255, 255, 255, 0.6); display: flex; justify-content: space-between;">
          <span>HTTP Status: <strong style="color: #ffffff;">${s.status ?? "N/A"}</strong></span>
          <span>Latency: <strong style="color: #ffffff;">${s.latency_ms} ms</strong></span>
        </div>

        ${
          s.error
            ? `<div style="margin-top: 8px; padding: 8px 10px; background-color: rgba(239, 68, 68, 0.08); border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; word-break: break-all;">
                Trace: ${s.error}
               </div>`
            : ""
        }
      </div>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${report.ok ? "Services Active" : "Service Outage Alert"}</title>
      </head>
      <body style="margin: 0; padding: 16px 8px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #121214; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <div style="padding: 24px 20px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: ${report.ok ? "linear-gradient(180deg, rgba(16,185,129,0.08) 0%, rgba(18,18,20,0) 100%)" : "linear-gradient(180deg, rgba(239,68,68,0.12) 0%, rgba(18,18,20,0) 100%)"};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
              <tr>
                <td style="font-size: 28px; width: 36px; vertical-align: middle;">
                  ${report.ok ? "🟢" : "🚨"}
                </td>
                <td style="vertical-align: middle;">
                  <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">
                    ${report.ok ? "All Services Operational" : "Service Outage Alert"}
                  </h2>
                </td>
              </tr>
            </table>
            
            <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.65); font-size: 13px; line-height: 1.5;">
              ${
                report.ok
                  ? "All monitored endpoints are active and responding normally."
                  : "One or more services failed their automated health check."
              }<br/>
              Checked at <strong>${new Date(report.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>
            </p>
          </div>

          <!-- Services List Cards -->
          <div style="padding: 20px 16px 8px;">
            ${serviceCards}
          </div>

          <!-- Footer -->
          <div style="padding: 16px 20px; background-color: rgba(255, 255, 255, 0.02); border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
            <span style="display: block; color: rgba(255, 255, 255, 0.4); font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-bottom: 8px;">
              Automated Monitor • /api/cron/monitor
            </span>
            <a href="https://www.adithyakrishnan.com" style="display: inline-block; color: #60a5fa; font-size: 12px; font-weight: 600; text-decoration: none; padding: 6px 12px; border-radius: 6px; background-color: rgba(96, 165, 250, 0.1);">
              View Website →
            </a>
          </div>

        </div>
      </body>
    </html>`;
}

