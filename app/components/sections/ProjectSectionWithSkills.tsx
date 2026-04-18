"use client";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import FadeUp from "../ui/FadeUp";
import ProjBox from "../ui/ProjBox";

import { RiArrowUpCircleLine } from "react-icons/ri";
import { projects, projectSkills, skillIcons } from "../../data/projects";
import { GitProjectBoxProps, ProjectBoxProps, Repo } from "../../types/projects";
import GithubProjectBox from "../ui/ProjectBoxGithub";

const ProjectsWithSkills: React.FC = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isGitHubProjectActive, setIsGitHubProjectActive] = useState(false);
  const { ref: sectionRef, inView: sectionInView } = useInView({
    threshold: 0.05,
    triggerOnce: false,
  });

  const { ref: breakRef, inView: breakInView } = useInView({
    threshold: 0.0001,
    triggerOnce: false,
  });
  const [repos, setRepos] = useState<Repo[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (breakInView) {
      setVisibleCount(0);
    }
  }, [breakInView]);

  useEffect(() => {
    async function fetchRepos() {
      const response = await fetch("https://api.github.com/users/fal3n-4ngel/repos");
      const data = await response.json();

      const filteredRepos = data
        .filter((repo: Repo) => !repo.fork || repo.stargazers_count > 0)
        .sort((a: Repo, b: Repo) => {
          if (
            b.stargazers_count === a.stargazers_count ||
            b.stargazers_count != a.stargazers_count
          ) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return b.stargazers_count - a.stargazers_count;
        });

      setRepos(filteredRepos);
    }
    fetchRepos();
  }, []);

  const showMoreProjects = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 3, repos.length));
  };

  const showLessProjects = () => {
    setVisibleCount((prevCount) => Math.max(prevCount - 3, 0));
  };

  return (
    <section className="relative min-h-screen w-full px-12 py-24" ref={sectionRef}>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 md:flex-row md:items-start md:gap-24">
        {/* Scrollable Projects Container */}
        <div className="z-10 w-full flex-1">
          <div className="mb-12">
            <FadeUp>
              <h2 className="font-mono text-sm uppercase tracking-[0.3em] text-neutral-500 md:text-xl">
                Selected Works
              </h2>
            </FadeUp>
          </div>

          <div className="space-y-48">
            {projects.map((project) => (
              <ProjectBoxSelf
                key={project.name}
                {...project}
                onVisible={() => {
                  setActiveProject(project.name);
                  setIsGitHubProjectActive(false);
                }}
              />
            ))}

            {repos.slice(0, visibleCount).map((repo) => (
              <GitProjectBox
                key={repo.id}
                url1={Math.random() * 11}
                name={repo.name.toUpperCase()}
                type="GitHub Repository"
                event="Projects"
                date={new Date(repo.created_at).getFullYear().toString()}
                view={repo.html_url}
                onVisible={() => {
                  setActiveProject(repo.name);
                  setIsGitHubProjectActive(true);
                }}
              />
            ))}
          </div>
          <FadeUp className="m-5 p-10">
            <div className="m-5 flex flex-col items-center p-10">
              {visibleCount < repos.length && (
                <button
                  onClick={showMoreProjects}
                  className="interactable mb-5 flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 font-poppins text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:text-2xl"
                >
                  <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
                  discover more <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
                </button>
              )}

              {visibleCount >= 1 && (
                <button
                  onClick={showLessProjects}
                  className="interactable flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 font-poppins text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:text-2xl"
                >
                  <RiArrowUpCircleLine className="h-6 w-6" /> collapse
                  <RiArrowUpCircleLine className="h-6 w-6" />
                </button>
              )}
              <div className="mt-8 flex w-full flex-col items-center rounded-full p-2 text-center shadow-md">
                <div className="flex w-full items-center justify-center">
                  <p className="work-sans text-xs font-light text-[#2e3440] dark:text-[#e5e9f0] md:text-base">
                    Projects are dynamically fetched through GitHub API
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Fixed Skills Container */}
        <div className="no-scrollbar sticky top-[18vh] hidden max-h-[85vh] w-80 self-start overflow-y-auto pb-12 md:block">
          <div
            className={`transition-opacity duration-700 ease-out ${
              sectionInView && !isGitHubProjectActive
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <FadeUp>
              <h3 className="text-md mb-8 font-bold uppercase tracking-[0.3em] text-neutral-600">
                Technology
              </h3>

              <div className="flex flex-wrap gap-6">
                {Object.entries(skillIcons).map(([skill, Icon]) => {
                  const isActive = activeProject && projectSkills[activeProject]?.includes(skill);
                  return (
                    <div
                      key={skill}
                      className={
                        isActive
                          ? "flex scale-105 items-center gap-2 rounded-xl border border-white bg-white p-2 px-3 text-xs text-black shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-500"
                          : "flex items-center gap-2 rounded-xl border border-neutral-800/80 bg-transparent p-2 px-3 text-xs text-white opacity-50 transition-all duration-500"
                      }
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="text-[10px] tracking-wider md:text-xs">{skill}</span>
                    </div>
                  );
                })}
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProjectBoxSelf: React.FC<ProjectBoxProps> = ({ name, onVisible, ...props }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      onVisible();
    }
  }, [inView, onVisible]);

  return (
    <div ref={ref}>
      <FadeUp>
        <ProjBox name={name} {...props} />
      </FadeUp>
    </div>
  );
};

export default ProjectsWithSkills;

const GitProjectBox: React.FC<GitProjectBoxProps> = ({ name, onVisible, ...props }) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      onVisible();
    }
  }, [inView, onVisible]);

  return (
    <div ref={ref}>
      <GithubProjectBox name={name} {...props} />
    </div>
  );
};
