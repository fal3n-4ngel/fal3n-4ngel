"use client";
import {
  DiJava,
  DiPython,
  DiJavascript,
  DiMongodb,
  DiFirebase,
  DiReact,
  DiAndroid,
} from "react-icons/di";
import {
  SiDotnet,
  SiAngular,
  SiTypescript,
  SiTailwindcss,
  SiFramer,
  SiKotlin,
  SiCsharp,
  SiFlutter,
  SiC,
  SiPostgresql,
  SiMysql,
  SiGraphql,
} from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";
import { BsDatabase } from "react-icons/bs";
import { BiTerminal } from "react-icons/bi";
import FadeUp from "./FadeUp";

// Define the type for the icon prop
interface SkillIconProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const SkillIcon: React.FC<SkillIconProps> = ({ icon: Icon, label }) => (
  <div className="flex items-center justify-center p-2 px-4 transition-transform duration-300 hover:scale-105  bg-white text-black rounded-xl">
    <Icon className="w-4 h-4 md:w-6 md:h-6 mr-2 " />
    <span className="text-sm md:text-base">{label}</span>
  </div>
);

const SkillsSection = () => (
  <div>
    <FadeUp>
      <div className="md:text-6xl text-5xl py-10 work-sans">
        What I`m Good At
      </div>

      <div className="ml-10 flex flex-wrap gap-6 bg-[#1a1a1a7b] p-10  rounded-xl ">
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
