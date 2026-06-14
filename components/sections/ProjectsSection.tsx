"use client";

import FadeUp from "@/components/ui/FadeUp";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { GithubProjectCard } from "@/components/cards/GithubProjectCard";
import { SkillsPanel } from "@/components/features/SkillsPanel";
import { projects, projectSkills, skillIcons } from "@/data/projects";
import { getProjects } from "@/lib/integrations/notion";
import { Project, Repo } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { RiArrowUpCircleLine } from "react-icons/ri";

const ProjectEntry: React.FC<{ project: Project; onVisible: () => void }> = ({ project, onVisible }) => {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: false });
  useEffect(() => { if (inView) onVisible(); }, [inView, onVisible]);
  return (
    <div ref={ref}>
      <FadeUp><ProjectCard {...project} /></FadeUp>
    </div>
  );
};

const GithubEntry: React.FC<{ repo: Repo; onVisible: () => void }> = ({ repo, onVisible }) => {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: false });
  useEffect(() => { if (inView) onVisible(); }, [inView, onVisible]);
  return (
    <div ref={ref}>
      <GithubProjectCard
        url1={Math.random() * 11}
        name={repo.name.toUpperCase()}
        type="GitHub Repository"
        event="Projects"
        date={new Date(repo.created_at).getFullYear().toString()}
        view={repo.html_url}
      />
    </div>
  );
};

const ProjectsSection: React.FC = () => {
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isGitHubProjectActive, setIsGitHubProjectActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  const { ref: sectionRef, inView: sectionInView } = useInView({ threshold: 0.05, triggerOnce: false });
  const { ref: breakRef, inView: breakInView } = useInView({ threshold: 0.0001, triggerOnce: false });

  useEffect(() => {
    getProjects().then((data) => { if (data?.length) setProjectsList(data); });
  }, []);

  useEffect(() => {
    if (breakInView) setVisibleCount(0);
  }, [breakInView]);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const res = await fetch("https://api.github.com/users/fal3n-4ngel/repos");
        const data = await res.json();
        const filtered = data
          .filter((r: Repo) => !r.fork || r.stargazers_count > 0)
          .sort((a: Repo, b: Repo) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        setRepos(filtered);
      } catch { /* silently fail */ }
    };
    fetchRepos();
  }, []);

  const displayedProjects = projectsList.length > 0 ? projectsList : projects;

  return (
    <section className="relative min-h-screen w-full px-12 py-24" ref={sectionRef}>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 md:flex-row md:items-start md:gap-24">

        {/* Project list */}
        <div className="z-10 w-full flex-1">
          <div className="mb-12" ref={breakRef}>
            <FadeUp>
              <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-neutral-500 md:text-xl">
                Selected Works
              </h2>
            </FadeUp>
          </div>

          <div className="space-y-48">
            {displayedProjects.map((project) => (
              <ProjectEntry
                key={project.name}
                project={project}
                onVisible={() => { setActiveProject(project.name); setIsGitHubProjectActive(false); }}
              />
            ))}
            {repos.slice(0, visibleCount).map((repo) => (
              <GithubEntry
                key={repo.id}
                repo={repo}
                onVisible={() => { setActiveProject(repo.name); setIsGitHubProjectActive(true); }}
              />
            ))}
          </div>

          {/* Load more / collapse controls */}
          <div className="mt-16 flex flex-col items-center gap-8">
            <div className="flex flex-wrap justify-center gap-4">
              {visibleCount < repos.length && (
                <button
                  onClick={() => setVisibleCount((c) => Math.min(c + 3, repos.length))}
                  className="interactable flex items-center gap-3 border border-white/10 bg-white/[0.02] px-6 py-3 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-all hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                >
                  <RiArrowUpCircleLine className="h-4 w-4 rotate-180" />
                  discover more
                </button>
              )}
              {visibleCount >= 1 && (
                <button
                  onClick={() => setVisibleCount((c) => Math.max(c - 3, 0))}
                  className="interactable flex items-center gap-3 border border-white/10 bg-white/[0.02] px-6 py-3 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-all hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
                >
                  <RiArrowUpCircleLine className="h-4 w-4" />
                  collapse
                </button>
              )}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
              Projects are dynamically fetched through GitHub API
            </p>
          </div>
        </div>

        {/* Sticky skills panel — desktop only */}
        <div className="no-scrollbar sticky top-[18vh] hidden max-h-[85vh] w-80 self-start overflow-y-auto pb-12 md:block">
          <SkillsPanel
            activeProject={activeProject}
            isVisible={sectionInView && !isGitHubProjectActive}
            skillIcons={skillIcons}
            projectSkills={projectSkills}
          />
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
