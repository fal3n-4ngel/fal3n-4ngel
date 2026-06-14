"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: boolean;
  id?: string;
  once?: boolean;
}

const getInitialOffset = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up": return { x: 0, y: distance };
    case "down": return { x: 0, y: -distance };
    case "left": return { x: distance, y: 0 };
    case "right": return { x: -distance, y: 0 };
    default: return { x: 0, y: 0 };
  }
};

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.75,
  distance = 40,
  stagger = false,
  id,
  once = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px 0px -80px 0px" });
  const { x, y } = getInitialOffset(direction, distance);

  const containerVariants: Variants = stagger
    ? {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12, delayChildren: delay } },
      }
    : {
        hidden: { opacity: 0, x, y, filter: "blur(4px)" },
        visible: {
          opacity: 1, x: 0, y: 0, filter: "blur(0px)",
          transition: { duration, delay, ease: [0.16, 1, 0.3, 1] },
        },
      };

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
};

export const StaggerChild: React.FC<{
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
}> = ({ children, className, direction = "up", distance = 30 }) => {
  const { x, y } = getInitialOffset(direction, distance);
  const childVariants: Variants = {
    hidden: { opacity: 0, x, y, filter: "blur(3px)" },
    visible: {
      opacity: 1, x: 0, y: 0, filter: "blur(0px)",
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  };
  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
};
