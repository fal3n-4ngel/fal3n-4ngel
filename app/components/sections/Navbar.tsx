import React from "react";
import Image from "next/image";

function Navbar() {
  const navLinks = [
    { href: "https://github.com/fal3n-4ngel", text: "github", className: "githubLogo" },
    { href: "https://www.linkedin.com/in/fal3n-4ngel/", text: "linkedin", className: "linkedinLogo" },
    { href: "/Resume Adithya Krishnan.pdf", text: "resume", className: "resumeLogo animate-pulse" }
  ];

  const mobileIcons = [
    { href: "https://github.com/fal3n-4ngel", src: "icons/github.svg", alt: "github", size: 20 },
    { href: "https://www.linkedin.com/in/fal3n-4ngel/", src: "icons/linkedin.svg", alt: "linkedin", size: 20 },
    { href: "/Resume Adithya Krishnan.pdf", src: "icons/resume.svg", alt: "resume", size: 15 },
    { href: "mailto:hello@adithyakrishnan.com", src: "icons/mail.svg", alt: "mail", size: 20 }
  ];

  const linkClasses = "font-poppins text-black transition-all duration-300 hover:opacity-25 dark:text-white";

  return (
    <nav className="z-[1] mx-auto mb-10 flex w-full items-center justify-between overflow-hidden bg-[#ececec] px-5 py-2 pt-5 dark:bg-transparent md:w-[80vw] md:bg-transparent md:px-2.5 md:pt-10">
      {/* Logo */}
      <a
        href="/"
        className={`${linkClasses} text-[2rem] md:min-w-[100px] md:text-[1.5vw]`}
      >
        Adi.
      </a>

      {/* Desktop Navigation */}
      <div className="hidden items-center gap-8 md:flex">
        {navLinks.map(({ href, text, className }) => (
          <a
            key={text}
            href={href}
            className={`${linkClasses} ${className} text-[2.5rem] md:text-[1vw] ${
              text === "resume" ? "flex animate-pulse items-center justify-center px-4 py-1" : ""
            }`}
          >
            {text}
          </a>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="flex items-center gap-4 md:hidden">
        {mobileIcons.map(({ href, src, alt, size }) => (
          <a
            key={alt}
            href={href}
            className={`${linkClasses} ${alt === "resume" ? "resumeLogo" : ""} text-[2.5rem] md:text-[1vw]`}
          >
            <Image src={src} width={size} height={size} alt={alt} />
          </a>
        ))}
      </div>

      {/* Contact Email */}
      <div className="hidden items-center gap-2 md:flex">
        <a
          href="mailto:hello@adithyakrishnan.com"
          className={`${linkClasses} mailLogo text-[2.5rem] md:text-[1vw]`}
        >
          hello@adithyakrishnan.com
        </a>
      </div>
    </nav>
  );
}

export default Navbar;