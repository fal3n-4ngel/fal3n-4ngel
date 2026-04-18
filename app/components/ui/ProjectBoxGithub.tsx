import React, { useEffect, useState } from "react";
import { RiArrowRightUpLine } from "react-icons/ri";

type GithubProjProps = {
  url1: number;
  name: string;
  type: string;
  event: string;
  date: string;
  view: string;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
};

const randomColor = (): string => "#" + Math.floor(Math.random() * 16777215).toString(16);

const generateRects = (seed: number): Rect[] => {
  const numRects = Math.floor(Math.random() * 11) + 5;
  return Array.from({ length: numRects }, () => ({
    x: Math.random() * 1280,
    y: Math.random() * 640,
    width: Math.random() * 200 + 50,
    height: Math.random() * 200 + 50,
    fill: randomColor(),
    opacity: Math.random() * 0.5 + 0.1,
  }));
};

const GithubProjectBox: React.FC<GithubProjProps> = ({ url1, name, type, date, view }) => {
  const [rects, setRects] = useState<Rect[]>(() => generateRects(url1));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRects(generateRects(url1));
    }, 2000);

    return () => clearInterval(intervalId);
  }, [url1]);

  return (
    <div className="group flex flex-col gap-6 md:gap-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
        <h3 className="flex-1 text-2xl font-light tracking-tight text-white transition-colors group-hover:text-neutral-300 md:text-3xl lg:text-4xl">
          <a
            href={view}
            target="_blank"
            rel="noopener noreferrer"
            className="interactable flex items-start gap-4 md:items-center"
          >
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
        <a
          href={view}
          target="_blank"
          rel="noopener noreferrer"
          className="interactable relative block h-full w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1280 640"
            className="h-auto w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
          >
            {rects.map((rect, index) => (
              <rect key={index} {...rect} className="transition-all duration-1000" />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="rounded-full bg-white px-6 py-3 font-medium text-black shadow-lg">
              View Repository
            </span>
          </div>
        </a>
      </div>

      <p className="max-w-3xl text-base font-light leading-relaxed text-neutral-400 md:text-xl">
        GitHub Repository - Dynamically fetched from GitHub, showcasing real-time repository data
        and updates. Visit the GitHub page to explore the complete codebase, documentation, and
        development history.
      </p>
    </div>
  );
};

export default GithubProjectBox;
