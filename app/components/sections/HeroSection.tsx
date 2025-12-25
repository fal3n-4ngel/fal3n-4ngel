import FadeUp from "../ui/FadeUp";

export const HeroSection = () => (
  <section className="flex min-h-screen w-full flex-col justify-center p-4 md:mt-10 md:w-[80vw]">
    {/* Desktop Hero */}
    <div className="space-grotesk interactable hidden w-fit flex-col px-5 text-[2.8rem] leading-none tracking-tighter md:flex md:text-[4.4vw]">
      <div className="h-fit overflow-hidden md:max-h-[10vh]">
        <FadeUp className="flex text-black">I&#39;m Adithya Krishnan,</FadeUp>
      </div>
      <div className="h-fit overflow-hidden md:max-h-[10vh]">
        <FadeUp className="text-black">a Software Engineer crafting</FadeUp>
      </div>
      <div className="h-fit overflow-hidden md:max-h-[10vh]">
        <FadeUp className="text-black">Digital Experiences.</FadeUp>
      </div>
    </div>

    {/* Mobile Hero */}
    <div className="space-grotesk interactable flex flex-col px-5 text-left text-[8.5vw] leading-none tracking-tighter md:hidden">
      <div className="h-[40px] overflow-hidden">
        <FadeUp className="flex text-black">I&#39;m Adithya Krishnan,</FadeUp>
      </div>
      <div className="h-[40px] overflow-hidden">
        <FadeUp className="text-black">a Software Engineer</FadeUp>
      </div>
      <div className="h-[40px] overflow-hidden">
        <FadeUp className="text-black">crafting</FadeUp>
      </div>
      <div className="h-[40px] overflow-hidden">
        <FadeUp className="text-black">Digital Experiences.</FadeUp>
      </div>
    </div>
  </section>
);
