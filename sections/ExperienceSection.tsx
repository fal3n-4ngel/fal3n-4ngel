import FadeUp from "@/components/FadeUp";
import { type ExperienceItem } from "@/data/experience";
import { getExperiences } from "@/lib/integrations/notion";
import { memo, useEffect, useState } from "react";

const ExperienceItemComponent = memo(({ item }: { item: ExperienceItem }) => (
  <div className="interactable space-y-1 px-1 py-2">
    <div className="text-[1.1rem] font-semibold text-white/90">{item.title}</div>
    <div className="text-white/80">
      {item.companyUrl ? (
        <a
          href={item.companyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white"
        >
          {item.company}
        </a>
      ) : (
        <span>{item.company}</span>
      )}
    </div>
    <div className="font-sans text-sm text-gray-500">{item.period}</div>
  </div>
));

ExperienceItemComponent.displayName = "ExperienceItemComponent";

export const ExperienceSection = memo(() => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);

  useEffect(() => {
    getExperiences().then((data) => {
      if (data && data.length > 0) {
        setExperiences(data);
      }
    });
  }, []);

  if (experiences.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <FadeUp>
        <h3 className="text-md font-bold uppercase tracking-[0.3em] text-neutral-600">
          experience
        </h3>
      </FadeUp>
      <div className="flex flex-col space-y-2">
        {experiences.map((item, index) => (
          <FadeUp key={index}>
            <ExperienceItemComponent item={item} />
          </FadeUp>
        ))}
      </div>
    </div>
  );
});

ExperienceSection.displayName = "ExperienceSection";
