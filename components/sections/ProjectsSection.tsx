"use client";

import { projects as fallbackProjects, projectImageMap, projectSkills } from "@/data/projects";
import { Project } from "@/types/projects";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import React, { useMemo, useRef, useState } from "react";

const PROJECT_BACKGROUNDS = [
  "/editorial/bg-limestone.jpg",
  "/editorial/bg-slate.jpg",
  "/editorial/bg-terracotta.jpg",
  "/editorial/bg-butterfly.jpg",
];

/* ── Project Card Item Component ── */
const ProjectCardItem: React.FC<{
  project: Project;
  idx: number;
  shouldReduceMotion: boolean | null;
}> = ({ project, idx, shouldReduceMotion }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.15 });
  const [isHovered, setIsHovered] = useState(false);

  const bgImage =
    PROJECT_BACKGROUNDS[idx % PROJECT_BACKGROUNDS.length] ||
    "/editorial/bg-limestone.jpg";
  const projectImage =
    projectImageMap[project.name] ||
    projectImageMap[project.name?.trim()] ||
    project.url1 ||
    "/projects/Continuum-Home.png";

  const rawSkills =
    project.skills && project.skills.length > 0
      ? project.skills
      : projectSkills[project.name] || ["Next.js", "TypeScript", "Tailwind CSS"];
  const skills = Array.from(new Set(rawSkills));

  const projectType = project.type || "WEBSITE";
  const projectEvent = project.event || "SIDE PROJECT";
  const projectYear = project.date || "2024";
  const formattedIndex = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
  const isGithub = project.view?.includes("github.com");

  return (
    <motion.article
      ref={cardRef}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative w-full flex flex-col scroll-mt-28"
    >
      {/* ── Project Title Header ── */}
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-light uppercase tracking-tight text-white leading-tight">
          <a
            href={project.view || "https://github.com/fal3n-4ngel"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors inline-flex items-center gap-2.5"
          >
            <span>{project.name}</span>
            <span className="font-mono text-xs sm:text-sm tracking-widest text-zinc-500 font-normal">
              [OPEN ↗]
            </span>
          </a>
        </h3>

        <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
          {`[ ${formattedIndex} ]`}
        </span>
      </div>

      {/* ── Main Hero Stage (Photographic Backdrop + Floating Mockup) ── */}
      <a
        href={project.view || "https://github.com/fal3n-4ngel"}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full h-[240px] sm:h-[320px] md:h-[380px] lg:h-[400px] xl:h-[440px] border border-white/15 bg-zinc-950 overflow-hidden flex items-center justify-center transition-all duration-700 hover:border-white/40 cursor-pointer select-none"
      >
        {/* Background Photographic Atmosphere */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={bgImage}
            alt={`${project.name} backdrop`}
            fill
            priority={idx < 2}
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover object-center scale-105 transition-transform duration-700 ease-out group-hover:scale-100"
          />
          {/* Subtle darkening vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
        </div>

        {/* Floating Website Preview Mockup (Full-Width 2:1, Zero Clipping) */}
        <div className="relative z-10 w-[88%] sm:w-[84%] md:w-[80%] lg:w-[80%] xl:w-[78%] max-w-[740px] transition-transform duration-500 ease-out group-hover:scale-[1.015] group-hover:-translate-y-1">
          <div className="relative aspect-[2/1] w-full rounded-md sm:rounded-lg overflow-hidden border border-black/20 dark:border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-zinc-950">
            <Image
              src={projectImage}
              alt={project.name}
              fill
              priority={idx < 2}
              sizes="(max-width: 768px) 90vw, 740px"
              className="object-cover object-top"
            />
          </div>
        </div>

        {/* Hover Pill */}
        <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-20 flex items-center gap-2 border border-white/20 bg-zinc-950/90 backdrop-blur-md px-3.5 py-1.5 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span>{isGithub ? "Inspect Code" : "Visit Project"}</span>
          <span className="text-zinc-400">→</span>
        </div>
      </a>

      {/* ── Bottom Data Block matching Thieb Reference (media_1789703664017.png) ── */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-8 pt-6">
        {/* Left Metadata Column */}
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-sans text-xs sm:text-[13px] uppercase tracking-wider shrink-0 select-none">
          <span className="text-zinc-500 font-normal">TYPE</span>
          <span className="text-zinc-200 font-medium">{projectType}</span>

          <span className="text-zinc-500 font-normal">EVENT</span>
          <span className="text-zinc-200 font-medium">{projectEvent}</span>

          <span className="text-zinc-500 font-normal">ROLE</span>
          <span className="text-zinc-200 font-medium">{skills.slice(0, 2).join(", ")}</span>

          <span className="text-zinc-500 font-normal">YEAR</span>
          <span className="text-zinc-200 font-medium">{projectYear}</span>
        </div>

        {/* Right Description & Tech Stack */}
        <div className="flex flex-col gap-3.5 flex-1 min-w-0">
          {project.description && (
            <p className="text-xs sm:text-sm md:text-[14px] text-zinc-300 font-light leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 font-mono text-[11px] sm:text-xs uppercase tracking-wider">
            <div className="flex items-center gap-2 text-zinc-400 truncate">
              <span className="text-zinc-500 font-medium">STACK</span>
              <span className="text-zinc-300">{skills.slice(0, 4).join(", ")}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href={project.view || "https://github.com/fal3n-4ngel"}
                target="_blank"
                rel="noopener noreferrer"
                className="interactable text-white hover:text-zinc-300 transition-colors"
              >
                [ VIEW PROJECT ↗ ]
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export const ProjectsSection: React.FC<{ initialProjects?: Project[] }> = ({
  initialProjects,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const projectList = useMemo(() => {
    return initialProjects && initialProjects.length > 0
      ? initialProjects
      : fallbackProjects;
  }, [initialProjects]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "ALL") return projectList;
    if (activeFilter === "WEBSITES") {
      return projectList.filter((p) => p.type?.toLowerCase().includes("web"));
    }
    if (activeFilter === "DESKTOP") {
      return projectList.filter((p) => !p.type?.toLowerCase().includes("web"));
    }
    return projectList;
  }, [projectList, activeFilter]);

  const categories = [
    { id: "ALL", label: `ALL [0${projectList.length}]` },
    {
      id: "WEBSITES",
      label: `WEBSITES [0${projectList.filter((p) => p.type?.toLowerCase().includes("web")).length}]`,
    },
    {
      id: "DESKTOP",
      label: `SYSTEMS [0${projectList.filter((p) => !p.type?.toLowerCase().includes("web")).length}]`,
    },
  ];

  return (
    <section
      id="projects"
      className="relative z-20 w-full border-t border-white/10 bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-16 sm:py-20 md:py-24"
    >
      <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-start lg:gap-24">
        {/* ── Left Column: Sticky Section Header & Filter Navigation (Aligns with Background Overview) ── */}
        <div className="flex flex-col lg:w-1/2 lg:sticky lg:top-24 shrink-0 mb-12 lg:mb-0">
          <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-zinc-500 mb-2 sm:mb-3">
            <span>[ 02 // SELECTED WORKS ]</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-none">
            Selected Works
          </h2>

          <p className="mt-3 text-sm sm:text-base font-light text-zinc-400 leading-relaxed max-w-md">
            Engineered systems, interactive web applications, and distributed platforms
            focusing on performance, architecture, and user experience.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs select-none mt-6 sm:mt-8">
            {categories.map((cat) => {
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? "bg-white text-black border-white font-medium"
                      : "bg-black/60 text-zinc-500 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Left Archive Link (Desktop Sticky) */}
          <div className="mt-10 hidden lg:block border-t border-white/10 pt-6 max-w-md">
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">
              [ ARCHIVES ]
            </span>
            <a
              href="https://github.com/fal3n-4ngel?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>Explore 40+ Repos on GitHub ↗</span>
            </a>
          </div>
        </div>

        {/* ── Right Column: Project Showcase Cards (Aligns with Background Experience/Awards) ── */}
        <div className="flex flex-col lg:w-1/2 gap-14 sm:gap-18 md:gap-20 w-full min-w-0">
          {filteredProjects.map((project, idx) => (
            <ProjectCardItem
              key={project.name}
              project={project}
              idx={idx}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;