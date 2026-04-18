export interface SocialLink {
  href: string;
  label: string;
  icon: string;
  target?: string;
  rel?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "https://github.com/fal3n-4ngel",
    label: "Github",
    icon: "RiGithubFill",
  },
  {
    href: "https://www.linkedin.com/in/fal3n-4ngel/",
    label: "LinkedIn",
    icon: "RiLinkedinBoxFill",
  },
  {
    href: "mailto:adiadithyakrishnan@gmail.com",
    label: "Email",
    icon: "RiMailFill",
  },
  {
    href: "/Resume Adithya Krishnan.pdf",
    label: "Resume",
    icon: "RiFile2Fill",
    target: "_blank",
    rel: "noopener noreferrer",
  },
];

export const COPYRIGHT_TEXT = "© Adithya Krishnan 2025.";
export const QUOTE_TEXT =
  '"Like I always say, can\'t find a door? Make your own." – Edward Elric, Fullmetal Alchemist';
export const MINIMAL_PORTFOLIO_URL = "https://minimal.adithyakrishnan.com";
