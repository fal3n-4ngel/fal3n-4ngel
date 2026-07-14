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
const CHECK_TIMEOUT_MS = 8000;

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

/** The expenses API surface: an unauthenticated 401 proves routing + handler are alive. */
export function checkExpensesApi() {
  return checkService(
    "website-expenses-api",
    `${SITE_URL}/api/expenses/categories`,
    {},
    (s) => s === 401 || s === 200
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
  const rows = report.services
    .map(
      (s) => `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
        <td style="padding: 14px 16px; color: rgba(255, 255, 255, 0.85); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px;">
          ${s.service}
        </td>
        <td style="padding: 14px 16px;">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${s.ok ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}; color: ${s.ok ? "#34d399" : "#f87171"};">
            ${s.ok ? "Healthy" : "Down"}
          </span>
        </td>
        <td style="padding: 14px 16px; color: rgba(255, 255, 255, 0.5); font-size: 13px;">
          ${s.status ?? "—"}
        </td>
        <td style="padding: 14px 16px; color: rgba(255, 255, 255, 0.5); font-size: 13px;">
          ${s.latency_ms} ms
        </td>
        <td style="padding: 14px 16px; color: #f87171; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; max-width: 250px; word-break: break-all;">
          ${s.error ? `<code>${s.error}</code>` : "—"}
        </td>
      </tr>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 40px 20px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 720px; margin: 0 auto; background-color: #121214; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          
          <!-- Header Banner -->
          <div style="padding: 32px 32px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 24px;">${report.ok ? "🟢" : "🚨"}</span>
              <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.02em;">
                ${report.ok ? "Services Active" : "Service Outage"}
              </h2>

            </div>
            <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.6); font-size: 14px; line-height: 1.5;">
              ${report.ok 
                ? "All monitored services are fully operational and responding normally." 
                : "One or more services failed a health check."
              } Checked on <strong>${new Date(report.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</strong>.
            </p>
          </div>


          <!-- Services Table -->
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 600px;">
              <thead>
                <tr style="background-color: rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                  <th style="padding: 14px 16px; color: rgba(255, 255, 255, 0.4); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Service</th>
                  <th style="padding: 14px 16px; color: rgba(255, 255, 255, 0.4); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Status</th>
                  <th style="padding: 14px 16px; color: rgba(255, 255, 255, 0.4); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">HTTP</th>
                  <th style="padding: 14px 16px; color: rgba(255, 255, 255, 0.4); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Latency</th>
                  <th style="padding: 14px 16px; color: rgba(255, 255, 255, 0.4); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Error / Trace</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>

          <!-- Footer Info -->
          <div style="padding: 24px 32px; background-color: rgba(255, 255, 255, 0.01); border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <span style="color: rgba(255, 255, 255, 0.35); font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
              Auto-triggered by /api/cron/monitor
            </span>
            <a href="https://www.adithyakrishnan.com" style="color: #60a5fa; font-size: 12px; text-decoration: none; font-weight: 500;">
              Go to Website →
            </a>
          </div>
        </div>
      </body>
    </html>`;
}

