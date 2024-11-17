"use client";
import { 
  DiJava, DiPython, DiJavascript, DiMongodb, DiFirebase, 
  DiReact, DiAndroid 
} from "react-icons/di";
import { 
  SiDotnet, SiAngular, SiTypescript, SiTailwindcss, 
  SiFramer, SiKotlin, SiCsharp, SiFlutter, SiC, 
  SiPostgresql, SiMysql, SiGraphql 
} from "react-icons/si";
import { TbBrandNextjs } from "react-icons/tb";
import { BsDatabase } from "react-icons/bs";
import { BiTerminal } from "react-icons/bi";

const SkillIcon = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center justify-center p-4 transition-transform duration-300 hover:scale-110 interactable">
    <Icon className="w-8 h-8 md:w-12 md:h-12 mb-2 text-primary" />
    <span className="text-sm md:text-base text-center">{label}</span>
  </div>
);

const SkillsSection = () => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-7 gap-6">
      {/* Frameworks & Frontend */}
      <SkillIcon icon={TbBrandNextjs} label="Next.js" />
      <SkillIcon icon={DiReact} label="React" />
      <SkillIcon icon={SiAngular} label="Angular" />
      <SkillIcon icon={SiTailwindcss} label="Tailwind CSS" />
      <SkillIcon icon={SiFramer} label="Framer Motion" />
      <SkillIcon icon={DiJavascript} label="JavaScript" />
      <SkillIcon icon={SiTypescript} label="TypeScript" />
      
      {/* Backend & Scripting */}
      <SkillIcon icon={SiDotnet} label=".NET" />
      <SkillIcon icon={DiPython} label="Python" />
      <SkillIcon icon={SiCsharp} label="C#" />
      <SkillIcon icon={BiTerminal} label="Shell Scripting" />

      {/* Databases */}
      <SkillIcon icon={DiMongodb} label="MongoDB" />
      <SkillIcon icon={SiPostgresql} label="PostgreSQL" />
      <SkillIcon icon={SiMysql} label="MySQL" />
      <SkillIcon icon={DiFirebase} label="Firebase" />
      <SkillIcon icon={BsDatabase} label="SQL" />
      
      {/* Programming Languages */}
      <SkillIcon icon={SiC} label="C" />
      <SkillIcon icon={DiJava} label="Java" />
      <SkillIcon icon={SiKotlin} label="Kotlin" />

      {/* Mobile Development */}
      <SkillIcon icon={DiAndroid} label="Android" />
      <SkillIcon icon={SiFlutter} label="Flutter" />
    </div>
  );
};

export default SkillsSection;
