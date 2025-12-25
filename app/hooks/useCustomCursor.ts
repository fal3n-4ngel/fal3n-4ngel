import { useCallback, useEffect, useState } from "react";
import { CursorState, LogoStates } from "../types/states";

type InteractionType = "github" | "linkedin" | "resume" | "mail" | "project" | null;

export const useCustomCursor = () => {
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
