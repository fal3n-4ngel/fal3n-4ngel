import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type ProjProps = {
  url1: string;
  name: string;
  type: string;
  event: string;
  date: string;
  view: string;
  description?: string;
};

function ProjBox({
  url1,
  name,
  type,
  event,
  date,
  view,
  description,
}: ProjProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full md:w-[95%] md:h-[95%] min-w-[75vw] text-white p-6 md:p-12 bg-[#07070748]  rounded-lg shadow-lg"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-4xl md:text-7xl font-light tracking-tight mb-2 space-grotesk interactable">
          {name}
        </h2>
        <h3 className="text-2xl md:text-4xl font-light tracking-wide text-neutral-400 space-grotesk">
          {type}
        </h3>
      </motion.div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative w-full aspect-video mb-12 overflow-hidden rounded-lg "
      >
        <a href={view}>
        <Image
          src={url1}
          alt={name}
                  fill
          className="object-cover transition-transform duration-700 hover:scale-105 projImg"
        />
        </a>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        {/* Metadata */}
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
        {description && (
          <div className="md:col-span-7">
            <p className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
              DESCRIPTION
            </p>
            <p className="md:text-xl text-lg font-light leading-relaxed work-sans  md:text-justify">
              {description}
            </p>
          </div>
        )}

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
}

export default ProjBox;
