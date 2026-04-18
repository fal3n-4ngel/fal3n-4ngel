import { motion } from "framer-motion";

export const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="interactable fixed top-0 z-50 w-full px-12 py-10 mix-blend-difference md:py-5 md:pt-[10vh]"
    >
      <div className="mx-auto flex w-full max-w-6xl justify-between">
        <div className="font-space font-mono text-4xl font-light tracking-wider text-white/90">
          Adi.
        </div>
        <div className="hidden items-center gap-10 font-mono text-base tracking-[0.15em] text-white/60 md:flex md:gap-16 md:text-[18px]">
          <a
            href="/Resume Adithya Krishnan.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-300 hover:text-white"
          >
            resume
          </a>
          <a
            href="mailto:hello@adithyakrishnan.com"
            className="transition-colors duration-300 hover:text-white"
          >
            hello@adithyakrishnan.com
          </a>
        </div>
      </div>
    </motion.nav>
  );
};
