import Image from "next/image";

const LINK_BASE_CLASS =
  "font-poppins text-black transition-all duration-300 hover:opacity-25 dark:text-white";

const NAV_LINKS = [
  { href: "https://github.com/fal3n-4ngel", text: "github", className: "githubLogo" ,pulse: false},
  { href: "https://www.linkedin.com/in/fal3n-4ngel/", text: "linkedin", className: "linkedinLogo" ,pulse: false},
  {
    href: "/Resume_Adithya_Krishnan.pdf",
    text: "resume",
    className: "resumeLogo animate-pulse",
    pulse: true,
  },
] as const;

const MOBILE_ICONS = [
  { href: "https://github.com/fal3n-4ngel", src: "icons/github.svg", alt: "github", size: 20 },
  { href: "https://www.linkedin.com/in/fal3n-4ngel/", src: "icons/linkedin.svg", alt: "linkedin", size: 20 },
  { href: "/Resume_Adithya_Krishnan.pdf", src: "icons/resume.svg", alt: "resume", size: 15 },
  { href: "mailto:hello@adithyakrishnan.com", src: "icons/mail.svg", alt: "mail", size: 20 },
] as const;

function externalProps(href: string) {
  return href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function NavLink({
  href,
  text,
  className = "",
  pulse = false,
}: {
  href: string;
  text: string;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <a
      href={href}
      className={`${LINK_BASE_CLASS} text-[2.5rem] md:text-[1vw] ${className} ${
        pulse ? "flex animate-pulse items-center justify-center px-4 py-1" : ""
      }`}
      {...externalProps(href)}
    >
      {text}
    </a>
  );
}

function IconLink({
  href,
  src,
  alt,
  size,
}: {
  href: string;
  src: string;
  alt: string;
  size: number;
}) {
  return (
    <a
      href={href}
      className={`${LINK_BASE_CLASS} text-[2.5rem] md:text-[1vw]`}
      {...externalProps(href)}
      aria-label={alt}
    >
      <Image src={`/${src}`} width={size} height={size} alt={alt} loading="eager" quality={90} />
    </a>
  );
}

export default function Navbar() {
  return (
    <nav
      className="z-[1] mx-auto mb-10 flex w-full items-center justify-between overflow-hidden bg-[#ececec] px-5 py-2 pt-5 dark:bg-transparent md:w-[80vw] md:bg-transparent md:px-2.5 md:pt-10"
      aria-label="Main navigation"
    >
      <a
        href="/"
        className={`${LINK_BASE_CLASS} text-[2rem] md:min-w-[100px] md:text-[1.5vw]`}
        aria-label="Home"
      >
        Adi.
      </a>

      {/* Desktop */}
      <div className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map(({ href, text, className, pulse }) => (
          <NavLink key={text} href={href} text={text} className={className} pulse={pulse} />
        ))}
      </div>

      {/* Mobile */}
      <div className="flex items-center gap-4 md:hidden">
        {MOBILE_ICONS.map(({ href, src, alt, size }) => (
          <IconLink key={alt} href={href} src={src} alt={alt} size={size} />
        ))}
      </div>

      {/* Email */}
      <div className="hidden items-center gap-2 md:flex">
        <a
          href="mailto:hello@adithyakrishnan.com"
          className={`${LINK_BASE_CLASS} mailLogo md:text-[1vw]`}
          aria-label="Email contact"
        >
          hello@adithyakrishnan.com
        </a>
      </div>
    </nav>
  );
}