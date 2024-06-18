import React from 'react'
import DarkModeSwitch from './ModeSwitch'
import { RiGithubFill } from 'react-icons/ri'
import Link from 'next/link'

function Navbar() {
  return (
    <nav className="flex w-full md:w-[90vw]  items-center justify-between py-5 mb-10 px-[10px] mx-auto z-[1]   overflow-hidden bg-[#ececec]  dark:bg-[#121212]  md:bg-transparent md:dark:bg-transparent">
        <div className="font-poppins md:text-[2vw] text-[2.5rem] dark:text-white text-black">Adi.</div>

        <div className="flex items-center md:justify-normal  gap-[20px] ">
          <Link href="https://github.com/fal3n-4ngel" className="flex md:w-fit md:h-fit px-[20px] py-3 h-[50px] rounded-full bg-white text-black text-center md:text-[1vw] font-logo items-center justify-center   gap-4">
           <RiGithubFill className='md:h-[1.7vw] md:w-[1.7vw] h-6 w-6'/>
            fal3n-4ngel
          </Link>
          <div className='md:flex hidden '><DarkModeSwitch /></div>
          
        </div>
      
      </nav>
  )
}

export default Navbar