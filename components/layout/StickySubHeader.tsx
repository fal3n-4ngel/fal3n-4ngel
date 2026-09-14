"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export const StickySubHeader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.7) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-4 backdrop-blur-md transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col min-w-0 pr-2">
        <a href="#" className="text-xs font-medium text-white tracking-wide hover:text-zinc-300 transition-colors truncate">
          Adithya Krishnan
        </a>
        <span className="hidden sm:inline text-[11px] text-zinc-500 font-mono">Software Engineer</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 text-[11px] sm:text-[12px] font-mono flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-zinc-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] flex-shrink-0" />
          <span className="hidden sm:inline">Available Today</span>
          <span className="sm:hidden">Available</span>
        </div>
        <Link
          href="/book"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          Book a Call
        </Link>
        <a
          href="#contact"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          Contact
        </a>
      </div>
    </div>
  );
};
