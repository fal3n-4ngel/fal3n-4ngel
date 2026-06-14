"use client";

import React from "react";
import FadeUp from "@/components/ui/FadeUp";

interface SkillsPanelProps {
  activeProject: string | null;
  isVisible: boolean;
  skillIcons: Record<string, React.ComponentType<{ className?: string }>>;
  projectSkills: Record<string, string[]>;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({
  activeProject,
  isVisible,
  skillIcons,
  projectSkills,
}) => {
  return (
    <div
      className={`transition-opacity duration-700 ease-out ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
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
  );
};
