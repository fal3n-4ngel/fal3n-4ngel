"use client";
import React, { useEffect, useState } from "react";
import { RiArrowUpCircleLine } from "react-icons/ri";
import FadeUp from "../components/FadeUp";
import ProjBox from "../components/ProjBox";
import GithubProjectBox from "../components/ProjectBoxGithub";
import { Project } from "../types/projects";
import { projects } from "../data/projects";


type GithubRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string;
  created_at: string;
  fork: boolean;
  stargazers_count: number;
};

function ProjectSection() {
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const response = await fetch(
          "https://api.github.com/users/fal3n-4ngel/repos"
        );
        const data = await response.json();

        const filteredRepos = data
          .filter((repo: GithubRepo) => !repo.fork || repo.stargazers_count > 0)
          .sort((a: GithubRepo, b: GithubRepo) => {
            if (b.stargazers_count === a.stargazers_count) {
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return b.stargazers_count - a.stargazers_count;
          });

        setRepos(filteredRepos);
      } catch (error) {
        console.error("Error fetching repos:", error);
      }
    }
    fetchRepos();
  }, []);

  const showMoreProjects = () => {
    setVisibleCount(prev => Math.min(prev + 3, repos.length));
  };

  const showLessProjects = () => {
    setVisibleCount(prev => Math.max(prev - 3, 0));
  };

  return (
    <section className="mx-auto flex min-h-screen w-[90%] flex-col justify-center p-5 text-4xl font-light md:w-[75%] md:p-0">
      <FadeUp>
        <div className="work-sans py-10 text-5xl md:text-6xl">
          Selected Works
        </div>
      </FadeUp>

      <div className="flex h-full w-full flex-wrap items-center justify-center">
        {projects.map((project: Project) => (
          <FadeUp key={project.name}>
            <ProjBox {...project} />
          </FadeUp>
        ))}

        {repos.slice(0, visibleCount).map((repo) => (
          <GithubProjectBox
            key={repo.id}
            url1={Math.random() * 11}
            name={repo.name.toUpperCase()}
            type="GitHub Repository"
            event="Projects"
            date={new Date(repo.created_at).getFullYear().toString()}
            view={repo.html_url}
           
          />
        ))}

        <FadeUp className="m-5 p-10">
          <div className="m-5 flex flex-col items-center p-10">
            {visibleCount < repos.length && (
              <button
                onClick={showMoreProjects}
                className="interactable font-poppins mb-5 flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:text-2xl"
              >
                <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
                discover more
                <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
              </button>
            )}

            {visibleCount > 0 && (
              <button
                onClick={showLessProjects}
                className="interactable font-poppins flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:text-2xl"
              >
                <RiArrowUpCircleLine className="h-6 w-6" /> 
                collapse
                <RiArrowUpCircleLine className="h-6 w-6" />
              </button>
            )}
            
            <div className="mt-8 flex w-full flex-col items-center rounded-full p-2 text-center shadow-md">
              <p className="work-sans text-xs font-light text-[#2e3440] dark:text-[#e5e9f0] md:text-base">
                Projects are dynamically fetched through GitHub API
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

export default ProjectSection;