"use client";
import Image from "next/image";
import { RiArrowRightUpLine } from "react-icons/ri";

type ProjProps = {
  url1: string;
  name: string;
  type: string;
  event: string;
  date: string;
  view: string;
  description?: string;
};

function ProjBox({ url1, name, type, event, date, view, description }: ProjProps) {
  return (
    <div className="group flex flex-col gap-6 md:gap-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
        <h3 className="flex-1 text-3xl font-light tracking-tight text-white transition-colors group-hover:text-neutral-300 md:text-4xl lg:text-5xl">
          <a
            href={view}
            target="_blank"
            rel="noopener noreferrer"
            className="interactable flex items-start gap-4 md:items-center"
          >
            <span className="leading-tight">{name}</span>
            <span className="mt-1 shrink-0 rounded-full bg-neutral-800 p-2 text-white transition-all group-hover:bg-white group-hover:text-black md:mt-0">
              <RiArrowRightUpLine className="h-5 w-5 md:h-6 md:w-6" />
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
          <Image
            src={url1}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="rounded-full bg-white px-6 py-3 font-medium text-black shadow-lg">
              View Project
            </span>
          </div>
        </a>
      </div>

      {description && (
        <p className="max-w-3xl text-base font-light leading-relaxed text-neutral-400 md:text-xl">
          {description}
        </p>
      )}
    </div>
  );
}

export default ProjBox;
