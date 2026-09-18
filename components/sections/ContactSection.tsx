"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const email = "hello@adithyakrishnan.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section
      id="contact"
      className="relative w-full bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-14 sm:py-20 md:py-28"
    >
      <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-start lg:gap-24">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:w-1/2 lg:sticky lg:top-24"
        >
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 sm:mb-3">
            <span>[ 03 // GET IN TOUCH ]</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-none">
            Contact
          </h2>
          <p className="mt-3 text-sm sm:text-base font-light text-zinc-400 leading-relaxed">
            Have an idea, opportunity, or just want to chat? Say hello.
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:w-1/2"
        >
          <span className="font-sans text-xs sm:text-sm text-zinc-400">Email</span>

          <a
            href={`mailto:${email}`}
            className="mt-2 text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-white transition-colors hover:text-zinc-300 break-all"
          >
            {email}
          </a>

          <div className="mt-6 flex flex-wrap items-center justify-between border-t border-white/5 pt-4 font-mono text-xs text-zinc-400 gap-4">
            <button
              onClick={handleCopy}
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              [ {copied ? "Copied!" : "Copy Email"} ]
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
