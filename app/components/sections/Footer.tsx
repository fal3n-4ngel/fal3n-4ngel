import { COPYRIGHT_TEXT, SOCIAL_LINKS } from "@/app/constants/social-links";
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
        className="interactable text-[10px] uppercase tracking-widest text-neutral-500 transition-colors hover:text-white md:text-xs"
        aria-label={label}
      >
        {label}
      </a>
    );
  }
);

SocialLink.displayName = "SocialLink";

export const Footer = memo(() => (
  <footer className="mt-12 flex w-full flex-col items-center justify-between gap-8 border-t border-white border-opacity-10 px-6 py-12 pb-24 font-mono text-[10px] text-neutral-600 md:flex-row md:px-12 md:text-xs">
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
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

    <div className="flex flex-col gap-2 text-center text-neutral-500 md:text-left">
      <span className="tracking-widest">
        SAY HELLO AT{" "}
        <a
          href="mailto:hello@adithyakrishnan.com"
          className="interactable text-white transition-colors hover:text-neutral-300"
        >
          hello@adithyakrishnan.com
        </a>
      </span>
      <span>{COPYRIGHT_TEXT}</span>
    </div>

    <button
      onClick={scrollToTop}
      className="interactable flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors hover:text-white md:text-xs"
      aria-label="Back to top"
    >
      Back To Top ?
    </button>
  </footer>
));

Footer.displayName = "Footer";
