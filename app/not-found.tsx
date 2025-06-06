"use client";
import Link from "next/link";
import { RiArrowLeftCircleLine } from "react-icons/ri";
import Navbar from "./components/sections/Navbar";
import { useFollowPointer } from "./utils/FollowPointer";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
export default function Custom404() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);
  const [interacting, setInteracting] = useState(false);
  const [projImage, setProjImage] = useState(false);
  const [offset, setOffset] = useState(0);

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
  return (
    <div className="w-full h-screen bg-[#121212] text-white flex flex-col justify-between items-center pb-10">
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
              : " opacity-0 transition-all duration-300 overflow-hidden"
          } `}
        >
          <img src="/ghost.png"></img>
        </motion.div>
      </div>
      <div
        className="w-full h-full flex flex-col items-center justify-between pb-10"
        ref={ref}
      >
        <Navbar />
        <h1 className="text-[25vw] md:text-[9vw] font-light font-elgoc mb-8 interactable">
          404
        </h1>

        <Link
          href="/"
          className="flex items-center gap-2 text-xl hover:underline interactable uppercase space-grotesk"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
