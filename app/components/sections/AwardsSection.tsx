import FadeUp from "../ui/FadeUp";

export const AwardsSection = () => (
  <FadeUp>
    <div className="mt-5 py-4 text-2xl font-semibold text-zinc-700 md:text-[1.5vw]">
      awards
    </div>
    <div className="flex flex-col space-y-1 font-normal">
      <div className="interactable px-1 py-1">
        <div className="font-semibold">Web3 for India Winner</div>
        <div>BlockHash | Kerala Block Chain Academy</div>
        <a
          href="https://github.com/Deflated-Pappadam"
          className="animate-pulse font-sans text-gray-400"
        >
          2023 (Team deflated pappadam)
        </a>
      </div>
      <div className="interactable px-1 py-1">
        <div className="font-semibold">Best Design, First Runner Up</div>
        <div>CodeCrypt Hackathon | Cusat</div>
        <a
          href="https://github.com/Deflated-Pappadam"
          className="animate-pulse font-sans text-gray-400"
        >
          2023 (Team deflated pappadam)
        </a>
      </div>
    </div>
  </FadeUp>
);
