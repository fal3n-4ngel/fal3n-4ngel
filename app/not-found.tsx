"use client";

import { useFollowPointer } from "@/lib/utils/FollowPointer";
import { Navbar } from "@/sections/Navbar";
import { CustomCursor } from "@/components/CustomCursor";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export default function Custom404() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);

  return (
    <main className="relative flex h-screen w-full flex-col overflow-hidden bg-[#121212] text-white selection:bg-white/30">
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

        <Link
          href="/"
          className="interactable mt-8 rounded-full border border-white/20 px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors hover:bg-white hover:text-black"
        >
          Return to Homepage
        </Link>
      </div>

      {/* Background Ghost Decoration */}
      <div className="pointer-events-none absolute bottom-[-10%] left-1/2 z-0 flex w-[120vw] max-w-[800px] -translate-x-1/2 items-end justify-center opacity-10 mix-blend-screen blur-xl">
        <Image
          src="/ghost.png"
          alt="Ghost background"
          width={500}
          height={500}
          className="object-contain"
          unoptimized
        />
      </div>
    </main>
  );
}
