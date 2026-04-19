import FadeUp from "@/components/FadeUp";
import { AwardItemData, getAwards } from "@/lib/integrations/notion";
import { useEffect, useState } from "react";

export const AwardsSection = () => {
  const [awards, setAwards] = useState<AwardItemData[]>([]);

  useEffect(() => {
    getAwards().then((data) => {
      if (data && data.length > 0) {
        setAwards(data);
      }
    });
  }, []);

  if (awards.length === 0) {
    return (
      <div className="space-y-8">
        <h3 className="text-md font-bold uppercase tracking-[0.3em] text-neutral-600">Awards</h3>
        <div className="space-y-8">
          <AwardItem
            title="Web3 for India Winner"
            org="BlockHash | Kerala Blockchain Academy"
            team="Team deflated pappadam"
            date="2023"
          />
          <AwardItem
            title="Best Design, 1st Runner Up"
            org="CodeCrypt Hackathon | Cusat"
            team="Team deflated pappadam"
            date="2023"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-md font-bold uppercase tracking-[0.3em] text-neutral-600">Awards</h3>
      <div className="space-y-8">
        {awards.map((award, index) => (
          <AwardItem
            key={index}
            title={award.title}
            org={award.org}
            team={award.team}
            date={award.date}
          />
        ))}
      </div>
    </div>
  );
};

const AwardItem = ({
  title,
  org,
  team,
  date = "2023",
}: {
  title: string;
  org: string;
  team: string;
  date?: string;
}) => (
  <FadeUp className="group">
    <div className="space-y-1">
      <h4 className="text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
        {title}
      </h4>
      <p className="text-neutral-400">{org}</p>
      <p className="font-mono text-xs text-neutral-600">
        {date} • {team}
      </p>
    </div>
  </FadeUp>
);
