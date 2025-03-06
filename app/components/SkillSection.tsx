"use client";
import {
  DiJava,
  DiPython,
  DiMongodb,
  DiFirebase,
  DiReact,
} from "react-icons/di";
import {
  SiDotnet,
  SiAngular,
  SiTypescript,
  SiTailwindcss,
  SiKotlin,
  SiCsharp,
  SiFlutter,
  SiC,
  SiPostgresql,
  SiMysql,
} from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";
import FadeUp from "./FadeUp";

// Define the type for the icon prop
interface SkillIconProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const SkillIcon: React.FC<SkillIconProps> = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-center rounded-xl bg-white p-2 px-4 text-black transition-transform duration-300 hover:scale-105">
    <Icon className="mr-2 h-4 w-4 md:h-6 md:w-6" />
    <span className="text-sm md:text-base">{label}</span>
  </div>
);

const SkillsSection = () => (
  <div>
    <FadeUp>
      <div className="work-sans py-10 text-5xl md:text-6xl">
        What I`m Good At
      </div>

      <div className="ml-10 flex flex-wrap gap-6 rounded-xl bg-[#1a1a1a7b] p-10 ">
        <SkillIcon icon={TbBrandNextjs} label="Next.js" />
        <SkillIcon icon={DiReact} label="React.js" />
        <SkillIcon icon={SiAngular} label="Angular.js" />
        <SkillIcon icon={SiTailwindcss} label="Tailwind CSS" />
        <SkillIcon icon={SiTypescript} label="TypeScript" />
        <SkillIcon icon={SiDotnet} label=".NET" />
        <SkillIcon icon={DiPython} label="Python" />
        <SkillIcon icon={SiC} label="C" />
        <SkillIcon icon={DiJava} label="Java" />
        <SkillIcon icon={SiCsharp} label="C#" />

        <SkillIcon icon={DiMongodb} label="MongoDB" />
        <SkillIcon icon={SiPostgresql} label="PostgreSQL" />
        <SkillIcon icon={SiMysql} label="MySQL" />
        <SkillIcon icon={DiFirebase} label="Firebase" />
        <SkillIcon icon={SiKotlin} label="Kotlin" />
        <SkillIcon icon={SiFlutter} label="Flutter" />
      </div>
    </FadeUp>
  </div>
);

export default SkillsSection;
