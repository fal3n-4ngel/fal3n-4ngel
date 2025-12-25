import { SKILLS_DATA } from "@/app/constants/skills";
import { memo } from "react";
import FadeUp from "../ui/FadeUp";

export const SkillsSection = memo(() => (
  <FadeUp className="md:hidden">
    <div className="mt-5 py-2 text-2xl font-semibold text-zinc-700 md:hidden md:text-[1.5vw]">
      skills
    </div>
    <div className="flex flex-col space-y-1 text-start font-normal md:hidden">
      <div>{SKILLS_DATA.frameworks}</div>
      <div>{SKILLS_DATA.languages}</div>
      <div>{SKILLS_DATA.databases}</div>
      <div>{SKILLS_DATA.styling}</div>
      <div>{SKILLS_DATA.mobile}</div>
    </div>
  </FadeUp>
));

SkillsSection.displayName = "SkillsSection";
