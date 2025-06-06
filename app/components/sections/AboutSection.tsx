import FadeUp from "../ui/FadeUp";

import { GhostButton } from "../ui/GhostButton";
import { AwardsSection } from "./AwardsSection";
import { ExperienceSection } from "./ExperienceSection";
import { SkillsSection } from "./SkillsSection";

 interface AboutSectionProps {
  isEscaping: boolean;
  triggerEscape: () => void;
  resetEscape: () => void;
}

export const AboutSection = ({ isEscaping, triggerEscape, resetEscape }: AboutSectionProps) => (
  <section className="h-full w-full">
    <div className="space-grotesk mx-auto flex min-h-screen w-[80%] flex-col items-center justify-center md:flex-row">
      {/* About Content */}
      <div className="flex flex-col text-xl md:w-[55vw] md:text-[2.1vw] md:leading-normal">
        <div className="overflow-hidden">
          <FadeUp>
            <div className="interactable m-5 ease-in md:mx-10">
              I turn ideas into performant, scalable web experiences—with
              an eye for design and a focus on detail
            </div>
          </FadeUp>
        </div>

        <div className="overflow-hidden">
          <FadeUp>
            <div className="interactable m-5 ease-in md:mx-10">
              With hands-on experience at Equifax, Nissan Digital, and UST Global, 
              I&#39;ve also built products through hackathons and freelance collaborations.
            </div>
          </FadeUp>
        </div>

        <div className="overflow-hidden">
          <FadeUp>
            <div className="interactable m-5 ease-in md:mx-10">
              Building at the edge of design and engineering — with purpose, not just polish.
            </div>
          </FadeUp>
        </div>
      </div>

      {/* Experience & Awards */}
      <div className="sm:space-grotek font-poppins-regular md:leading-2 mx-auto flex w-[90%] flex-col tracking-wider md:w-[50%] md:pl-[20%] md:text-[0.90vw]">
        <ExperienceSection />
        <AwardsSection />
        <SkillsSection />
        <GhostButton 
          isEscaping={isEscaping}
          triggerEscape={triggerEscape}
          resetEscape={resetEscape}
        />
      </div>
    </div>
  </section>
);