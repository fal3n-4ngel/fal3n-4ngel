"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { useFollowPointer } from "./utils/FollowPointer";
import { animate, motion, useAnimation } from "framer-motion";
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
  const [interacting, setInteracting] = useState(false)

 window.onmousemove =e =>{
  if(e){
    const targetElement = e.target as HTMLElement; // Type casting to HTMLElement
    const interactableElement = targetElement.closest(".interactable");
    setInteracting(interactableElement?true:false)


  }
  
 }
  return (
    <div className="min-h-screen bg-[#e0e0e0]">
      <div >
        <motion.div
          style={{
            position: "fixed",
            top: `0%`,
            left: `0%`,
            height:'150px',
            width:'150px'
          }}
          animate={{ x: x, y: y, top: 0, left: 0 ,width:`${interacting?'150px':'40px'}`, height:`${interacting?'150px':'40px'}`}}
        
          className={`  bg-white rounded-full z-[100]  pointer-events-none mix-blend-difference `}
        ></motion.div>
     
      </div>
      <main
        className="flex min-h-screen flex-col items-center justify-center bg-[#e0e0e0]"
        ref={ref}
      >
        <div className={`text-[6rem] interactable  text-black `}>
          Hello I&apos;am Adi
        </div>
      </main>
    </div>
  );
}
