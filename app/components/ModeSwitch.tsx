"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RiMoonClearFill, RiSunFill } from "react-icons/ri";

export default function DarkModeSwitch() {
  const [isOn, setIsOn] = useState(false);

 

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);

    if (typeof window !== "undefined") {
      localStorage.setItem("theme", newState ? "dark" : "light");

      if (newState) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };
  

  const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30,
  };

  return (
    <div
      onClick={toggleSwitch}
      className={`flex-start flex h-[40px] w-[80px] rounded-[50px] bg-zinc-100 p-[5px] shadow-inner hover:cursor-pointer dark:bg-zinc-700 ${
        isOn && "place-content-end"
      }`}
    >
      <motion.div
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-black/90"
        layout
        transition={spring}
      >
        <motion.div whileTap={{ rotate: 360 }}>
          {isOn ? (
            <RiSunFill className="h-6 w-6 text-white" />
          ) : (
            <RiMoonClearFill className="h-6 w-6 text-slate-200" />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
