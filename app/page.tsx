"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingPage from "./loading";

import { CustomCursor } from "@/components/layout/CustomCursor";
import { SectionTransition } from "@/components/ui/SectionTransition";
import { useFollowPointer, useGhostEscape } from "@/hooks";
import { getProjects } from "@/lib/integrations/notion";
import { preloadImages } from "@/lib/preload-images";

// Hard cap so a slow network or a stalled Notion fetch can't hold the
// loading screen forever — after this we reveal the page regardless.
const PRELOAD_TIMEOUT_MS = 4000;

const Navbar = dynamic(
  () => import("@/components/layout/Navbar").then((mod) => ({ default: mod.Navbar })),
  {
    ssr: true,
  }
);
const ProjectsSection = dynamic(() => import("@/components/sections/ProjectsSection"), {
  ssr: false,
});
const Footer = dynamic(
  () => import("@/components/layout/Footer").then((mod) => ({ default: mod.Footer })),
  {
    ssr: true,
  }
);
const AboutSection = dynamic(
  () => import("@/components/sections/AboutSection").then((mod) => ({ default: mod.AboutSection })),
  { ssr: true }
);

export default function Home() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);
  const [isLoading, setIsLoading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const { isEscaping, triggerEscape, resetEscape } = useGhostEscape(x, y);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Warm the browser's cache for every live project cover image (Notion/Blob
  // URLs) while the loading screen is up, so the Projects section never
  // shows a bare pop-in when the user scrolls to it later.
  useEffect(() => {
    let cancelled = false;
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      if (!cancelled) setPreloadProgress(100);
    }, PRELOAD_TIMEOUT_MS);

    (async () => {
      let urls: string[] = [];
      try {
        const liveProjects = await getProjects();
        urls = liveProjects?.map((p) => p.url1) ?? [];
      } catch {
        // No live data — nothing to preload, page renders with whatever the
        // section falls back to.
      }

      if (cancelled || timedOut) return;

      await preloadImages(urls, ({ loaded, total }) => {
        if (!cancelled && !timedOut) {
          setPreloadProgress(total === 0 ? 100 : Math.round((loaded / total) * 100));
        }
      });
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="h-full min-h-screen w-full text-white">
      <AnimatePresence>
        {isLoading && <LoadingPage onComplete={handleLoadingComplete} progress={preloadProgress} />}
      </AnimatePresence>

      <CustomCursor x={x} y={y} isEscaping={isEscaping} />

      <main
        className="flex min-h-screen w-full flex-col items-center justify-between text-white selection:bg-white selection:text-black"
        ref={ref}
      >
        <Navbar />

        <div id="about" className="w-full">
          <AboutSection
            isEscaping={isEscaping}
            triggerEscape={triggerEscape}
            resetEscape={resetEscape}
          />
        </div>

        <SectionTransition id="projects" direction="up" className="w-full" distance={50}>
          <ProjectsSection />
        </SectionTransition>

        <SectionTransition direction="up" delay={0.1} className="w-full" distance={30}>
          <Footer />
        </SectionTransition>
      </main>
    </div>
  );
}
