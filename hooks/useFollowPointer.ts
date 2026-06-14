import { useMotionValue, MotionValue } from "framer-motion";
import { useEffect } from "react";

export interface FollowPointerResult {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

export const useFollowPointer = (
  ref?: React.RefObject<HTMLElement | null>
): FollowPointerResult => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    x.set(window.innerWidth / 2);
    y.set(window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      if (ref && !ref.current) return;
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [ref, x, y]);

  return { x, y };
};
