"use client";

import { CursorState, LogoStates } from "@/types";
import { motion, MotionValue, useMotionValue, useSpring } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";

type CustomCursorProps = {
  x?: MotionValue<number>;
  y?: MotionValue<number>;
};

export const CustomCursor: React.FC<CustomCursorProps> = ({ x, y }) => {
  const fallbackX = useMotionValue(-100);
  const fallbackY = useMotionValue(-100);
  const targetX = x ?? fallbackX;
  const targetY = y ?? fallbackY;

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
    if (!x) fallbackX.set(e.clientX);
    if (!y) fallbackY.set(e.clientY);

    const targetElement = e.target as HTMLElement;
    if (!targetElement) return;

    const isGitHub = !!targetElement.closest(".githubLogo");
    const isLinkedIn = !!targetElement.closest(".linkedinLogo");
    const isResume = !!targetElement.closest(".resumeLogo");
    const isMail = !!targetElement.closest(".mailLogo");
    const isProj = !!targetElement.closest(".projImg");
    const isLinkOrBtn = !!targetElement.closest("a, button, [role='button']");
    const isInteractable = !!targetElement.closest(".interactable") || isLinkOrBtn;

    const interactionType = isProj ? "project" : null;
    const isInteractingVal = isProj || isInteractable || isGitHub || isLinkedIn || isResume || isMail;

    setCursorState((prev) => {
      if (
        prev.isInteracting === isInteractingVal &&
        prev.interactionType === interactionType
      ) {
        return prev;
      }

      if (typeof window !== "undefined") {
        if (!prev.isInteracting && isInteractingVal) {
          window.dispatchEvent(
            new CustomEvent("cursor-interact", {
              detail: { isInteracting: true, interactionType },
            })
          );
        } else if (prev.isInteracting && !isInteractingVal) {
          window.dispatchEvent(
            new CustomEvent("cursor-interact", {
              detail: { isInteracting: false, interactionType: null },
            })
          );
        }
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
  }, [x, y, fallbackX, fallbackY]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      window.dispatchEvent(
        new CustomEvent("cursor-click", {
          detail: { x: e.clientX, y: e.clientY },
        })
      );
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleMouseMove]);

  const springConfig = { damping: 25, stiffness: 180, mass: 0.4 };
  const xSpring = useSpring(targetX, springConfig);
  const ySpring = useSpring(targetY, springConfig);

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
        width: isInteracting ? (cursorState.interactionType === "project" ? "72px" : "56px") : "14px",
        height: isInteracting ? (cursorState.interactionType === "project" ? "72px" : "56px") : "14px",
      }}
      transition={{
        type: "spring",
        damping: 24,
        stiffness: 220,
        mass: 0.3,
      }}
      className={cursorClasses}
    />
  );
};
