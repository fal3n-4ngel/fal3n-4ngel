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
    <div className="flex h-screen w-full flex-col items-center justify-between bg-[#121212] pb-10 text-white">
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
          className={`z-top pointer-events-none hidden rounded-full bg-white md:flex ${
            !projImage
              ? "mix-blend-difference"
              : "overflow-hidden opacity-0 transition-all duration-300"
          } `}
        >
          <img src="/ghost.png"></img>
        </motion.div>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-between pb-10" ref={ref}>
        <Navbar />
        <h1 className="interactable mb-8 font-elgoc text-[25vw] font-light md:text-[9vw]">404</h1>

        <Link
          href="/"
          className="interactable space-grotesk flex items-center gap-2 text-xl uppercase hover:underline"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
