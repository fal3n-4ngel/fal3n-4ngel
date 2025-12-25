import { EXPERIENCE_DATA, type ExperienceItem } from "@/app/constants/experience";
import { memo } from "react";
import FadeUp from "../ui/FadeUp";

const ExperienceItemComponent = memo(({ item }: { item: ExperienceItem }) => (
  <div className="interactable px-1 py-1">
    <div className="font-semibold">{item.title}</div>
    {item.companyUrl ? (
      <a href={item.companyUrl} target="_blank" rel="noopener noreferrer">
        {item.company}
      </a>
    ) : (
      <div>{item.company}</div>
    )}
    <div className="font-sans text-gray-400">{item.period}</div>
  </div>
));

ExperienceItemComponent.displayName = "ExperienceItemComponent";

export const ExperienceSection = memo(() => (
  <>
    <FadeUp>
      <div className="mt-5 py-4 text-2xl font-semibold text-zinc-700 md:text-[1.5vw]">
        experience
      </div>
    </FadeUp>
    {EXPERIENCE_DATA.reduce<ExperienceItem[][]>((acc, item, index) => {
      const groupIndex = Math.floor(index / 2);
      if (!acc[groupIndex]) {
        acc[groupIndex] = [];
      }
      acc[groupIndex]!.push(item);
      return acc;
    }, []).map((group, index) => (
      <FadeUp key={index}>
        {group.map((item, itemIndex) => (
          <ExperienceItemComponent key={itemIndex} item={item} />
        ))}
      </FadeUp>
    ))}
  </>
));

ExperienceSection.displayName = "ExperienceSection";
