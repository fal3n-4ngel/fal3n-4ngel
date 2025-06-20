"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingPage = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
         
          setTimeout(() => onComplete(), 300);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 150);

    // Show text after a delay
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 600);

    return () => {
      clearInterval(timer);
      clearTimeout(textTimer);
    };
  }, [onComplete]);

 

  const textVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.5,
      },
    },
  };

  const progressVariants = {
    initial: {
      width: "0%",
    },
    animate: {
      width: `${progress}%`,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center bg-[#020202fc]"
      exit={{
        opacity: 0,
        scale: 0.95,
        transition: {
          duration: 0.8,
          ease: "easeInOut",
        },
      }}
    >
  

      {/* Loading Text */}
      <AnimatePresence>
        {showText && (
          <motion.div
            className="mb-8 text-center"
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="h-1 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
              <motion.div
                className="h-full rounded-full bg-black dark:bg-white"
                variants={progressVariants}
                initial="initial"
                animate="animate"
              />
            </div>

            <motion.div
              className="mt-4 font-mono text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              {Math.round(progress)}%
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dots */}
       <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 0 }}
            className="absolute h-1 w-1 rounded-full bg-gray-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default LoadingPage;
