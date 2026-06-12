import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=1`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token!,
    }),
  });
  return response.json();
};

async function testSpotify() {
  try {
    const { access_token } = await getAccessToken();
    console.log("Access Token retrieved:", access_token ? "YES" : "NO");
    if (!access_token) return { isPlaying: false };

    console.log("Fetching Now Playing...");
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    console.log("Now Playing Status:", response.status);

    if (response.status === 200) {
      const song = await response.json();
      console.log("Now Playing Response Body:", JSON.stringify(song, null, 2));
      if (song.item) {
        return {
          title: song.item.name,
          artist: song.item.artists.map((a: any) => a.name).join(", "),
          isPlaying: song.is_playing,
          songUrl: song.item.external_urls.spotify,
          albumImageUrl: song.item.album.images[0]?.url,
          lastPlayedAt: new Date().toISOString(),
        };
      }
    }

    console.log("Fetching Recently Played...");
    const recentReq = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    console.log("Recently Played Status:", recentReq.status);

    if (recentReq.ok) {
      const recent = await recentReq.json();
      console.log("Recently Played Response Body:", JSON.stringify(recent, null, 2));
      return {
        isPlaying: false,
        lastPlayedAt: recent.items?.[0]?.played_at || null,
        title: recent.items?.[0]?.track.name,
        artist: recent.items?.[0]?.track.artists.map((a: any) => a.name).join(", "),
      };
    }

    return { isPlaying: false };
  } catch (e) {
    console.error("Exception in testSpotify:", e);
    return { isPlaying: false };
  }
}

testSpotify().then(res => console.log("Final Output:", res));
