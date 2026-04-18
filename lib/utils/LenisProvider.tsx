"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";

interface LenisProviderProps {
  children: React.ReactNode;
}


export default function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.09,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <div data-lenis-prevent={false}>{children}</div>;
}
