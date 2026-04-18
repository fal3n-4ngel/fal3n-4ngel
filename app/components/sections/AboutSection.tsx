import { getSiteConfig } from "@/app/lib/notion";
import { useEffect, useState } from "react";
import FadeUp from "../ui/FadeUp";
import { GhostButton } from "../ui/GhostButton";
import { AwardsSection } from "./AwardsSection";
import { ExperienceSection } from "./ExperienceSection";

interface AboutSectionProps {
  isEscaping: boolean;
  triggerEscape: () => void;
  resetEscape: () => void;
}

export const AboutSection = ({ isEscaping, triggerEscape, resetEscape }: AboutSectionProps) => {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    getSiteConfig().then((data) => {
      if (data) setConfig(data);
    });
  }, []);

  const collaborationStatus = config?.["collaboration"]?.isEnabled ?? false;
  const collaborationText = config?.["collaboration"]?.content || "Inactive";

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-black px-12 py-24 pt-48">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 md:flex-row md:items-start md:gap-20">
        {/* Left: Hero Content */}
        <div className="flex-1 space-y-8">
          <div className="space-grotesk max-w-2xl text-3xl font-light leading-[1.1] tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
            <FadeUp>
              Building performant,{" "}
              <span className="text-white/60">scalable digital experiences.</span>
            </FadeUp>
          </div>

          {/* New block to fill space */}
          <div className="mt-12 flex flex-col border-t border-white/10 pt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 md:mt-24 md:flex-row md:gap-12">
            <div>
              <p className="mb-2 text-zinc-700">Based in</p>
              <p className="text-zinc-300">Kerala, India</p>
            </div>
            <div className="mt-6 space-y-2 md:mt-0">
              <p className="text-white/40">Status</p>
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    collaborationStatus ? "animate-pulse bg-green-500" : "bg-red-500"
                  }`}
                />
                <span>{collaborationText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Lists */}
        <div className="flex w-full flex-col gap-8 md:w-auto md:max-w-sm lg:max-w-md">
          <ExperienceSection />
          <AwardsSection />

          <GhostButton
            isEscaping={isEscaping}
            triggerEscape={triggerEscape}
            resetEscape={resetEscape}
          />
        </div>
      </div>
    </section>
  );
};
