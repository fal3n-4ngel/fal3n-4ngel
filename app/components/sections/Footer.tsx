import {
  COPYRIGHT_TEXT,
  SOCIAL_LINKS,
} from "@/app/constants/social-links";
import { scrollToTop } from "@/app/utils/SmoothScroll";
import { memo } from "react";

const SocialLink = memo(
  ({
    href,
    label,
    target,
    rel,
  }: {
    href: string;
    label: string;
    icon: string;
    target?: string;
    rel?: string;
  }) => {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className="interactable text-[10px] md:text-xs uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
        aria-label={label}
      >
        {label}
      </a>
    );
  }
);

SocialLink.displayName = "SocialLink";

export const Footer = memo(() => (
  <footer className="w-full py-12 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between font-mono text-[10px] md:text-xs text-neutral-600 gap-8 border-t border-white border-opacity-10 mt-12 pb-24">
    
      <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
        {SOCIAL_LINKS.map((link) => (
          <SocialLink
            key={link.label}
            href={link.href}
            label={link.label}
            icon={link.icon}
            target={link.target}
            rel={link.rel}
          />
        ))}
      </div>

      <div className="text-center md:text-left text-neutral-500">
        {COPYRIGHT_TEXT}
      </div>

      <button
        onClick={scrollToTop}
        className="interactable flex items-center gap-2 text-[10px] md:text-xs hover:text-white transition-colors uppercase tracking-widest"
        aria-label="Back to top"
      >
        Back To Top ?
      </button>

  </footer>
));

Footer.displayName = "Footer";
