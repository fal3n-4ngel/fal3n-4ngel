"use client";
"use client";
import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import ProjBox from "../components/ProjBox";
import FadeUp from "../components/FadeUp";

import GithubProjectBox from "../components/ProjectBoxGithub";
import { RiArrowUpCircleLine } from "react-icons/ri";
import {
  GitProjectBoxProps,
  Project,
  ProjectBoxProps,
  Repo,
} from "../types/projects";
import { projects, projectSkills, skillIcons } from "../data/projects";
import { inView } from "framer-motion";

// Main component
const ProjectsWithSkills: React.FC = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const { ref: sectionRef, inView: sectionInView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const { ref: breakRef, inView: breakInView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });
  const [repos, setRepos] = useState<Repo[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  
  useEffect(() => {
    if (breakInView) {
      setVisibleCount(0);
    }
  }, [ breakInView]);

  useEffect(() => {


    async function fetchRepos() {
      const response = await fetch(
        "https://api.github.com/users/fal3n-4ngel/repos",
      );
      const data = await response.json();

      const filteredRepos = data
        .filter((repo: Repo) => !repo.fork || repo.stargazers_count > 0)
        .sort((a: Repo, b: Repo) => {
          if (
            b.stargazers_count === a.stargazers_count ||
            b.stargazers_count != a.stargazers_count
          ) {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
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
    <section className="h-full min-h-screen w-full"  ref={sectionRef}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row">
          {/* Scrollable Projects Container */}
          <div className="md:pr-8">
            <FadeUp>
              <div className="work-sans py-10 text-5xl md:text-6xl">
                Selected Works
              </div>
            </FadeUp>
            <div ref={breakRef}></div>
            <div className="space-y-8" >
              {projects.map((project) => (
                <ProjectBox
                  key={project.name}
                  {...project}
                  onVisible={() => setActiveProject(project.name)}
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
                  onVisible={() => setActiveProject(repo.name)}
                />
              ))}
            </div>
            <FadeUp className="m-5 p-10">
              <div className="m-5 flex flex-col items-center p-10">
                {visibleCount < repos.length && (
                  <button
                    onClick={showMoreProjects}
                    className="interactable font-poppins mb-5 flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:text-2xl"
                  >
                    <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
                    discover more{" "}
                    <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
                  </button>
                )}

                {visibleCount >= 1 && (
                  <button
                    onClick={showLessProjects}
                    className="interactable font-poppins flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:text-2xl"
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
          <div className="hidden md:block z-0">
            <div
              className={`fixed right-[2vw] top-[20vh] w-[25vw] max-w-[350px] transition-all duration-500 ${
                sectionInView ? "size-100 opacity-100" : "scale-75 opacity-0"
              }`}
            >
              <FadeUp>
                <div className="rounded-xl p-6">
                  <div className="work-sans mb-6 text-2xl">Tech Stacks</div>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(skillIcons).map(([skill, Icon]) => (
                      <div
                        key={skill}
                        className={`flex items-center rounded-xl p-2 px-4 transition-all duration-300 ${
                          activeProject &&
                          projectSkills[activeProject]?.includes(skill)
                            ? "scale-105 bg-white text-black"
                            : "bg-[#2a2a2a] text-gray-400"
                        }`}
                      >
                        <Icon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsWithSkills;

const ProjectBox: React.FC<ProjectBoxProps> = ({
  name,
  onVisible,
  ...props
}) => {
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
      <ProjBox name={name} {...props} />
    </div>
  );
};

const GitProjectBox: React.FC<GitProjectBoxProps> = ({
  name,
  onVisible,
  ...props
}) => {




  return (
    <div >
      <GithubProjectBox name={name} {...props} />
    </div>
  );
};
