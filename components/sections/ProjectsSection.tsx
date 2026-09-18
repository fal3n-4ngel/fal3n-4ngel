"use client";

import { projects as fallbackProjects, projectImageMap, projectSkills } from "@/data/projects";
import { Project } from "@/types/projects";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import React, { useMemo, useState } from "react";

const PROJECT_BACKGROUNDS = [
  "/editorial/bg-limestone.jpg",
  "/editorial/bg-slate.jpg",
  "/editorial/bg-terracotta.jpg",
  "/editorial/bg-butterfly.jpg",
];

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
      className="relative z-20 w-full border-t border-white/10 bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-20 sm:py-28 md:py-36"
    >
      {/* ── Section Header ── */}
      <div className="flex flex-col mb-16 sm:mb-20 md:mb-28">
        <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-widest text-zinc-500 mb-2 sm:mb-3">
          <span>[ 02 // SELECTED WORKS ]</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-none">
              Selected Works
            </h2>
            <p className="mt-4 max-w-xl font-light text-zinc-400 text-sm sm:text-base leading-relaxed">
              Engineered systems, interactive web applications, and distributed platforms
              focusing on performance, architecture, and user experience.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs select-none">
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
        </div>
      </div>

      {/* ── Editorial Project Showcase ── */}
      <div className="flex flex-col gap-24 sm:gap-32 md:gap-40 w-full">
        {filteredProjects.map((project, idx) => {
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
              key={project.name}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative w-full flex flex-col scroll-mt-28"
            >
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 mb-6 sm:mb-8 font-mono text-[11px] sm:text-xs text-zinc-500 uppercase tracking-widest gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold">{`[ ${formattedIndex} ]`}</span>
                  <span className="text-zinc-700">/</span>
                  <span>{projectEvent}</span>
                </div>
                <div className="flex items-center gap-4 text-zinc-400">
                  <span className="hidden sm:inline">TYPE: {projectType}</span>
                  <span className="hidden sm:inline text-zinc-700">·</span>
                  <span>YEAR: {projectYear}</span>
                </div>
              </div>

              {/* Title & Headline */}
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-6 sm:mb-8">
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light uppercase tracking-tight text-white leading-tight">
                  <a
                    href={project.view || "https://github.com/fal3n-4ngel"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-zinc-300 transition-colors inline-flex items-center gap-3"
                  >
                    <span>{project.name}</span>
                    <span className="font-mono text-xs sm:text-sm tracking-widest text-zinc-500 font-normal">
                      [OPEN ↗]
                    </span>
                  </a>
                </h3>

                <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ACTIVE REPO</span>
                </div>
              </div>

              {/* ── Main Hero Stage (Photographic Backdrop + Floating Mockup) ── */}
              <a
                href={project.view || "https://github.com/fal3n-4ngel"}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[360px] sm:min-h-[460px] md:min-h-[560px] lg:min-h-[640px] xl:min-h-[700px] max-h-[78vh] border border-white/15 bg-zinc-950 overflow-hidden flex items-center justify-center transition-all duration-700 hover:border-white/40 cursor-pointer select-none"
              >
                {/* Background Photographic Atmosphere */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image
                    src={bgImage}
                    alt={`${project.name} backdrop`}
                    fill
                    priority={idx < 2}
                    sizes="(max-width: 768px) 100vw, 90vw"
                    className="object-cover object-center scale-105 transition-transform duration-700 ease-out group-hover:scale-100"
                  />
                  {/* Subtle darkening vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
                </div>

                {/* Floating Website Preview Mockup (Full-Width 2:1, Zero Clipping) */}
                <div className="relative z-10 w-[92%] sm:w-[88%] md:w-[84%] lg:w-[80%] xl:w-[78%] max-w-[1060px] transition-transform duration-500 ease-out group-hover:scale-[1.015] group-hover:-translate-y-1">
                  <div className="relative aspect-[2/1] w-full rounded-md sm:rounded-lg overflow-hidden border border-black/20 dark:border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.85)] bg-zinc-950">
                    <Image
                      src={projectImage}
                      alt={project.name}
                      fill
                      priority={idx < 2}
                      sizes="(max-width: 768px) 95vw, 1060px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>

                {/* Hover Pill */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-2 border border-white/20 bg-zinc-950/90 backdrop-blur-md px-3.5 py-1.5 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span>{isGithub ? "Inspect Code" : "Visit Project"}</span>
                  <span className="text-zinc-400">→</span>
                </div>
              </a>

              {/* Bottom Details & Tech Stack */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-6 sm:pt-8 border-t border-white/5 mt-6 sm:mt-8">
                {/* Description */}
                {project.description && (
                  <p className="max-w-2xl text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Tech Stack Badges & Links */}
                <div className="flex flex-wrap items-center gap-2">
                  {skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 border border-white/10 bg-white/[0.02]"
                    >
                      {skill}
                    </span>
                  ))}

                  <a
                    href={project.view || "https://github.com/fal3n-4ngel"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto lg:ml-4 inline-flex items-center gap-1.5 font-mono text-xs text-white hover:text-zinc-300 transition-colors py-1"
                  >
                    <span>[ View ↗ ]</span>
                  </a>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* ── Archive Section Footer ── */}
      <div className="mt-28 sm:mt-36 md:mt-44 border-t border-white/10 pt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest block mb-1">
            [ 02.1 // REPOSITORIES ]
          </span>
          <span className="text-sm sm:text-base text-zinc-300 font-light">
            Want to explore all open source experiments, libraries, and utilities?
          </span>
        </div>

        <a
          href="https://github.com/fal3n-4ngel?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="interactable inline-flex items-center gap-2 border border-white/20 bg-white/5 hover:bg-white hover:text-black transition-all px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-white shrink-0"
        >
          <span>Browse All GitHub Repos ↗</span>
        </a>
      </div>
    </section>
  );
};

export default ProjectsSection;