import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `Spotify returned authentication error: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return NextResponse.json(
      { error: "Spotify credentials (client ID or secret) are missing in environment" },
      { status: 500 }
    );
  }

  // Dynamically determine the redirect URI matching current request host
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const redirect_uri = `${protocol}://${host}/api/auth/spotify/callback`;

  try {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to exchange authorization code for tokens", details: data },
        { status: response.status }
      );
    }

    // Return a styled HTML page with copyable tokens
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Spotify Authentication Successful</title>
          <style>
            body {
              background-color: #0a0a0a;
              color: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
            }
            .card {
              background: rgba(20, 20, 20, 0.7);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 16px;
              padding: 2.5rem;
              max-width: 620px;
              width: 90%;
              box-shadow: 0 24px 48px rgba(0, 0, 0, 0.8);
            }
            h1 {
              color: #1DB954;
              margin-top: 0;
              font-size: 26px;
              font-weight: 600;
              letter-spacing: -0.5px;
            }
            p {
              color: #a0a0a0;
              font-size: 15px;
              line-height: 1.6;
              margin-bottom: 2rem;
            }
            .token-box {
              background-color: rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.05);
              border-radius: 8px;
              padding: 1.2rem;
              margin-top: 0.5rem;
              font-family: 'Courier New', Courier, monospace;
              font-size: 13px;
              word-break: break-all;
              user-select: all;
              color: #e0e0e0;
              cursor: pointer;
              transition: border-color 0.2s, background-color 0.2s;
            }
            .token-box:hover {
              border-color: rgba(29, 185, 84, 0.4);
              background-color: rgba(0, 0, 0, 0.7);
            }
            .label {
              font-weight: 700;
              color: #1DB954;
              margin-top: 1.5rem;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            .instructions {
              margin-top: 2rem;
              padding-top: 1.5rem;
              border-top: 1px solid rgba(255, 255, 255, 0.08);
              font-size: 13px;
              color: #808080;
            }
            .instructions code {
              background: rgba(255, 255, 255, 0.05);
              padding: 2px 6px;
              border-radius: 4px;
              color: #d4d4d4;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Spotify OAuth Successful!</h1>
            <p>You have successfully authenticated with Spotify. Copy the refresh token below and add it to your environment variables as <code>SPOTIFY_REFRESH_TOKEN</code>.</p>
            
            <div class="label">SPOTIFY_REFRESH_TOKEN (Add to Env)</div>
            <div class="token-box" title="Click to select all">${data.refresh_token}</div>

            <div class="label">SPOTIFY_ACCESS_TOKEN (Temporary)</div>
            <div class="token-box" title="Click to select all">${data.access_token}</div>

            <div class="instructions">
              <strong>Tip:</strong> Click inside either box to automatically select the token content. If you are developing locally, paste it into your local <code>.env.local</code>. For production, add it to your Vercel project environment settings.
            </div>
          </div>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Error during token exchange", message: error.message },
      { status: 500 }
    );
  }
}
