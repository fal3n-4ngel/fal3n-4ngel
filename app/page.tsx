"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useRef, useState, useCallback } from "react";
import LoadingPage from "./loading";


import { SectionTransition } from "@/components/ui/SectionTransition";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { useGhostEscape, useFollowPointer } from "@/hooks";

const Navbar = dynamic(() => import("@/components/layout/Navbar").then((mod) => ({ default: mod.Navbar })), {
  ssr: true,
});
const ProjectsSection = dynamic(() => import("@/components/sections/ProjectsSection"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/layout/Footer").then((mod) => ({ default: mod.Footer })), {
  ssr: true,
});
const AboutSection = dynamic(
  () => import("@/components/sections/AboutSection").then((mod) => ({ default: mod.AboutSection })),
  { ssr: true }
);


export default function Home() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);
  const [isLoading, setIsLoading] = useState(true);
  const { isEscaping, triggerEscape, resetEscape } = useGhostEscape(x, y);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="h-full min-h-screen w-full text-white">
      <AnimatePresence>
        {isLoading && <LoadingPage onComplete={handleLoadingComplete} />}
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



