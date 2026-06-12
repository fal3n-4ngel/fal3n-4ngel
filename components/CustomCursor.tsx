"use client";

import { CursorState, LogoStates } from "@/types";
import { motion, MotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

type CustomCursorProps = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  isEscaping?: boolean;
};

export const CustomCursor: React.FC<CustomCursorProps> = ({
  x,
  y,
  isEscaping = false,
}) => {
  const [cursorState, setCursorState] = useState<CursorState>({
    isInteracting: false,
    interactionType: null,
  });

  const [logoStates, setLogoStates] = useState<LogoStates>({
    isGitHubLogo: false,
    isLinkedInLogo: false,
    isResumeLogo: false,
    isMailLogo: false,
    isProjImage: false,
  });

  const { isInteracting } = cursorState;
  const { isGitHubLogo, isLinkedInLogo, isResumeLogo, isMailLogo } = logoStates;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const targetElement = e.target as HTMLElement;
    if (!targetElement) return;

    // Detect if we are hovering over specific interactive classes
    const isGitHub = !!targetElement.closest(".githubLogo");
    const isLinkedIn = !!targetElement.closest(".linkedinLogo");
    const isResume = !!targetElement.closest(".resumeLogo");
    const isMail = !!targetElement.closest(".mailLogo");
    const isProj = !!targetElement.closest(".projImg");
    const isInteractable = !!targetElement.closest(".interactable");

    const interactionType = isProj ? "project" : null;
    const isInteractingVal = isProj || isInteractable || isGitHub || isLinkedIn || isResume || isMail;

    // Optimize state setting to prevent re-renders unless the actual hover target category changes
    setCursorState((prev) => {
      if (
        prev.isInteracting === isInteractingVal &&
        prev.interactionType === interactionType
      ) {
        return prev;
      }
      return { isInteracting: isInteractingVal, interactionType };
    });

    setLogoStates((prev) => {
      if (
        prev.isGitHubLogo === isGitHub &&
        prev.isLinkedInLogo === isLinkedIn &&
        prev.isResumeLogo === isResume &&
        prev.isMailLogo === isMail &&
        prev.isProjImage === isProj
      ) {
        return prev;
      }
      return {
        isGitHubLogo: isGitHub,
        isLinkedInLogo: isLinkedIn,
        isResumeLogo: isResume,
        isMailLogo: isMail,
        isProjImage: isProj,
      };
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  // Spring physics setup for smooth tracking
  const springConfig = { damping: 25, stiffness: 180, mass: 0.4 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const cursorClasses = `pointer-events-none z-[10000] hidden rounded-full bg-white md:flex fixed left-0 top-0 mix-blend-difference ${
    isGitHubLogo || isLinkedInLogo || isResumeLogo || isMailLogo ? "animate-pulse" : ""
  }`.trim();

  return (
    <motion.div
      style={{
        x: xSpring,
        y: ySpring,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        width: isInteracting ? "200px" : "40px",
        height: isInteracting ? "200px" : "40px",
      }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 100,
        mass: 0.5,
      }}
      className={cursorClasses}
    >
      <motion.div
        className="relative h-full w-full"
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
      >
        <Image
          src="/ghost.png"
          fill
          sizes="(max-width: 768px) 0px, 200px"
          className={`z-[-1] object-contain p-[15%] transition-opacity duration-300 ${
            isEscaping ? "opacity-0" : "opacity-100"
          }`}
          alt=""
          priority
        />
      </motion.div>
    </motion.div>
  );
};
