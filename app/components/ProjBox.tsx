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
      className="w-full rounded-lg bg-[#07070748] p-6 text-white shadow-lg md:h-[95%] md:p-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-4"
      >
        <h2 className="work-sans interactable mb-2 text-4xl font-light tracking-tight md:text-5xl">
          {name}
        </h2>
        <h3 className="space-grotesk text-2xl font-light tracking-wide text-neutral-400 md:text-3xl">
          {type}
        </h3>
      </motion.div>

      {/* Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative mb-6 aspect-video overflow-hidden rounded-lg md:w-[80%]"
      >
        <a href={view}>
          <Image
            src={url1}
            alt={name}
            width={1920}
            height={1080}
            className="projImg object-cover transition-transform duration-700 hover:scale-105"
          />
        </a>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 gap-8 md:w-[80%] md:grid-cols-12"
      >
        {/* Metadata */}
        <div className="row-span-3 md:col-span-3 md:space-y-3">
          <div className="flex w-full flex-row items-center justify-between md:flex-col md:items-start md:space-y-3">
            <div>
              <p className="text-sm uppercase tracking-wider text-neutral-500">
                TYPE
              </p>
              <p className="work-sans text-lg font-light">{type}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-neutral-500">
                EVENT
              </p>
              <p className="work-sans text-lg font-light">{event}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider text-neutral-500">
                YEAR
              </p>
              <p className="work-sans text-lg font-light">{date}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="md:col-span-7">
            <p className="mb-2 text-sm uppercase tracking-wider text-neutral-500">
              DESCRIPTION
            </p>
            <p className="work-sans text-lg font-light leading-relaxed md:text-justify md:text-xl">
              {description}
            </p>
          </div>
        )}

        {/* View Button */}
        <div className="flex items-start justify-end md:col-span-2">
          <motion.a
            href={view}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="interactable group relative inline-flex items-center justify-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-700 transition-all duration-300 group-hover:border-white">
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
