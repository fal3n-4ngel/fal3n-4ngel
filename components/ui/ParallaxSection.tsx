"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  smooth?: boolean;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className,
  speed = 0.2,
  smooth = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rawY = useTransform(scrollYProgress, [0, 1], [`${speed * 100}px`, `${-speed * 100}px`]);
  const springY = useSpring(rawY, { stiffness: 80, damping: 30, restDelta: 0.001 });
  const y = smooth ? springY : rawY;

  return (
    <div ref={ref} className={className} style={{ overflow: "visible" }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};

interface ParallaxElementProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  smooth?: boolean;
}

export const ParallaxElement: React.FC<ParallaxElementProps> = ({
  children,
  className,
  speed = 0.15,
  smooth = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rawY = useTransform(scrollYProgress, [0, 1], [`${speed * 120}px`, `${-speed * 120}px`]);
  const springY = useSpring(rawY, { stiffness: 60, damping: 25 });
  const y = smooth ? springY : rawY;

  return (
    <div ref={ref} className={className} style={{ overflow: "visible" }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
};
