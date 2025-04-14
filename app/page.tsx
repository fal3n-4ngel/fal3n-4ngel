/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import { useFollowPointer } from "./utils/FollowPointer";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Navbar from "./components/Navbar";
import FadeUp from "./components/FadeUp";
import ProjectsWithSkills from "./ui/ProjectSectionSkill";
import ProjectSection from "./ui/ProjectSection";
import useSmoothScroll, { scrollToTop } from "./utils/SmoothScroll";
import { generateRandomPath } from "./utils/GenerateRandomPath";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { Position } from "./types/position";
import {
  RiArrowUpCircleLine,
  RiFile2Fill,
  RiGithubFill,
  RiLinkedinBoxFill,
  RiMailFill,
} from "react-icons/ri";
import Image from "next/image";

export default function Home() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);
  const pathRef = useRef<Position[]>([]);
  const [projImage, setProjImage] = useState(false);
  const [isEscaping, setIsEscaping] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { cursorState, logoStates, offset } = useCustomCursor();
  const { isInteracting, interactionType } = cursorState;
  const {
    isGitHubLogo,
    isLinkedInLogo,
    isResumeLogo,
    isMailLogo,
    isProjImage,
  } = logoStates;

  useSmoothScroll();

  function useCustomCursor() {
    const [cursorState, setCursorState] = useState({
      isInteracting: false,
      interactionType: null as
        | "github"
        | "linkedin"
        | "resume"
        | "mail"
        | "project"
        | null,
    });

    const [offset, setOffset] = useState(0);
    const [logoStates, setLogoStates] = useState({
      isGitHubLogo: false,
      isLinkedInLogo: false,
      isResumeLogo: false,
      isMailLogo: false,
      isProjImage: false,
    });

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        const targetElement = e.target as HTMLElement;

        const getInteractionType = () => {
          if (targetElement.closest(".projImg")) return "project";
          return null;
        };

        const interactionType = getInteractionType();
        const isInteracting =
          !!interactionType || !!targetElement.closest(".interactable");

        // Update interaction states
        setCursorState({
          isInteracting,
          interactionType,
        });

        // Update logo and image states
        setLogoStates({
          isGitHubLogo: !!targetElement.closest(".githubLogo"),
          isLinkedInLogo: !!targetElement.closest(".linkedinLogo"),
          isResumeLogo: !!targetElement.closest(".resumeLogo"),
          isMailLogo: !!targetElement.closest(".mailLogo"),
          isProjImage: !!targetElement.closest(".projImg"),
        });

        // Update offset based on interaction
        setOffset(isInteracting ? 70 : 0);
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return {
      cursorState,
      logoStates,
      offset,
    };
  }

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

  const triggerEscape = () => {
    if (!isEscaping) {
      pathRef.current = generateRandomPath(
        { x, y },
        { width: window.innerWidth, height: window.innerHeight },
      );
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
      x: pathRef.current.map((p) => p.x),
      y: pathRef.current.map((p) => p.y),
      rotate: [0, 25, -10, 5, 0, 35, -10, -5, 0, 15, -10, 0, 0, 5, -10, 0],
      scale: [1, 1.1, 0.9, 1],
      transition: {
        duration: 60,
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
    <div className="h-full min-h-screen w-full bg-[#ececec] text-black dark:bg-[#121212] dark:text-white">
      <GoogleAnalytics trackPageViews />

      <div>
        <AnimatePresence>
          {isEscaping && dimensions.width > 0 && (
            <motion.div
              className="interactable fixed z-10"
              initial="initial"
              animate={["breakFree", "spin", "escape"]}
              exit="exit"
              variants={ghostVariants}
            >
              <img
                src="/ghostwhite.png"
                onClick={() => resetEscape()}
                alt="Escaping Ghost"
                className="interactable h-28 w-28 opacity-90"
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
            width: `${isInteracting ? "200px" : "40px"}`,
            height: `${isInteracting ? "200px" : "40px"}`,
          }}
          className={`pointer-events-none z-[10000] hidden rounded-full bg-white md:flex ${
            !projImage
              ? "mix-blend-difference"
              : "scale-0 overflow-hidden opacity-0 transition-all duration-200"
          } ${isGitHubLogo || isLinkedInLogo || isResumeLogo || isMailLogo ? "animate-pulse" : "bg-white"}`}
        >
          <img
            src="/ghost.png"
            className={`z-[-1] opacity-[35%] ${isEscaping ? "hidden" : "flex"}`}
            alt=""
          ></img>
        </motion.div>
      </div>

      <main
        className="flex min-h-screen w-full flex-col items-center justify-between overflow-x-hidden bg-[#ececec] text-black dark:bg-[#060606] dark:text-white"
        ref={ref}
      >
        <div className="fixed z-[10] w-full">
          <Navbar />
        </div>

        <section className="flex min-h-screen w-full flex-col justify-center p-4 md:w-[80vw] md:mt-10">
          <div className="space-grotesk interactable hidden w-fit flex-col px-5 text-[2.8rem] leading-none tracking-tighter md:flex md:text-[4.4vw]">
            <div className="h-[9vh] overflow-hidden md:max-h-[9vh]">
              <FadeUp className="flex text-black">I`m Adithya Krishnan,</FadeUp>
            </div>
            <div className="h-[9vh] overflow-hidden md:max-h-[9vh]">
              <FadeUp className="text-black">
                a Software Engineer crafting
              </FadeUp>
            </div>
            <div className="h-[9vh] overflow-hidden md:max-h-[9vh]">
              <FadeUp className="text-black">Digital Experiences.</FadeUp>
            </div>
          </div>
          <div className="space-grotesk interactable flex flex-col px-5 text-left text-[8.5vw] leading-none tracking-tighter md:hidden md:text-5xl">
            <div className="h-[40px] overflow-hidden">
              <FadeUp className="flex text-black">
                I&apos;m Adithya Krishnan,
              </FadeUp>
            </div>
            <div className="h-[40px] overflow-hidden">
              <FadeUp className="text-black">a Software Engineer</FadeUp>
            </div>
            <div className="h-[40px] overflow-hidden">
              <FadeUp className="text-black"> crafting</FadeUp>
            </div>
            <div className="h-[40px] overflow-hidden">
              <FadeUp className="text-black">Digital Experiences.</FadeUp>
            </div>
          </div>
        </section>

        <section className="h-full w-full">
          <div className="space-grotesk mx-auto flex min-h-screen w-[80%] flex-col items-center justify-center md:flex-row">
            <div className="flex flex-col text-xl md:w-[55vw] md:text-[2.4vw] md:leading-[3vw]">
              <div className="overflow-hidden">
                <FadeUp>
                  <div className="interactable m-5 ease-in md:mx-10">
                    I turn ideas into performant, scalable web experiences—with
                    an eye for design and a focus on detail{" "}
                  </div>
                </FadeUp>
              </div>

              <div className="overflow-hidden">
                <FadeUp>
                  <div className="interactable m-5 ease-in md:mx-10">
                   
                  With hands-on experience at Equifax, Nissan Digital, and UST Global, I’ve also built products through hackathons and freelance collaborations.
                  </div>
                </FadeUp>
              </div>
              <div className="overflow-hidden">
                <FadeUp>
                  <div className="interactable m-5 ease-in md:mx-10">
              
                  Building at the edge of design and engineering — with purpose, not just polish.
                  </div>
                </FadeUp>
              </div>
            </div>

            <div className="sm:space-grotek font-poppins-regular md:leading-2 mx-auto flex w-[90%] flex-col tracking-wider md:w-[50%] md:pl-[20%] md:text-[0.90vw]">
              <FadeUp>
                <div className="mt-5 py-4 text-2xl font-semibold text-zinc-700 md:text-[1.5vw]">
                  experience
                </div>
              </FadeUp>
              <FadeUp><div className="interactable px-1 py-1">
                  <div className="font-semibold">
                    Student Associate
                    <span className="text-md text-gray-400"></span>
                  </div>
                  <a
                    href="https://www.equifax.co.in/?ref=adithyakrishnan.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Equifax
                  </a>
                  <div className="font-sans text-gray-400">
                    Feb 2025 - Present
                  </div>
                </div>
                <div className="interactable px-1 py-1">
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
               
              </FadeUp>
              <FadeUp>
              <div className="interactable px-1 py-1">
                  <div className="font-semibold">
                    Developer Intern
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
                <div className="interactable px-1 py-1">
                  <div className="font-semibold">Student Intern</div>
                  <div>UST Global</div>
                  <div className="font-sans text-gray-400">
                    April 2023 - May 2023
                  </div>
                </div>
              </FadeUp>

              <FadeUp>
                <div className="interactable px-1 py-1">
                  <div className="font-semibold">
                    Google Cloud Facilitator
                    <span className="text-md text-gray-400"></span>
                  </div>
                  <div>GDSC MBCET</div>
                  <div className="font-sans text-gray-400">
                    Nov 2022 - Dec 2023
                  </div>
                </div>

                <div className="interactable px-1 py-1">
                  <div className="font-semibold">Techinal Co Lead </div>
                  <div>IEEE MBCET Chapter</div>
                  <div className="font-sans text-gray-400">
                    Jan 2023 - Feb 2024
                  </div>
                </div>
              </FadeUp>

              <FadeUp>
                <div className="mt-5 py-4 text-2xl font-semibold text-zinc-700 md:text-[1.5vw]">
                  awards
                </div>
                <div className="flex flex-col space-y-1 font-normal">
                  <div className="interactable px-1 py-1">
                    <div className="font-semibold">
                      Web3 for India Winner
                      <span className="text-md text-gray-400"></span>
                    </div>
                    <div>BlockHash | Kerala Block Chain Academy</div>
                    <a
                      href="https://github.com/Deflated-Pappadam"
                      className="animate-pulse font-sans text-gray-400"
                    >
                      2023 (Team deflated pappadam)
                    </a>
                  </div>
                  <div className="interactable px-1 py-1">
                    <div className="font-semibold">
                      Best Design , First Runner Up
                      <span className="text-md text-gray-400"></span>
                    </div>
                    <div>CodeCrypt Hackathon | Cusat</div>
                    <a
                      href="https://github.com/Deflated-Pappadam"
                      className="animate-pulse font-sans text-gray-400"
                    >
                      2023 (Team deflated pappadam)
                    </a>
                  </div>
                </div>
              </FadeUp>
              <FadeUp className="md:hidden">
                <div className="mt-5 py-2 text-2xl font-semibold text-zinc-700 md:hidden md:text-[1.5vw]">
                  skills
                </div>
                <div className="flex flex-col space-y-1 text-start font-normal md:hidden">
                  <div>Next.js, Angular.js, .NET, React.js</div>
                  <div>C, Java, Python, C#, Javascript, Typescript</div>
                  <div>Firebase, MongoDB, SQL</div>
                  <div>Tailwind, Framer Motion, Gsap</div>
                  <div>Flutter, Kotlin, Jetpack Compose</div>
                </div>
              </FadeUp>
              <FadeUp>
                <div className="max-w-fit animate-pulse py-4">
                  {!isEscaping && (
                    <button
                      onClick={() => triggerEscape()}
                      className="interactable group relative flex items-center gap-2 rounded-full bg-white px-6 py-1 font-medium shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-zinc-800 md:text-[1vw]"
                    >
                      <img
                        src="/ghostwhite.png"
                        alt="Ghost"
                        className="h-12 w-12 transition-opacity group-hover:opacity-100"
                      />
                      <div>Release the Ghost</div>
                      <span className="absolute -bottom-6 left-0 right-0 text-sm opacity-60"></span>
                    </button>
                  )}
                  {isEscaping && (
                    <button
                      onClick={() => resetEscape()}
                      className="interactable group relative flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-zinc-800 md:text-[1vw]"
                    >
                      <img
                        src="/ghostwhite.png"
                        alt="Ghost"
                        className="h-8 w-8 opacity-75 transition-opacity group-hover:opacity-100"
                      />
                      Catch The Ghost
                    </button>
                  )}
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        <section className="mx-auto my-20 hidden flex-col justify-center p-2 text-4xl font-light md:flex md:w-[75%] md:p-0">
          <ProjectsWithSkills />
        </section>
        <section className="mt-20 mb-10 flex flex-col justify-center text-4xl font-light md:hidden md:w-[75%]">
          <ProjectSection />
        </section>

        <footer className="py-[40px] flex h-full w-full flex-col justify-center  text-3xl font-thin text-black dark:text-white md:border-t-[1px] border-[#ffffff39] pt-28">
          <div className="font-poppins mx-auto flex h-full w-full flex-col items-center justify-center text-xl md:w-[90%] md:flex-row md:justify-between">
            <div className="md:flex hidden w-fit items-start justify-start p-5 text-center md:p-0">
              © Adithya Krishnan 2025.
            </div>
            <div className="flex min-w-[600px] flex-col items-center justify-start text-justify md:flex-row md:justify-between ">
              <div className="flex flex-col items-start md:w-full md:flex-row md:justify-between gap-4">
                <a
                  href="https://github.com/fal3n-4ngel"
                  className="interactable flex items-center gap-2 transition-all hover:scale-[110%] hover:animate-pulse"
                >
                  <RiGithubFill className=" h-8 w-8" /> Github
                </a>
                <a
                  href="https://www.linkedin.com/in/fal3n-4ngel/"
                  className="interactable flex items-center gap-2 transition-all hover:scale-[110%] hover:animate-pulse"
                >
                  <RiLinkedinBoxFill className="h-8 w-8" />
                  LinkedIn
                </a>
                <a
                  href="mailto:adiadithyakrishnan@gmail.com"
                  className="interactable flex items-center gap-2 transition-all hover:scale-[110%] hover:animate-pulse"
                >
                  <RiMailFill className="h-8 w-8" />
                  Email
                </a>
                <a
                  href="/Resume Adithya Krishnan.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="interactable flex items-center gap-2 transition-all hover:scale-[110%] hover:animate-pulse"
                >
                  <RiFile2Fill className="h-8 w-8" />
                  Resume
                </a>
              </div>
            </div>
            <button
              onClick={scrollToTop}
              className="interactable z-10 flex items-center gap-2 p-10 md:p-0"
            >
              {" "}
              Back To Top <RiArrowUpCircleLine className="h-8 w-8" />{" "}
            </button>
          </div>

          <div className="font-poppins interactable mt-5 flex flex-col p-4 text-center text-xl md:mt-10">
            &quot;Like I always say, can&apos;t find a door? Make your
            own.&quot; – Edward Elric, Fullmetal Alchemist
            <div className="mt-10 text-center text-xl font-light text-slate-600 md:text-2xl">
              - - -
            </div>
          </div>

          <div className="flex md:hidden text-base w-full items-center justify-center p-10 text-center md:p-0 pb-20">
              © Adithya Krishnan 2025.
            </div>
        </footer>
      </main>
    </div>
  );
}
