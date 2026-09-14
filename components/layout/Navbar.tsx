"use client";

import Link from "next/link";
import React from "react";

interface NavbarProps {
  current?: "writing" | "book" | "home" | string;
}

export const Navbar: React.FC<NavbarProps> = ({ current }) => (
  <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/85 px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-4 backdrop-blur-md transition-all duration-300">
    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
      <Link
        href="/"
        className="interactable text-xs font-medium text-white tracking-wide hover:text-zinc-300 transition-colors truncate"
      >
        Adithya Krishnan
      </Link>
      <span className="text-zinc-700 hidden sm:inline">/</span>
      <span className="hidden sm:inline text-[11px] text-zinc-500 font-mono">
        Software Engineer
      </span>
      {current && current !== "home" && (
        <>
          <span className="text-zinc-700">/</span>
          <span className="text-[11px] text-zinc-300 font-mono capitalize">
            {current}
          </span>
        </>
      )}
    </div>

    <nav className="flex items-center gap-3.5 sm:gap-6 text-[11px] sm:text-[12px] font-mono flex-shrink-0">
      <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 text-zinc-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] flex-shrink-0" />
        <span>Available Today</span>
      </div>
      <Link
        href="/#projects"
        className="interactable text-zinc-400 hover:text-white transition-colors"
      >
        Projects
      </Link>
      <Link
        href="/book"
        className={`interactable transition-colors ${
          current === "book" ? "text-white font-medium" : "text-zinc-400 hover:text-white"
        }`}
      >
        Book Meeting
      </Link>
      <Link
        href="/#contact"
        className="interactable text-zinc-400 hover:text-white transition-colors"
      >
        Contact
      </Link>
      <a
        href="/Resume_Adithya_Krishnan_sept.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="interactable hidden md:inline text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        Resume ↗
      </a>
    </nav>
  </header>
);

export default Navbar;
