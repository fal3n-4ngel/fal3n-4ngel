"use client";

import { ParallaxElement } from "@/components/ui/ParallaxSection";
import { SectionTransition, StaggerChild } from "@/components/ui/SectionTransition";

export const HeroSection = () => (
  <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-visible p-8 text-center md:p-24">
    {/* Ambient parallax blobs */}
    <ParallaxElement speed={0.35} className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute left-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-white/[0.015] blur-[80px]" />
    </ParallaxElement>
    <ParallaxElement speed={-0.2} className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute right-[15%] top-[40%] h-[200px] w-[200px] rounded-full bg-white/[0.02] blur-[60px]" />
    </ParallaxElement>

    {/* Staggered text reveal */}
    <SectionTransition once stagger direction="up" className="space-grotesk interactable relative z-10 flex flex-col gap-6">
      <ParallaxElement speed={0.12}>
        <StaggerChild>
          <div className="overflow-hidden select-none text-6xl font-light leading-none tracking-tighter text-white md:text-[8rem]">
            Adi
          </div>
        </StaggerChild>
      </ParallaxElement>
      <ParallaxElement speed={0.22}>
        <StaggerChild direction="up" distance={20}>
          <div className="overflow-hidden font-mono text-sm uppercase tracking-[0.3em] text-neutral-400 md:text-lg">
            Software Engineer
          </div>
        </StaggerChild>
      </ParallaxElement>
    </SectionTransition>

    {/* Scroll indicator */}
    <SectionTransition once delay={1.2} direction="none" className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2">
      <div className="flex flex-col items-center gap-2 opacity-40">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white">Scroll</span>
        <div className="h-8 w-px bg-gradient-to-b from-white to-transparent" />
      </div>
    </SectionTransition>
  </section>
);
