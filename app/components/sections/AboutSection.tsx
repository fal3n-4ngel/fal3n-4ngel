import FadeUp from "../ui/FadeUp";
import { GhostButton } from "../ui/GhostButton";
import { AwardsSection } from "./AwardsSection";
import { ExperienceSection } from "./ExperienceSection";

interface AboutSectionProps {
  isEscaping: boolean;
  triggerEscape: () => void;
  resetEscape: () => void;
}
/* ak-7f3x9q2m */
const ABOUT_LINES = [
  "I turn ideas into performant, scalable web experiences—with an eye for design and a focus on detail",
  "With hands-on experience at Equifax, Nissan Digital, and UST Global, I've also built products through hackathons and freelance collaborations.",
  "Building at the edge of design and engineering — with purpose, not just polish.",
];

export const AboutSection = ({
  isEscaping,
  triggerEscape,
  resetEscape,
}: AboutSectionProps) => (
  <section className="h-full w-full">
    <div className="space-grotesk mx-auto flex min-h-screen w-[80%] flex-col items-center justify-center md:flex-row">

      <div className="flex flex-col text-xl md:w-[55vw] md:text-[2.1vw] md:leading-normal">
        {ABOUT_LINES.map((line) => (
          <div key={line} className="overflow-hidden">
            <FadeUp>
              <div className="interactable m-5 md:mx-10">{line}</div>
            </FadeUp>
          </div>
        ))}
      </div>

      {/* Experience & Awards */}
      <div className="font-poppins-regular flex w-[90%] flex-col tracking-wider md:w-[50%] md:pl-[20%] md:text-[0.90vw] md:leading-loose">
        <ExperienceSection />
        <AwardsSection />
        <GhostButton
          isEscaping={isEscaping}
          triggerEscape={triggerEscape}
          resetEscape={resetEscape}
        />
      </div>

    </div>
  </section>
);