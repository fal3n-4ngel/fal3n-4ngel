import { Variants } from "framer-motion";

export const createGhostVariants = (
  width: number,
  height: number,
  path: { x: number; y: number }[],
  startX: number,
  startY: number
): Variants => ({
  initial: {
    x: startX,
    y: startY,
    scale: 0.5,
    opacity: 0,
    rotate: 0,
  },
  breakFree: {
    scale: [0.5, 1.3, 1],
    opacity: [0, 1, 1],
    rotate: [0, 360],
    transition: {
      duration: 1.2,
      ease: [0.34, 1.56, 0.64, 1], // Elastic ease
      times: [0, 0.6, 1],
    },
  },
  escape: {
    x: path.map((p) => p.x),
    y: path.map((p) => p.y),
    rotate: [0, 25, -10, 5, 0, 35, -10, -5, 0, 15, -10, 0, 0, 5, -10, 0],
    scale: [1, 1.15, 0.95, 1.1, 0.9, 1],
    transition: {
      x: {
        duration: 60,
        ease: "linear",
      },
      y: {
        duration: 60,
        ease: "linear",
      },
      rotate: {
        duration: 8,
        ease: "easeInOut",
        repeat: Infinity,
      },
      scale: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  },
  exit: {
    scale: [1, 1.5, 0],
    opacity: [1, 1, 0],
    rotate: 720,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
    },
  },
});
