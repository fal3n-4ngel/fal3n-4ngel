"use client";

import { EXPERIENCE_DATA, ExperienceItem } from "@/data/experience";
import { AwardItemData, getAwards, getExperiences } from "@/lib/integrations/notion";
import React, { useEffect, useState } from "react";

const DEFAULT_AWARDS: AwardItemData[] = [
  {
    title: "Web3 for India Winner",
    org: "BlockHash | Kerala Blockchain Academy",
    team: "Team deflated pappadam",
    date: "2023",
  },
  {
    title: "Best Design, 1st Runner Up",
    org: "CodeCrypt Hackathon | Cusat",
    team: "Team deflated pappadam",
    date: "2023",
  },
];

export const AchievementsSection: React.FC = () => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(EXPERIENCE_DATA);
  const [awards, setAwards] = useState<AwardItemData[]>(DEFAULT_AWARDS);

  useEffect(() => {
    getExperiences().then((data) => {
      if (data && data.length > 0) {
        setExperiences(data);
      }
    });
    getAwards().then((data) => {
      if (data && data.length > 0) {
        setAwards(data);
      }
    });
  }, []);

  const skillsData = [
    {
      category: "Frontend",
      technologies: "React, Next.js, TypeScript, JavaScript, Tailwind CSS, Three.js, Framer Motion, HTML5/CSS3",
    },
    {
      category: "Backend",
      technologies: "Java Spring Boot, Python, Node.js, .NET, PostgreSQL, MongoDB, Redis, REST APIs, Microservices",
    },
    {
      category: "Mobile & Cloud",
      technologies: "Flutter, Kotlin, Firebase, Docker, Git, Google Cloud Platform, Linux, CI/CD",
    },
  ];

  return (
    <section
      id="achievements"
      className="relative w-full border-t border-white/10 bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-14 sm:py-20 md:py-28"
    >
      <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-start lg:gap-24">
        {/* ── Left Column: Section Title & Subtitle ── */}
        <div className="flex flex-col lg:w-1/2 lg:sticky lg:top-24">
          <h2 className="interactable text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white">
            Background
          </h2>
          <p className="mt-2.5 sm:mt-3 text-sm sm:text-base font-light text-zinc-400">
            Where I’ve worked, learned, and built.
          </p>

          <div className="mt-6 sm:mt-8 font-mono text-xs sm:text-sm">
            <a
              href="/Resume_Adithya_Krishnan_sept.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="interactable inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <span>[ Open Curriculum Vitae ]</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* ── Right Column: Experience, Skills & Awards ───────────── */}
        <div className="flex flex-col gap-12 sm:gap-14 lg:w-1/2">
          <div className="flex flex-col">
            <h3 className="interactable text-lg sm:text-xl font-normal tracking-tight text-white mb-3 sm:mb-4">
              Experience
            </h3>
            <div className="flex flex-col divide-y divide-white/5 border-t border-white/10">
              {experiences.map((exp, idx) => (
                <div
                  key={`${exp.title}-${exp.company || idx}`}
                  className="interactable group flex flex-col gap-0.5 py-4 transition-colors hover:bg-white/[0.03] cursor-default"
                >
                  <span className="text-sm sm:text-[15px] font-normal text-zinc-100 group-hover:text-white transition-colors">
                    {exp.title}
                  </span>
                  <span className="font-mono text-xs sm:text-[13px] text-zinc-400">
                    {exp.companyUrl ? (
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="interactable hover:text-white transition-colors underline-offset-4 hover:underline"
                      >
                        {exp.company}
                      </a>
                    ) : (
                      exp.company
                    )}
                    {" · "}
                    {exp.period}
                  </span>
                </div>
              ))}
              <div className="interactable group flex flex-col gap-0.5 py-4 transition-colors hover:bg-white/[0.03] cursor-default">
                <span className="text-sm sm:text-[15px] font-normal text-zinc-100 group-hover:text-white transition-colors">
                  Bachelor of Technology (CSE)
                </span>
                <span className="font-mono text-xs sm:text-[13px] text-zinc-400">
                  <a
                    href="https://ktu.edu.in/?ref=adithyakrishnan.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactable hover:text-white transition-colors underline-offset-4 hover:underline"
                  >
                    APJ Abdul Kalam Technological University
                  </a>
                  {" · "}2021 - 2025
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="interactable text-lg sm:text-xl font-normal tracking-tight text-white mb-3 sm:mb-4">
              Skills
            </h3>
            <div className="flex flex-col divide-y divide-white/5 border-t border-white/10">
              {skillsData.map((item) => (
                <div
                  key={item.category}
                  className="interactable group flex flex-col gap-1 py-4 transition-colors hover:bg-white/[0.03] cursor-default"
                >
                  <span className="text-sm sm:text-[15px] font-medium text-zinc-100 group-hover:text-white transition-colors">
                    {item.category}
                  </span>
                  <span className="text-sm text-zinc-300 font-light leading-relaxed">
                    {item.technologies}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="interactable text-lg sm:text-xl font-normal tracking-tight text-white mb-3 sm:mb-4">
              Awards
            </h3>
            <div className="flex flex-col divide-y divide-white/5 border-t border-white/10">
              {awards.map((item, idx) => (
                <div
                  key={`${item.title}-${item.date || idx}`}
                  className="interactable group flex flex-col gap-0.5 py-4 transition-colors hover:bg-white/[0.03] cursor-default"
                >
                  <span className="text-sm sm:text-[15px] font-normal text-zinc-100 group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                  <span className="font-mono text-xs sm:text-[13px] text-zinc-400">
                    {item.org}
                    {" · "}
                    {item.date}
                  </span>
                  {item.team && (
                    <span className="text-xs font-mono text-zinc-500 mt-0.5">
                      {item.team}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};