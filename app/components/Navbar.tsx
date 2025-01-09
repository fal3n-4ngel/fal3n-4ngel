import React from "react";
import DarkModeSwitch from "./ModeSwitch";
import { RiGithubFill } from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";

function Navbar() {
  return (
    <nav className="z-[1] mx-auto mb-10 flex w-full items-center justify-between overflow-hidden bg-[#ececec] px-[20px] py-2 pt-5 dark:bg-transparent md:w-[85vw] md:bg-transparent md:px-[10px] md:pt-10 md:dark:bg-transparent">
      {/* <div className="font-poppins md:text-[2.2vw] text-[2.5rem] dark:text-white text-black">Adi.</div>

        <div className="flex items-center md:justify-normal  gap-[20px] ">
          <Link href="https://github.com/fal3n-4ngel" className="flex md:w-fit md:h-fit px-[20px] py-3 h-[50px] rounded-full bg-white text-black text-center md:text-[1vw] font-logo items-center justify-center   gap-4">
           <RiGithubFill className='md:h-[1.7vw] md:w-[1.7vw] h-6 w-6'/>
            fal3n-4ngel
          </Link>
          <div className='md:flex hidden '><DarkModeSwitch /></div>
          
        </div> */}
      <a
        href="/"
        className="font-poppins text-[2.0rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:min-w-[100px] md:text-[1.2vw]"
      >
        Adi.
      </a>
      <div className="hidden items-center gap-8 md:flex">
        <a
          href="https://github.com/fal3n-4ngel"
          className="githubLogo font-poppins text-[2.5rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:text-[1vw]"
        >
          github
        </a>
        <a
          href="https://www.linkedin.com/in/fal3n-4ngel/"
          className="linkedinLogo font-poppins text-[2.5rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:text-[1vw]"
        >
          linkedin
        </a>
        <a
          href="/Resume Adithya Krishnan Nov.pdf"
          className="resumeLogo font-poppins text-[2.5rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:text-[1vw]"
        >
          resume
        </a>
      </div>
      <div className="flex items-center gap-4 md:hidden">
        <a
          href="https://github.com/fal3n-4ngel"
          className="font-poppins text-[2.5rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:text-[1vw]"
        >
          <Image src="icons/github.svg" width={20} height={20} alt="github" />
        </a>
        <a
          href="https://www.linkedin.com/in/fal3n-4ngel/"
          className="font-poppins text-[2.5rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:text-[1vw]"
        >
          <Image
            src="icons/linkedin.svg"
            width={20}
            height={20}
            alt="linkedin"
          />
        </a>
        <a
          href="/Resume Adithya Krishnan.pdf"
          className="resumeLogo font-poppins text-[2.5rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:text-[1vw]"
        >
          <Image src="icons/resume.svg" width={15} height={15} alt="x" />
        </a>
        <a
          href="mailto:hello@adithyakrishnan.com"
          className="font-poppins text-[2.5rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:text-[1vw]"
        >
          <Image src="icons/mail.svg" width={20} height={20} alt="mail" />
        </a>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <a
          href="mailto:hello@adithyakrishnan.com"
          className="mailLogo font-poppins text-[2.5rem] text-black transition-all duration-300 hover:opacity-25 dark:text-white md:text-[1vw]"
        >
          hello@adithyakrishnan.com
        </a>
        <div className="hidden">
          <DarkModeSwitch />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
