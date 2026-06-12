"use client";
import FadeUp from "@/components/FadeUp";
import ProjBox from "@/components/ProjBox";
import GithubProjectBox from "@/components/ProjectBoxGithub";
import { projects } from "@/data/projects";
import { getProjects } from "@/lib/integrations/notion";
import { Project, Repo } from "@/types/projects";
import { useEffect, useState } from "react";
import { RiArrowUpCircleLine } from "react-icons/ri";

function ProjectSection() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    getProjects().then((data) => {
      if (data && data.length > 0) {
        setProjectsList(data);
      } else {
        // Fallback or empty state
      }
    });

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
        {(projectsList.length > 0 ? projectsList : projects).map((project: Project) => (
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

      <div className="mt-16 flex flex-col items-center gap-8">
        <div className="flex flex-wrap justify-center gap-4">
          {visibleCount < repos.length && (
            <button
              onClick={showMoreProjects}
              className="interactable flex items-center gap-3 border border-white/10 bg-white/[0.02] px-6 py-3 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-all hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
            >
              <RiArrowUpCircleLine className="h-4 w-4 rotate-180" />
              discover more
            </button>
          )}

          {visibleCount >= 1 && (
            <button
              onClick={showLessProjects}
              className="interactable flex items-center gap-3 border border-white/10 bg-white/[0.02] px-6 py-3 font-mono text-xs uppercase tracking-widest text-neutral-400 transition-all hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
            >
              <RiArrowUpCircleLine className="h-4 w-4" />
              collapse
            </button>
          )}
        </div>
        <div className="flex items-center justify-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">
            Projects are dynamically fetched through GitHub API
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProjectSection;
