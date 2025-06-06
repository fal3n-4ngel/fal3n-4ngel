import FadeUp from "../ui/FadeUp";

export const SkillsSection = () => (
  <FadeUp className="md:hidden">
    <div className="mt-5 py-2 text-2xl font-semibold text-zinc-700 md:hidden md:text-[1.5vw]">
      skills
    </div>
    <div className="flex flex-col space-y-1 text-start font-normal md:hidden">
      <div>Next.js, Angular.js, .NET, React.js</div>
      <div>C, Java, Python, C#, Javascript, Typescript</div>
      <div>Firebase, MongoDB, SQL</div>
      <div>Tailwind, Framer Motion, Gsap</div>
      <div>Flutter, Kotlin, Jetpack Compose</div>
    </div>
  </FadeUp>
);