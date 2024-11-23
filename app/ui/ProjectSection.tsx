"use client";
import React, { useEffect, useState } from "react";
import { RiArrowUpCircleLine } from "react-icons/ri";
import FadeUp from "../components/FadeUp";
import ProjBox from "../components/ProjBox";
import GithubProjectBox from "../components/ProjectBoxGithub";
type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string;
  created_at: string;
  fork: boolean;
  stargazers_count: number;
};

function ProjectSection() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    async function fetchRepos() {
      const response = await fetch(
        "https://api.github.com/users/fal3n-4ngel/repos",
      );
      const data = await response.json();

      const filteredRepos = data
        .filter((repo: Repo) => !repo.fork || repo.stargazers_count > 0)

        .sort((a: Repo, b: Repo) => {
          if (
            b.stargazers_count === a.stargazers_count ||
            b.stargazers_count != a.stargazers_count
          ) {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }
          return b.stargazers_count - a.stargazers_count;
        });

      setRepos(filteredRepos);
    }
    fetchRepos();
  }, []);

  const showMoreProjects = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 3, repos.length));
  };

  const showLessProjects = () => {
    setVisibleCount((prevCount) => Math.min(prevCount - 3, repos.length));
  };

  return (
    <section className="mx-auto flex min-h-screen w-[90%] flex-col justify-center p-5 text-4xl font-light md:w-[75%] md:p-0">
      <FadeUp>
        <div className="work-sans py-10 text-5xl md:text-6xl">
          Selected Works
        </div>
      </FadeUp>

      <div className="flex h-full w-full flex-wrap items-center justify-center">
        <FadeUp>
          <ProjBox
            url1="/Flash1.png"
            name="FLASH DRIVE"
            type="Website"
            event="College Project"
            date="2023"
            view="https://flashdrive-f2an.vercel.app/"
            description="A Next.js web platform featuring an AI image generator with custom-trained Stable Diffusion model and a few other arcade games. Built with Firebase and EpicRealism image model , it`s just a DBMS course project that evolved into a playground for implementing advanced web technologies."
          />
        </FadeUp>

        <FadeUp>
          <ProjBox
            url1="/SOYO.png"
            name="Stream Own Your Own"
            type="Website"
            event="Side Project"
            date="2024"
            description="A Next.js-powered local streaming solution that turns your computer into a personal media server. Built to solve the problem of limited mobile storage, SOYO lets you stream your video library across all devices on your network through a clean, modern interface."
            view="https://github.com/fal3n-4ngel/SOYO"
          />
        </FadeUp>
        <FadeUp>
          <ProjBox
            url1="/smartcertify.png"
            name="SMART CERTIFY"
            type="Website | Blockchain "
            event="BlockHash "
            date="2023"
            view="https://github.com/Deflated-Pappadam/Smart-Certify"
            description="A blockchain based certification platform thatuniquely identifies organizations through secure wallet IDs and authenticates users via AADHAR integration, ensuring tamper-proof documentation. This project secured the winning spot at BlockHash 2023 by the Kerala Blockchain Academy."
          />
        </FadeUp>

        <FadeUp>
          <ProjBox
            url1="/betterfunds.png"
            name="BETTER FUNDS"
            type="Website | Desktop"
            event="Zilckathon"
            date="2024"
            view="https://better-funds.vercel.app/"
            description="Developed in a 24-hour hackathon (Zilckathon - HFT), Better Funds is a blockchain-based incentivized crowdfunding platform. Contributors earn tokens proportional to their contributions, which can be redeemed in a marketplace."
          />
        </FadeUp>

        <FadeUp>
          <ProjBox
            url1="/Sustaina1.png"
            name="SUS GOALS"
            type="Website"
            event="College Project"
            date="2023"
            view="https://sus-goals.vercel.app/"
            description="A college project centered on promoting sustainable development goals (SDGs). SUS Goals provides users with daily tasks to complete and keeps a global counter of the tasks completed , thus helping SDG's through an engaging digital experience."
          />
        </FadeUp>
        <FadeUp>
          <ProjBox
            url1="/Drish.png"
            name="DRISHTI"
            type="Mobile App"
            event="Define 2022"
            date="2022"
            view="https://github.com/fal3n-4ngel/Drishti-Client"
            description="Drishti simplifies hazard reporting and notifications, focusing on incidents like snapped powerlines or broken pipelines. Developed for Define Hack 2022, it enables users to report hazards, receive alerts, and track report status, while admins manage responses through a web service."
          />
        </FadeUp>
        <FadeUp>
          {" "}
          <ProjBox
            url1="/Ctrack.png"
            name="C-TRACKER"
            type="Java | Swing"
            event="College Project"
            date="2023"
            view="https://github.com/fal3n-4ngel/CTracker"
            description="A Java Swing GUI application tailored as an academic-themed task manager. C-Tracker employs SQLite for efficient database management and features tools for adding, editing, deleting, and tracking academic tasks."
          />
        </FadeUp>

        {repos.slice(0, visibleCount).map((repo) => (
          <GithubProjectBox
            key={repo.id}
            url1={Math.random() * 11}
            name={repo.name.toUpperCase()}
            type="GitHub Repository"
            event="Projects"
            date={new Date(repo.created_at).getFullYear().toString()}
            view={repo.html_url}
          />
        ))}

        <FadeUp className="m-5 p-10">
          <div className="m-5 flex flex-col items-center p-10">
            {visibleCount < repos.length && (
              <button
                onClick={showMoreProjects}
                className="interactable font-poppins mb-5 flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:text-2xl"
              >
                <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
                discover more{" "}
                <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
              </button>
            )}

            {visibleCount >= 1 && (
              <button
                onClick={showLessProjects}
                className="interactable font-poppins flex h-fit w-fit cursor-pointer items-center gap-2 rounded-full bg-[#afafaf] p-2 px-5 text-lg text-black transition-all dark:bg-[#3d3d3d] dark:text-white md:text-2xl"
              >
                <RiArrowUpCircleLine className="h-6 w-6" /> collapse
                <RiArrowUpCircleLine className="h-6 w-6" />
              </button>
            )}
            <div className="mt-8 flex w-full flex-col items-center rounded-full p-2 text-center shadow-md">
              <div className="flex w-full items-center justify-center">
                <p className="work-sans text-xs font-light text-[#2e3440] dark:text-[#e5e9f0] md:text-base">
                  Projects are dynamically fetched through GitHub Api
                </p>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

export default ProjectSection;
