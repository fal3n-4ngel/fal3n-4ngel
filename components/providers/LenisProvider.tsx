"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface LenisProviderProps {
  children: React.ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.11,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5,
      syncTouch: false,
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;
    if (typeof window !== "undefined") {
      (window as unknown as { lenis?: Lenis }).lenis = lenis;
    }

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
      if (typeof window !== "undefined") {
        delete (window as unknown as { lenis?: Lenis }).lenis;
      }
    };
  }, []);

  const isFirstMount = useRef(true);

  // Handle route changes and initial hash navigation
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isFirstMount.current) {
      isFirstMount.current = false;

      // If initial URL has a hash (e.g. #projects), scroll to it once fonts and layout are fully ready
      if (window.location.hash) {
        const hash = window.location.hash;
        const syncHash = () => {
          lenisRef.current?.resize();
          lenisRef.current?.scrollTo(hash, { immediate: true });
        };

        if (typeof document !== "undefined" && (document as any).fonts?.ready) {
          (document as any).fonts.ready.then(() => {
            requestAnimationFrame(syncHash);
          });
        }
        const t1 = setTimeout(syncHash, 150);
        const t2 = setTimeout(syncHash, 400);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
      return;
    }

    // Actual pathname route transition (not initial load)
    if (window.location.hash) {
      lenisRef.current?.scrollTo(window.location.hash, { immediate: true });
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  // Smooth scroll for in-page anchor links (e.g. <a href="#projects">)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        if (lenisRef.current) {
          e.preventDefault();
          lenisRef.current.scrollTo(href, { duration: 1.1 });
          window.history.pushState(null, "", href);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return <div data-lenis-prevent={false}>{children}</div>;
}
