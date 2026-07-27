"use client";

import { CustomCursor } from "@/components/layout/CustomCursor";
import { Navbar } from "@/components/layout/Navbar";
import { useFollowPointer } from "@/hooks";
import Link from "next/link";
import { useRef } from "react";

export default function Custom404() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);

  return (
    <main className="relative flex h-screen w-full flex-col overflow-hidden text-white selection:bg-white/30">
      <div className="absolute left-0 top-0 z-50 w-full">
        <Navbar />
      </div>

      {/* Custom Follow Cursor */}
      <CustomCursor x={x} y={y} />

      {/* Main 404 Content */}
      <div
        className="z-10 flex flex-1 flex-col items-center justify-center space-y-8 px-6 text-center"
        ref={ref}
      >
        <h1 className="interactable font-elgoc text-8xl font-light leading-none tracking-tight md:text-[12vw]">
          404
        </h1>

        <p className="max-w-md font-mono text-sm uppercase tracking-wider opacity-60">
          the page does not exist.
        </p>

        <Link
          href="/"
          className="interactable mt-8 rounded-full border border-white/20 px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors hover:bg-white hover:text-black"
        >
          Return to Homepage
        </Link>
      </div>
    </main>
  );
}
