"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useLanyard } from "@/hooks";
import { getCalendarAvailabilityStatus } from "@/lib/integrations/google-calendar";

const GhostCanvas = dynamic(() => import("@/components/features/GhostCanvas"), {
  ssr: false,
});

export const HeroGhostSection: React.FC = () => {
  const [statusText, setStatusText] = useState("Alive");
  const [statusDotColor, setStatusDotColor] = useState("bg-emerald-400 shadow-[0_0_8px_#34d399]");
  const [calendarStatus, setCalendarStatus] = useState<string | null>(null);

  const [flags, setFlags] = useState({
    isCoding: false,
    isMusic: false,
    isGaming: false,
  });

  const { data: lanyardData } = useLanyard("849515993546096660");

  useEffect(() => {
    getCalendarAvailabilityStatus().then((cal) => {
      if (cal?.status) {
        setCalendarStatus(cal.status);
      }
    });
  }, []);

  useEffect(() => {
    const checkSpotifyStatus = async () => {
      try {
        const res = await fetch("/api/spotify");
        if (res.ok) {
          const data = await res.json();
          if (data?.isPlaying) {
            setFlags((prev) => ({ ...prev, isMusic: true }));
            setStatusText(`Listening to: ${data.title} - ${data.artist}`);
            setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse");
          }
        }
      } catch {
        // silent fallback
      }
    };
    checkSpotifyStatus();
    const interval = setInterval(checkSpotifyStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!lanyardData) {
      if (calendarStatus === "Busy") {
        setStatusText("Busy (In a meeting)");
        setStatusDotColor("bg-amber-400 shadow-[0_0_8px_#fbbf24]");
      } else if (!flags.isMusic) {
        setStatusText("Alive");
        setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399]");
      }
      return;
    }

    const vsCodeAct = lanyardData.activities?.find(
      (act) =>
        act.type === 0 &&
        (act.name.toLowerCase().includes("code") ||
          act.name.toLowerCase().includes("cursor") ||
          act.name.toLowerCase().includes("visual studio"))
    );
    const gameAct = lanyardData.activities?.find(
      (act) =>
        act.type === 0 &&
        !act.name.toLowerCase().includes("code") &&
        !act.name.toLowerCase().includes("cursor")
    );

    const music = !!lanyardData.listening_to_spotify || flags.isMusic;
    const coding = !!vsCodeAct && !music;
    const gaming = !!gameAct && !music && !coding;

    setFlags({ isCoding: coding, isMusic: music, isGaming: gaming });

    if (music) {
      const spotify = lanyardData.activities?.find((act) => act.name === "Spotify");
      const song = spotify?.details
        ? `${spotify.details} - ${spotify.state}`
        : statusText.startsWith("Listening to:")
        ? statusText.replace("Listening to: ", "")
        : "Spotify";
      setStatusText(`Listening to: ${song}`);
      setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse");
    } else if (coding && vsCodeAct) {
      const detail = vsCodeAct.details || vsCodeAct.state || "VS Code";
      setStatusText(`Coding: ${detail}`);
      setStatusDotColor("bg-blue-400 shadow-[0_0_8px_#60a5fa] animate-pulse");
    } else if (gaming && gameAct) {
      setStatusText(`Playing: ${gameAct.name}`);
      setStatusDotColor("bg-purple-400 shadow-[0_0_8px_#c084fc] animate-pulse");
    } else if (calendarStatus === "Busy") {
      setStatusText("Busy (In a meeting)");
      setStatusDotColor("bg-amber-400 shadow-[0_0_8px_#fbbf24]");
    } else if (lanyardData.discord_status === "online") {
      setStatusText("Online Now");
      setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399]");
    } else if (lanyardData.discord_status === "idle") {
      setStatusText("Away");
      setStatusDotColor("bg-yellow-400 shadow-[0_0_8px_#facc15]");
    } else if (lanyardData.discord_status === "dnd") {
      setStatusText("Do Not Disturb");
      setStatusDotColor("bg-red-400 shadow-[0_0_8px_#f87171]");
    } else {
      setStatusText("Alive");
      setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399]");
    }
  }, [lanyardData, calendarStatus, flags.isMusic]);

  return (
    <section className="relative flex h-screen h-[100dvh] max-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-black text-white px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-6 md:py-8 select-none">
      <header className="relative z-30 flex w-full items-center justify-between font-sans text-xs sm:text-sm tracking-wide gap-2">
        <Link
          href="/"
          className="interactable text-white font-medium hover:text-zinc-300 transition-colors tracking-wide truncate max-w-[170px] sm:max-w-none"
        >
          Adi
        </Link>

        <nav className="hidden sm:flex items-center gap-6 md:gap-8 text-xs text-zinc-400">
          <a href="#achievements" className="interactable hover:text-white transition-colors">
            achievements
          </a>
          <a href="#projects" className="interactable hover:text-white transition-colors">
            projects
          </a>
          <a href="#contact" className="interactable hover:text-white transition-colors">
            contact
          </a>
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href="mailto:hello@adithyakrishnan.com"
            className="interactable text-zinc-300 hover:text-white transition-colors text-xs truncate max-w-[180px] sm:max-w-none"
          >
            hello@adithyakrishnan.com
          </a>
        </div>
      </header>

      <GhostCanvas isMusic={flags.isMusic} isCoding={flags.isCoding} isGaming={flags.isGaming} />

      <div className="relative z-20 flex flex-1 flex-col justify-center max-w-2xl lg:max-w-3xl pointer-events-none">
        <h1 className="interactable pointer-events-auto text-2xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[62px] font-light tracking-tight text-white leading-[1.2] sm:leading-[1.14]">
          <span className="text-white font-normal">I’m Adi</span>
          <span className="text-zinc-500 font-light mx-2 sm:mx-3">—</span>
          <span className="text-zinc-200">a Multidisciplinary Software Engineer,</span>
          <br className="hidden sm:inline" />{" "}
          <span className="text-zinc-400 font-light">
            building for the web, cloud, and everything in between.
          </span>
        </h1>

        <blockquote className="interactable pointer-events-auto mt-6 sm:mt-8 border-l border-white/20 pl-3.5 sm:pl-4 max-w-xl">
          <p className="font-mono text-xs sm:text-[13px] text-zinc-300 italic leading-relaxed">
            “Like I always say, can&apos;t find a door? Make your own.”
          </p>
          <cite className="mt-1.5 block font-mono text-[11px] text-zinc-500 not-italic">
            — Edward Elric, Fullmetal Alchemist
          </cite>
        </blockquote>
      </div>

      <footer className="relative z-30 flex w-full items-end justify-between pt-4 pb-2 sm:pb-0 pointer-events-none gap-4">
        <div className="flex flex-col gap-1.5 pointer-events-auto max-w-[80%] sm:max-w-none">
          <div className="flex items-center gap-2 text-left">
            <span className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${statusDotColor} transition-transform`} />
            <span className="font-mono text-[11px] sm:text-xs text-zinc-300 tracking-wide font-medium truncate">
              {statusText}
            </span>
          </div>
          <div className="font-mono text-[10px] sm:text-[11px] text-zinc-500 tracking-widest uppercase truncate">
            Software Engineer · Kerala, India
          </div>
        </div>

        <a
          href="#achievements"
          aria-label="Scroll to achievements"
          className="interactable group pointer-events-auto flex items-center justify-center p-2 text-zinc-400 hover:text-white transition-colors text-lg flex-shrink-0"
        >
          <span className="transition-transform duration-300 group-hover:translate-y-1">
            ↓
          </span>
        </a>
      </footer>
    </section>
  );
};
