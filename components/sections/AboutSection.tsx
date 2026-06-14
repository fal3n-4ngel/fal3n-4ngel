"use client";

import { AwardsList } from "@/components/features/AwardsList";
import { ExperienceList } from "@/components/features/ExperienceList";
import { GhostButton } from "@/components/features/GhostButton";
import NowPlaying from "@/components/features/NowPlaying";
import { ParallaxElement } from "@/components/ui/ParallaxSection";
import { SectionTransition, StaggerChild } from "@/components/ui/SectionTransition";
import { useLanyard } from "@/hooks";
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
  const [spotifyData, setSpotifyData] = useState<{ isPlaying: boolean; lastPlayedAt?: string }>({
    isPlaying: false,
  });

  const { data: lanyardData } = useLanyard("849515993546096660");

  useEffect(() => {
    getSiteConfig().then((data) => {
      if (data) setConfig(data);
    });
  }, []);

  useEffect(() => {
    const isCoding = lanyardData?.activities.some((act) => act.type === 0 && act.name === "Visual Studio Code") ?? false;
    window.dispatchEvent(new CustomEvent("ghost-coding", { detail: { coding: isCoding } }));
  }, [lanyardData]);

  const activeStatus = config?.["active status"]?.isEnabled ?? false;
  const collaborationStatus = config?.["collaboration"]?.isEnabled ?? false;
  const collaborationText = config?.["collaboration"]?.content || "Inactive";

  let lastSeenSpotifyText: string | null = null;
  if (!spotifyData.isPlaying && spotifyData.lastPlayedAt) {
    const diffMs = Date.now() - new Date(spotifyData.lastPlayedAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) lastSeenSpotifyText = `Last seen ${diffMins}m ago`;
    else {
      const diffHours = Math.floor(diffMins / 60);
      lastSeenSpotifyText =
        diffHours < 24
          ? `Last seen ${diffHours}h ago`
          : `Last seen ${Math.floor(diffHours / 24)}d ago`;
    }
  }

  let displayStatus = collaborationStatus;
  let displayText = collaborationText;
  let statusColor = displayStatus ? "bg-green-500 animate-pulse" : "bg-red-500";

  if (!activeStatus) {
    if (lanyardData) {
      const activeGameOrCoding = lanyardData.activities.find((act) => act.type === 0);
      const customStatus = lanyardData.activities.find((act) => act.type === 4);

      if (lanyardData.discord_status === "online") {
        statusColor = "bg-green-500 animate-pulse";
      } else if (lanyardData.discord_status === "idle") {
        statusColor = "bg-yellow-500 animate-pulse";
      } else if (lanyardData.discord_status === "dnd") {
        statusColor = "bg-red-500 animate-pulse";
      } else {
        statusColor = "bg-zinc-600";
      }

      displayStatus = lanyardData.discord_status !== "offline";

      if (activeGameOrCoding) {
        if (activeGameOrCoding.name === "Visual Studio Code") {
          displayText = `Coding: ${activeGameOrCoding.details || "VS Code"}`;
        } else if (activeGameOrCoding.name === "Minecraft") {
          displayText = "Playing Minecraft";
        } else {
          displayText = `Playing ${activeGameOrCoding.name}`;
        }
      } else if (lanyardData.listening_to_spotify) {
        displayText = "Listening to Spotify";
        statusColor = "bg-green-500 animate-pulse";
      } else if (customStatus?.state) {
        displayText = customStatus.state;
      } else {
        if (lanyardData.discord_status === "online") {
          displayText = "Online";
        } else if (lanyardData.discord_status === "idle") {
          displayText = "Away";
        } else if (lanyardData.discord_status === "dnd") {
          displayText = "Busy";
        } else {
          displayText = "Offline";
        }
      }
    } else {
      if (spotifyData.isPlaying) {
        displayStatus = true;
        statusColor = "bg-green-500 animate-pulse";
        displayText = "Listening to Spotify";
      } else if (lastSeenSpotifyText) {
        displayStatus = false;
        statusColor = "bg-zinc-600";
        displayText = lastSeenSpotifyText;
      } else {
        displayStatus = false;
        statusColor = "bg-red-500";
        displayText = "Offline";
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
