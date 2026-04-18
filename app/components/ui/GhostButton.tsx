import { memo } from "react";
import FadeUp from "./FadeUp";

interface GhostButtonProps {
  isEscaping: boolean;
  triggerEscape: () => void;
  resetEscape: () => void;
}

export const GhostButton = memo<GhostButtonProps>(({ isEscaping, triggerEscape, resetEscape }) => (
  <FadeUp>
    <div className="mt-12 flex w-full justify-start">
      <button
        onClick={isEscaping ? resetEscape : triggerEscape}
        className="interactable group flex items-center gap-4 border border-white/5 bg-white/[0.02] px-5 py-3 transition-all hover:border-white/20 hover:bg-white/[0.05]"
        aria-label={isEscaping ? "Catch the Ghost" : "Release the Ghost"}
      >
        <div className="relative flex h-5 w-5 items-center justify-center">
          <img
            src="/ghostwhite.png"
            alt="Ghost icon"
            className={`h-4 w-4 transition-all duration-500 ${
              isEscaping
                ? "scale-125 animate-pulse brightness-110 invert-0"
                : "opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0"
            }`}
          />
          {/* Subtle radar ping effect when "escaping" */}
          {isEscaping && (
            <span className="absolute h-full w-full animate-ping rounded-full bg-white/20" />
          )}
        </div>

        <div className="flex flex-col items-start leading-none">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            {isEscaping ? "Status: Released" : "Status: Captured"}
          </span>
          <span
            className={`font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
              isEscaping ? "text-red-400" : "text-white/70 group-hover:text-white"
            }`}
          >
            {isEscaping ? "Catch Ghost" : "Release Ghost"}
          </span>
        </div>
      </button>
    </div>
  </FadeUp>
));

GhostButton.displayName = "GhostButton";
