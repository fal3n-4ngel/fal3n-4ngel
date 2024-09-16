import React from "react";
import DarkModeSwitch from "./ModeSwitch";
import { RiGithubFill } from "react-icons/ri";
import Link from "next/link";
import Image from "next/image";

function Navbar() {
  return (
    <nav className="flex w-full md:w-[85vw]  items-center justify-between md:pt-10 pt-5 py-2 mb-10 px-[20px] md:px-[10px] mx-auto z-[1]   overflow-hidden bg-[#ececec]  dark:bg-transparent  md:bg-transparent md:dark:bg-transparent">
      {/* <div className="font-poppins md:text-[2.2vw] text-[2.5rem] dark:text-white text-black">Adi.</div>

        <div className="flex items-center md:justify-normal  gap-[20px] ">
          <Link href="https://github.com/fal3n-4ngel" className="flex md:w-fit md:h-fit px-[20px] py-3 h-[50px] rounded-full bg-white text-black text-center md:text-[1vw] font-logo items-center justify-center   gap-4">
           <RiGithubFill className='md:h-[1.7vw] md:w-[1.7vw] h-6 w-6'/>
            fal3n-4ngel
          </Link>
          <div className='md:flex hidden '><DarkModeSwitch /></div>
          
        </div> */}
      <a href="/" className="font-poppins md:text-[1.2vw] text-[2.0rem] dark:text-white text-black hover:opacity-25 transition-all duration-300">
        Adi.
      </a>
      <div className="md:flex hidden gap-8 items-center">
        <a href="https://github.com/fal3n-4ngel" className="font-poppins md:text-[1vw] text-[2.5rem] dark:text-white text-black hover:opacity-25 transition-all duration-300">
          github
        </a>
        <a href="https://www.linkedin.com/in/fal3n-4ngel/" className="font-poppins md:text-[1vw] text-[2.5rem] dark:text-white text-black hover:opacity-25 transition-all duration-300">
          linkedin
        </a>
        <a href="https://x.com/fal3n_4ngel"className="font-poppins md:text-[1vw] text-[2.5rem] dark:text-white text-black hover:opacity-25 transition-all duration-300">
          twitter
        </a>
      </div>
      <div className="flex md:hidden gap-4 items-center">
        <a href="https://github.com/fal3n-4ngel" className="font-poppins md:text-[1vw] text-[2.5rem] dark:text-white text-black hover:opacity-25 transition-all duration-300">
          <Image src="icons/github.svg" width={20} height={20} alt="github" />
        </a>
        <a href="https://www.linkedin.com/in/fal3n-4ngel/" className="font-poppins md:text-[1vw] text-[2.5rem] dark:text-white text-black hover:opacity-25 transition-all duration-300">
        <Image src="icons/linkedin.svg" width={20} height={20} alt="linkedin" />
        </a>
        <a href="https://x.com/fal3n_4ngel"className="font-poppins md:text-[1vw] text-[2.5rem] dark:text-white text-black hover:opacity-25 transition-all duration-300">
        <Image src="icons/x.svg" width={20} height={20} alt="x" />
        </a>
        <a href="mailto:hello@adithyakrishnan.com"className="font-poppins md:text-[1vw] text-[2.5rem] dark:text-white text-black hover:opacity-25 transition-all duration-300">
        <Image src="icons/mail.svg" width={20} height={20} alt="mail" />
        </a>
      </div>
      <div className="md:flex hidden gap-2 items-center">
      <a href="mailto:hello@adithyakrishnan.com" className="font-poppins md:text-[1vw] text-[2.5rem] dark:text-white text-black hover:opacity-25 transition-all duration-300">
          hello@adithyakrishnan.com
        </a>
        <div className="hidden ">
          <DarkModeSwitch />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
