"use server";

import { unstable_cache } from "next/cache";

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

export const getNowPlaying = unstable_cache(
  async () => {
    try {
      const { access_token } = await getAccessToken();
      if (!access_token) return { isPlaying: false };

      const response = await fetch(NOW_PLAYING_ENDPOINT, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (response.status === 200) {
        const song = await response.json();
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

      const recentReq = await fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (recentReq.ok) {
        const recent = await recentReq.json();
        return {
          isPlaying: false,
          lastPlayedAt: recent.items[0]?.played_at || null,
          title: recent.items[0]?.track.name,
          artist: recent.items[0]?.track.artists.map((a: any) => a.name).join(", "),
        };
      }

      return { isPlaying: false };
    } catch (e) {
      console.error(e);
      return { isPlaying: false };
    }
  },
  ["spotify-status"],
  { revalidate: 60, tags: ["spotify"] }
);
