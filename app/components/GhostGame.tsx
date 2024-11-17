"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants, TargetAndTransition } from 'framer-motion';
import { RiGamepadLine, RiRestartLine } from 'react-icons/ri';

interface Position {
  x: number;
  y: number;
}

const GhostEscape: React.FC = () => {
  const [isEscaping, setIsEscaping] = useState<boolean>(false);
  const [hasEscaped, setHasEscaped] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });

  // Update dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const generateRandomPath = (): Position[] => {
    const points: Position[] = [];
    const numPoints = 10;
    const padding = 100; // Keep ghost away from edges
    
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: padding + Math.random() * (dimensions.width - 2 * padding),
        y: padding + Math.random() * (dimensions.height - 2 * padding)
      });
    }
    
    return points;
  };

  const triggerEscape = () => {
    if (!hasEscaped) {
      setIsEscaping(true);
      setTimeout(() => {
        setIsEscaping(false);
        setHasEscaped(true);
      }, 4000);
    }
  };

  const resetEscape = () => {
    setHasEscaped(false);
  };

  const path = generateRandomPath();

  // Define animation variants
  const ghostVariants: Variants = {
    initial: { 
      x: dimensions.width / 2,
      y: dimensions.height / 2,
      scale: 0.2,
      opacity: 0 
    },
    breakFree: { 
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    spin: {
      rotate: 360,
      scale: [1, 1.2, 1],
      transition: { duration: 0.6, ease: "easeInOut" }
    },
    escape: {
      x: path.map(p => p.x),
      y: path.map(p => p.y),
      rotate: [-10, 10, -10, 10, 0],
      scale: [1, 1.1, 0.9, 1.1, 0.8],
      transition: {
        duration: 3,
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: "easeInOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 relative overflow-hidden min-h-[300px]">
      <button
        onClick={triggerEscape}
        disabled={isEscaping || hasEscaped}
        className={`flex items-center gap-2 px-6 py-3 bg-[#afafaf] dark:bg-[#3d3d3d] rounded-full text-lg font-medium transition-all hover:scale-105 interactable 
          ${(isEscaping || hasEscaped) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
      >
        <RiGamepadLine className="w-6 h-6" />
        {hasEscaped ? "Ghost Escaped!" : "Free the Ghost!"}
      </button>

      <AnimatePresence>
        {isEscaping && dimensions.width > 0 && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            initial="initial"
            animate={["breakFree", "spin", "escape"]}
            exit="exit"
            variants={ghostVariants}
          >
            <img 
              src="/ghost.png" 
              alt="Escaping Ghost"
              className="w-20 h-20 opacity-90 bg-white"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {hasEscaped && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={resetEscape}
          className="mt-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 interactable"
        >
          <RiRestartLine className="w-4 h-4" />
          Catch the ghost again?
        </motion.button>
      )}
    </div>
  );
};

export default GhostEscape;