"use client";
import { useEffect, useRef, useState } from "react";
import { useFollowPointer } from "./utils/FollowPointer";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Navbar from "./components/Navbar";
import FadeUp from "./components/FadeUp";
import ProjBox from "./components/ProjBox";
import {
  RiArrowUpCircleLine,
  RiFile2Fill,
  RiGamepadLine,
  RiGithubFill,
  RiLinkedinBoxFill,
  RiMailFill,
} from "react-icons/ri";
import useSmoothScroll from "./utils/SmoothScroll";
import ProjBoxGithub from "./components/ProjectBoxGithub";
import { GoogleAnalytics } from "nextjs-google-analytics";
import GithubProjectBox from "./components/ProjectBoxGithub";
import SkillsSection from "./components/SkillSection";
import GhostGame from "./components/GhostGame";
import GhostEscape from "./components/GhostGame";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string;
  created_at: string;
  fork: boolean;
  stargazers_count: number;
};
interface Position {
  x: number;
  y: number;
}

export default function Home() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);
  const [interacting, setInteracting] = useState(false);
  const [projImage, setProjImage] = useState(false);
  const [offset, setOffset] = useState(0);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isEscaping, setIsEscaping] = useState<boolean>(false);
  const [hasEscaped, setHasEscaped] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (typeof window !== "undefined") {
    window.onmousemove = (e) => {
      if (e) {
        const targetElement = e.target as HTMLElement;
        const interactableElement = targetElement.closest(".interactable");
        setInteracting(interactableElement ? true : false);
        const targetImage = e.target as HTMLElement;
        const interactableImage = targetImage.closest(".projImg");
        setProjImage(interactableImage ? true : false);
        if (interacting) {
          setOffset(50);
        } else {
          setOffset(0);
        }
      }
    };
  }

  useEffect(() => {
    async function fetchRepos() {
      const response = await fetch(
        "https://api.github.com/users/fal3n-4ngel/repos"
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

  useSmoothScroll();

  const pathRef = useRef<Position[]>([]); // Store the path here

  // Update dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const generateRandomPath = (startPos: { x: number; y: number }) => {
    const points = [startPos]; // Start from the mouse position
    const numPoints = 10;
    const padding = 50; // Allow for wider coverage
    const { width, height } = dimensions;

    for (let i = 0; i < numPoints; i++) {
      const controlPoint1 = {
        x: padding + Math.random() * (width - 2 * padding),
        y: padding + Math.random() * (height - 2 * padding),
      };
      const controlPoint2 = {
        x: padding + Math.random() * (width - 2 * padding),
        y: padding + Math.random() * (height - 2 * padding),
      };
      const endPoint = {
        x: padding + Math.random() * (width - 2 * padding),
        y: padding + Math.random() * (height - 2 * padding),
      };

      points.push(controlPoint1, controlPoint2, endPoint);
    }

    // Ensure loop: add the first point to the end
    if (points.length > 0) {
      points.push(points[0]);
    }

    return points;
  };

  const triggerEscape = () => {
    if (!isEscaping) {
      // Generate a new path only when starting the escape
      pathRef.current = generateRandomPath({x,y});
      setIsEscaping(true);
    }
  };

  const resetEscape = () => {
    setIsEscaping(false);
  };

  const ghostVariants: Variants = {
    initial: {
      x: dimensions.width / 2,
      y: dimensions.height / 2,
      scale: 0.2,
      opacity: 0,
    },
    breakFree: {
      scale: 1,
      opacity: 1,
      transition: { duration: 2, ease: "easeOut" },
    },
    escape: {
      x: pathRef.current.map((p) => p.x), // Use the stable path
      y: pathRef.current.map((p) => p.y),
      rotate: [0, 25, -10, 5, 0, 35, -10, -5, 0, 15, -10, 0, 0, 5, -10, 0],
      scale: [1, 1.1, 0.9, 1],
      transition: {
        duration: 80, // Slower movement
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
    exit: {
      opacity: 0,
      scale: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#ececec] dark:bg-[#121212]  text-black dark:text-white">
      <GoogleAnalytics trackPageViews />

      <div>
        <AnimatePresence>
          {isEscaping && dimensions.width > 0 && (
            <motion.div
              className="fixed z-10  interactable"
              initial="initial"
              animate={["breakFree", "spin", "escape"]}
              exit="exit"
              variants={ghostVariants}
            >
              <img
                src="/ghostwhite.png"
                onClick={() => resetEscape()}
                alt="Escaping Ghost"
                className="w-28 h-28 opacity-90 interactable"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <motion.div
          style={{
            position: "fixed",
            top: `0%`,
            left: `0%`,
            height: "200px",
            width: "200px",
          }}
          animate={{
            x: x - offset,
            y: y - offset,
            top: 0,
            left: 0,
            width: `${interacting ? "200px" : "40px"}`,
            height: `${interacting ? "200px" : "40px"}`,
          }}
          className={`bg-white rounded-full z-top md:flex hidden pointer-events-none ${
            !projImage
              ? "mix-blend-difference"
              : " opacity-0 scale-0 transition-all duration-100 overflow-hidden"
          } `}
        >
          {" "}
          <img
            src="/ghost.png"
            className={`z-[-1] opacity-25 ${
              hasEscaped || isEscaping ? "hidden" : "flex"
            }`}
          ></img>
        </motion.div>
      </div>

      <main
        className="w-full flex flex-col min-h-screen items-center justify-between bg-[#ececec] dark:bg-[#0c0c0c] text-black dark:text-white overflow-x-hidden"
        ref={ref}
      >
        <div className="w-full fixed z-[10]">
          <Navbar />
        </div>

        <section className="md:w-[80%] w-full justify-center  min-h-screen flex flex-col">
          <FadeUp className=" flex text-black  space-grotesk ">
            <h1 className="md:text-[2vw] text-xl p-5 work-sans">Hello,</h1>
          </FadeUp>
          <div className="md:flex flex-col hidden tracking-tighter space-grotesk leading-none md:text-[4.4vw] text-[2.8rem] px-5 interactable w-fit">
            <div className="md:max-h-[8vh] h-[8vh] overflow-hidden">
              <FadeUp className=" flex text-black ">
                I`m Adithya Krishnan,
              </FadeUp>
            </div>
            <div className="md:max-h-[8vh] h-[8vh] overflow-hidden">
              <FadeUp className="  text-black ">
                a Software Engineer crafting
              </FadeUp>
            </div>
            <div className="md:max-h-[8vh] h-[8vh] overflow-hidden">
              <FadeUp className=" text-black ">Digital Experiences.</FadeUp>
            </div>
          </div>
          <div className="md:hidden flex flex-col  tracking-tighter leading-none md:text-6xl space-grotesk text-[2.15rem] px-5 interactable text-left">
            <div className="h-[40px] overflow-hidden ">
              <FadeUp className=" flex text-black   ">
                I&apos;m Adithya Krishnan,
              </FadeUp>
            </div>
            <div className="h-[40px] overflow-hidden">
              <FadeUp className="  text-black   ">a Software Engineer</FadeUp>
            </div>
            <div className="h-[40px] overflow-hidden">
              <FadeUp className="  text-black   "> crafting</FadeUp>
            </div>
            <div className="h-[40px] overflow-hidden">
              <FadeUp className=" text-black ">Digital Experiences.</FadeUp>
            </div>
          </div>
        </section>

        <section className=" w-full h-full ">
          <div className="flex md:flex-row flex-col w-[80%] mx-auto justify-center items-center space-grotesk min-h-screen">
            <div className="flex flex-col md:w-[55vw] md:text-[2.2vw] md:leading-[3vw] text-xl">
              <div className="overflow-hidden">
                <FadeUp>
                  <div className="md:mx-10 m-5 ease-in interactable">
                    As a final-year undergraduate pursuing a BTech degree in
                    Computer Science and Engineering, I`m currently interning
                    while also on the lookout for full-time gigs and freelance
                    projects.
                  </div>
                </FadeUp>
              </div>

              <div className="overflow-hidden">
                <FadeUp>
                  <div className="md:mx-10 m-5 ease-in interactable">
                    When I`m not working, you`ll catch me watching anime,
                    reading random stuff, or messing with some fun side
                    projects.
                  </div>
                </FadeUp>
              </div>
            </div>
            <div className="flex flex-col md:w-[50%] w-[90%] md:text-[0.90vw] sm:space-grotek font-poppins-regular  md:pl-[20%] mx-auto tracking-wider  md:leading-2 ">
              <FadeUp>
                <div className=" text-2xl md:text-[1.5vw] text-zinc-700 mt-5 py-2 font-semibold  ">
                  experience
                </div>
              </FadeUp>
              <FadeUp>
                <div className="py-1 interactable">
                  <div className="font-semibold">
                    SDE Intern
                    <span className="text-md text-gray-400"></span>
                  </div>
                  <a
                    href="https://www.nissanmotor.jobs/ami/india/ndi/index.html?ref=adithyakrishnan.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Nissan Digital LLP
                  </a>
                  <div className="font-sans text-gray-400">
                    July 2024 - Dec 2024
                  </div>
                </div>
                <div className="py-1 interactable">
                  <div className="font-semibold">
                    Fullstack Developer Intern
                    <span className="text-md text-gray-400"></span>
                  </div>
                  <a
                    href="https://www.oronium.com?ref=adithyakrishnan.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Oronium
                  </a>
                  <div className="font-sans text-gray-400">
                    April 2024 - July 2024
                  </div>
                </div>
              </FadeUp>
              <FadeUp>
                <div className="py-1 interactable">
                  <div className="font-semibold">
                    Co Founder | Developer
                    <span className="text-md text-gray-400"></span>
                  </div>
                  <a
                    href="https://github.com/Deflated-Pappadam"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    deflated pappadam
                  </a>
                  <div className="font-sans text-gray-400">2022 - Present</div>
                </div>
                <div className="py-1 interactable">
                  <div className="font-semibold">Student Intern</div>
                  <div>UST Global, Thirvanathapuram</div>
                  <div className="font-sans text-gray-400">
                    April 2023 - May 2023
                  </div>
                </div>
              </FadeUp>

              <FadeUp>
                <div className="py-1 interactable">
                  <div className="font-semibold">Techinal Co Lead </div>
                  <div>IEEE MBCET Chapter</div>
                  <div className="font-sans text-gray-400">
                    Jan 2023 - Feb 2024
                  </div>
                </div>

                <div className="py-1 interactable">
                  <div className="font-semibold">
                    Google Cloud Facilitator
                    <span className="text-md text-gray-400"></span>
                  </div>
                  <div>GDSC MBCET</div>
                  <div className="font-sans text-gray-400">
                    Nov 2022 - Feb 2024
                  </div>
                </div>
              </FadeUp>

              <FadeUp>
                <div className=" text-2xl md:text-[1.5vw] text-zinc-700 mt-5 py-2 font-semibold ">
                  awards
                </div>
                <div className="flex flex-col font-normal space-y-1">
                  <div className="py-1 interactable">
                    <div className="font-semibold">
                      Web3 for India 2030 Winner
                      <span className="text-md text-gray-400"></span>
                    </div>
                    <div>BlockHash | kerala Block Chain Academy</div>
                    <a
                      href="https://github.com/Deflated-Pappadam"
                      className="font-sans text-gray-400 animate-pulse"
                    >
                      2023 (Team deflated pappadam)
                    </a>
                  </div>
                  <div className="py-1 interactable">
                    <div className="font-semibold">
                      Best Design , First Runner Up
                      <span className="text-md text-gray-400"></span>
                    </div>
                    <div>CodeCrypt Hackathon | Cusat</div>
                    <a
                      href="https://github.com/Deflated-Pappadam"
                      className="font-sans text-gray-400 animate-pulse "
                    >
                      2023 (Team deflated pappadam)
                    </a>
                  </div>
                </div>
              </FadeUp>
              <FadeUp>
              <div className="max-w-fit py-4 animate-pulse">
                {!isEscaping && (
                  <button
                    onClick={() => triggerEscape()}
                    className="group relative flex items-center gap-2 px-6 py-1 md:text-[1vw]  font-medium bg-white dark:bg-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 interactable"
                  >
                    <img
                      src="/ghostwhite.png"
                      alt="Ghost"
                      className="w-12 h-12  group-hover:opacity-100 transition-opacity"
                    />
                    Release the Ghost
                    <span className="absolute -bottom-6 left-0 right-0 text-sm opacity-60"></span>
                  </button>
                )}
                {isEscaping && (
                  <button
                    onClick={() => resetEscape()}
                    className="group relative flex items-center gap-2 px-6 py-3 md:text-[1vw] font-medium bg-white dark:bg-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 interactable"
                  >
                    <img
                      src="/ghostwhite.png"
                      alt="Ghost"
                      className="w-8 h-8 opacity-75 group-hover:opacity-100 transition-opacity "
                    />
                    Catch The Ghost
                  </button>
                  
                  
                )}
              </div>
              </FadeUp>
            </div>
          </div>
        </section>

        <section className="min-h-screen font-light text-4xl md:w-[75%] p-5 md:p-0 mx-auto flex flex-col justify-center ">
          <FadeUp>
            <div className="md:text-6xl text-5xl py-10 work-sans">My Works</div>
          </FadeUp>

          <div className="w-full h-full flex  flex-wrap justify-center items-center">
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
                url1="/smartcertify.png"
                name="SMART CERTIFY"
                type="Website | Blockchain "
                event="BlockHash "
                date="2023"
                view="https://github.com/Deflated-Pappadam/Smart-Certify"
                description="A blockchain based certification platform thatuniquely identifies organizations through secure wallet IDs and authenticates users via AADHAR integration, ensuring tamper-proof documentation.This project secured the winning spot at BlockHash 2023 by the Kerala Blockchain Academy."
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

            <FadeUp className="p-10 m-5">
              <div className="p-10 m-5 flex flex-col items-center">
                {visibleCount < repos.length && (
                  <button
                    onClick={showMoreProjects}
                    className="flex  items-center gap-2 w-fit h-fit p-2 px-5 cursor-pointer interactable transition-all text-lg md:text-2xl font-poppins bg-[#afafaf] dark:bg-[#3d3d3d] dark:text-white text-black rounded-full mb-5"
                  >
                    <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
                    discover more{" "}
                    <RiArrowUpCircleLine className="h-6 w-6 rotate-180" />
                  </button>
                )}

                {visibleCount >= 1 && (
                  <button
                    onClick={showLessProjects}
                    className="flex gap-2 items-center w-fit h-fit p-2 px-5 cursor-pointer interactable transition-all text-lg md:text-2xl font-poppins bg-[#afafaf] dark:bg-[#3d3d3d] dark:text-white text-black rounded-full"
                  >
                    <RiArrowUpCircleLine className="h-6 w-6 " /> collapse
                    <RiArrowUpCircleLine className="h-6 w-6 " />
                  </button>
                )}
                <div className="flex flex-col w-full  items-center mt-8  p-2 rounded-full shadow-md text-center">
                  <div className="flex items-center justify-center w-full">
                    <p className="md:text-base font-light text-[#2e3440] dark:text-[#e5e9f0] text-xs work-sans">
                      Projects are dynamically fetched through GitHub Api
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>
        <footer className="flex flex-col w-full h-full justify-center text-3xl mt-[40px] py-[40px] font-thin text-black dark:text-white bg-[#ececec] dark:bg-[#101010]">
          <div className="flex md:flex-row flex-col w-full md:w-[90%] h-full mx-auto text-xl font-poppins  md:justify-between justify-center items-center ">
            <div className="items-start flex justify-start w-fit md:p-0 p-5 text-center">
              © Adithya Krishnan 2024.
            </div>
            <div className="flex  md:flex-row flex-col min-w-[600px]  md:justify-between justify-start items-center text-justify ">
              <div className="flex flex-col md:flex-row items-start md:justify-between md:w-full">
                <a
                  href="https://github.com/fal3n-4ngel"
                  className="flex items-center gap-2 hover:animate-pulse hover:scale-[110%] transition-all interactable"
                >
                  <RiGithubFill className="h-6 w-6 " /> Github
                </a>
                <a
                  href="https://www.linkedin.com/in/fal3n-4ngel/"
                  className="flex items-center gap-2 hover:animate-pulse hover:scale-[110%] transition-all interactable"
                >
                  <RiLinkedinBoxFill className="h-6 w-6" />
                  LinkedIn
                </a>
                <a
                  href="mailto:adiadithyakrishnan@gmail.com"
                  className="flex items-center gap-2 hover:animate-pulse hover:scale-[110%] transition-all interactable"
                >
                  <RiMailFill className="h-6 w-6" />
                  Email
                </a>
                <a
                  href="/Resume Adithya Krishnan Nov.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:animate-pulse hover:scale-[110%] transition-all interactable"
                >
                  <RiFile2Fill className="h-6 w-6" />
                  Resume
                </a>
              </div>
            </div>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 md:p-0 p-10 interactable"
            >
              {" "}
              Back To Top <RiArrowUpCircleLine className="h-6 w-6" />{" "}
            </button>
          </div>

          <div className="flex flex-col text-center text-xl font-poppins  p-4 interactable mt-5">
            &quot;Like I always say, can&apos;t find a door? Make your
            own.&quot; – Edward Elric, Fullmetal Alchemist
            <div className="text-slate-600 font-light text-center text-xl md:text-2xl mt-10">
              - - -
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
