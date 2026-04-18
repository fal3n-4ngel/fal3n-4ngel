import FadeUp from "@/components/FadeUp";

export const AwardsSection = () => (
  <div className="space-y-8">
    <h3 className="text-md font-bold uppercase tracking-[0.3em] text-neutral-600">Awards</h3>
    <div className="space-y-8">
      <AwardItem
        title="Web3 for India Winner"
        org="BlockHash | Kerala Blockchain Academy"
        team="Team deflated pappadam"
      />
      <AwardItem
        title="Best Design, 1st Runner Up"
        org="CodeCrypt Hackathon | Cusat"
        team="Team deflated pappadam"
      />
    </div>
  </div>
);

const AwardItem = ({ title, org, team }: { title: string; org: string; team: string }) => (
  <FadeUp className="group">
    <div className="space-y-1">
      <h4 className="text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
        {title}
      </h4>
      <p className="text-neutral-400">{org}</p>
      <p className="font-mono text-xs text-neutral-600">2023 • {team}</p>
    </div>
  </FadeUp>
);
