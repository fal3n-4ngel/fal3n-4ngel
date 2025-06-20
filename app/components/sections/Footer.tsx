import { scrollToTop } from "@/app/utils/SmoothScroll";
import { RiArrowUpCircleLine, RiFile2Fill, RiGithubFill, RiLinkedinBoxFill, RiMailFill, RiFileList3Fill } from "react-icons/ri";

export const Footer = () => (
  <footer className="py-[40px] flex h-full w-full flex-col justify-center text-3xl font-thin text-black dark:text-white md:border-t-[1px] border-[#ffffff39] pt-28">
    <div className="font-poppins mx-auto flex h-full w-full flex-col items-center justify-center text-xl md:w-[90%] md:flex-row md:justify-between">
      <div className="md:flex hidden w-fit items-start justify-start p-5 text-center md:p-0">
        © Adithya Krishnan 2025.
      </div>
      
      <div className="flex min-w-[600px] flex-col items-center justify-start text-justify md:flex-row md:justify-between">
        <div className="flex flex-col items-start md:w-full md:flex-row md:justify-between gap-4">
          <a
            href="https://github.com/fal3n-4ngel"
            className="interactable flex items-center gap-2 transition-all hover:scale-[110%] hover:animate-pulse"
          >
            <RiGithubFill className="h-8 w-8" /> Github
          </a>
          <a
            href="https://www.linkedin.com/in/fal3n-4ngel/"
            className="interactable flex items-center gap-2 transition-all hover:scale-[110%] hover:animate-pulse"
          >
            <RiLinkedinBoxFill className="h-8 w-8" /> LinkedIn
          </a>
          <a
            href="mailto:adiadithyakrishnan@gmail.com"
            className="interactable flex items-center gap-2 transition-all hover:scale-[110%] hover:animate-pulse"
          >
            <RiMailFill className="h-8 w-8" /> Email
          </a>
          <a
            href="/Resume Adithya Krishnan.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="interactable flex items-center gap-2 transition-all hover:scale-[110%] hover:animate-pulse"
          >
            <RiFile2Fill className="h-8 w-8" /> Resume
          </a>
          
        </div>
      </div>
      
      <button
        onClick={scrollToTop}
        className="interactable z-10 flex items-center gap-2 p-10 md:p-0"
      >
        Back To Top <RiArrowUpCircleLine className="h-8 w-8" />
      </button>
    </div>

    <div className="font-poppins interactable mt-5 flex flex-col p-4 text-center text-xl md:mt-10">
      &quot;Like I always say, can&#39;t find a door? Make your own.&quot; – Edward Elric, Fullmetal Alchemist
      <div className="mt-10 text-center text-xl font-light text-slate-600 md:text-2xl">
        - - -
      </div>
    </div>

    <div className="flex md:hidden text-base w-full items-center justify-center p-10 text-center md:p-0 pb-20">
      © Adithya Krishnan 2025.
    </div>

    <div className="font-poppins mt-8 flex w-full md:flex-row p-4 flex-col items-center justify-center text-center text-base text-slate-500 dark:text-slate-400 pb-8">
      Not a fan of complex portfolios?<span className="md:hidden"></span> Check out my  &nbsp; <a href="https://minimal.adithyakrishnan.com" className="text-slate-700 dark:text-slate-300 hover:underline">minimal portfolio.</a>
    </div>
  
</footer>
);