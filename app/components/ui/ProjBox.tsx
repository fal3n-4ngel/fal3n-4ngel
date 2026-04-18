"use client";
import React from "react";
import Image from "next/image";

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
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4">
        <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white group-hover:text-neutral-300 transition-colors">
          <a href={view} target="_blank" rel="noopener noreferrer" className="interactable">{name}</a>
        </h3>
        <span className="font-mono text-sm md:text-[15px] uppercase tracking-[0.2em] text-neutral-500">
          {type} / {date}
        </span>
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 border border-white/5">
        <a href={view} target="_blank" rel="noopener noreferrer" className="interactable block w-full h-full">
          <Image
            src={url1}
            alt={name}
            fill
            className="object-cover opacity-80 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
          />
        </a>
      </div>

      {description && (
        <p className="text-neutral-400 font-light leading-relaxed max-w-3xl text-base md:text-xl">
          {description}
        </p>
      )}
    </div>
  );
}

export default ProjBox;
