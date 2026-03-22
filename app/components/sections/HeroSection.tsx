import FadeUp from "../ui/FadeUp";

const LINES = [
  "I'm Adithya Krishnan,",
  "a Software Engineer crafting",
  "Digital Experiences.",
];

const MOBILE_LINES = [
  "I'm Adithya Krishnan,",
  "a Software Engineer",
  "crafting",
  "Digital Experiences.",
];

export const HeroSection = () => (
  <section className="flex min-h-screen w-full flex-col justify-center p-4 md:w-[80vw]">
    <h1 className="space-grotesk interactable px-5 leading-none tracking-tighter">
      {/* Desktop */}
      <span className="hidden md:flex md:flex-col md:text-[4.4vw]">
        {LINES.map((line) => (
          <span key={line} className="overflow-hidden">
            <FadeUp className="text-black">{line}</FadeUp>
          </span>
        ))}
      </span>

      {/* Mobile */}
      <span className="flex flex-col text-[8.5vw] md:hidden">
        {MOBILE_LINES.map((line) => (
          <span key={line} className="h-[40px] overflow-hidden">
            <FadeUp className="text-black">{line}</FadeUp>
          </span>
        ))}
      </span>
    </h1>
  </section>
);