import { useCallback, useRef, useState } from "react";
import { Position } from "@/types/position";
import { generateRandomPath } from "@/lib/utils/GenerateRandomPath";
import { MotionValue } from "framer-motion";

export const useGhostEscape = (x: MotionValue<number>, y: MotionValue<number>) => {
  const [isEscaping, setIsEscaping] = useState(false);
  const pathRef = useRef<Position[]>([]);

  const triggerEscape = useCallback(() => {
    if (!isEscaping) {
      pathRef.current = generateRandomPath(
        { x: x.get(), y: y.get() },
        { width: window.innerWidth, height: window.innerHeight }
      );
      setIsEscaping(true);
      window.dispatchEvent(new CustomEvent("ghost-escape", { detail: { escaping: true } }));
    }
  }, [isEscaping, x, y]);

  const resetEscape = useCallback(() => {
    setIsEscaping(false);
    window.dispatchEvent(new CustomEvent("ghost-escape", { detail: { escaping: false } }));
  }, []);

  return { isEscaping, pathRef, triggerEscape, resetEscape };
};
