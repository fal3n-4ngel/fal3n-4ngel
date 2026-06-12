"use client";
import { useGhostEscape } from "@/hooks/useGhostEscape";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";
import { createGhostVariants } from "@/lib/animations/animations";
import { useFollowPointer } from "@/lib/utils/FollowPointer";
import { CustomCursor } from "@/components/CustomCursor";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import LoadingPage from "./loading";

const Navbar = dynamic(() => import("@/sections/Navbar").then((mod) => ({ default: mod.Navbar })), {
  ssr: true,
});
const ProjectsWithSkills = dynamic(() => import("@/sections/ProjectSectionWithSkills"), {
  ssr: false,
});
const ProjectSection = dynamic(() => import("@/sections/ProjectSection"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/sections/Footer").then((mod) => ({ default: mod.Footer })), {
  ssr: true,
});
const AboutSection = dynamic(
  () => import("@/sections/AboutSection").then((mod) => ({ default: mod.AboutSection })),
  { ssr: true }
);

const MotionImage = motion.create(Image);

export default function Home() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);

  const [isLoading, setIsLoading] = useState(true);

  const dimensions = useWindowDimensions();
  const { isEscaping, pathRef, triggerEscape, resetEscape } = useGhostEscape(x, y);

  const ghostVariants = useMemo(
    () =>
      createGhostVariants(
        dimensions.width,
        dimensions.height,
        pathRef.current,
        x.get(),
        y.get()
      ),
    [dimensions.width, dimensions.height, isEscaping]
  );

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="h-full min-h-screen w-full bg-black text-white">
      <AnimatePresence>
        {isLoading && <LoadingPage onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isEscaping && dimensions.width > 0 && (
          <motion.div
            className="fixed z-[9999]"
            initial="initial"
            animate={["breakFree", "escape"]}
            exit="exit"
            variants={ghostVariants}
          >
            <MotionImage
              src="/ghostwhite.png"
              width={112}
              height={112}
              onClick={resetEscape}
              alt="Escaping Ghost"
              className="interactable h-28 w-28 cursor-pointer drop-shadow-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                filter: [
                  "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
                  "drop-shadow(0 0 20px rgba(255,255,255,0.6))",
                  "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
                ],
              }}
              transition={{
                filter: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>

      <CustomCursor x={x} y={y} isEscaping={isEscaping} />

      <main
        className="flex min-h-screen w-full flex-col items-center justify-between bg-black text-white selection:bg-white selection:text-black"
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

        <div id="projects" className="hidden w-full md:block">
          <ProjectsWithSkills />
        </div>

        <div id="projects-mobile" className="w-full md:hidden">
          <ProjectSection />
        </div>

        <Footer />
      </main>
    </div>
  );
}
