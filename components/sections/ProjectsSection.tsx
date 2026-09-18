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

// ─── Constants ──────────────────────────────────────────────────────────────

const PROJECT_BACKGROUNDS = [
  "/editorial/bg-limestone.jpg",
  "/editorial/bg-slate.jpg",
  "/editorial/bg-terracotta.jpg",
  "/editorial/bg-butterfly.jpg",
];

const SCALE_X_MIN = 0.78;
const SCALE_Y_MIN = 0.78;
const MOBILE_METADATA_HEIGHT = 76;
const PER_CARD_VH_DESKTOP = 90;
const PER_CARD_VH_MOBILE = 55;

// ─── Pure math helpers (no React, no side-effects) ──────────────────────────

/** Cosine bell weight: 1.0 at d = 0, smoothly → 0 at d = 1 */
function getCardWeight(idx: number, p: number): number {
  const d = Math.abs(idx - p);
  if (d >= 1.0) return 0;
  return 0.5 * (1 + Math.cos(d * Math.PI));
}

function getCardScaleY(idx: number, p: number): number {
  return SCALE_Y_MIN + getCardWeight(idx, p) * (1.0 - SCALE_Y_MIN);
}

function getCardScaleX(idx: number, p: number): number {
  return SCALE_X_MIN + getCardWeight(idx, p) * (1.0 - SCALE_X_MIN);
}

/** Cosine ease-in-out for 0→1 domain */
function cosEase(t: number): number {
  return 0.5 * (1 - Math.cos(t * Math.PI));
}

function getCardY(
  idx: number,
  p: number,
  cardHeight: number,
  windowHeight: number,
  total: number
): number {
  const m = Math.min(Math.max(0, Math.floor(p)), Math.max(0, total - 2));
  const t = p - m;

  const startCenter = cardHeight / 2;
  const screenCenter = windowHeight / 2;
  const endCenter = windowHeight - cardHeight / 2;

  let focusCenter = screenCenter;
  if (total > 1) {
    if (p < 1) {
      focusCenter = startCenter + cosEase(p) * (screenCenter - startCenter);
    } else if (p > total - 2) {
      const rem = p - (total - 2);
      focusCenter = screenCenter + cosEase(rem) * (endCenter - screenCenter);
    }
  } else {
    focusCenter = startCenter;
  }

  const sM = getCardScaleY(m, p);
  const sM1 = getCardScaleY(m + 1, p);
  const deltaM = ((sM + sM1) / 2) * cardHeight;
  const centerM = focusCenter - t * deltaM;

  if (idx === m) return centerM - cardHeight / 2;

  if (idx > m) {
    let cur = centerM;
    for (let j = m; j < idx; j++) {
      cur += ((getCardScaleY(j, p) + getCardScaleY(j + 1, p)) / 2) * cardHeight;
    }
    return cur - cardHeight / 2;
  }

  let cur = centerM;
  for (let j = m; j > idx; j--) {
    cur -= ((getCardScaleY(j, p) + getCardScaleY(j - 1, p)) / 2) * cardHeight;
  }
  return cur - cardHeight / 2;
}

// ─── Compute dimensions from window ─────────────────────────────────────────

function measureDimensions() {
  const h = window.innerHeight;
  const w = window.innerWidth;
  const mobile = w < 768;
  const card = mobile
    ? Math.round(Math.min(360, Math.max(280, h * 0.42)))
    : Math.round(Math.min(800, Math.max(340, h * 0.75)));
  return { windowHeight: h, cardHeight: card, isMobile: mobile };
}

// ─── ProjectImage ───────────────────────────────────────────────────────────

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
      <div className="w-full aspect-[16/10] flex flex-col items-center justify-center p-6 text-center bg-zinc-950 border border-white/10 rounded-md">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">{type}</span>
        <span className="mt-2 text-xl font-light text-white">{name}</span>
        <span className="mt-1 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
          Preview unavailable
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[16/10] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-md overflow-hidden border border-black/15 dark:border-white/20 bg-zinc-950">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/60">
          <span className="h-4 w-4 border border-white/20 border-t-white animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={name}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover object-top block transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

// ─── SemiCircleScrollCard ───────────────────────────────────────────────────

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
  // ── Desktop Y position ──
  const y = useTransform(progress, (p) => getCardY(idx, p, cardHeight, windowHeight, total));
  const scaleX = useTransform(progress, (p) => getCardScaleX(idx, p));
  const scaleY = useTransform(progress, (p) => getCardScaleY(idx, p));

  // ── Mobile Y position ──
  const mobileY = useTransform(progress, (p) => {
    const unit = cardHeight + MOBILE_METADATA_HEIGHT;
    const startY = 16;
    const centerY = windowHeight / 2 - unit / 2;
    const baseY = p < 1 ? startY + cosEase(p) * (centerY - startY) : centerY;
    return baseY + (idx - p) * unit;
  });

  // ── Offscreen culling: cosine fade ──
  const cardOpacity = useTransform(progress, (p) => {
    const d = Math.abs(idx - p);
    if (d >= 2.5) return 0;
    if (d >= 1.8) return 0.5 * (1 + Math.cos(((d - 1.8) / 0.7) * Math.PI));
    return 1;
  });

  // ── Parallax: clamped for smooth bounded motion ──
  const innerParallaxY = useTransform(progress, (p) => {
    const d = Math.max(-1.2, Math.min(1.2, idx - p));
    return d * (isMobile ? 24 : 50);
  });
  const bgParallaxY = useTransform(progress, (p) => {
    const d = Math.max(-1.2, Math.min(1.2, p - idx));
    return d * (isMobile ? 15 : 30);
  });
  const scrollInnerScale = useTransform(progress, (p) => 0.94 + getCardWeight(idx, p) * 0.06);

  // ── Counter-scale: outer card scales 0.78→1.0, inner content counter-scales ──
  // This creates the Roshan Sahu "reveal" parallax: the outer frame grows but
  // the inner backdrop + preview image stay visually stable / centered, as if
  // you're looking through a growing window.
  const counterScaleX = useTransform(progress, (p) => {
    const sx = getCardScaleX(idx, p);
    return 1 / sx;
  });
  const counterScaleY = useTransform(progress, (p) => {
    const sy = getCardScaleY(idx, p);
    return 1 / sy;
  });

  // ── Text: cosine fade + vertical drift ──
  const textOpacity = useTransform(progress, (p) => {
    const d = Math.abs(idx - p);
    if (d <= 0.35) return 1;
    if (d >= 0.85) return 0;
    return 0.5 * (1 + Math.cos(((d - 0.35) / 0.5) * Math.PI));
  });
  const textY = useTransform(progress, (p) => {
    return Math.max(-1.2, Math.min(1.2, idx - p)) * 22;
  });
  const textPointerEvents = useTransform(progress, (p) =>
    Math.abs(idx - p) <= 0.5 ? "auto" : "none"
  );

  // ── Static z-index: eliminates Chromium GPU layer rebuild on every frame ──
  const cardZIndex = 10 + idx;

  // ── Derived data ──
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
          ? { zIndex: cardZIndex, opacity: cardOpacity }
          : {
              y: isMobile ? mobileY : y,
              zIndex: cardZIndex,
              opacity: cardOpacity,
              willChange: "transform",
            }
      }
      className="absolute top-0 inset-x-0 md:left-auto md:right-0 flex flex-col md:flex-row items-stretch md:items-center md:justify-end pr-0 pointer-events-auto"
    >
      {/* ── Desktop Project Details ── */}
      <motion.div
        style={{
          y: shouldReduceMotion ? 0 : textY,
          opacity: shouldReduceMotion ? 1 : textOpacity,
          pointerEvents: (shouldReduceMotion ? "auto" : textPointerEvents) as any,
        }}
        className="hidden md:flex flex-col justify-center w-[260px] lg:w-[320px] xl:w-[360px] shrink-0 pr-6 lg:pr-8 xl:pr-10 z-20 select-text"
      >
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
        <div className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          <span>{skills.slice(0, 3).join(", ")}</span>
        </div>
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
            : { scaleX, scaleY, height: `${cardHeight}px`, willChange: "transform" }
        }
        className="w-full md:w-[60vw] lg:w-[64vw] xl:w-[66vw] max-w-[1300px] origin-right cursor-pointer select-none shrink-0"
      >
        <div className="group relative w-full h-full border-l border-white/20 overflow-hidden flex items-center justify-center">
          {/* ── Counter-scaled inner container ──
              The outer card scales 0.78→1.0. This inner wrapper counter-scales
              1/0.78→1/1.0 so the backdrop + preview stay visually stable while
              the outer frame "reveals" around them like a growing window. */}
          <motion.div
            style={
              shouldReduceMotion || isMobile
                ? {}
                : { scaleX: counterScaleX, scaleY: counterScaleY, willChange: "transform" }
            }
            className="relative w-full h-full flex items-center justify-center p-2.5 sm:p-4 md:p-6 lg:p-8"
          >
            {/* Editorial Photographic Backdrop */}
            <motion.div
              style={{
                y: shouldReduceMotion ? 0 : bgParallaxY,
                scale: 1.22,
                willChange: "transform",
              }}
              className="absolute inset-0 z-0"
            >
              <Image
                src={bgImage}
                alt="Project Background"
                fill
                priority={idx < 3}
                sizes="(max-width: 768px) 100vw, 70vw"
                className="object-cover object-center"
              />
            </motion.div>

            {/* Website Preview Image */}
            <motion.div
              style={{
                y: shouldReduceMotion ? 0 : innerParallaxY,
                scale: shouldReduceMotion ? 1 : scrollInnerScale,
                willChange: "transform",
              }}
              className="relative z-10 w-[65%] sm:w-[60%] md:w-[56%] lg:w-[52%] max-w-[560px] flex items-center justify-center pointer-events-auto"
            >
              <ProjectImage src={project.url1} name={project.name} type={projectType} priority={idx < 3} />
            </motion.div>
          </motion.div>

          {/* Hover pill (desktop) */}
          <div className="hidden md:flex absolute top-4 right-4 z-30 items-center gap-1.5 border border-white/25 bg-zinc-950/95 px-3 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-300 transform translate-y-1 group-hover:translate-y-0">
            <span>{isGithub ? "View Code" : "Open Project"}</span>
            <span className="text-zinc-400">→</span>
          </div>
        </div>
      </motion.div>

      {/* ── Mobile Metadata Block ── */}
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

// ─── ProjectsSection ────────────────────────────────────────────────────────

export const ProjectsSection: React.FC<{ initialProjects?: Project[] }> = ({
  initialProjects,
}) => {
  const [projectList, setProjectList] = useState<Project[]>(
    initialProjects && initialProjects.length > 0 ? initialProjects : fallbackProjects
  );
  const [activeIdx, setActiveIdx] = useState(0);

  // ── CRITICAL FIX: Gate everything behind `mounted` ──
  // SSR renders with no window → fallback dimensions. On hydration React
  // compares SSR HTML against client initial render. If useState initializers
  // read `window` during SSR they get the fallback, but on the client they
  // get real measurements → hydration mismatch → Framer Motion's useScroll
  // captures the wrong section height → cards shift down.
  //
  // Solution: start with stable defaults that match SSR, then measure once
  // after mount in a single useEffect. The cards and scroll math only render
  // once `mounted` is true, guaranteeing dimensions are always from the real
  // browser viewport.
  const [mounted, setMounted] = useState(false);
  const [dims, setDims] = useState({ windowHeight: 900, cardHeight: 660, isMobile: false });

  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Stable callback to tell Lenis + Framer Motion the scrollable area changed
  const syncScroll = useCallback(() => {
    if (typeof window === "undefined") return;
    (window as unknown as { lenis?: { resize: () => void } }).lenis?.resize();
    window.dispatchEvent(new Event("resize"));
  }, []);

  // ── Mount + resize ──
  useEffect(() => {
    const measure = () => {
      const d = measureDimensions();
      setDims(d);
      return d;
    };

    measure();
    setMounted(true);

    // After first paint with correct dims, double-rAF to guarantee layout is
    // settled before we tell Lenis to re-measure its scroll boundaries.
    requestAnimationFrame(() => {
      requestAnimationFrame(syncScroll);
    });

    const handleResize = () => {
      measure();
      // Debounced sync: wait for React to commit the new dims before resync
      requestAnimationFrame(syncScroll);
    };

    window.addEventListener("resize", handleResize);

    // Fonts can change layout height — resync when they finish loading
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        measure();
        requestAnimationFrame(() => requestAnimationFrame(syncScroll));
      });
    }

    // ResizeObserver on the section catches any height change (CMS data, image
    // decode, font swap) deterministically instead of racing timeouts.
    let ro: ResizeObserver | null = null;
    if (sectionRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(syncScroll);
      ro.observe(sectionRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      ro?.disconnect();
    };
  }, [syncScroll]);

  // ── Fetch projects from Notion if SSR didn't provide them ──
  useEffect(() => {
    if (!initialProjects || initialProjects.length === 0) {
      getProjects().then((data) => {
        if (data && data.length > 0) {
          setProjectList(data);
          requestAnimationFrame(() => requestAnimationFrame(syncScroll));
        }
      });
    }
  }, [initialProjects, syncScroll]);

  const { windowHeight, cardHeight, isMobile } = dims;
  const total = projectList.length;

  // ── Scroll tracking ──
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const perCardVh = isMobile ? PER_CARD_VH_MOBILE : PER_CARD_VH_DESKTOP;
  const cardsScrollVh = Math.max(1, total - 1) * perCardVh;
  const curtainVh = 100;
  const totalScrollVh = cardsScrollVh + curtainVh;
  const cardsEndFraction = cardsScrollVh / totalScrollVh;

  const progress = useTransform(scrollYProgress, (v) => {
    if (total <= 1) return 0;
    if (v <= 0) return 0;
    if (v >= cardsEndFraction) return total - 1;
    return (v / cardsEndFraction) * (total - 1);
  });

  // ── Footer curtain recession ──
  const curtainProgress = useTransform(scrollYProgress, [cardsEndFraction, 1.0], [0, 1]);
  const stageScale = useTransform(curtainProgress, [0, 1], [1, 0.95]);
  const stageOpacity = useTransform(curtainProgress, [0, 0.85], [1, 0.45]);
  const stageY = useTransform(curtainProgress, [0, 1], ["0%", "-4%"]);

  // ── Sync active index + URL hash ──
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (typeof window !== "undefined" && latest > 0.005 && latest < 0.98) {
      if (window.location.hash !== "#projects") {
        window.history.replaceState(null, "", "#projects");
      }
    }
    if (total <= 1) return;
    const cardV = Math.min(1, Math.max(0, latest / cardsEndFraction));
    const targetIdx = Math.min(total - 1, Math.max(0, Math.round(cardV * (total - 1))));
    if (targetIdx !== activeIdx) setActiveIdx(targetIdx);
  });

  const activeProject = projectList[activeIdx] || projectList[0];

  // ── Scroll-to-index ──
  const scrollToIndex = useCallback(
    (targetIndex: number, behavior: ScrollBehavior = "smooth") => {
      if (!sectionRef.current || total <= 1) return;
      const sectionTop = sectionRef.current.offsetTop;
      const totalScrollable = sectionRef.current.offsetHeight - window.innerHeight;
      const clamped = Math.min(total - 1, Math.max(0, targetIndex));
      const targetScrollY = sectionTop + (clamped / (total - 1)) * (cardsEndFraction * totalScrollable);
      const lenis = (window as unknown as { lenis?: { scrollTo: (t: number, o?: any) => void } }).lenis;
      if (lenis) {
        lenis.scrollTo(targetScrollY, { duration: 1.0 });
      } else {
        window.scrollTo({ top: targetScrollY, behavior });
      }
    },
    [total, cardsEndFraction]
  );

  const handleSelectProject = (targetIndex: number) => {
    if (targetIndex === activeIdx) {
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
      style={{ height: `${totalScrollVh}vh` }}
    >
      {/* Pinned Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden p-0 m-0 bg-black">
        <motion.div
          style={{
            scale: shouldReduceMotion ? 1 : stageScale,
            opacity: shouldReduceMotion ? 1 : stageOpacity,
            y: shouldReduceMotion ? 0 : stageY,
          }}
          className="relative h-full w-full origin-center"
        >
          {/* Top-Left: Section Title */}
          <div className="absolute top-4 sm:top-8 md:top-12 lg:top-14 left-4 sm:left-8 md:left-12 lg:left-16 z-30 flex flex-col pointer-events-auto select-none max-w-[280px] sm:max-w-[340px] lg:max-w-[420px]">
            <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-zinc-500 mb-1 sm:mb-2">
              <span>[ 02 // SELECTED WORKS ]</span>
            </div>
            <h2 className="interactable font-display text-2xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-none">
              Selected Works
            </h2>
            <p className="mt-2 text-xs sm:text-sm font-light text-zinc-400 leading-relaxed hidden sm:block">
              Selected case studies, experiments, and systems.
            </p>
          </div>

          {/* Bottom-Left: Pagination */}
          <div className="absolute bottom-8 left-8 sm:left-12 lg:left-16 z-30 hidden sm:flex flex-col pointer-events-auto">
            <div className="flex items-center font-mono text-xs">
              {projectList.map((_, i) => {
                const isActive = i === activeIdx;
                const idxStr = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectProject(i)}
                    className={`interactable text-[10px] transition-colors ${
                      isActive ? "bg-white text-black font-medium" : "text-zinc-500 hover:text-white"
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

          {/* Mobile-Only Project Banner */}
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

          {/* ── Card Stage ── */}
          <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none">
            {mounted &&
              projectList.map((project, idx) => (
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
      </div>
    </section>
  );
};

export default ProjectsSection;