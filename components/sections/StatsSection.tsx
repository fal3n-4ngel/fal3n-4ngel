"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import FadeUp from "@/components/ui/FadeUp";
import {
  RiGithubLine,
  RiSpotifyLine,
  RiCalendarEventLine,
  RiFileTextLine,
  RiAwardLine,
  RiGitRepositoryLine,
  RiUserFollowLine,
} from "react-icons/ri";

interface StatsData {
  spotify: {
    isPlaying: boolean;
    title?: string;
    artist?: string;
    songUrl?: string;
    albumImageUrl?: string;
  };
  github: {
    username: string;
    publicRepos: number;
    followers: number;
    totalStars: number;
  } | null;
  notion: {
    blogsCount: number;
    projectsCount: number;
    experiencesCount: number;
  };
  availability: {
    status: "Available" | "Busy";
    currentEvent?: string;
  };
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats/public");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="relative w-full px-12 py-24 border-t border-white/5 bg-black">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 animate-pulse">
            Loading dashboard stats...
          </p>
        </div>
      </section>
    );
  }

  if (!stats) return null;

  return (
    <section className="relative w-full px-12 py-24 border-t border-white/5 bg-black">
      <div className="mx-auto max-w-6xl space-y-12">
        <FadeUp>
          <div className="space-y-2">
            <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-neutral-500">
              Live Dashboard
            </h2>
            <p className="text-xl font-light text-neutral-400">
              Real-time snapshots of my digital workspace, music, and calendar.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Spotify Live Status Card */}
          <FadeUp className="md:col-span-1 lg:col-span-1">
            <div className="group relative flex flex-col justify-between h-64 border border-white/10 bg-white/[0.01] hover:border-white/20 transition-all duration-300 p-6 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                  <RiSpotifyLine className="h-4 w-4 text-[#1DB954]" /> Spotify Status
                </span>
                {stats.spotify.isPlaying && (
                  <span className="flex gap-0.5 items-end h-3.5">
                    <motion.span
                      className="w-0.5 bg-[#1DB954] rounded-full"
                      animate={{ height: [4, 14, 4] }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                    />
                    <motion.span
                      className="w-0.5 bg-[#1DB954] rounded-full"
                      animate={{ height: [4, 14, 4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        ease: "easeInOut",
                        delay: 0.25,
                      }}
                    />
                    <motion.span
                      className="w-0.5 bg-[#1DB954] rounded-full"
                      animate={{ height: [4, 14, 4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        ease: "easeInOut",
                        delay: 0.1,
                      }}
                    />
                  </span>
                )}
              </div>

              {stats.spotify.isPlaying && stats.spotify.title ? (
                <a
                  href={stats.spotify.songUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactable flex items-center gap-4 my-auto"
                >
                  <div className="relative shrink-0 h-16 w-16 overflow-hidden rounded-md group-hover:shadow-[0_0_20px_rgba(29,185,84,0.3)] transition-all duration-500">
                    <Image
                      src={stats.spotify.albumImageUrl || ""}
                      alt="Album Cover"
                      fill
                      sizes="64px"
                      className="object-cover animate-[spin_12s_linear_infinite]"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-base font-light text-white truncate transition-colors group-hover:text-[#1DB954]">
                      {stats.spotify.title}
                    </h4>
                    <p className="text-xs text-neutral-500 truncate">{stats.spotify.artist}</p>
                  </div>
                </a>
              ) : (
                <div className="my-auto text-neutral-500 text-sm font-light">
                  Currently offline. Last seen listening to music recently.
                </div>
              )}

              <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                {stats.spotify.isPlaying ? "Listening right now" : "Offline / Idle"}
              </div>
            </div>
          </FadeUp>

          {/* 2. Availability & Booking Card */}
          <FadeUp className="md:col-span-1 lg:col-span-1">
            <div className="group relative flex flex-col justify-between h-64 border border-white/10 bg-white/[0.01] hover:border-white/20 transition-all duration-300 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                  <RiCalendarEventLine className="h-4 w-4 text-purple-400" /> Availability
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    stats.availability.status === "Available" ? "bg-green-500 animate-pulse" : "bg-red-500 animate-pulse"
                  }`}
                />
              </div>

              <div className="my-auto space-y-3">
                <h3 className="text-xl font-light text-white">
                  {stats.availability.status === "Available" ? "Open for Collaboration" : "Busy in Meeting"}
                </h3>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  {stats.availability.status === "Available"
                    ? "I am currently free for consultation, code reviews, or project chats. Book a slot!"
                    : "I am currently in a scheduled meeting, but you can schedule a call for later."}
                </p>
              </div>

              <Link
                href="/book"
                className="interactable flex items-center justify-center border border-white/10 bg-white/[0.02] hover:bg-white hover:text-black py-2.5 text-[10px] font-mono uppercase tracking-widest text-neutral-300 transition-all duration-300 rounded-sm"
              >
                Schedule a sync
              </Link>
            </div>
          </FadeUp>

          {/* 3. Notion Projects & Work Content Card */}
          <FadeUp className="md:col-span-1 lg:col-span-1">
            <div className="group relative flex flex-col justify-between h-64 border border-white/10 bg-white/[0.01] hover:border-white/20 transition-all duration-300 p-6 rounded-lg">
              <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                <RiFileTextLine className="h-4 w-4 text-amber-400" /> Notion CMS Data
              </span>

              <div className="my-auto grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <div className="text-3xl font-light text-white">{stats.notion.projectsCount}</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                    Works
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-light text-white">{stats.notion.blogsCount}</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                    Blogs
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-light text-white">
                    {stats.notion.experiencesCount}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
                    Roles
                  </div>
                </div>
              </div>

              <div className="font-mono text-[9px] uppercase tracking-wider text-neutral-600">
                Synced directly with Notion Workspace
              </div>
            </div>
          </FadeUp>

          {/* 4. GitHub Stats Card */}
          {stats.github && (
            <FadeUp className="md:col-span-2 lg:col-span-3">
              <div className="group relative flex flex-col justify-between md:flex-row md:items-center gap-6 border border-white/10 bg-white/[0.01] hover:border-white/20 transition-all duration-300 p-6 rounded-lg">
                <div className="space-y-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                    <RiGithubLine className="h-4 w-4 text-sky-400" /> GitHub Analytics
                  </span>
                  <h3 className="text-xl font-light text-white">@{stats.github.username}</h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Dynamic integration fetching total repository counts and popularity stars.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-8 md:gap-16 pr-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-2xl font-light text-white justify-center">
                      <RiGitRepositoryLine className="h-5 w-5 text-neutral-500" />
                      {stats.github.publicRepos}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 text-center">
                      Repos
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-2xl font-light text-white justify-center">
                      <RiAwardLine className="h-5 w-5 text-yellow-500" />
                      {stats.github.totalStars}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 text-center">
                      Stars
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-2xl font-light text-white justify-center">
                      <RiUserFollowLine className="h-5 w-5 text-neutral-500" />
                      {stats.github.followers}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-500 text-center">
                      Followers
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>
          )}
        </div>
      </div>
    </section>
  );
}
