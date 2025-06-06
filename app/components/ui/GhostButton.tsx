import FadeUp from "./FadeUp";

interface GhostButtonProps {
  isEscaping: boolean;
  triggerEscape: () => void;
  resetEscape: () => void;
}

export const GhostButton = ({ isEscaping, triggerEscape, resetEscape }: GhostButtonProps) => (
  <FadeUp>
    <div className="max-w-fit animate-pulse py-4">
      {!isEscaping ? (
        <button
          onClick={triggerEscape}
          className="interactable group relative flex items-center gap-2 rounded-full bg-white px-6 py-1 font-medium shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-zinc-800 md:text-[1vw]"
        >
          <img
            src="/ghostwhite.png"
            alt="Ghost"
            className="h-12 w-12 transition-opacity group-hover:opacity-100"
          />
          <div>Release the Ghost</div>
        </button>
      ) : (
        <button
          onClick={resetEscape}
          className="interactable group relative flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-zinc-800 md:text-[1vw]"
        >
          <img
            src="/ghostwhite.png"
            alt="Ghost"
            className="h-8 w-8 opacity-75 transition-opacity group-hover:opacity-100"
          />
          Catch The Ghost
        </button>
      )}
    </div>
  </FadeUp>
);
