"use client";

import React, { useEffect, useState } from "react";
import { RiArrowRightUpLine } from "react-icons/ri";

type Rect = { x: number; y: number; width: number; height: number; fill: string; opacity: number };

const RECT_COLORS = [
  "rgba(255,255,255,0.03)",
  "rgba(255,255,255,0.06)",
  "rgba(255,255,255,0.01)",
  "rgba(255,255,255,0.09)",
  "rgba(255,255,255,0.12)",
  "rgba(150,160,175,0.04)",
];

const generateRects = (): Rect[] =>
  Array.from({ length: Math.floor(Math.random() * 11) + 6 }, () => ({
    x: Math.random() * 1280,
    y: Math.random() * 640,
    width: Math.random() * 250 + 50,
    height: Math.random() * 250 + 50,
    fill: RECT_COLORS[Math.floor(Math.random() * RECT_COLORS.length)] ?? RECT_COLORS[0]!,
    opacity: 1.0,
  }));

interface GithubProjectCardProps {
  url1: number;
  name: string;
  type: string;
  event: string;
  date: string;
  view: string;
  onVisible?: () => void;
}

export const GithubProjectCard: React.FC<GithubProjectCardProps> = ({ url1, name, type, date, view }) => {
  const [rects, setRects] = useState<Rect[]>(() => generateRects());

  useEffect(() => {
    const id = setInterval(() => setRects(generateRects()), 2000);
    return () => clearInterval(id);
  }, [url1]);

  return (
    <div className="group flex flex-col gap-6 md:gap-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
        <h3 className="flex-1 text-2xl font-light tracking-tight text-white transition-colors group-hover:text-neutral-300 md:text-3xl lg:text-4xl">
          <a href={view} target="_blank" rel="noopener noreferrer" className="interactable flex items-start gap-4 md:items-center">
            <span className="leading-tight">{name}</span>
            <span className="mt-1 shrink-0 rounded-full bg-neutral-800 p-2 text-white transition-all group-hover:bg-white group-hover:text-black md:mt-0">
              <RiArrowRightUpLine className="h-4 w-4 md:h-5 md:w-5" />
            </span>
          </a>
        </h3>
        <span className="mt-2 shrink-0 font-mono text-sm uppercase tracking-[0.2em] text-neutral-500 md:ml-6 md:mt-0 md:text-[15px]">
          {type} / {date}
        </span>
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden border border-white/5 bg-neutral-900">
        <a href={view} target="_blank" rel="noopener noreferrer" className="interactable projImg relative block h-full w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 640" className="h-auto w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100">
            {rects.map((rect, i) => <rect key={i} {...rect} className="transition-all duration-1000" />)}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="rounded-full bg-white px-6 py-3 font-medium text-black shadow-lg">View Repository</span>
          </div>
        </a>
      </div>

      <p className="max-w-3xl text-base font-light leading-relaxed text-neutral-400 md:text-xl">
        GitHub Repository — Dynamically fetched, showcasing real-time repository data and updates.
      </p>
    </div>
  );
};
