"use client";

import { AwardsList } from "@/components/features/AwardsList";
import { ExperienceList } from "@/components/features/ExperienceList";
import { GhostButton } from "@/components/features/GhostButton";
import NowPlaying from "@/components/features/NowPlaying";
import { ParallaxElement } from "@/components/ui/ParallaxSection";
import { SectionTransition, StaggerChild } from "@/components/ui/SectionTransition";
import { useLanyard } from "@/hooks";
import { getCalendarAvailabilityStatus, AvailabilityStatus } from "@/lib/integrations/google-calendar";
import { getSiteConfig } from "@/lib/integrations/notion";
import { useEffect, useState } from "react";

interface AboutSectionProps {
  isEscaping: boolean;
  triggerEscape: () => void;
  resetEscape: () => void;
}

export const AboutSection = ({ isEscaping, triggerEscape, resetEscape }: AboutSectionProps) => {


  type ConfigItem = { isEnabled?: boolean; content?: string };
  const [config, setConfig] = useState<Record<string, ConfigItem> | null>(null);
  const [spotifyData, setSpotifyData] = useState<{
    isPlaying: boolean;
    lastPlayedAt?: string;
    title?: string;
    artist?: string;
  }>({
    isPlaying: false,
  });
  const [calendarStatus, setCalendarStatus] = useState<AvailabilityStatus | null>(null);
  const [traktData, setTraktData] = useState<{
    isWatching: boolean;
    title?: string;
    type?: "movie" | "episode";
    year?: number;
    showTitle?: string;
    season?: number;
    episode?: number;
    lastWatchedAt?: string;
  } | null>(null);

  const { data: lanyardData } = useLanyard("849515993546096660");

  useEffect(() => {
    getSiteConfig().then((data) => {
      if (data) setConfig(data);
    });
    getCalendarAvailabilityStatus().then((status) => {
      if (status) setCalendarStatus(status);
    });
    fetch("/api/trakt/watching")
      .then((res) => res.json())
      .then((data) => {
        if (data) setTraktData(data);
      })
      .catch((err) => console.error("Failed to fetch Trakt status:", err));
  }, []);


  useEffect(() => {
    const isCoding = lanyardData?.activities.some((act) => act.type === 0 && act.name === "Visual Studio Code") ?? false;
    window.dispatchEvent(new CustomEvent("ghost-coding", { detail: { coding: isCoding } }));

    const isMinecraft = lanyardData?.activities.some((act) => act.type === 0 && act.name.toLowerCase().includes("minecraft")) ?? false;
    window.dispatchEvent(new CustomEvent("ghost-minecraft", { detail: { minecraft: isMinecraft } }));
  }, [lanyardData]);

  const activeStatus = config?.["active status"]?.isEnabled ?? false;
  const collaborationStatus = config?.["collaboration"]?.isEnabled ?? false;
  const collaborationText = config?.["collaboration"]?.content || "Inactive";

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  let lastSeenSpotifyText: string | null = null;
  let spotifyTime = 0;
  if (!spotifyData.isPlaying && spotifyData.lastPlayedAt) {
    spotifyTime = new Date(spotifyData.lastPlayedAt).getTime();
    lastSeenSpotifyText = `Last seen ${formatTimeAgo(spotifyData.lastPlayedAt)}`;
  }

  let lastWatchedTraktText: string | null = null;
  let traktTime = 0;
  if (traktData && !traktData.isWatching && traktData.lastWatchedAt) {
    traktTime = new Date(traktData.lastWatchedAt).getTime();
    const prefix = traktData.type === "movie" 
      ? `Last watched: ${traktData.title}`
      : `Last watched: ${traktData.showTitle} S${String(traktData.season).padStart(2, "0")}E${String(traktData.episode).padStart(2, "0")}`;
    lastWatchedTraktText = `${prefix} (${formatTimeAgo(traktData.lastWatchedAt)})`;
  }

  let displayStatus = collaborationStatus;
  let displayText = collaborationText;
  let statusColor = displayStatus ? "bg-green-500 animate-pulse" : "bg-red-500";

  if (!activeStatus) {
    if (calendarStatus?.status === "Busy") {
      displayStatus = true;
      statusColor = "bg-red-500 animate-pulse";
      displayText = calendarStatus.currentEvent ? `Busy: ${calendarStatus.currentEvent}` : "Busy (In a meeting)";
    } else if (spotifyData.isPlaying) {
      displayStatus = true;
      statusColor = "bg-green-500 animate-pulse";
      displayText = spotifyData.title ? `Listening: ${spotifyData.title} - ${spotifyData.artist}` : "Listening to Spotify";
    } else if (traktData?.isWatching) {
      displayStatus = true;
      statusColor = "bg-orange-500 animate-pulse";
      displayText = traktData.type === "movie"
        ? `Watching: ${traktData.title} (${traktData.year})`
        : `Watching: ${traktData.showTitle} S${String(traktData.season).padStart(2, "0")}E${String(traktData.episode).padStart(2, "0")}`;
    } else if (lanyardData && lanyardData.discord_status !== "offline") {
      const activeGameOrCoding = lanyardData.activities.find((act) => act.type === 0);
      const customStatus = lanyardData.activities.find((act) => act.type === 4);

      if (lanyardData.discord_status === "online") {
        statusColor = "bg-green-500 animate-pulse";
      } else if (lanyardData.discord_status === "idle") {
        statusColor = "bg-yellow-500 animate-pulse";
      } else if (lanyardData.discord_status === "dnd") {
        statusColor = "bg-red-500 animate-pulse";
      }

      displayStatus = true;

      if (activeGameOrCoding) {
        if (activeGameOrCoding.name === "Visual Studio Code") {
          displayText = `Coding: ${activeGameOrCoding.details || "VS Code"}`;
          statusColor = "bg-emerald-400 animate-pulse";
        } else if (activeGameOrCoding.name === "Minecraft") {
          displayText = `Minecraft: ${activeGameOrCoding.details || activeGameOrCoding.state || "Multiplayer"}`;
          statusColor = "bg-cyan-400 animate-pulse";
        } else {
          displayText = `Playing ${activeGameOrCoding.name}`;
          statusColor = "bg-indigo-400 animate-pulse";
        }
      } else if (customStatus?.state) {
        displayText = customStatus.state;
      } else {
        if (lanyardData.discord_status === "online") {
          displayText = "Online";
        } else if (lanyardData.discord_status === "idle") {
          displayText = "Away";
        } else if (lanyardData.discord_status === "dnd") {
          displayText = "Busy";
        }
      }
    } else {
      displayStatus = false;
      if (spotifyTime > traktTime && lastSeenSpotifyText) {
        statusColor = "bg-zinc-600";
        displayText = lastSeenSpotifyText;
      } else if (traktTime > spotifyTime && lastWatchedTraktText) {
        statusColor = "bg-zinc-600";
        displayText = lastWatchedTraktText;
      } else {
        statusColor = "bg-red-500";
        displayText = "AFK";
      }
    }
  }


  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-visible px-12 py-24 pt-48">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 md:flex-row md:items-start md:gap-20">
        {/* Left column */}
        <SectionTransition direction="left" delay={0.05} className="flex-1 space-y-8">
          <ParallaxElement speed={0.1}>
            <div className="space-grotesk interactable max-w-2xl text-3xl font-light leading-[1.1] tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
              <StaggerChild direction="up">
                Building performant,{" "}
                <span className="text-white/60">scalable digital experiences.</span>
              </StaggerChild>
            </div>

            <div className="mt-12 flex flex-col border-t border-white/10 pt-8 font-mono md:mt-24 md:flex-row md:gap-12">
              <StaggerChild direction="up" distance={15}>
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Based in</p>
                  <p className="text-xs md:text-sm text-zinc-300 font-light tracking-wide">Kerala, India</p>
                </div>
              </StaggerChild>
              <StaggerChild direction="up" distance={15}>
                <div className="mt-6 space-y-1.5 md:mt-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Status</p>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-300 font-light tracking-wide">
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusColor}`}
                    />
                    <span>{displayText}</span>
                  </div>
                </div>
              </StaggerChild>
              <StaggerChild direction="up" distance={15}>
                <NowPlaying onPlayingChange={setSpotifyData} />
              </StaggerChild>
            </div>
          </ParallaxElement>
        </SectionTransition>

        {/* Right column */}
        <SectionTransition
          direction="right"
          delay={0.2}
          className="flex w-full flex-col gap-8 md:w-auto md:max-w-sm lg:max-w-md"
        >
          <ParallaxElement speed={0.18}>
            <div className="flex flex-col gap-8">
              <ExperienceList />
              <AwardsList />
              <GhostButton
                isEscaping={isEscaping}
                triggerEscape={triggerEscape}
                resetEscape={resetEscape}
              />

            </div>
          </ParallaxElement>
        </SectionTransition>
      </div>
    </section>
  );
};
