"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingPage from "./loading";

import { CustomCursor } from "@/components/layout/CustomCursor";
import { StickySubHeader } from "@/components/layout/StickySubHeader";
import { HeroGhostSection } from "@/components/sections/HeroGhostSection";
import { useFollowPointer, useGhostEscape } from "@/hooks";
import { getProjects } from "@/lib/integrations/notion";
import { preloadImages } from "@/lib/preload-images";

const PRELOAD_TIMEOUT_MS = 3000;

const ProjectsSection = dynamic(() => import("@/components/sections/ProjectsSection"), {
  ssr: false,
});
const AchievementsSection = dynamic(
  () => import("@/components/sections/AchievementsSection").then((mod) => mod.AchievementsSection),
  { ssr: false }
);
const ContactSection = dynamic(
  () => import("@/components/sections/ContactSection").then((mod) => mod.ContactSection),
  { ssr: false }
);
const AsciiTextCanvas = dynamic(
  () => import("@/components/features/AsciiTextCanvas").then((mod) => mod.AsciiTextCanvas),
  { ssr: false }
);
const Footer = dynamic(
  () => import("@/components/layout/Footer").then((mod) => ({ default: mod.Footer })),
  { ssr: true }
);

export default function Home() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);
  const [isLoading, setIsLoading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const { isEscaping } = useGhostEscape(x, y);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

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
        // Fallback
      }

      if (cancelled) return;

      // Continue loading images in the background even after page load!
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
    <div className="h-full min-h-screen w-full bg-black text-white selection:bg-white selection:text-black">
      <AnimatePresence>
        {isLoading && <LoadingPage onComplete={handleLoadingComplete} progress={preloadProgress} />}
      </AnimatePresence>

      <CustomCursor x={x} y={y} isEscaping={isEscaping} />

      {/* Sticky Secondary Top Bar matching Image 2 */}
      <StickySubHeader />

      <main className="flex min-h-screen w-full flex-col items-center bg-black" ref={ref}>
        {/* Section 1: Hero with 3D Chrome Ghost & Typography (Image 1) */}
        <HeroGhostSection />

        {/* Section 2: Achievements with Experience, Skills & Languages (Images 2 & 3) */}
        <AchievementsSection />

        {/* Section 3: Projects Section */}
        <ProjectsSection />

        {/* Section 4: Contact with Email Typography and Actions (Image 4) */}
        <ContactSection />

        {/* Section 5: Interactive ASCII Text Physics Animation (Images 1-4) */}
        <AsciiTextCanvas />

        {/* Section 6: Footer with Navigation and Contact Columns (Image 5) */}
        <Footer />
      </main>
    </div>
  );
}
