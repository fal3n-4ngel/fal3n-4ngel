import { useEffect, useState, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

export const useFollowPointer = (
  ref: React.RefObject<HTMLElement | null>,
): Position => {
  let xh = 0,
    yh = 0;
  if (typeof window !== "undefined") {
    xh = window.innerWidth / 2 - 50;
    yh = window.innerHeight / 2 - 50;
  }
  const [position, setPosition] = useState<Position>({ x: xh, y: yh });

  const lastUpdateRef = useCallback(() => {
    let lastUpdate = 0;
    const FRAME_RATE = 60; // 80Hz
    const FRAME_TIME = 1000 / FRAME_RATE; // ~12.5ms between updates

    return (e: MouseEvent) => {
      if (!ref.current) return;

      const now = performance.now();
      if (now - lastUpdate < FRAME_TIME) return;

      setPosition({
        x: e.clientX - 20,
        y: e.clientY - 20,
      });

      lastUpdate = now;
    };
  }, [ref]);

  useEffect(() => {
    const handleMouseMove = lastUpdateRef();
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lastUpdateRef]);

  return position;
};
