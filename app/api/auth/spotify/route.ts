import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  if (!client_id) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID environment variable is missing in .env" },
      { status: 500 }
    );
  }

  // Dynamically determine the redirect URI matching current request host
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const redirect_uri = `${protocol}://${host}/api/auth/spotify/callback`;

  const scope = "user-read-currently-playing user-read-recently-played";

  const spotifyAuthUrl = new URL("https://accounts.spotify.com/authorize");
  spotifyAuthUrl.searchParams.append("response_type", "code");
  spotifyAuthUrl.searchParams.append("client_id", client_id);
  spotifyAuthUrl.searchParams.append("scope", scope);
  spotifyAuthUrl.searchParams.append("redirect_uri", redirect_uri);
  spotifyAuthUrl.searchParams.append("state", "adithya_portfolio_auth");

  return NextResponse.redirect(spotifyAuthUrl.toString());
}
