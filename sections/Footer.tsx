import FadeUp from "@/components/FadeUp";
import MagneticElement from "@/components/MagneticElement";
import { COPYRIGHT_TEXT, SOCIAL_LINKS } from "@/data/social-links";
import { scrollToTop } from "@/lib/utils/SmoothScroll";
import { memo } from "react";

export const Footer = memo(() => (
  <footer className="w-full px-6 py-24 md:px-12 md:py-32">
    <div className="mx-auto max-w-6xl">
      {/* CTA */}
      <FadeUp>
        <div className="mb-20 border-t border-white/[0.08] pt-16">
          <h2 className="font-grotesk text-4xl font-extralight tracking-tight text-[#666666] md:text-6xl lg:text-7xl">
            Let&apos;s work <span className="text-[#e8e4e0]">together</span>
          </h2>
          <div className="mt-6">
            <a
              href="mailto:hello@adithyakrishnan.com"
              className="interactable inline-block font-mono text-sm tracking-[0.15em] text-[#999] transition-colors duration-300 hover:text-[#e8e4e0]"
            >
              hello@adithyakrishnan.com →
            </a>
          </div>
        </div>
      </FadeUp>

      {/* Bottom bar */}
      <div className="flex flex-col items-center justify-between gap-8 border-t border-white/[0.08] pt-8 md:flex-row">
        {/* Social links */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {SOCIAL_LINKS.map((link) => (
            <MagneticElement key={link.label}>
              <a
                href={link.href}
                target={link.target}
                rel={link.rel}
                className="interactable font-mono text-[10px] uppercase tracking-[0.2em] text-[#555] transition-colors duration-300 hover:text-[#e8e4e0]"
                aria-label={link.label}
              >
                {link.label}
              </a>
            </MagneticElement>
          ))}
        </div>

        {/* Copyright */}
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]">
          {COPYRIGHT_TEXT}
        </span>

        {/* Back to top */}
        <MagneticElement>
          <button
            onClick={scrollToTop}
            className="interactable font-mono text-[10px] uppercase tracking-[0.2em] text-[#555] transition-colors duration-300 hover:text-[#c4a47c]"
            aria-label="Back to top"
          >
            Back to top ↑
          </button>
        </MagneticElement>
      </div>
    </div>
  </footer>
));

Footer.displayName = "Footer";
