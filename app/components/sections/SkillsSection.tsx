import { SKILLS_DATA } from "@/app/constants/skills";
import FadeUp from "../ui/FadeUp";

export const SkillsSection = () => (
  <FadeUp className="md:hidden">
    <div className="mt-5 py-2 text-2xl font-semibold text-zinc-700">skills</div>
    <ul className="flex flex-col space-y-1 text-start font-normal">
      <li>{SKILLS_DATA.frameworks}</li>
      <li>{SKILLS_DATA.languages}</li>
      <li>{SKILLS_DATA.databases}</li>
      <li>{SKILLS_DATA.styling}</li>
      <li>{SKILLS_DATA.mobile}</li>
    </ul>
  </FadeUp>
);
