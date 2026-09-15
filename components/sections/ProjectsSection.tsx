"use client";

import { projects as fallbackProjects, projectSkills } from "@/data/projects";
import { getProjects } from "@/lib/integrations/notion";
import { Project } from "@/types/projects";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const NUM_SLATS = 6;

const ProjectImage: React.FC<{
  src: string;
  name: string;
  type: string;
  priority?: boolean;
}> = ({ src, name, type, priority }) => {
  const [loaded, setLoaded] = useState(false);
  const [useDirectImg, setUseDirectImg] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setUseDirectImg(false);
    setError(false);

    if (src && typeof window !== "undefined") {
      const img = new window.Image();
      img.onload = () => setLoaded(true);
      img.onerror = () => {
        setUseDirectImg(true);
      };
      img.src = src;
    }
  }, [src]);

  if (error || !src) {
    return (
      <div className="flex aspect-[16/9] min-h-[300px] w-full flex-col items-center justify-center p-8 text-center bg-zinc-950">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">{type}</span>
        <span className="mt-2 text-xl font-light text-white">{name}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[200px] sm:min-h-[260px] md:min-h-[300px] overflow-hidden flex items-center justify-center bg-zinc-950">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950">
          <div className="flex flex-col items-center gap-2">
            <span className="h-4 w-4 border border-white/20 border-t-white animate-spin" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Loading preview...
            </span>
          </div>
        </div>
      )}

      {useDirectImg ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full max-h-[400px] object-contain block transition-transform duration-700 ease-out group-hover:scale-[1.01] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <Image
          src={src}
          alt={name}
          width={1600}
          height={1100}
          sizes="(max-width: 1024px) 100vw, 700px"
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setUseDirectImg(true);
          }}
          className={`w-full h-full max-h-[400px] object-contain block transition-transform duration-700 ease-out group-hover:scale-[1.01] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
};

/* ── Signature Vertical Slat Shutter / Blind Cut Transition (Thieb Reference 2) ── */
const SlatCutOverlay: React.FC<{
  inView: boolean;
  shouldReduceMotion: boolean | null;
  isHovered: boolean;
}> = ({ inView, shouldReduceMotion, isHovered }) => {
  if (shouldReduceMotion) return null;

  return (
    <div className="absolute inset-0 grid grid-cols-6 pointer-events-none z-20">
      {Array.from({ length: NUM_SLATS }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1 }}
          animate={{
            opacity: inView ? (isHovered ? 0.08 : 0) : 1,
          }}
          transition={{
            duration: 0.65,
            delay: i * 0.07,
            ease: [0.65, 0.05, 0.36, 1],
          }}
          className="h-full w-full bg-black border-r border-white/[0.04] last:border-r-0"
        />
      ))}
    </div>
  );
};

const EditorialProjectArticle: React.FC<{
  project: Project;
  idx: number;
  total: number;
  shouldReduceMotion: boolean | null;
}> = ({ project, idx, total, shouldReduceMotion }) => {
  const articleRef = useRef<HTMLElement>(null);
  const isInView = useInView(articleRef, {
    once: false,
    amount: 0.2,
  });
  const [isHovered, setIsHovered] = useState(false);

  const rawSkills =
    project.skills && project.skills.length > 0
      ? project.skills
      : projectSkills[project.name] || ["Next.js", "Full Stack"];
  const skills = Array.from(new Set(rawSkills));

  const projectType = project.type || "WEBSITE";
  const projectEvent = project.event || "SIDE PROJECT";
  const projectYear = project.date || "2024";
  const isGithub = project.view?.includes("github.com");

  const formattedIndex = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
  const totalFormatted = total < 10 ? `0${total}` : `${total}`;

  return (
    <article
      id={`project-${idx}`}
      ref={articleRef}
      className="project scroll-mt-28 py-10 first:pt-0 sm:py-14 md:py-16 last:pb-0 w-full flex flex-col"
    >
      {/* ── 1. Editorial Header (Thieb Reference 1) ── */}
      <div className="mb-4 sm:mb-6">
        {/* Metadata Topline */}
        <div className="flex items-center gap-3 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-zinc-500 mb-2">
          <span>{`[ ${formattedIndex} / ${totalFormatted} ]`}</span>
          <span className="text-zinc-700">—</span>
          <span>{projectEvent}</span>
        </div>

        {/* Stark Typography */}
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-normal uppercase tracking-tight text-white leading-[0.95] select-none">
          <a
            href={project.view || "https://github.com/fal3n-4ngel"}
            target="_blank"
            rel="noopener noreferrer"
            className="interactable hover:text-zinc-300 transition-colors inline-block"
          >
            {project.name} —
          </a>
          <br />
          <span className="text-zinc-600 font-light hover:text-zinc-400 transition-colors">
            {projectType}
          </span>
        </h3>
      </div>

      {/* ── 2. Hero Visual Showcase with Vertical Slat Cut Animation (Thieb Reference 2) ── */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative w-full border border-white/10 bg-zinc-950 overflow-hidden transition-colors duration-500 hover:border-white/30"
      >
        <a
          href={project.view || "https://github.com/fal3n-4ngel"}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative w-full h-full cursor-pointer"
        >
          {/* Project Screenshot Media */}
          <ProjectImage
            src={project.url1}
            name={project.name}
            type={projectType}
            priority={idx === 0}
          />

          {/* Signature Slat Cut Shutter Overlay */}
          <SlatCutOverlay
            inView={isInView}
            shouldReduceMotion={shouldReduceMotion}
            isHovered={isHovered}
          />

          {/* Minimal Corner Pill */}
          <div className="absolute top-3.5 right-3.5 z-30 flex items-center gap-1.5 border border-white/20 bg-black/80 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>{isGithub ? "View Repository" : "Launch App"}</span>
            <span className="text-zinc-400">→</span>
          </div>
        </a>
      </div>

      {/* ── 3. Split Technical Specs & Editorial Narrative (Thieb Reference 3) ── */}
      <div className="mt-5 sm:mt-7 grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-7 items-start">
        {/* Left Column: Technical Specifications Key-Value List */}
        <div className="sm:col-span-5 flex flex-col gap-2 font-mono text-[11px] uppercase tracking-wider">
          <div className="flex items-baseline justify-between border-b border-white/10 pb-1.5">
            <span className="text-zinc-500">TYPE</span>
            <span className="text-white font-medium">{projectType}</span>
          </div>
          <div className="flex items-baseline justify-between border-b border-white/10 pb-1.5">
            <span className="text-zinc-500">CATEGORY</span>
            <span className="text-white font-medium">{projectEvent}</span>
          </div>
          <div className="flex items-baseline justify-between border-b border-white/10 pb-1.5">
            <span className="text-zinc-500">ROLE</span>
            <span className="text-white font-medium">FULL STACK</span>
          </div>
          <div className="flex items-baseline justify-between border-b border-white/10 pb-1.5">
            <span className="text-zinc-500">YEAR</span>
            <span className="text-white font-medium">{projectYear}</span>
          </div>
        </div>

        {/* Right Column: Editorial Narrative & Action Links */}
        <div className="sm:col-span-7 flex flex-col justify-between">
          {project.description && (
            <p className="text-xs sm:text-sm font-light text-zinc-300 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Bottom Credits & Action Buttons */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-3 font-mono text-[11px] uppercase tracking-wider">
            {/* Tech Stack Credit */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-400">
              <span className="text-zinc-600">TECH /</span>
              <span className="text-zinc-200">{skills.join(" · ")}</span>
            </div>

            {/* Action Links */}
            <div className="flex items-center gap-5 shrink-0 pt-1">
              <a
                href={project.view || "https://github.com/fal3n-4ngel"}
                target="_blank"
                rel="noopener noreferrer"
                className="interactable group/link inline-flex items-center gap-1.5 text-white hover:text-zinc-300 transition-colors"
              >
                <span>{isGithub ? "View Repository" : "Live Deployment"}</span>
                <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                  →
                </span>
              </a>

              {!isGithub && (
                <a
                  href="https://github.com/fal3n-4ngel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactable inline-flex items-center gap-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <span>GitHub</span>
                  <span className="text-zinc-600">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export const ProjectsSection: React.FC<{ initialProjects?: Project[] }> = ({
  initialProjects,
}) => {
  const [projectList, setProjectList] = useState<Project[]>(
    initialProjects && initialProjects.length > 0 ? initialProjects : fallbackProjects
  );
  const [showAll, setShowAll] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!initialProjects || initialProjects.length === 0) {
      getProjects().then((data) => {
        if (data && data.length > 0) {
          setProjectList(data);
        }
      });
    }
  }, [initialProjects]);

  // Display top 6 by default, or all if toggled
  const displayedProjects = showAll ? projectList : projectList.slice(0, 6);

  return (
    <section
      id="projects"
      className="relative w-full border-t border-white/10 bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-14 sm:py-20 md:py-28"
    >
      <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-start lg:gap-24">
        {/* ── Left Column: Section Title & Subtitle (Sticky on Desktop, matches Background section) ── */}
        <div className="flex flex-col lg:w-1/2 lg:sticky lg:top-24">
          <h2 className="interactable text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white">
            Projects
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base font-light text-zinc-400">
            Selected case studies, experiments, and systems.
          </p>

          <div className="mt-6 sm:mt-8 font-mono text-xs sm:text-sm">
            <a
              href="https://github.com/fal3n-4ngel?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="interactable inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <span>[ Open GitHub Archives ]</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* ── Right Column: Editorial Projects Showcase (Compact & Clean) ── */}
        <div className="flex flex-col lg:w-1/2 divide-y divide-white/10">
          {displayedProjects.map((project, idx) => (
            <EditorialProjectArticle
              key={project.name}
              project={project}
              idx={idx}
              total={projectList.length}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}

          {/* View More / Archives Toggle */}
          {projectList.length > 6 && (
            <div className="w-full pt-12 sm:pt-16 flex flex-col items-center justify-center text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="interactable group border border-white/20 hover:border-white bg-white/[0.02] hover:bg-white hover:text-black px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-white transition-all cursor-pointer"
              >
                <span>{showAll ? "Show Less Selected Works" : `View All Projects (0${projectList.length})`}</span>
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-y-0.5">
                  {showAll ? "↑" : "↓"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
