"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { useFollowPointer } from "./utils/FollowPointer";
import { animate, motion, useAnimation } from "framer-motion";
import Navbar from "./components/Navbar";
import FadeUp from "./components/FadeUp";
import AnimatedTextCharacter from "./components/FadeUp";
import FadeSide from "./components/FadeSide";
import ProjBox from "./components/ProjBox";
import {
  RiArrowUpCircleFill,
  RiArrowUpCircleLine,
  RiArrowUpDoubleFill,
  RiArrowUpSFill,
  RiGithubFill,
  RiLinkedinBoxFill,
  RiLinkedinFill,
  RiMailFill,
} from "react-icons/ri";
type Transition$1 =
  | {
      type: string; // The type can be more specific if necessary
      damping: number;
      stiffness: number;
    }
  | undefined;

export default function Home() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);
  const [interacting, setInteracting] = useState(false);
  const [projImage, setProjImage] = useState(false);
  const [jbInter, setJbInter] = useState(false);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (typeof window !== "undefined") {
    window.onmousemove = (e) => {
      if (e) {
        const targetElement = e.target as HTMLElement; // Type casting to HTMLElement
        const interactableElement = targetElement.closest(".interactable");
        setInteracting(interactableElement ? true : false);
        const targetImage = e.target as HTMLElement; // Type casting to HTMLElement
        const interactableImage = targetImage.closest(".projImg");
        setProjImage(interactableImage ? true : false);
        const targetJb = e.target as HTMLElement; // Type casting to HTMLElement
        const interactablejB = targetJb.closest(".jB");
        setJbInter(interactablejB ? true : false);
      }
    };
  }
  return (
    <div className="w-full h-full min-h-screen bg-[#ececec] dark:bg-[#121212] text-black dark:text-white">
      <div>
        <motion.div
          style={{
            position: "fixed",
            top: `0%`,
            left: `0%`,
            height: "150px",
            width: "150px",
          }}
          animate={{
            x: x,
            y: y,
            top: 0,
            left: 0,
            width: `${interacting ? "150px" : "40px"}`,
            height: `${interacting ? "150px" : "40px"}`,
          }}
          className={`bg-white rounded-full z-top md:flex hidden pointer-events-none ${
            !projImage ? "mix-blend-difference" : "mix-blend-difference"
          } `}
        >
          {/* {projImage?
          <a href=""><img src="/Visit.png" alt="" className=" animate-spin-slow "></img></a>
        :<div></div>} */}
        </motion.div>
      </div>
      <main
        className="w-full flex flex-col min-h-screen items-center justify-between bg-[#ececec] dark:bg-[#121212] text-black dark:text-white overflow-x-hidden"
        ref={ref}
      >
        <div className="w-full fixed z-[10]">
          <Navbar />
        </div>

        <section className="md:w-[70%] w-full justify-center  min-h-screen flex flex-col">
          <FadeUp className=" flex text-black  font-poppins ">
            <h1 className="md:text-3xl text-xl p-5">Hello</h1>
          </FadeUp>
          <div className="md:flex flex-col hidden tracking-tighter font-poppins-regular leading-none md:text-6xl text-[2.8rem] px-5 interactable w-fit">
            <div className="md:max-h-[110px] overflow-hidden">
              <FadeUp className=" flex text-black   ">
                I&apos;m Adithya Krishnan,
              </FadeUp>
            </div>
            <div className="md:max-h-[110px] overflow-hidden">
              <FadeUp className="  text-black   ">
                a Versatile developer who
              </FadeUp>
            </div>
            <div className="md:max-h-[110px] overflow-hidden">
              <FadeUp className=" text-black   ">
                likes to code fun stuff.
              </FadeUp>
            </div>
          </div>
          <div className="md:hidden flex flex-col  tracking-tighter leading-none md:text-6xl text-4xl px-5 interactable text-left">
            <div className="h-[40px] overflow-hidden ">
              <FadeUp className=" flex text-black  font-poppins-regular ">
                I&apos;m Adithya Krishnan,
              </FadeUp>
            </div>
            <div className="h-[40px] overflow-hidden">
              <FadeUp className="  text-black   ">a Versatile developer</FadeUp>
            </div>
            <div className="h-[40px] overflow-hidden">
              <FadeUp className="  text-black   ">who likes to</FadeUp>
            </div>
            <div className="h-[40px] overflow-hidden">
              <FadeUp className=" text-black ">code fun stuff.</FadeUp>
            </div>
          </div>
        </section>

        <section className=" w-full h-full ">
          <div className="flex md:flex-row flex-col w-[80%] mx-auto justify-center items-center font-poppins  min-h-screen">
            <div className="flex flex-col md:w-[60%] md:text-[2.3rem] leading-none text-xl">
              <div className="  overflow-hidden ">
                <FadeUp>
                  <div className="  md:m-10 m-5 ease-in interactable ">
                    As a third-year undergraduate pursuing a Btech degree in
                    CSE, I am actively seeking internships and freelancing
                    projects.
                    {/* <div
                      className={` jB md:text-xl text-lg  text-[#ececec] dark:text-[#121212] ${
                        jbInter ? "invert" : ""
                      }`}
                    >
                      
                      ( I&apos;m currently jobless )
                    </div> */}
                  </div>
                </FadeUp>
              </div>
              <div className="  overflow-hidden">
                <FadeUp>
                  <div className="  md:m-10 m-5 ease-in interactable">
                    With a passion for bringing ideas to life, I thrive on
                    solving puzzles, fixing bugs, tackling mind-boggling
                    problems.
                  </div>
                </FadeUp>
              </div>
              <div className="  overflow-hidden">
                <FadeUp>
                  <div className="   md:m-10 m-5 ease-in interactable">
                    I spent my free time either &lsquo;watching or reading or
                    coding&rsquo; stupid stuff
                  </div>
                </FadeUp>
              </div>
            </div>
            <div className="flex flex-col md:w-[50%] w-[90%] text-base md:pl-[20%] mx-auto tracking-wider ">
              <FadeUp>
                <div className=" text-2xl text-zinc-700 mt-5 py-2 font-semibold  ">
                  experience
                </div>
              </FadeUp>
              <FadeUp>
                <div className="py-1 interactable">
                  <div className="font-semibold">
                    Full stack developer
                    <span className="text-md text-gray-400"></span>
                  </div>
                  <div>deflated pappadam</div>
                  <div className="font-sans text-gray-400">2022 - Present</div>
                </div>
                <div className="py-1 interactable">
                  <div className="font-semibold">Techinal Co Lead </div>
                  <div>IEEE MBCET Chapter</div>
                  <div className="font-sans text-gray-400">
                    Jan 2023 - Feb 2024
                  </div>
                </div>
              </FadeUp>

              <FadeUp>
                <div className="py-1 interactable">
                  <div className="font-semibold">Student Intern</div>
                  <div>UST Global, Thirvanathapuram</div>
                  <div className="font-sans text-gray-400">
                    April 2023 - May 2023
                  </div>
                </div>
                <div className="py-1 interactable">
                  <div className="font-semibold">
                    Cloud Facilitator
                    <span className="text-md text-gray-400"></span>
                  </div>
                  <div>GDSC MBCET</div>
                  <div className="font-sans text-gray-400">
                    Nov 2022 - Feb 2024
                  </div>
                </div>
              </FadeUp>
              <FadeUp>
                <div className=" text-2xl text-zinc-700 mt-5 py-2 font-semibold ">
                  skills
                </div>
                <div className="flex flex-col font-normal space-y-1">
                  <div>Nextjs ,Reactjs ,Angular ,Flutter </div>
                  <div>C , Java , Python , C#</div>
                  <div>Firebase , MongoDB , Sql</div>
                  <div>Typescript, Tailwind, Framer Motion , Gsap</div>
                  <div> .NET , Kotlin, Jetpack Compose</div>
                </div>
              </FadeUp>
              <FadeUp>
                <div className=" text-2xl text-zinc-700 mt-5 py-2 font-semibold ">
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
            </div>
          </div>
        </section>

        <section className="min-h-screen font-light text-4xl md:w-[75%] p-5 md:p-0 mx-auto flex flex-col justify-center ">
          <FadeUp>
            <div className="md:text-6xl text-5xl py-10">Projects</div>
          </FadeUp>

          <div className="w-full h-full flex flex-col justify-center items-center">
            <FadeUp>
              <ProjBox
                url1="/Flash1.png"
                name="FLASH DRIVE"
                type="website"
                event="college project"
                date="2023"
                view="https://flashdrive-f2an.vercel.app/"
              />
            </FadeUp>
            <FadeUp>
              <ProjBox
                url1="/Sustaina1.png"
                name="SUS GOALS"
                type="website"
                event="college project"
                date="2023"
                view="https://sus-goals.vercel.app/"
              />
            </FadeUp>
            <FadeUp>
              <ProjBox
                url1="/Drish.png"
                name="DRISHTI"
                type="mobile app"
                event="define 2022"
                date="2022"
                view="https://github.com/fal3n-4ngel/Drishti-Client"
              />
            </FadeUp>
            <FadeUp>
              {" "}
              <ProjBox
                url1="/Ctrack.png"
                name="C TRACKER"
                type="swing java"
                event="micro project"
                date="2023"
                view="https://github.com/fal3n-4ngel/CTracker"
              />
            </FadeUp>
            <FadeUp className="p-10 m-5">
              <a
                href="https://github.com/fal3n-4ngel"
                className="w-fit h-fit p-2 px-5 cursor-pointer hover:scale-105 interactable transition-all text-lg md:text-2xl font-poppins bg-[#121212] dark:bg-[#ececec] dark:text-black text-white rounded-full "
              >
                View All Projects
              </a>
            </FadeUp>
          </div>
        </section>
        <footer className="flex flex-col w-full h-full justify-center text-3xl mt-[40px] py-[80px] font-thin text-black dark:text-white bg-[#e0e0e0] dark:bg-[#101010]">
          <div className="flex md:flex-row flex-col w-full md:w-[90%] h-full mx-auto text-xl font-poppins  md:justify-between justify-center items-center p-10">
            <div className="items-start flex justify-start w-fit md:p-0 p-10 text-center">
              ©Adithya Krishnan 2024.
            </div>
            <div className="flex  md:flex-row flex-col min-w-[400px]  md:justify-between justify-start items-center text-justify ">
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

          <div className="flex flex-col text-center text-xl font-poppins  p-4 interactable">
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
