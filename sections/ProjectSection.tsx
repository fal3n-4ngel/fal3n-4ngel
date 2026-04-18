"use client";
import { useEffect, useState } from "react";
import { RiArrowUpCircleLine } from "react-icons/ri";
import { projects } from "@/data/projects";
import { Project, Repo } from "@/types/projects";
import FadeUp from "@/components/FadeUp";
import ProjBox from "@/components/ProjBox";
import GithubProjectBox from "@/components/ProjectBoxGithub";

function ProjectSection() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

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
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-12 py-24 md:py-24">
      <div className="mb-12 md:mb-24">
        <FadeUp>
          <h3 className="font-mono text-sm uppercase tracking-[0.3em] text-neutral-500 md:text-xl">
            Selected Works
          </h3>
        </FadeUp>
      </div>

      <div className="flex flex-col gap-32">
        {projects.map((project: Project) => (
          <FadeUp key={project.name}>
            <ProjBox {...project} />
          </FadeUp>
        ))}

        {repos.slice(0, visibleCount).map((repo) => (
          <FadeUp key={repo.id}>
            <GithubProjectBox
              url1={Math.random() * 11}
              name={repo.name.toUpperCase()}
              type="GitHub Repository"
              event="Projects"
              date={new Date(repo.created_at).getFullYear().toString()}
              view={repo.html_url}
            />
          </FadeUp>
        ))}
      </div>

      <FadeUp className="m-5 mt-16 p-10">
        <div className="mt-6 flex flex-col items-center">
          {visibleCount < repos.length && (
            <button
              onClick={showMoreProjects}
              className="interactable mb-5 flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 font-poppins text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:pt-2 md:text-2xl"
            >
              <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
              discover more <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
            </button>
          )}

          {visibleCount >= 1 && (
            <button
              onClick={showLessProjects}
              className="interactable flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 font-poppins text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:pt-2 md:text-2xl"
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
    </section>
  );
}

export default ProjectSection;
