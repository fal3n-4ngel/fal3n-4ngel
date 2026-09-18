"use client";

import { EXPERIENCE_DATA, ExperienceItem } from "@/data/experience";
import { AwardItemData, getAwards, getExperiences } from "@/lib/integrations/notion";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

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

export const AchievementsSection: React.FC<{
  initialExperiences?: ExperienceItem[];
  initialAwards?: AwardItemData[];
}> = ({ initialExperiences, initialAwards }) => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(
    initialExperiences && initialExperiences.length > 0 ? initialExperiences : EXPERIENCE_DATA
  );
  const [awards, setAwards] = useState<AwardItemData[]>(
    initialAwards && initialAwards.length > 0 ? initialAwards : DEFAULT_AWARDS
  );
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!initialExperiences || initialExperiences.length === 0) {
      getExperiences().then((data) => {
        if (data && data.length > 0) {
          setExperiences(data);
          if (typeof window !== "undefined") {
            setTimeout(() => {
              (window as unknown as { lenis?: { resize: () => void } }).lenis?.resize();
              window.dispatchEvent(new Event("resize"));
            }, 50);
          }
        }
      });
    }
    if (!initialAwards || initialAwards.length === 0) {
      getAwards().then((data) => {
        if (data && data.length > 0) {
          setAwards(data);
          if (typeof window !== "undefined") {
            setTimeout(() => {
              (window as unknown as { lenis?: { resize: () => void } }).lenis?.resize();
              window.dispatchEvent(new Event("resize"));
            }, 50);
          }
        }
      });
    }
  }, [initialExperiences, initialAwards]);

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

  // Parallax curtain recession as ProjectsSection rises over Background
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["end end", "end start"],
  });
  const exitScale = useTransform(exitProgress, [0, 1], [1, 0.95]);
  const exitOpacity = useTransform(exitProgress, [0, 0.85], [1, 0.4]);
  const exitY = useTransform(exitProgress, [0, 1], ["0%", "-4%"]);

  return (
    <section
      ref={sectionRef}
      id="achievements"
      className="relative z-10 w-full min-h-screen border-t border-white/10 bg-black px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 md:pb-10 flex flex-col justify-center overflow-hidden"
    >
      <motion.div
        style={{
          scale: shouldReduceMotion ? 1 : exitScale,
          opacity: shouldReduceMotion ? 1 : exitOpacity,
          y: shouldReduceMotion ? 0 : exitY,
          willChange: "transform",
        }}
        className="w-full origin-center"
      >
        <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-start lg:gap-24">
          {/* ── Left Column: Section Title & Subtitle (Sticky on Desktop) ── */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:w-1/2 lg:sticky lg:top-24"
          >
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 sm:mb-3">
              <span>[ 01 // OVERVIEW ]</span>
            </div>

          <h2 className="interactable font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white leading-none">
            Background
          </h2>
          <p className="mt-3 text-sm sm:text-base font-light text-zinc-400 leading-relaxed">
            Where I’ve worked, learned, and built.
          </p>

          <div className="mt-6 sm:mt-8 font-mono text-xs sm:text-sm">
            <a
              href="/Resume_Adithya_Krishnan_sept.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="interactable group inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <span>[ Open Curriculum Vitae ]</span>
              <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                ↗
              </span>
            </a>
          </div>
        </motion.div>

        {/* ── Right Column: Experience, Skills & Awards ───────────── */}
        <div className="flex flex-col gap-12 sm:gap-14 lg:w-1/2">
          {/* ── 1. Experience ── */}
          <div className="flex flex-col">
            <motion.h3
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="interactable text-lg sm:text-xl font-normal tracking-tight text-white mb-3 sm:mb-4"
            >
              Experience
            </motion.h3>
            <div className="flex flex-col divide-y divide-white/5 border-t border-white/10">
              {experiences.map((exp, idx) => (
                <motion.div
                  key={`${exp.title}-${exp.company || idx}`}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="interactable group flex flex-col gap-0.5 py-4 transition-colors hover:bg-white/[0.03] cursor-default"
                >
                  <span className="text-sm sm:text-[15px] font-normal text-zinc-100 group-hover:text-white transition-colors duration-200">
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
                </motion.div>
              ))}

              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{
                  duration: 0.5,
                  delay: experiences.length * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="interactable group flex flex-col gap-0.5 py-4 transition-colors hover:bg-white/[0.03] cursor-default"
              >
                <span className="text-sm sm:text-[15px] font-normal text-zinc-100 group-hover:text-white transition-colors duration-200">
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
              </motion.div>
            </div>
          </div>

          {/* ── 2. Skills ── */}
          <div className="flex flex-col">
            <motion.h3
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="interactable text-lg sm:text-xl font-normal tracking-tight text-white mb-3 sm:mb-4"
            >
              Skills
            </motion.h3>
            <div className="flex flex-col divide-y divide-white/5 border-t border-white/10">
              {skillsData.map((item, idx) => (
                <motion.div
                  key={item.category}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="interactable group flex flex-col gap-1 py-4 transition-colors hover:bg-white/[0.03] cursor-default"
                >
                  <span className="text-sm sm:text-[15px] font-medium text-zinc-100 group-hover:text-white transition-colors duration-200">
                    {item.category}
                  </span>
                  <span className="text-sm text-zinc-300 font-light leading-relaxed">
                    {item.technologies}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── 3. Awards ── */}
          <div className="flex flex-col">
            <motion.h3
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="interactable text-lg sm:text-xl font-normal tracking-tight text-white mb-3 sm:mb-4"
            >
              Awards
            </motion.h3>
            <div className="flex flex-col divide-y divide-white/5 border-t border-white/10">
              {awards.map((item, idx) => (
                <motion.div
                  key={`${item.title}-${item.date || idx}`}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="interactable group flex flex-col gap-0.5 py-4 transition-colors hover:bg-white/[0.03] cursor-default"
                >
                  <span className="text-sm sm:text-[15px] font-normal text-zinc-100 group-hover:text-white transition-colors duration-200">
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </section>
  );
};