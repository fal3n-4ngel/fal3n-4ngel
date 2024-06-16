import React from "react";
import Navbar from "./components/Navbar";
import Image from "next/image";
import Link from "next/link";

function Page() {
  return (
    <div className="w-full h-full min-h-screen bg-[#ececec] dark:bg-[#121212]  text-black dark:text-white flex flex-col justify-between items-center">
      <div className="w-full fixed z-[10]">
        <Navbar />
      </div>
      <div></div>
      <div className="flex justify-center items-center flex-col">
        <Image src="/404.png" alt="" width={400} height={400} className="md:hidden flex"></Image>
        <Image src="/404.png" alt="" width={600} height={600} className="hidden md:flex"></Image>
        <h2 className="font-poppins text-[1.5rem] md:text-[3rem] tracking-tighter text-center md:p-0 px-5">
          404: I think you might be a little lost....
        </h2>
        <div className="flex md:flex-row flex-col gap-2 text-[1rem] font-medium ">
          <div className="p-1  text-lg md:text-[1.1rem] font-light">
            Why not visit my
          </div>

          <Link
            href="/"
            className="border-black border font-light rounded-full px-4 py-1 hover:bg-black hover:text-white text-center transition-all dark:border-white dark:hover:bg-[#3d3d3d]"
          >
            HOMEPAGE
          </Link>
        </div>
      </div>
      <div></div>
    </div>
  );
}

export default Page;
