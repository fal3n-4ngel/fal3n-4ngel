"use client";

import React, { useEffect, useRef } from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import type Lenis from "lenis";
import { cancelFrame, frame } from "framer-motion";
import { usePathname } from "next/navigation";

export { useLenis };

interface LenisProviderProps {
  children: React.ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  // Synchronize Lenis with Framer Motion's unified animation loop
  useEffect(() => {
    function update(data: { timestamp?: number } | number) {
      const time =
        typeof data === "object" && data?.timestamp
          ? data.timestamp
          : performance.now();
      lenisRef.current?.lenis?.raf(time);
    }

    // Bind Lenis raf to Framer Motion's frame.update recurring ticker
    frame.update(update, true);

    return () => {
      cancelFrame(update);
    };
  }, []);

  // Expose global window.lenis for existing utilities and components
  useEffect(() => {
    const lenisInstance = lenisRef.current?.lenis;
    if (lenisInstance && typeof window !== "undefined") {
      (window as unknown as { lenis?: Lenis }).lenis = lenisInstance;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as unknown as { lenis?: Lenis }).lenis;
      }
    };
  }, []);

  // Handle route transitions & hash navigation with stopInertiaOnNavigate
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isFirstMount.current) {
      isFirstMount.current = false;

      // If initial URL has a hash (e.g. #projects), scroll to it once fonts and layout are fully ready
      if (window.location.hash) {
        const hash = window.location.hash;
        const syncHash = () => {
          lenisRef.current?.lenis?.resize();
          lenisRef.current?.lenis?.scrollTo(hash, { immediate: true });
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
      lenisRef.current?.lenis?.scrollTo(window.location.hash, { immediate: true });
      return;
    }

    lenisRef.current?.lenis?.scrollTo(0, { immediate: true });
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
        if (lenisRef.current?.lenis) {
          e.preventDefault();
          lenisRef.current.lenis.scrollTo(href, { duration: 1.1 });
          window.history.pushState(null, "", href);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      autoRaf={false}
      options={{
        lerp: 0.09,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.4,
        syncTouch: false,
        autoResize: true,
        autoToggle: true,
        anchors: true,
        stopInertiaOnNavigate: true,
        allowNestedScroll: true,
        overscroll: true,
      }}
    >
      <div data-lenis-prevent={false}>{children}</div>
    </ReactLenis>
  );
}
