"use client";

import { projects as fallbackProjects, projectSkills } from "@/data/projects";
import { getProjects } from "@/lib/integrations/notion";
import { Project } from "@/types/projects";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const PROJECT_BACKGROUNDS = [
  "/editorial/bg-limestone.jpg",   // 0: Warm travertine limestone & olive branch shadow (Continuum Home)
  "/editorial/bg-slate.jpg",       // 1: Minimalist brutalist slate concrete (DASH)
  "/editorial/bg-terracotta.jpg",  // 2: Rustic terracotta Italian facade with green shutters (Modevelle style)
  "/editorial/bg-butterfly.jpg",   // 3: Swallowtail butterfly on yellow flower petals (Roshan Sahu style)
];

const PROJECT_GRADIENTS = [
  "bg-gradient-to-br from-[#801b1b] via-[#5c1313] to-[#2b0808]", // 0: Crimson / Terracotta
  "bg-gradient-to-br from-[#8c6b1b] via-[#5a430d] to-[#291e04]", // 1: Golden Amber / Ochre
  "bg-gradient-to-br from-[#1e3a5f] via-[#12253f] to-[#08111e]", // 2: Steel Cobalt / Deep Twilight
  "bg-gradient-to-br from-[#1c4031] via-[#10271e] to-[#07130e]", // 3: Alpine Emerald / Forest
  "bg-gradient-to-br from-[#4a2840] via-[#2f1929] to-[#160a13]", // 4: Deep Mulberry / Plum
  "bg-gradient-to-br from-[#733d22] via-[#4d2714] to-[#241107]", // 5: Burnt Clay / Sienna
  "bg-gradient-to-br from-[#2b333e] via-[#1a2027] to-[#0c0f13]", // 6: Slate Graphite / Minimalist Titanium
  "bg-gradient-to-br from-[#1d4444] via-[#112a2a] to-[#071313]", // 7: Deep Pine / Teal
  "bg-gradient-to-br from-[#403828] via-[#2a2418] to-[#120f09]", // 8: Warm Sand / Raw Linen
  "bg-gradient-to-br from-[#2e233c] via-[#1d1627] to-[#0c0911]", // 9: Obsidian Violet / Indigo
];

const SCALE_X_MIN = 0.68; // width scale when not focused (noticeably more compact)
const SCALE_Y_MIN = 0.48; // height scale when not focused (clearly secondary)

function getCardScaleY(idx: number, p: number): number {
  const d = Math.abs(idx - p);
  if (d >= 1.0) return SCALE_Y_MIN;
  return 1.0 - d * (1.0 - SCALE_Y_MIN);
}

function getCardScaleX(idx: number, p: number): number {
  const d = Math.abs(idx - p);
  if (d >= 1.0) return SCALE_X_MIN;
  return 1.0 - d * (1.0 - SCALE_X_MIN);
}

const ProjectImage: React.FC<{
  src: string;
  name: string;
  type: string;
  priority?: boolean;
}> = ({ src, name, type, priority }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);

    if (src && typeof window !== "undefined") {
      const img = new window.Image();
      img.onload = () => setLoaded(true);
      img.onerror = () => setError(true);
      img.src = src;
    }
  }, [src]);

  if (error || !src) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-black/60 backdrop-blur-md border border-white/10 rounded-sm">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">{type}</span>
        <span className="mt-2 text-xl font-light text-white">{name}</span>
        <span className="mt-1 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
          Preview unavailable
        </span>
      </div>
    );
  }

  return (
    <div className="relative inline-block shadow-[0_24px_70px_rgba(0,0,0,0.55)] rounded-sm overflow-hidden border border-black/15 dark:border-white/20">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <span className="h-4 w-4 border border-white/20 border-t-white animate-spin" />
        </div>
      )}

      <img
        src={src}
        alt={name}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`max-w-[85vw] sm:max-w-[70vw] md:max-w-[54vw] lg:max-w-[56vw] xl:max-w-[58vw] max-h-[58vh] sm:max-h-[64vh] w-auto h-auto object-contain block transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};


function getCardY(
  idx: number,
  p: number,
  cardHeight: number,
  windowHeight: number,
  total: number
): number {
  const m = Math.min(Math.max(0, Math.floor(p)), Math.max(0, total - 2));
  const t = p - m;

  // Viewport center where the focused card rests
  const screenCenter = windowHeight / 2;
  // When p = 0: top edge touches 0px, so center is cardHeight / 2
  const startCenter = cardHeight / 2;
  // When p = total - 1: bottom edge touches windowHeight, so center is windowHeight - cardHeight / 2
  const endCenter = windowHeight - cardHeight / 2;

  let focusCenter = screenCenter;
  if (p < 1.0) {
    focusCenter = startCenter + p * (screenCenter - startCenter);
  } else if (p > total - 2) {
    focusCenter = screenCenter + (p - (total - 2)) * (endCenter - screenCenter);
  }

  // To guarantee IDENTICALLY 0.0px gap between scaled cards, the distance between
  // consecutive card centers MUST strictly equal ((s_k + s_{k+1}) / 2) * cardHeight.
  const sM = getCardScaleY(m, p);
  const sM1 = getCardScaleY(m + 1, p);
  const deltaM = ((sM + sM1) / 2) * cardHeight;

  // Center of card m interpolates from focusCenter (at t = 0) to (focusCenter - deltaM) (at t = 1)
  const centerM = focusCenter - t * deltaM;

  if (idx === m) {
    return centerM - cardHeight / 2;
  }

  if (idx > m) {
    let curCenter = centerM;
    for (let j = m; j < idx; j++) {
      const sA = getCardScaleY(j, p);
      const sB = getCardScaleY(j + 1, p);
      curCenter += ((sA + sB) / 2) * cardHeight;
    }
    return curCenter - cardHeight / 2;
  } else {
    let curCenter = centerM;
    for (let j = m; j > idx; j--) {
      const sA = getCardScaleY(j, p);
      const sB = getCardScaleY(j - 1, p);
      curCenter -= ((sA + sB) / 2) * cardHeight;
    }
    return curCenter - cardHeight / 2;
  }
}

const SemiCircleScrollCard: React.FC<{
  project: Project;
  idx: number;
  total: number;
  progress: ReturnType<typeof useTransform<number, number>>;
  cardHeight: number;
  windowHeight: number;
  shouldReduceMotion: boolean | null;
  onSelect: (idx: number) => void;
}> = ({ project, idx, total, progress, cardHeight, windowHeight, shouldReduceMotion, onSelect }) => {
  // Pure 2D Flat Motion: continuous contiguous stack with ZERO gaps at all times
  const y = useTransform(progress, (p) => getCardY(idx, p, cardHeight, windowHeight, total));
  const scaleX = useTransform(progress, (p) => getCardScaleX(idx, p));
  const scaleY = useTransform(progress, (p) => getCardScaleY(idx, p));

  // Subtle parallax between the inner preview box, the backdrop, and the card wrapper
  const innerParallaxY = useTransform(progress, (p) => (idx - p) * 34);
  const bgParallaxY = useTransform(progress, (p) => (p - idx) * 16);

  // Text is tied directly to this card: fades in as card enters center, fades out as card leaves
  const textOpacity = useTransform(progress, (p) => {
    const d = Math.abs(idx - p);
    if (d <= 0.45) return 1;
    if (d >= 0.85) return 0;
    return 1 - (d - 0.45) / (0.85 - 0.45);
  });

  const textPointerEvents = useTransform(progress, (p) =>
    Math.abs(idx - p) <= 0.5 ? "auto" : "none"
  );

  // Z-index: center card always on top, smooth stacking
  const zIndex = useTransform(progress, (p) => {
    const d = Math.abs(idx - p);
    return Math.round(50 - d * 20);
  });

  const defaultSkills = ["Next.js", "Full Stack"];
  const rawSkills =
    project?.skills && project.skills.length > 0
      ? project.skills
      : (project?.name && projectSkills[project.name]) || defaultSkills;
  const skills = Array.from(new Set(rawSkills));

  const projectType = project.type || "WEBSITE";
  const isGithub = project.view?.includes("github.com");
  const bgGradient = PROJECT_GRADIENTS[idx % PROJECT_GRADIENTS.length];
  const bgImage = PROJECT_BACKGROUNDS[idx % PROJECT_BACKGROUNDS.length] || "/editorial/bg-limestone.jpg";

  return (
    <motion.div
      style={
        shouldReduceMotion
          ? { zIndex }
          : {
              y,
              zIndex,
            }
      }
      className="absolute top-0 right-0 flex items-center justify-end pr-0 pointer-events-auto"
    >
      {/* ── Minimal Project Details (Matching Reference Style) ── */}
      <motion.div
        style={{
          opacity: shouldReduceMotion ? 1 : textOpacity,
          pointerEvents: (shouldReduceMotion ? "auto" : textPointerEvents) as any,
        }}
        className="hidden md:flex flex-col justify-center w-[260px] lg:w-[320px] xl:w-[360px] shrink-0 pr-6 lg:pr-8 xl:pr-10 z-20 select-text"
      >
        {/* Title [OPEN] */}
        <h3 className="text-3xl sm:text-4xl lg:text-[42px] font-light uppercase tracking-tight text-white leading-tight flex items-baseline gap-2 mb-2">
          <a
            href={project.view || "https://github.com/fal3n-4ngel"}
            target="_blank"
            rel="noopener noreferrer"
            className="interactable hover:text-zinc-300 transition-colors"
          >
            {project.name}
          </a>
          <span className="font-mono text-[10px] sm:text-xs tracking-widest text-zinc-500 font-light">
            [OPEN]
          </span>
        </h3>

        {/* Stack / Category */}
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          <span>{skills.slice(0, 3).join(", ")}</span>
        </div>

        {/* Role */}
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mt-1">
          <span>ROLE: {projectType.toUpperCase()}</span>
        </div>
      </motion.div>

      {/* ── Big Project Image Card (Touching Right Edge) ── */}
      <motion.div
        onClick={() => onSelect(idx)}
        style={
          shouldReduceMotion
            ? { height: `${cardHeight}px` }
            : {
                scaleX,
                scaleY,
                height: `${cardHeight}px`,
              }
        }
        className="w-[95vw] sm:w-[92vw] md:w-[68vw] lg:w-[72vw] xl:w-[75vw] 2xl:w-[76vw] max-w-[1550px] origin-right cursor-pointer select-none shrink-0"
      >
        <div
          className={`group relative w-full h-full ${bgGradient} border-l border-white/20 overflow-hidden flex items-center justify-center p-4 sm:p-7 lg:p-12 transition-all duration-300`}
        >
          {/* Editorial Photographic Backdrop with subtle counter parallax */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : bgParallaxY,
              scale: 1.1,
            }}
            className="absolute inset-0 z-0 overflow-hidden"
          >
            <Image
              src={bgImage}
              alt="Project Background"
              fill
              priority={idx < 3}
              sizes="(max-width: 1024px) 95vw, 80vw"
              className="object-cover object-center"
            />
          </motion.div>

          {/* Website Preview Image with vertical parallax, unclipped, zero black bars */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : innerParallaxY,
            }}
            className="relative z-10 flex items-center justify-center pointer-events-auto"
          >
            <ProjectImage
              src={project.url1}
              name={project.name}
              type={projectType}
              priority={idx < 3}
            />
          </motion.div>

          {/* Direct Action Pill on Hover */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 border border-white/25 bg-black/90 px-3 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
            <span>{isGithub ? "View Code" : "Open Project"}</span>
            <span className="text-zinc-400">→</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ProjectsSection: React.FC<{ initialProjects?: Project[] }> = ({
  initialProjects,
}) => {
  const [projectList, setProjectList] = useState<Project[]>(
    initialProjects && initialProjects.length > 0 ? initialProjects : fallbackProjects
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [cardHeight, setCardHeight] = useState(600);
  const [windowHeight, setWindowHeight] = useState(900);
  const shouldReduceMotion = useReducedMotion();

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialProjects || initialProjects.length === 0) {
      getProjects().then((data) => {
        if (data && data.length > 0) {
          setProjectList(data);
        }
      });
    }
  }, [initialProjects]);

  useEffect(() => {
    const handleResize = () => {
      const h = window.innerHeight;
      setWindowHeight(h);
      // Focused card covers 74% of viewport height
      const ch = Math.round(Math.max(500, h * 0.74));
      setCardHeight(ch);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const total = projectList.length;

  // Track scroll position within this pinned section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Timing: cards animate over (total - 1) * 90vh, then footer curtain covers over 100vh
  const cardsScrollVh = Math.max(1, total - 1) * 90;
  const curtainVh = 100;
  const totalScrollVh = cardsScrollVh + curtainVh;
  const cardsEndFraction = cardsScrollVh / totalScrollVh;

  // Continuous progress mapped from 0 to total - 1 (holds steady on last card during curtain reveal)
  const progress = useTransform(scrollYProgress, (v) => {
    if (v <= 0) return 0;
    if (v >= cardsEndFraction) return total - 1;
    return (v / cardsEndFraction) * (total - 1);
  });

  // Parallax recession of the projects stage while the footer curtain slides over it
  const curtainProgress = useTransform(scrollYProgress, [cardsEndFraction, 1.0], [0, 1]);
  const stageScale = useTransform(curtainProgress, [0, 1], [1, 0.95]);
  const stageOpacity = useTransform(curtainProgress, [0, 0.85], [1, 0.45]);
  const stageY = useTransform(curtainProgress, [0, 1], ["0%", "-4%"]);

  // Sync active project index for bottom-left pagination & mobile footer
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardV = Math.min(1, Math.max(0, latest / cardsEndFraction));
    const targetIdx = Math.min(total - 1, Math.max(0, Math.round(cardV * (total - 1))));
    if (targetIdx !== activeIdx) {
      setActiveIdx(targetIdx);
    }
  });

  const activeProject = projectList[activeIdx] || projectList[0];

  // Scroll to project on clicking card or index pill
  const handleSelectProject = (targetIndex: number) => {
    if (targetIndex === activeIdx) {
      // If clicking center active card, open link
      const url = activeProject?.view || "https://github.com/fal3n-4ngel";
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    if (!sectionRef.current) return;
    const sectionTop = sectionRef.current.offsetTop;
    const totalScrollable = sectionRef.current.offsetHeight - window.innerHeight;
    const targetScrollY =
      sectionTop + (targetIndex / (total - 1)) * (cardsEndFraction * totalScrollable);
    window.scrollTo({ top: targetScrollY, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative z-20 w-full border-t border-white/15 bg-black shadow-[0_-50px_140px_rgba(0,0,0,0.98)]"
      style={{ height: `${totalScrollVh + 100}vh` }}
    >
      {/* Pinned Viewport Container - Full Screen, Zero Padding, Recedes under footer */}
      <motion.div
        style={{
          scale: shouldReduceMotion ? 1 : stageScale,
          opacity: shouldReduceMotion ? 1 : stageOpacity,
          y: shouldReduceMotion ? 0 : stageY,
        }}
        className="sticky top-0 h-screen w-full overflow-hidden p-0 m-0 bg-black origin-center"
      >
        {/* Bottom-Left: Pagination & Archive Link */}
        <div className="absolute bottom-8 left-8 sm:left-12 lg:left-16 z-30 hidden sm:flex flex-col gap-3 pointer-events-auto">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {projectList.map((_, i) => {
              const isActive = i === activeIdx;
              const idxStr = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectProject(i)}
                  className={`interactable px-1.5 py-0.5 text-[10px] transition-all ${
                    isActive
                      ? "bg-white text-black font-medium"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {idxStr}
                </button>
              );
            })}
          </div>

          <a
            href="https://github.com/fal3n-4ngel?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="interactable inline-flex items-center gap-1 font-mono text-xs text-zinc-500 hover:text-white transition-colors"
          >
            <span>[ Archives ↗ ]</span>
          </a>
        </div>

        {/* Mobile-Only Project Header Banner */}
        {activeProject && (
          <div className="md:hidden absolute bottom-4 left-4 right-4 z-30 border border-white/15 bg-black/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between font-mono text-xs pointer-events-auto">
            <span className="text-white truncate max-w-[200px]">{activeProject.name}</span>
            <a
              href={activeProject.view || "https://github.com/fal3n-4ngel"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white"
            >
              Open →
            </a>
          </div>
        )}

        {/* ── Unified Scrolling Stage: Both Text & Image Tied Together on the Right ── */}
        <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none">
          {projectList.map((project, idx) => (
            <SemiCircleScrollCard
              key={project.name}
              project={project}
              idx={idx}
              total={total}
              progress={progress}
              cardHeight={cardHeight}
              windowHeight={windowHeight}
              shouldReduceMotion={shouldReduceMotion}
              onSelect={handleSelectProject}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ProjectsSection;
