"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getProjects } from "@/lib/integrations/notion";
import { projects as fallbackProjects, projectSkills } from "@/data/projects";
import { Project } from "@/types/projects";

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

    // Warm up the image in browser cache even after page load
    if (src && typeof window !== "undefined") {
      const img = new window.Image();
      img.onload = () => setLoaded(true);
      img.onerror = () => {
        // If Next optimizer fails or URL is direct Notion S3 link, switch to direct <img>
        setUseDirectImg(true);
      };
      img.src = src;
    }
  }, [src]);

  if (error || !src) {
    return (
      <div className="flex aspect-[16/9] min-h-[300px] w-full flex-col items-center justify-center p-12 text-center bg-zinc-900/60">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">{type}</span>
        <span className="mt-3 text-xl font-light text-white">{name}</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${!loaded ? "aspect-[16/10] bg-zinc-950" : ""}`}>
      {/* Background loading skeleton that displays smoothly while fetching */}
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900/80 animate-pulse">
          <div className="flex flex-col items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
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
          className={`w-full h-auto block transition-all duration-700 ease-out group-hover:scale-[1.01] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <Image
          src={src}
          alt={name}
          width={1600}
          height={1100}
          sizes="(max-width: 1024px) 100vw, 800px"
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => {
            // Attempt direct img tag before declaring failure
            setUseDirectImg(true);
          }}
          className={`w-full h-auto block transition-all duration-700 ease-out group-hover:scale-[1.01] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
};

export const ProjectsSection: React.FC = () => {
  const [projectList, setProjectList] = useState<Project[]>(fallbackProjects);

  useEffect(() => {
    getProjects().then((data) => {
      if (data && data.length > 0) {
        setProjectList(data);
      }
    });
  }, []);

  // Display top projects in vertical sequence
  const displayProjects = projectList.slice(0, 6);

  return (
    <section
      id="projects"
      className="relative w-full border-t border-white/10 bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-14 sm:py-20 md:py-28"
    >
      <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-start lg:gap-24">
        {/* ── Left Column: Projects Heading fixed / sticky on the side (matching Achievements) ── */}
        <div className="flex flex-col lg:w-1/2 lg:sticky lg:top-24">
          <h2 className="interactable text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white">
            Projects
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base font-light text-zinc-400 max-w-md">
            Selected digital products, web platforms, and distributed systems.
          </p>

          <div className="mt-6 sm:mt-8 hidden lg:block font-mono text-sm text-zinc-500">
            <a
              href="https://github.com/fal3n-4ngel?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="interactable inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <span>[ Browse all repositories on GitHub ]</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* ── Right Column: Vertical Stream of Project Cards ──────────────── */}
        <div className="flex flex-col gap-16 sm:gap-24 lg:w-1/2">
          {displayProjects.map((project, idx) => {
            const skills =
              project.skills && project.skills.length > 0
                ? project.skills
                : projectSkills[project.name] || ["Next.js", "Full Stack"];

            const projectType = project.type || "WEBSITE";
            const projectEvent = project.event || "SIDE PROJECT";
            const projectYear = project.date || "2024";

            return (
              <article key={project.name} className="interactable flex w-full flex-col">
                {/* Project Title & Scope */}
                <div className="flex flex-col mb-3 sm:mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
                    {`0${idx + 1} // ${projectEvent}`}
                  </span>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-light tracking-tight text-white uppercase leading-tight">
                    <a
                      href={project.view || "https://github.com/fal3n-4ngel"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="interactable hover:text-zinc-300 transition-colors inline-flex items-baseline gap-2"
                    >
                      <span>{project.name}</span>
                      <span className="text-zinc-600 font-light text-lg sm:text-2xl">↗</span>
                    </a>
                  </h3>
                </div>

                {/* Project Preview Image with background load support */}
                <div className="w-full">
                  <a
                    href={project.view || "https://github.com/fal3n-4ngel"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block w-full overflow-hidden rounded-xl border border-white/15 bg-zinc-950/90 shadow-xl transition-all duration-500 hover:border-white/35"
                  >
                    <div className="relative w-full overflow-hidden bg-zinc-950">
                      <ProjectImage
                        src={project.url1}
                        name={project.name}
                        type={projectType}
                        priority={idx === 0}
                      />

                      {/* Subtle glass inner rim */}
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all" />

                      {/* Floating hover badge */}
                      <div className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 flex items-center gap-1 rounded-full border border-white/20 bg-black/80 px-2.5 py-1 sm:px-3 sm:py-1 font-mono text-[10px] sm:text-[11px] text-white backdrop-blur-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-xl">
                        <span>View Project</span>
                        <span>↗</span>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Metadata & Description */}
                <div className="mt-5 sm:mt-6 flex flex-col space-y-3.5 sm:space-y-4">
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1.5 font-mono text-[10px] sm:text-[11px] text-zinc-400 border-b border-white/5 pb-2.5 sm:pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-600 uppercase">Type:</span>
                      <span className="text-zinc-200 uppercase font-medium">{projectType}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-600 uppercase">Scope:</span>
                      <span className="text-zinc-200 font-medium">{projectEvent}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-600 uppercase">Year:</span>
                      <span className="text-zinc-300">{projectYear}</span>
                    </div>
                  </div>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-[10px] sm:text-[11px] text-zinc-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs sm:text-sm font-light leading-relaxed text-zinc-400">
                      {project.description}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Mobile view all link */}
      <div className="mt-12 flex lg:hidden justify-center font-mono text-xs text-zinc-500">
        <a
          href="https://github.com/fal3n-4ngel?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          [ Browse all repositories on GitHub ↗ ]
        </a>
      </div>
    </section>
  );
};

export default ProjectsSection;
