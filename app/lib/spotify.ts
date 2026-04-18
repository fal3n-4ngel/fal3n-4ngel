"use server";

import { unstable_cache } from "next/cache";

const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.NEXT_PUBLIC_SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
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

      if (!access_token) {
        console.error("Spotify: No access token returned");
        return { isPlaying: false };
      }

      const response = await fetch(NOW_PLAYING_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        next: {
          revalidate: 120, // 2 minutes cache
        },
      });

      if (response.status === 204 || response.status > 400) {
        console.log("Spotify: Status", response.status);
        return { isPlaying: false };
      }

      const song = await response.json();

      if (song.item === null) {
        return { isPlaying: false };
      }

      return {
        album: song.item.album.name,
        albumImageUrl: song.item.album.images[0]?.url,
        artist: song.item.artists.map((_artist: { name: string }) => _artist.name).join(", "),
        isPlaying: song.is_playing,
        songUrl: song.item.external_urls.spotify,
        title: song.item.name,
      };
    } catch (error) {
      return { isPlaying: false };
    }
  },
  ["spotify-now-playing"],
  {
    revalidate: 120,
    tags: ["spotify"],
  }
);
