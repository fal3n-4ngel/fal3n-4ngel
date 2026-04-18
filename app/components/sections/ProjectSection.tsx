"use client";
import { projects } from "../../data/projects";
import { Project } from "../../types/projects";
import FadeUp from "../ui/FadeUp";
import ProjBox from "../ui/ProjBox";

function ProjectSection() {
  return (
    <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-12 md:py-24">
      <div className="mb-8 md:mb-24">
        <FadeUp>
          <h3 className="text-md mb-8 font-bold uppercase tracking-[0.3em] text-neutral-600">
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
      </div>
    </section>
  );
}

export default ProjectSection;
