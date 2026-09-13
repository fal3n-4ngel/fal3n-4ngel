"use client";

import React, { useState } from "react";

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = "hello@adithyakrishnan.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section
      id="contact"
      className="relative w-full border-t border-white/10 bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-20 md:py-28"
    >
      <div className="flex w-full flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
        {/* ── Left Column: Heading & Note ──────────────────────── */}
        <div className="flex flex-col lg:w-1/2 lg:sticky lg:top-24">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white">
            Contact
          </h2>
          <p className="mt-3 text-xs sm:text-sm font-light text-zinc-400 max-w-md">
            Want to work together? Anything else to tell me? Feel free to contact me!
          </p>
        </div>

        {/* ── Right Column: Email Display & Actions ────────────── */}
        <div className="flex flex-col lg:w-1/2">
          <span className="font-sans text-sm text-zinc-400">Email</span>

          {/* Huge Email Typography */}
          <a
            href={`mailto:${email}`}
            className="mt-2 text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-white transition-colors hover:text-zinc-300 break-all"
          >
            {email}
          </a>

          {/* Actions: Copy Email & Open in Client */}
          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-white/5 pt-4 font-mono text-xs text-zinc-400 gap-4">
            <button
              onClick={handleCopy}
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              [ {copied ? "Copied!" : "Copy Email"} ]
            </button>

            <a
              href={`mailto:${email}`}
              className="text-zinc-300 hover:text-white transition-colors"
            >
              [ Open in Email Client ]
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
