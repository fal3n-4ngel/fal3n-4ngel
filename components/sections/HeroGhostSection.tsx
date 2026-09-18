"use client";

import { useLanyard } from "@/hooks";
import type { AvailabilityStatus } from "@/lib/integrations/google-calendar";
import { getCalendarAvailabilityStatus } from "@/lib/integrations/google-calendar";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const GhostCanvas = dynamic(() => import("@/components/features/GhostCanvas"), {
  ssr: false,
});

export const HeroGhostSection: React.FC = () => {
  const [statusText, setStatusText] = useState("Alive");
  const [statusDotColor, setStatusDotColor] = useState("bg-emerald-400 shadow-[0_0_8px_#34d399]");
  const [calendarInfo, setCalendarInfo] = useState<AvailabilityStatus | null>(null);

  const [flags, setFlags] = useState({
    isCoding: false,
    isMusic: false,
    isGaming: false,
  });

  const { data: lanyardData } = useLanyard("849515993546096660");

  useEffect(() => {
    let isMounted = true;
    const fetchCalendar = async () => {
      try {
        const cal = await getCalendarAvailabilityStatus();
        if (isMounted && cal) {
          setCalendarInfo(cal);
        }
      } catch {
        // silent fallback
      }
    };
    fetchCalendar();
    const interval = setInterval(fetchCalendar, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
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
    const isBusyCalendar = calendarInfo?.status === "Busy";
    const calendarEventName =
      calendarInfo?.currentEvent &&
      calendarInfo.currentEvent.trim() &&
      calendarInfo.currentEvent.trim().toLowerCase() !== "busy"
        ? calendarInfo.currentEvent.trim()
        : null;
    const busyStatusText = calendarEventName ? `Busy: ${calendarEventName}` : "Busy (In a meeting)";

    if (!lanyardData) {
      if (isBusyCalendar) {
        setStatusText(busyStatusText);
        setStatusDotColor("bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse");
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

    if (isBusyCalendar) {
      setStatusText(busyStatusText);
      setStatusDotColor("bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse");
    } else if (music) {
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
  }, [lanyardData, calendarInfo, flags.isMusic]);

  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // 3D Ghost background layer - moves at ~0.35x speed (deeper layer), gently recedes and softens
  const ghostY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ["0%", "0%"] : ["0%", "28%"]
  );
  const ghostScale = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [1, 1] : [1, 0.9]
  );
  const ghostOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.2]);

  // Foreground text drift - moves upward faster (~0.55x speed) and fades cleanly
  const textY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ["0px", "0px"] : ["0px", "-110px"]
  );
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Quote counter-drift - drifts slightly more to give typographic depth separation
  const quoteY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ["0px", "0px"] : ["0px", "-140px"]
  );

  // Status footer fade-out
  const footerOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const footerY = useTransform(
    scrollYProgress,
    [0, 0.3],
    shouldReduceMotion ? ["0px", "0px"] : ["0px", "-24px"]
  );

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[100svh] sm:h-screen w-full flex-col justify-between overflow-hidden bg-black text-white px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-6 md:py-8 select-none"
    >
      <header className="relative z-30 flex w-full items-center justify-between font-sans gap-4 py-2 pt-10 select-none">
        <Link
          href="/"
          className="interactable text-white text-lg sm:text-xl md:text-2xl font-normal tracking-tight hover:text-zinc-300 transition-colors"
        >
          Adi
        </Link>

        <nav className="flex items-center gap-5 sm:gap-8 md:gap-10 text-sm sm:text-base md:text-[17px] font-light ">
          <a
            href="https://github.com/fal3n-4ngel"
            target="_blank"
            rel="noopener noreferrer"
            className="interactable text-zinc-400 hover:text-white transition-colors lowercase"
          >
            github
          </a>
          <a
            href="https://www.linkedin.com/in/fal3n-4ngel/"
            target="_blank"
            rel="noopener noreferrer"
            className="interactable text-zinc-400 hover:text-white transition-colors lowercase"
          >
            linkedin
          </a>
          <a
            href="/Resume_Adithya_Krishnan_sept.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="interactable text-zinc-400 hover:text-white transition-colors lowercase"
          >
            resume
          </a>
          <a
            href="mailto:hello@adithyakrishnan.com"
            className="interactable text-zinc-300 hover:text-white transition-colors truncate max-w-[200px] sm:max-w-none"
          >
            hello@adithyakrishnan.com
          </a>
        </nav>
      </header>

      {/* 3D Ghost Layer with Parallax Depth & Soft Recede */}
      <motion.div
        style={{
          y: ghostY,
          scale: ghostScale,
          opacity: ghostOpacity,
        }}
        className="absolute inset-0 z-10 w-full h-full will-change-transform pointer-events-auto"
      >
        <GhostCanvas
          isMusic={flags.isMusic}
          isCoding={flags.isCoding}
          isGaming={flags.isGaming}
        />
      </motion.div>

      {/* Foreground Typography with Dynamic Scroll Drift */}
      <motion.div
        style={{
          y: textY,
          opacity: textOpacity,
        }}
        className="relative z-20 flex flex-1 flex-col justify-end pb-6 sm:pb-12 md:pb-14 lg:pb-0 lg:justify-center max-w-2xl lg:max-w-3xl pointer-events-none will-change-transform"
      >
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.15 },
            },
          }}
          className="interactable pointer-events-auto font-display text-2xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[56px] font-light tracking-tight text-white leading-[1.2] sm:leading-[1.14]"
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="block"
          >
            <span className="text-white font-normal">I’m Adi</span>
            <span className="text-zinc-500 font-light mx-2 sm:mx-3">—</span>
            <span className="text-zinc-200">a Multidisciplinary</span>
          </motion.span>
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="block text-zinc-200"
          >
            Software Engineer,
          </motion.span>
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="block text-zinc-400 font-light"
          >
            building for the web, cloud,
          </motion.span>
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
            }}
            className="block text-zinc-400 font-light"
          >
            and everything in between.
          </motion.span>
        </motion.h1>

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: "easeOut" }}
          style={{ y: quoteY }}
          className="hidden sm:block interactable pointer-events-auto mt-6 sm:mt-8 border-l border-white/20 pl-3.5 sm:pl-4 max-w-xl will-change-transform"
        >
          <p className="font-mono text-xs sm:text-[13px] text-zinc-300 italic leading-relaxed">
            “Like I always say, can&apos;t find a door? Make your own.”
          </p>
          <cite className="mt-1.5 block font-mono text-[11px] text-zinc-500 not-italic">
            — Edward Elric, Fullmetal Alchemist
          </cite>
        </motion.blockquote>
      </motion.div>

      {/* Bottom Status Footer with Quick Fade on Scroll */}
      <motion.footer
        style={{
          y: footerY,
          opacity: footerOpacity,
        }}
        className="relative z-30 flex w-full items-end justify-between pt-4 pb-2 sm:pb-0 pointer-events-none gap-4 will-change-transform"
      >
        <div className="flex flex-col gap-1.5 pointer-events-auto max-w-[80%] sm:max-w-none">
          <div className="flex items-center gap-2 text-left">
            <span
              className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${statusDotColor} transition-transform`}
            />
            <span
              className="font-mono text-[11px] sm:text-xs text-zinc-300 tracking-wide font-medium truncate"
              title={statusText}
            >
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
      </motion.footer>
    </section>
  );
};
