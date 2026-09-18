"use client";

import { scrollToTop } from "@/lib/utils/smoothScroll";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import React from "react";

export const Footer: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const triggerAsciiMorph = (text: string | null) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("ascii-text-morph", { detail: { text } })
      );
    }
  };

  return (
    <footer
      onMouseLeave={() => triggerAsciiMorph(null)}
      className="w-full bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-16 md:py-24 text-zinc-400"
    >
      <div className="flex w-full flex-col justify-between gap-12">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-24"
        >
          <div className="flex flex-col">
            <h4
              onMouseEnter={() => triggerAsciiMorph("CONTACT")}
              onMouseLeave={() => triggerAsciiMorph(null)}
              onTouchStart={() => triggerAsciiMorph("CONTACT")}
              className="text-xl font-light text-white tracking-tight mb-6 cursor-default transition-colors hover:text-zinc-200 inline-block w-fit"
            >
              Contact
            </h4>
            <div className="flex flex-col gap-3 font-sans text-xs sm:text-sm">
              <div
                onMouseEnter={() => triggerAsciiMorph("GITHUB")}
                onMouseLeave={() => triggerAsciiMorph(null)}
                onTouchStart={() => triggerAsciiMorph("GITHUB")}
                className="flex items-center justify-between border-b border-white/5 pb-2"
              >
                <span className="text-zinc-500">GitHub</span>
                <a
                  href="https://github.com/fal3n-4ngel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-white transition-colors"
                >
                  @fal3n-4ngel
                </a>
              </div>

              <div
                onMouseEnter={() => triggerAsciiMorph("LINKEDIN")}
                onMouseLeave={() => triggerAsciiMorph(null)}
                onTouchStart={() => triggerAsciiMorph("LINKEDIN")}
                className="flex items-center justify-between border-b border-white/5 pb-2"
              >
                <span className="text-zinc-500">LinkedIn</span>
                <a
                  href="https://www.linkedin.com/in/fal3n-4ngel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-white transition-colors"
                >
                  /in/fal3n-4ngel
                </a>
              </div>

              <div
                onMouseEnter={() => triggerAsciiMorph("X")}
                onMouseLeave={() => triggerAsciiMorph(null)}
                onTouchStart={() => triggerAsciiMorph("X")}
                className="flex items-center justify-between border-b border-white/5 pb-2"
              >
                <span className="text-zinc-500">Twitter / X</span>
                <a
                  href="https://twitter.com/fal3n4ngel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-white transition-colors"
                >
                  @fal3n4ngel
                </a>
              </div>

              <div
                onMouseEnter={() => triggerAsciiMorph("EMAIL")}
                onMouseLeave={() => triggerAsciiMorph(null)}
                onTouchStart={() => triggerAsciiMorph("EMAIL")}
                className="flex items-center justify-between border-b border-white/5 pb-2"
              >
                <span className="text-zinc-500">Email</span>
                <a
                  href="mailto:hello@adithyakrishnan.com"
                  className="text-zinc-300 hover:text-white transition-colors"
                >
                  hello@adithyakrishnan.com
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <h4
              onMouseEnter={() => triggerAsciiMorph("NAVIGATION")}
              onMouseLeave={() => triggerAsciiMorph(null)}
              onTouchStart={() => triggerAsciiMorph("NAVIGATION")}
              className="text-xl font-light text-white tracking-tight mb-6 cursor-default transition-colors hover:text-zinc-200 inline-block w-fit"
            >
              Navigation
            </h4>
            <div className="flex flex-col gap-3 font-sans text-xs sm:text-sm">
              <button
                onClick={scrollToTop}
                onMouseEnter={() => triggerAsciiMorph("ADITHYA KRISHNAN")}
                onMouseLeave={() => triggerAsciiMorph(null)}
                onTouchStart={() => triggerAsciiMorph("ADITHYA KRISHNAN")}
                className="flex items-center justify-between border-b border-white/5 pb-2 text-left text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>Adithya Krishnan</span>
                <span className="text-zinc-500">↑</span>
              </button>

              <a
                href="/#projects"
                onMouseEnter={() => triggerAsciiMorph("PROJECTS")}
                onMouseLeave={() => triggerAsciiMorph(null)}
                onTouchStart={() => triggerAsciiMorph("PROJECTS")}
                className="flex items-center justify-between border-b border-white/5 pb-2 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Projects</span>
                <span className="text-zinc-500">↑</span>
              </a>

              <a
                href="/#achievements"
                onMouseEnter={() => triggerAsciiMorph("BACKGROUND")}
                onMouseLeave={() => triggerAsciiMorph(null)}
                onTouchStart={() => triggerAsciiMorph("BACKGROUND")}
                className="flex items-center justify-between border-b border-white/5 pb-2 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Background</span>
                <span className="text-zinc-500">↑</span>
              </a>

              <Link
                href="/book"
                scroll={true}
                onClick={() => scrollToTop(true)}
                onMouseEnter={() => triggerAsciiMorph("BOOK A MEETING")}
                onMouseLeave={() => triggerAsciiMorph(null)}
                onTouchStart={() => triggerAsciiMorph("BOOK A MEETING")}
                className="flex items-center justify-between border-b border-white/5 pb-2 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Book a Meeting</span>
                <span className="text-zinc-500">→</span>
              </Link>

              <a
                href="/#contact"
                onMouseEnter={() => triggerAsciiMorph("CONTACT")}
                onMouseLeave={() => triggerAsciiMorph(null)}
                onTouchStart={() => triggerAsciiMorph("CONTACT")}
                className="flex items-center justify-between border-b border-white/5 pb-2 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Contact</span>
                <span className="text-zinc-500">↑</span>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.blockquote
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="block sm:hidden border-l border-white/20 pl-3.5 max-w-sm"
        >
          <p className="font-mono text-xs text-zinc-300 italic leading-relaxed">
            “Like I always say, can&apos;t find a door? Make your own.”
          </p>
          <cite className="mt-1.5 block font-mono text-[11px] text-zinc-500 not-italic">
            — Edward Elric, Fullmetal Alchemist
          </cite>
        </motion.blockquote>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="pt-8 flex items-center justify-between text-xs font-mono text-zinc-600"
        >
          <span>© {new Date().getFullYear()} Adithya Krishnan</span>
          <button
            type="button"
            onMouseEnter={() => triggerAsciiMorph("GHOST")}
            onMouseLeave={() => triggerAsciiMorph(null)}
            onTouchStart={() => triggerAsciiMorph("GHOST")}
            aria-label="Ghost Mascot ASCII morph"
            className="cursor-pointer hover:text-zinc-300 transition-colors flex items-center gap-1.5 opacity-70 hover:opacity-100"
          >
            <span>mascot</span>
            <span>👻</span>
          </button>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
