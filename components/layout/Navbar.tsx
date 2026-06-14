"use client";

import MagneticElement from "@/components/ui/MagneticElement";
import { motion } from "framer-motion";
import Link from "next/link";

export const Navbar = () => (
  <motion.nav
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="fixed left-0 right-0 top-0 z-50 w-full py-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:py-12"
  >
    <div className="mx-auto flex max-w-7xl items-center justify-between border border-transparent bg-transparent px-12 py-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
      <Link
        href="/"
        className="interactable font-space font-mono text-2xl font-light tracking-wider text-white transition-opacity hover:opacity-80"
      >
        Adi.
      </Link>
      <div className="flex items-center gap-5 font-mono text-[11px] tracking-[0.1em] text-white/50 md:gap-10 md:text-[14px]">
        <MagneticElement>
          <a
            href="/Resume_Adithya_Krishnan.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="interactable transition-colors duration-300 hover:text-white"
          >
            resume
          </a>
        </MagneticElement>
        <MagneticElement>
          <a
            href="mailto:hello@adithyakrishnan.com"
            className="interactable transition-colors duration-300 hover:text-white"
          >
            contact
          </a>
        </MagneticElement>
      </div>
    </div>
  </motion.nav>
);
