import { motion } from "framer-motion";
import { memo } from "react";
import FadeUp from "./FadeUp";

interface GhostButtonProps {
  isEscaping: boolean;
  triggerEscape: () => void;
  resetEscape: () => void;
}

export const GhostButton = memo<GhostButtonProps>(({ isEscaping, triggerEscape, resetEscape }) => (
  <FadeUp>
    <div className="max-w-fit animate-pulse py-4">
      {!isEscaping ? (
        <motion.button
          onClick={triggerEscape}
          className="interactable group relative flex items-center gap-2 rounded-full bg-white px-6 py-1 font-medium shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-zinc-800 md:text-[1vw]"
          aria-label="Release the Ghost"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.img
            src="/ghostwhite.png"
            alt="Ghost"
            className="h-12 w-12 transition-opacity group-hover:opacity-100"
            animate={{
              rotate: [0, -5, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <div>Release the Ghost</div>
        </motion.button>
      ) : (
        <motion.button
          onClick={resetEscape}
          className="interactable group relative flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-zinc-800 md:text-[1vw]"
          aria-label="Catch the Ghost"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 10px 15px -3px rgba(255, 255, 255, 0.1)",
              "0 10px 25px -3px rgba(255, 255, 255, 0.3)",
              "0 10px 15px -3px rgba(255, 255, 255, 0.1)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.img
            src="/ghostwhite.png"
            alt="Ghost"
            className="h-8 w-8 opacity-75 transition-opacity group-hover:opacity-100"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.75, 1, 0.75],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          Catch The Ghost
        </motion.button>
      )}
    </div>
  </FadeUp>
));

GhostButton.displayName = "GhostButton";
