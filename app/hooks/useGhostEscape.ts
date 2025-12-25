import { useCallback, useRef, useState } from "react";
import { Position } from "../types/position";
import { generateRandomPath } from "../utils/GenerateRandomPath";

export const useGhostEscape = (x: number, y: number) => {
  const [isEscaping, setIsEscaping] = useState(false);
  const pathRef = useRef<Position[]>([]);

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

  return { isEscaping, pathRef, triggerEscape, resetEscape };
};
