import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface AnimatedTextCharacterProps {
  text: string;
}

interface FadeUpProps extends HTMLMotionProps<"div"> {}

interface CombinedProps extends AnimatedTextCharacterProps, FadeUpProps {}

const AnimatedTextCharacter: React.FC<CombinedProps> = ({ text }) => {
  const [ref, inView] = useInView({
    triggerOnce: false, // Only trigger once when entering the viewport
  });

  // Splitting text into letters
  const letters = Array.from(text);

  // Variants for Container
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  };

  // Variants for each letter
  const child = {
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      x: -20,
      y: 10,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      style={{ overflow: "hidden", display: "flex" }}
      variants={container}
      initial="hidden"
      animate={inView ? "visible" : "hidden"} // Conditionally apply animation based on inView
      className="flex flex-wrap md:text-6xl text-[30px]"
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default AnimatedTextCharacter;
