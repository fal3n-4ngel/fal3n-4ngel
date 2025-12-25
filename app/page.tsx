/* eslint-disable @next/next/no-img-element */
"use client";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { useCallback, useMemo, useRef, useState } from "react";
import { createGhostVariants } from "./constants/animations";
import { useCustomCursor } from "./hooks/useCustomCursor";
import { useGhostEscape } from "./hooks/useGhostEscape";
import { useWindowDimensions } from "./hooks/useWindowDimensions";
import LoadingPage from "./loading";
import { useFollowPointer } from "./utils/FollowPointer";

// Dynamic imports for better code splitting
const Navbar = dynamic(() => import("./components/sections/Navbar"), {
  ssr: true,
});
const ProjectsWithSkills = dynamic(() => import("./components/sections/ProjectSectionWithSkills"), {
  ssr: false,
});
const ProjectSection = dynamic(() => import("./components/sections/ProjectSection"), {
  ssr: false,
});
const HeroSection = dynamic(
  () => import("./components/sections/HeroSection").then((mod) => ({ default: mod.HeroSection })),
  { ssr: true }
);
const Footer = dynamic(
  () => import("./components/sections/Footer").then((mod) => ({ default: mod.Footer })),
  { ssr: true }
);
const AboutSection = dynamic(
  () => import("./components/sections/AboutSection").then((mod) => ({ default: mod.AboutSection })),
  { ssr: true }
);

export default function Home() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);

  const [projImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Custom hooks
  const dimensions = useWindowDimensions();
  const { cursorState, logoStates, offset } = useCustomCursor();
  const { isEscaping, pathRef, triggerEscape, resetEscape } = useGhostEscape(x, y);

  const { isInteracting } = cursorState;
  const { isGitHubLogo, isLinkedInLogo, isResumeLogo, isMailLogo } = logoStates;

  // Memoized animation variants - update when path changes
  const ghostVariants = useMemo(
    () =>
      createGhostVariants(
        dimensions.width,
        dimensions.height,
        pathRef.current,
        x, // Start from current cursor position
        y
      ),
    [dimensions.width, dimensions.height, isEscaping, x, y]
  );

  const cursorClasses = useMemo(
    () =>
      `
    pointer-events-none z-[10000] hidden rounded-full bg-white md:flex
    ${
      !projImage
        ? "mix-blend-difference"
        : "scale-0 overflow-hidden opacity-0 transition-all duration-200"
    }
    ${isGitHubLogo || isLinkedInLogo || isResumeLogo || isMailLogo ? "animate-pulse" : "bg-white"}
  `.trim(),
    [projImage, isGitHubLogo, isLinkedInLogo, isResumeLogo, isMailLogo]
  );

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="h-full min-h-screen w-full bg-[#121212] text-white">
      <GoogleAnalytics trackPageViews />

      <AnimatePresence>
        {isLoading && <LoadingPage onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isEscaping && dimensions.width > 0 && (
          <motion.div
            className="fixed z-[9999]"
            initial="initial"
            animate={["breakFree", "escape"]}
            exit="exit"
            variants={ghostVariants}
          >
            <motion.img
              src="/ghostwhite.png"
              onClick={resetEscape}
              alt="Escaping Ghost"
              className="interactable h-28 w-28 cursor-pointer drop-shadow-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                filter: [
                  "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
                  "drop-shadow(0 0 20px rgba(255,255,255,0.6))",
                  "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
                ],
              }}
              transition={{
                filter: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "200px",
          width: "200px",
        }}
        animate={{
          x: x - offset,
          y: y - offset,
          width: `${isInteracting ? "200px" : "40px"}`,
          height: `${isInteracting ? "200px" : "40px"}`,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
          mass: 0.8,
        }}
        className={cursorClasses}
      >
        <motion.img
          src="/ghost.png"
          className={`z-[-1] h-full w-full object-contain ${isEscaping ? "hidden" : "flex"}`}
          alt=""
          animate={
            isInteracting
              ? {
                  opacity: [0.35, 0.5, 0.35],
                  scale: [1, 1.05, 1],
                }
              : { opacity: 0.35 }
          }
          transition={{
            duration: 1.5,
            repeat: isInteracting ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      <main
        className="flex min-h-screen w-full flex-col items-center justify-between overflow-x-hidden bg-[#ececec] text-black dark:bg-[#060606] dark:text-white"
        ref={ref}
      >
        <div className="fixed z-[10] w-full">
          <Navbar />
        </div>

        <HeroSection />

        <AboutSection
          isEscaping={isEscaping}
          triggerEscape={triggerEscape}
          resetEscape={resetEscape}
        />
        <section className="mx-auto my-20 hidden flex-col justify-center p-2 text-4xl font-light md:flex md:w-[75%] md:p-0">
          <ProjectsWithSkills />
        </section>
        <section className="mb-10 mt-20 flex flex-col justify-center text-4xl font-light md:hidden md:w-[75%]">
          <ProjectSection />
        </section>
        <Footer />
      </main>
    </div>
  );
}
