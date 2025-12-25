/* eslint-disable @next/next/no-img-element */
"use client";
import { AnimatePresence, motion, Variants } from "framer-motion";
import dynamic from "next/dynamic";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LoadingPage from "./loading";
import { Dimensions } from "./types/dimensions";
import { Position } from "./types/position";
import { CursorState, LogoStates } from "./types/states";
import { useFollowPointer } from "./utils/FollowPointer";
import { generateRandomPath } from "./utils/GenerateRandomPath";

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

type InteractionType = "github" | "linkedin" | "resume" | "mail" | "project" | null;

const useCustomCursor = () => {
  const [cursorState, setCursorState] = useState<CursorState>({
    isInteracting: false,
    interactionType: null,
  });

  const [offset, setOffset] = useState(0);
  const [logoStates, setLogoStates] = useState<LogoStates>({
    isGitHubLogo: false,
    isLinkedInLogo: false,
    isResumeLogo: false,
    isMailLogo: false,
    isProjImage: false,
  });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const targetElement = e.target as HTMLElement;

    const getInteractionType = (): InteractionType => {
      if (targetElement.closest(".projImg")) return "project";
      return null;
    };

    const interactionType = getInteractionType();
    const isInteracting = !!interactionType || !!targetElement.closest(".interactable");

    setCursorState({ isInteracting, interactionType });

    setLogoStates({
      isGitHubLogo: !!targetElement.closest(".githubLogo"),
      isLinkedInLogo: !!targetElement.closest(".linkedinLogo"),
      isResumeLogo: !!targetElement.closest(".resumeLogo"),
      isMailLogo: !!targetElement.closest(".mailLogo"),
      isProjImage: !!targetElement.closest(".projImg"),
    });

    setOffset(isInteracting ? 70 : 0);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return { cursorState, logoStates, offset };
};

export default function Home() {
  const ref = useRef(null);
  const pathRef = useRef<Position[]>([]);
  const { x, y } = useFollowPointer(ref);

  const [projImage] = useState(false);
  const [isEscaping, setIsEscaping] = useState(false);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const { cursorState, logoStates, offset } = useCustomCursor();
  const { isInteracting } = cursorState;
  const { isGitHubLogo, isLinkedInLogo, isResumeLogo, isMailLogo } = logoStates;

  // Single unified effect for dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Handlers
  const triggerEscape = useCallback(() => {
    if (!isEscaping) {
      pathRef.current = generateRandomPath(
        { x, y },
        { width: window.innerWidth, height: window.innerHeight }
      );
      setIsEscaping(true);
    }
  }, [isEscaping, x, y]);

  const resetEscape = useCallback(() => {
    setIsEscaping(false);
  }, []);

  // Memoized animation variants
  const ghostVariants: Variants = useMemo(
    () => ({
      initial: {
        x: dimensions.width / 2,
        y: dimensions.height / 2,
        scale: 0.2,
        opacity: 0,
      },
      breakFree: {
        scale: 1,
        opacity: 1,
        transition: { duration: 2, ease: "easeOut" },
      },
      escape: {
        x: pathRef.current.map((p) => p.x),
        y: pathRef.current.map((p) => p.y),
        rotate: [0, 25, -10, 5, 0, 35, -10, -5, 0, 15, -10, 0, 0, 5, -10, 0],
        scale: [1, 1.1, 0.9, 1],
        transition: {
          duration: 60,
          ease: "easeInOut",
          repeat: Infinity,
        },
      },
      exit: {
        opacity: 0,
        scale: 0,
        transition: { duration: 0.5 },
      },
    }),
    [dimensions.width, dimensions.height]
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

      <AnimatePresence>
        {isEscaping && dimensions.width > 0 && (
          <motion.div
            className="interactable fixed z-10"
            initial="initial"
            animate={["breakFree", "spin", "escape"]}
            exit="exit"
            variants={ghostVariants}
          >
            <img
              src="/ghostwhite.png"
              onClick={resetEscape}
              alt="Escaping Ghost"
              className="interactable h-28 w-28 opacity-90"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{
          position: "fixed",
          top: "0%",
          left: "0%",
          height: "200px",
          width: "200px",
        }}
        animate={{
          x: x - offset,
          y: y - offset,
          top: 0,
          left: 0,
          width: `${isInteracting ? "200px" : "40px"}`,
          height: `${isInteracting ? "200px" : "40px"}`,
        }}
        className={cursorClasses}
      >
        <img
          src="/ghost.png"
          className={`z-[-1] opacity-[35%] ${isEscaping ? "hidden" : "flex"}`}
          alt=""
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
