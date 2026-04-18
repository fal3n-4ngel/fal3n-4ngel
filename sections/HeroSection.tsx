import FadeUp from "@/components/FadeUp";

export const HeroSection = () => (
  <section className="relative flex min-h-screen w-full flex-col justify-center items-center text-center p-8 md:p-24">
    <div className="space-grotesk interactable flex flex-col gap-6">
      <div className="overflow-hidden text-white text-6xl md:text-[8rem] font-light tracking-tighter leading-none">
        <FadeUp>Adi</FadeUp>
      </div>
      <div className="overflow-hidden text-neutral-400 text-sm md:text-lg font-mono tracking-[0.3em] uppercase">
        <FadeUp>Software Engineer</FadeUp>
      </div>
    </div>
  </section>
);
