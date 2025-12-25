import Image from "next/image";
import { memo } from "react";

const NavLink = memo(
  ({ href, text, className = "" }: { href: string; text: string; className?: string }) => (
    <a
      href={href}
      className={`font-poppins text-black transition-all duration-300 hover:opacity-25 dark:text-white ${className} text-[2.5rem] md:text-[1vw] ${
        text === "resume" ? "flex animate-pulse items-center justify-center px-4 py-1" : ""
      }`}
      {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {text}
    </a>
  )
);

NavLink.displayName = "NavLink";

const IconLink = memo(
  ({ href, src, alt, size }: { href: string; src: string; alt: string; size: number }) => (
    <a
      href={href}
      className={`font-poppins text-black transition-all duration-300 hover:opacity-25 dark:text-white ${
        alt === "resume" ? "resumeLogo" : ""
      } text-[2.5rem] md:text-[1vw]`}
      {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
      aria-label={alt}
    >
      <Image src={`/${src}`} width={size} height={size} alt={alt} loading="eager" quality={90} />
    </a>
  )
);

IconLink.displayName = "IconLink";

function Navbar() {
  const navLinks = [
    { href: "https://github.com/fal3n-4ngel", text: "github", className: "githubLogo" },
    {
      href: "https://www.linkedin.com/in/fal3n-4ngel/",
      text: "linkedin",
      className: "linkedinLogo",
    },
    { href: "/Resume Adithya Krishnan.pdf", text: "resume", className: "resumeLogo animate-pulse" },
  ];

  const mobileIcons = [
    { href: "https://github.com/fal3n-4ngel", src: "icons/github.svg", alt: "github", size: 20 },
    {
      href: "https://www.linkedin.com/in/fal3n-4ngel/",
      src: "icons/linkedin.svg",
      alt: "linkedin",
      size: 20,
    },
    { href: "/Resume Adithya Krishnan.pdf", src: "icons/resume.svg", alt: "resume", size: 15 },
    { href: "mailto:hello@adithyakrishnan.com", src: "icons/mail.svg", alt: "mail", size: 20 },
  ];

  return (
    <nav
      className="z-[1] mx-auto mb-10 flex w-full items-center justify-between overflow-hidden bg-[#ececec] px-5 py-2 pt-5 dark:bg-transparent md:w-[80vw] md:bg-transparent md:px-2.5 md:pt-10"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <a
        href="/"
        className="font-poppins text-[2rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:min-w-[100px] md:text-[1.5vw]"
        aria-label="Home"
      >
        Adi.
      </a>

      {/* Desktop Navigation */}
      <div className="hidden items-center gap-8 md:flex">
        {navLinks.map(({ href, text, className }) => (
          <NavLink key={text} href={href} text={text} className={className} />
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="flex items-center gap-4 md:hidden">
        {mobileIcons.map(({ href, src, alt, size }) => (
          <IconLink key={alt} href={href} src={src} alt={alt} size={size} />
        ))}
      </div>

      {/* Contact Email */}
      <div className="hidden items-center gap-2 md:flex">
        <a
          href="mailto:hello@adithyakrishnan.com"
          className="mailLogo font-poppins text-[2.5rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:text-[1vw]"
          aria-label="Email contact"
        >
          hello@adithyakrishnan.com
        </a>
      </div>
    </nav>
  );
}

export default memo(Navbar);
