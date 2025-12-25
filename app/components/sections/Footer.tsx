import {
  COPYRIGHT_TEXT,
  MINIMAL_PORTFOLIO_URL,
  QUOTE_TEXT,
  SOCIAL_LINKS,
} from "@/app/constants/social-links";
import { scrollToTop } from "@/app/utils/SmoothScroll";
import { memo } from "react";
import {
  RiArrowUpCircleLine,
  RiFile2Fill,
  RiGithubFill,
  RiLinkedinBoxFill,
  RiMailFill,
} from "react-icons/ri";

const iconMap = {
  RiGithubFill,
  RiLinkedinBoxFill,
  RiMailFill,
  RiFile2Fill,
};

const SocialLink = memo(
  ({
    href,
    label,
    icon,
    target,
    rel,
  }: {
    href: string;
    label: string;
    icon: string;
    target?: string;
    rel?: string;
  }) => {
    const IconComponent = iconMap[icon as keyof typeof iconMap];

    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className="interactable flex items-center gap-2 transition-all hover:scale-[110%] hover:animate-pulse"
        aria-label={label}
      >
        <IconComponent className="h-8 w-8" /> {label}
      </a>
    );
  }
);

SocialLink.displayName = "SocialLink";

export const Footer = memo(() => (
  <footer className="flex h-full w-full flex-col justify-center border-[#ffffff39] py-[40px] pt-28 text-3xl font-thin text-black dark:text-white md:border-t-[1px]">
    <div className="mx-auto flex h-full w-full flex-col items-center justify-center font-poppins text-xl md:w-[90%] md:flex-row md:justify-between">
      <div className="hidden w-fit items-start justify-start p-5 text-center md:flex md:p-0">
        {COPYRIGHT_TEXT}
      </div>

      <div className="flex min-w-[600px] flex-col items-center justify-start text-justify md:flex-row md:justify-between">
        <div className="flex flex-col items-start gap-4 md:w-full md:flex-row md:justify-between">
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
      </div>

      <button
        onClick={scrollToTop}
        className="interactable z-10 flex items-center gap-2 p-10 md:p-0"
        aria-label="Back to top"
      >
        Back To Top <RiArrowUpCircleLine className="h-8 w-8" />
      </button>
    </div>

    <div className="interactable mt-5 flex flex-col p-4 text-center font-poppins text-xl md:mt-10">
      {QUOTE_TEXT}
      <div className="mt-10 text-center text-xl font-light text-slate-600 md:text-2xl">- - -</div>
    </div>

    <div className="flex w-full items-center justify-center p-10 pb-20 text-center text-base md:hidden md:p-0">
      {COPYRIGHT_TEXT}
    </div>

    <div className="mt-8 flex w-full flex-col items-center justify-center p-4 pb-8 text-center font-poppins text-base text-slate-500 dark:text-slate-400 md:flex-row">
      Not a fan of complex portfolios?<span className="md:hidden"></span> Check out my &nbsp;
      <a
        href={MINIMAL_PORTFOLIO_URL}
        className="text-slate-700 hover:underline dark:text-slate-300"
      >
        minimal portfolio.
      </a>
    </div>
  </footer>
));

Footer.displayName = "Footer";
