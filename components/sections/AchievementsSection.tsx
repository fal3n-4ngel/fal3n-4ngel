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
      className="relative w-full border-t border-white/10 bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-20 md:py-28"
    >
      <div className="flex w-full flex-col gap-16 lg:flex-row lg:items-start lg:gap-24">
        {/* ── Left Column: Section Title & Subtitle (matching reference exactly) ── */}
        <div className="flex flex-col lg:w-1/2 lg:sticky lg:top-24">
          <h2 className="interactable text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white">
            Achievements
          </h2>
          <p className="mt-3 text-sm sm:text-base font-light text-zinc-400">
            An overview of my credentials and skillset.
          </p>

          <div className="mt-8 font-mono text-sm">
            <a
              href="/Resume_Adithya_Krishnan.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="interactable inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <span>[ Open Curriculum Vitae ]</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* ── Right Column: Experience, Skills & Awards Tables ───────────── */}
        <div className="flex flex-col gap-14 lg:w-1/2">
          {/* ── Experience Table ────────────────────────────────────────── */}
          <div className="flex flex-col">
            <h3 className="interactable text-lg sm:text-xl font-normal tracking-tight text-white mb-4">
              Experience
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left font-sans text-sm sm:text-[15px]">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-zinc-400">
                    <th className="pb-3.5 font-normal w-5/12">WHAT</th>
                    <th className="pb-3.5 font-normal w-4/12">WHERE</th>
                    <th className="pb-3.5 font-normal text-right w-3/12">WHEN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {experiences.map((exp, idx) => (
                    <tr key={idx} className="interactable group transition-colors hover:bg-white/[0.03] cursor-default">
                      <td className="py-4 pr-4 text-zinc-100 font-normal group-hover:text-white transition-colors">
                        {exp.title}
                      </td>
                      <td className="py-4 pr-4 text-zinc-300 font-light">
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
                      </td>
                      <td className="py-4 text-right font-mono text-xs sm:text-[13px] text-zinc-400 whitespace-nowrap">
                        {exp.period}
                      </td>
                    </tr>
                  ))}
                  {/* Education row */}
                  <tr className="interactable group transition-colors hover:bg-white/[0.03] cursor-default">
                    <td className="py-4 pr-4 text-zinc-100 font-normal group-hover:text-white transition-colors">
                      Bachelor of Technology (CSE)
                    </td>
                    <td className="py-4 pr-4 text-zinc-300 font-light">
                      APJ Abdul Kalam Tech University
                    </td>
                    <td className="py-4 text-right font-mono text-xs sm:text-[13px] text-zinc-400 whitespace-nowrap">
                      2020 - 2024
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Skills Table ────────────────────────────────────────────── */}
          <div className="flex flex-col">
            <h3 className="interactable text-lg sm:text-xl font-normal tracking-tight text-white mb-4">
              Skills
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left font-sans text-sm sm:text-[15px]">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-zinc-400">
                    <th className="pb-3.5 font-normal w-1/3">CATEGORY</th>
                    <th className="pb-3.5 font-normal w-2/3 text-right">TECHNOLOGIES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {skillsData.map((item, idx) => (
                    <tr key={idx} className="interactable group transition-colors hover:bg-white/[0.03] cursor-default">
                      <td className="py-4 pr-4 text-zinc-100 font-medium align-top group-hover:text-white transition-colors">
                        {item.category}
                      </td>
                      <td className="py-4 text-right text-zinc-300 font-light leading-relaxed">
                        {item.technologies}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Awards Table (Replacing Languages) ───────────────────────── */}
          <div className="flex flex-col">
            <h3 className="interactable text-lg sm:text-xl font-normal tracking-tight text-white mb-4">
              Awards
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left font-sans text-sm sm:text-[15px]">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-zinc-400">
                    <th className="pb-3.5 font-normal w-5/12">HONOR</th>
                    <th className="pb-3.5 font-normal w-4/12">ORGANIZER / EVENT</th>
                    <th className="pb-3.5 font-normal text-right w-3/12">YEAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {awards.map((item, idx) => (
                    <tr key={idx} className="interactable group transition-colors hover:bg-white/[0.03] cursor-default">
                      <td className="py-4 pr-4 text-zinc-100 font-normal group-hover:text-white transition-colors">
                        <div>{item.title}</div>
                        {item.team && (
                          <div className="text-xs font-mono text-zinc-400 mt-1">
                            {item.team}
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-zinc-300 font-light">
                        {item.org}
                      </td>
                      <td className="py-4 text-right font-mono text-xs sm:text-[13px] text-zinc-400 whitespace-nowrap">
                        {item.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
