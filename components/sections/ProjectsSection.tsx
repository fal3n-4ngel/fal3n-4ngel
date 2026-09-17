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
import React, { useCallback, useEffect, useRef, useState } from "react";

const PROJECT_BACKGROUNDS = [
  "/editorial/bg-limestone.jpg",   // 0: Warm travertine limestone & olive branch shadow (Continuum Home)
  "/editorial/bg-slate.jpg",       // 1: Minimalist brutalist slate concrete (DASH)
  "/editorial/bg-terracotta.jpg",  // 2: Rustic terracotta Italian facade with green shutters (Modevelle style)
  "/editorial/bg-butterfly.jpg",   // 3: Swallowtail butterfly on yellow flower petals (Roshan Sahu style)
];

const SCALE_X_MIN = 0.68; // width scale when not focused (noticeably more compact)
const SCALE_Y_MIN = 0.58; // height scale when not focused — softer than 0.48, still clear hierarchy

// Fixed, explicit height for the mobile metadata bar.
const MOBILE_METADATA_HEIGHT = 76;

// Scroll distance (in vh) allocated per card transition.
// 55vh on mobile matches the compact card unit height for a natural 1:1 scroll feel.
const PER_CARD_VH_DESKTOP = 90;
const PER_CARD_VH_MOBILE = 55;

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
        className={`max-w-[92vw] sm:max-w-[70vw] md:max-w-[54vw] lg:max-w-[56vw] xl:max-w-[58vw] max-h-[240px] sm:max-h-[280px] md:max-h-[58vh] lg:max-h-[64vh] w-auto h-auto object-contain block transition-opacity duration-300 ${
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
  isMobile: boolean;
  shouldReduceMotion: boolean | null;
  onSelect: (idx: number) => void;
}> = ({ project, idx, total, progress, cardHeight, windowHeight, isMobile, shouldReduceMotion, onSelect }) => {
  // Desktop: gap-math keeps cards gapless at all scroll positions
  const y = useTransform(progress, (p) => getCardY(idx, p, cardHeight, windowHeight, total));
  const scaleX = useTransform(progress, (p) => getCardScaleX(idx, p));
  const scaleY = useTransform(progress, (p) => getCardScaleY(idx, p));

  // Mobile: compact card unit (cardHeight + metadata height).
  // Step = mobileUnitHeight guarantees adjacent cards touch with exactly zero gap.
  // When p = 0, card 0 is centered in viewport. Card 1 is immediately below its metadata block.
  const mobileUnitHeight = cardHeight + MOBILE_METADATA_HEIGHT;
  const mobileCenterY = windowHeight / 2 - mobileUnitHeight / 2;
  const mobileY = useTransform(progress, (p) => mobileCenterY + (idx - p) * mobileUnitHeight);

  // Subtle parallax between the inner preview box, the backdrop, and the card wrapper
  const innerParallaxY = useTransform(progress, (p) => (idx - p) * 16);
  const bgParallaxY = useTransform(progress, (p) => (p - idx) * 8);

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
  const bgImage = PROJECT_BACKGROUNDS[idx % PROJECT_BACKGROUNDS.length] || "/editorial/bg-limestone.jpg";

  return (
    <motion.div
      style={
        shouldReduceMotion
          ? { zIndex }
          : {
              y: isMobile ? mobileY : y,
              zIndex,
              willChange: "transform",
            }
      }
      className="absolute top-0 inset-x-0 md:left-auto md:right-0 flex flex-col md:flex-row items-stretch md:items-center md:justify-end pr-0 pointer-events-auto"
    >
      {/* ── Minimal Project Details (Desktop only) ── */}
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

      {/* ── Project Image Card ── */}
      <motion.div
        onClick={() => onSelect(idx)}
        style={
          shouldReduceMotion || isMobile
            ? { height: `${cardHeight}px`, willChange: "transform" }
            : {
                scaleX,
                scaleY,
                height: `${cardHeight}px`,
                willChange: "transform",
              }
        }
        className="w-full md:w-[68vw] lg:w-[72vw] xl:w-[75vw] 2xl:w-[76vw] max-w-[1550px] origin-right cursor-pointer select-none shrink-0"
      >
        <div className="group relative w-full h-full border-l border-white/20 overflow-hidden flex items-center justify-center p-2.5 sm:p-4 md:p-7 lg:p-12">
          {/* Editorial Photographic Backdrop with subtle counter parallax */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : bgParallaxY,
              scale: 1.1,
              willChange: "transform",
            }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={bgImage}
              alt="Project Background"
              fill
              priority={idx < 3}
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover object-center"
            />
          </motion.div>

          {/* Website Preview Image with vertical parallax */}
          <motion.div
            style={{
              y: shouldReduceMotion ? 0 : innerParallaxY,
              willChange: "transform",
            }}
            className="relative z-10 w-[92%] sm:w-[88%] md:w-auto flex items-center justify-center pointer-events-auto"
          >
            <ProjectImage
              src={project.url1}
              name={project.name}
              type={projectType}
              priority={idx < 3}
            />
          </motion.div>

          {/* Hover pill — desktop only, hidden on touch devices. Scoped transition
              (was transition-all, which forces the browser to diff every animatable
              property on every hover frame instead of just the two that change). */}
          <div className="hidden md:flex absolute top-4 right-4 z-30 items-center gap-1.5 border border-white/25 bg-black/90 px-3 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-300 transform translate-y-1 group-hover:translate-y-0">
            <span>{isGithub ? "View Code" : "Open Project"}</span>
            <span className="text-zinc-400">→</span>
          </div>
        </div>
      </motion.div>

      {/* ── Mobile Metadata Block — full-width, attached directly below card ──
          Fixed, explicit height (matches MOBILE_METADATA_HEIGHT) so it can never
          drift from the tiling math regardless of text length/wrapping. */}
      <div
        style={{ height: `${MOBILE_METADATA_HEIGHT}px` }}
        className="md:hidden w-full bg-black border-b border-white/10 px-4 py-3 flex flex-col justify-center overflow-hidden select-text pointer-events-auto shrink-0"
      >
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <h3 className="text-lg font-light uppercase tracking-tight text-white leading-tight truncate">
            <a
              href={project.view || "https://github.com/fal3n-4ngel"}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              {project.name}
            </a>
          </h3>
          <a
            href={project.view || "https://github.com/fal3n-4ngel"}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs tracking-widest text-zinc-400 hover:text-white shrink-0"
          >
            [OPEN]
          </a>
        </div>
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 truncate">
          {skills.slice(0, 3).join(", ")}
        </div>
        <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5 truncate">
          ROLE: {projectType.toUpperCase()}
        </div>
      </div>
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
  const [cardHeight, setCardHeight] = useState(() => {
    if (typeof window !== "undefined") {
      const h = window.innerHeight;
      const w = window.innerWidth;
      if (w < 768) {
        return Math.round(Math.min(320, Math.max(260, h * 0.38)));
      }
      return Math.round(Math.max(500, h * 0.74));
    }
    return 600;
  });
  const [windowHeight, setWindowHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900
  );
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth < 768;
    return false;
  });
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
      const w = window.innerWidth;
      setWindowHeight(h);
      const isMob = w < 768;
      setIsMobile(isMob);
      if (isMob) {
        // Mobile: compact, well-proportioned card matching roshan-sahu reference (pic 3)
        // Card image is ~260-320px (about 38% of viewport), NOT a giant 700px wall
        setCardHeight(Math.round(Math.min(320, Math.max(260, h * 0.38))));
      } else {
        // Desktop: focused card covers 74% of viewport height
        setCardHeight(Math.round(Math.max(500, h * 0.74)));
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const total = projectList.length;

  // Track scroll position within this pinned section
  const { scrollYProgress: rawScrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Direct 1:1 scroll tracking without spring resistance / magnetic drag.
  // Lenis provides the root smooth easing; bypassing useSpring eliminates
  // the rubber-band / magnetic touch feeling completely.
  const scrollYProgress = rawScrollYProgress;

  // Timing: cards animate over (total - 1) * perCardVh, then footer curtain covers over 100vh.
  // perCardVh now differs by device: mobile cards travel a full windowHeight per
  // step, so the scroll distance per step must also be a full 100vh, or the
  // visual motion and the user's actual scroll input fall out of sync.
  const perCardVh = isMobile ? PER_CARD_VH_MOBILE : PER_CARD_VH_DESKTOP;
  const cardsScrollVh = Math.max(1, total - 1) * perCardVh;
  const curtainVh = 100;
  const totalScrollVh = cardsScrollVh + curtainVh;
  const cardsEndFraction = cardsScrollVh / totalScrollVh;

  // Continuous progress mapped from 0 to total - 1 (holds steady on last card during curtain reveal)
  const progress = useTransform(scrollYProgress, (v) => {
    if (total <= 1) return 0;
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
    if (total <= 1) return;
    const cardV = Math.min(1, Math.max(0, latest / cardsEndFraction));
    const targetIdx = Math.min(total - 1, Math.max(0, Math.round(cardV * (total - 1))));
    if (targetIdx !== activeIdx) {
      setActiveIdx(targetIdx);
    }
  });

  const activeProject = projectList[activeIdx] || projectList[0];

  // Shared scroll-to-index helper (used by clicks AND settle-snap below)
  const scrollToIndex = useCallback(
    (targetIndex: number, behavior: ScrollBehavior = "smooth") => {
      if (!sectionRef.current || total <= 1) return;
      const sectionTop = sectionRef.current.offsetTop;
      const totalScrollable = sectionRef.current.offsetHeight - window.innerHeight;
      const clamped = Math.min(total - 1, Math.max(0, targetIndex));
      const targetScrollY =
        sectionTop + (clamped / (total - 1)) * (cardsEndFraction * totalScrollable);
      window.scrollTo({ top: targetScrollY, behavior });
    },
    [total, cardsEndFraction]
  );

  // Scroll to project on clicking card or index pill
  const handleSelectProject = (targetIndex: number) => {
    if (targetIndex === activeIdx) {
      // If clicking center active card, open link
      const url = activeProject?.view || "https://github.com/fal3n-4ngel";
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    scrollToIndex(targetIndex);
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
          willChange: "transform",
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
                  className={`interactable px-1.5 py-0.5 text-[10px] transition-colors ${
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
              isMobile={isMobile}
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