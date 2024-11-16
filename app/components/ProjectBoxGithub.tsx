import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

type GithubProjProps = {
  url1: number;
  name: string;
  type: string;
  event: string;
  date: string;
  view: string;
};

const randomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

const generateRects = (seed: number) => {
  const numRects = Math.floor(Math.random() * 11) + 5;
  const rects = [];
  for (let i = 0; i < numRects; i++) {
    rects.push({
      x: Math.random() * 1280,
      y: Math.random() * 640,
      width: Math.random() * 200 + 50,
      height: Math.random() * 200 + 50,
      fill: randomColor(),
      opacity: Math.random() * 0.5 + 0.1,
    });
  }
  return rects;
};

const GithubProjectBox = ({
  url1,
  name,
  type,
  event,
  date,
  view,
}: GithubProjProps) => {
  const [rects, setRects] = useState(generateRects(url1));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRects(generateRects(url1));
    }, 2000);

    return () => clearInterval(intervalId);
  }, [url1]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full md:w-[95%] md:h-[95%] min-w-[75vw] text-white p-6 md:p-12 bg-[#07070748] rounded-lg shadow-lg"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-4xl md:text-7xl font-light tracking-tight mb-2 space-grotesk">
          {name}
        </h2>
      </motion.div>

      {/* Dynamic SVG Background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative w-full aspect-video mb-12 overflow-hidden rounded-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1280 640"
          className="w-full h-auto bg-neutral-900"
        >
          {rects.map((rect, index) => (
            <rect
              key={index}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill={rect.fill}
              opacity={rect.opacity}
              className="transition-all duration-1000"
            />
          ))}
        </svg>
      </motion.div>

      {/* Footer with Tags and Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        <div className="md:col-span-3 md:space-y-3 row-span-3 ">
          <div className="flex md:flex-col flex-row justify-between items-center  md:items-start w-full md:space-y-3 ">
            <div>
              <p className="text-sm uppercase tracking-wider text-neutral-500">
                TYPE
              </p>
              <p className="text-lg font-light work-sans">{type}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-neutral-500">
                EVENT
              </p>
              <p className="text-lg font-light work-sans">{event}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-neutral-500">
                YEAR
              </p>
              <p className="text-lg font-light work-sans">{date}</p>
            </div>
          </div>
        </div>
        {/* Description */}

        <div className="md:col-span-7">
          <p className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
            DESCRIPTION
          </p>
          <p className="text-justify text-lg font-light leading-relaxed work-sans">
            This project is dynamically fetched from GitHub, showcasing
            real-time repository data and updates. Visit the GitHub page to
            explore the complete codebase, documentation, and development
            history, and stay up-to-date with the latest changes and
            improvements
          </p>
        </div>

        {/* View Button */}
        <div className="md:col-span-2 flex justify-end items-start">
          <motion.a
            href={view}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center interactable"
          >
            <div className="h-16 w-16 rounded-full border border-neutral-700 flex items-center justify-center transition-all duration-300 group-hover:border-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GithubProjectBox;
