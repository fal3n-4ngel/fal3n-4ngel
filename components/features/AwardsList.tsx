import FadeUp from "@/components/ui/FadeUp";
import { AwardItemData, getAwards } from "@/lib/integrations/notion";
import { useEffect, useState } from "react";

const AwardItem = ({
  title, org, team, date = "2023",
}: { title: string; org: string; team: string; date?: string }) => (
  <FadeUp className="group">
    <div className="interactable space-y-1">
      <h4 className="text-lg font-semibold text-white transition-colors group-hover:text-neutral-200">{title}</h4>
      <p className="text-neutral-400">{org}</p>
      <p className="font-mono text-xs text-neutral-600">{date} • {team}</p>
    </div>
  </FadeUp>
);

const DEFAULT_AWARDS = [
  { title: "Web3 for India Winner", org: "BlockHash | Kerala Blockchain Academy", team: "Team deflated pappadam", date: "2023" },
  { title: "Best Design, 1st Runner Up", org: "CodeCrypt Hackathon | Cusat", team: "Team deflated pappadam", date: "2023" },
];

export const AwardsList = () => {
  const [awards, setAwards] = useState<AwardItemData[]>([]);

  useEffect(() => {
    getAwards().then((data) => { if (data?.length) setAwards(data); });
  }, []);

  const displayAwards = awards.length > 0 ? awards : DEFAULT_AWARDS;

  return (
    <div className="space-y-8">
      <h3 className="text-md font-bold uppercase tracking-[0.3em] text-neutral-600">Awards</h3>
      <div className="space-y-8">
        {displayAwards.map((award, i) => (
          <AwardItem key={i} {...award} />
        ))}
      </div>
    </div>
  );
};
