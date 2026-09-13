"use client";

import { scrollToTop } from "@/lib/utils/smoothScroll";
import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-16 md:py-24 text-zinc-400">
      <div className="flex w-full flex-col justify-between gap-12">
        {/* Navigation & Contact Columns matching Image 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-24">
          {/* Contact Column */}
          <div className="flex flex-col">
            <h4 className="text-xl font-light text-white tracking-tight mb-6">Contact</h4>
            <div className="flex flex-col gap-3 font-sans text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
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

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
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

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
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

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
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

          {/* Navigation Column */}
          <div className="flex flex-col">
            <h4 className="text-xl font-light text-white tracking-tight mb-6">Navigation</h4>
            <div className="flex flex-col gap-3 font-sans text-xs sm:text-sm">
              <button
                onClick={scrollToTop}
                className="flex items-center justify-between border-b border-white/5 pb-2 text-left text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>Adithya Krishnan</span>
                <span className="text-zinc-500">↑</span>
              </button>

              <a
                href="#projects"
                className="flex items-center justify-between border-b border-white/5 pb-2 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Projects</span>
                <span className="text-zinc-500">↑</span>
              </a>

              <a
                href="#achievements"
                className="flex items-center justify-between border-b border-white/5 pb-2 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Achievements</span>
                <span className="text-zinc-500">↑</span>
              </a>

              <a
                href="#contact"
                className="flex items-center justify-between border-b border-white/5 pb-2 text-zinc-300 hover:text-white transition-colors"
              >
                <span>Contact</span>
                <span className="text-zinc-500">↑</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="pt-8 text-xs font-mono text-zinc-600">
          © {new Date().getFullYear()} Adithya Krishnan
        </div>
      </div>
    </footer>
  );
};

export default Footer;
