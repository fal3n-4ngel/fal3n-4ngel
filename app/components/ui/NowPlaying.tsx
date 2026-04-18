"use client";

import { getNowPlaying } from "@/app/lib/spotify";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function NowPlaying({
  onPlayingChange,
}: {
  onPlayingChange?: (status: { isPlaying: boolean; lastPlayedAt?: string }) => void;
}) {
  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      const data = await getNowPlaying();
      setSong(data);
      setLoading(false);

      if (onPlayingChange) {
        onPlayingChange({
          isPlaying: !!data?.isPlaying,
          lastPlayedAt: data?.lastPlayedAt,
        });
      }
    };

    fetchSong();

    // Poll every 30 seconds
    const interval = setInterval(fetchSong, 30000);
    return () => clearInterval(interval);
  }, [onPlayingChange]);

  if (loading) {
    return (
      <div className="flex w-fit items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.01] p-3 text-zinc-500">
        <SpotifyLogo className="h-6 w-6 animate-pulse text-zinc-600" />
        <div className="flex flex-col font-mono text-xs">
          <span className="text-zinc-400">Loading...</span>
          <span className="text-[9px] uppercase tracking-widest text-zinc-600">Spotify</span>
        </div>
      </div>
    );
  }

  // If status is 204 (No Content), it means nothing is currently playing
  if (!song || !song.isPlaying) {
    return (
      <div className="hidden">
        <SpotifyLogo className="h-6 w-6 text-zinc-600" />
        <div className="flex flex-col font-mono text-xs">
          <span className="text-zinc-400">Offline</span>
          <span className="text-[9px] uppercase tracking-widest text-zinc-600">Spotify</span>
        </div>
      </div>
    );
  }

  const { isPlaying, title, artist, albumImageUrl, songUrl } = song;

  return (
    <a
      href={songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="interactable group flex w-fit items-center gap-3 py-4"
    >
      {albumImageUrl ? (
        <div className="relative h-10 w-10 overflow-hidden rounded-md">
          <Image src={albumImageUrl} alt="Album cover" fill sizes="40px" className="object-cover" />
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/5 bg-zinc-900">
          <SpotifyLogo className="h-5 w-5 text-zinc-600" />
        </div>
      )}

      <div className="flex max-w-[150px] flex-col sm:max-w-xs">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white/90 transition-colors group-hover:text-white">
            {title}
          </p>
        </div>
        <p className="truncate text-xs text-zinc-500">{artist}</p>
      </div>

      <SpotifyLogo className="ml-2 hidden h-6 w-6 text-[#1DB954] opacity-70 transition-opacity group-hover:opacity-100 sm:block" />
    </a>
  );
}

function SpotifyLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.821-1.741-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.54-1.02.72-1.56.42z" />
    </svg>
  );
}
