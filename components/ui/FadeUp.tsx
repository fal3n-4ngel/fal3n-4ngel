"use client";

import { HTMLMotionProps, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface FadeUpProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
}

const dirOffset = (direction: FadeUpProps["direction"], distance: number) => {
  switch (direction) {
    case "up": return { x: 0, y: distance };
    case "down": return { x: 0, y: -distance };
    case "left": return { x: distance, y: 0 };
    case "right": return { x: -distance, y: 0 };
    default: return { x: 0, y: 0 };
  }
};

const FadeUp: React.FC<FadeUpProps> = ({
  children,
  delay = 0.1,
  duration = 0.65,
  distance = 28,
  direction = "up",
  once = false,
  ...rest
}) => {
  const [ref, inView] = useInView({
    triggerOnce: once,
    fallbackInView: false,
    rootMargin: "-60px 0px -60px 0px",
  });
  const { x, y } = dirOffset(direction, distance);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y, filter: "blur(3px)" }}
      animate={inView ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default FadeUp;
