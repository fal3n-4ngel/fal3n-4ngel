export default function Maintenance({
  content = "Q1 2026 // CHECK NOTION STATUS",
}: {
  content?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-start justify-between bg-black p-6 text-white md:p-16 lg:p-24">
      {/* Top Bar: Branded Status */}
      <div className="flex w-full items-center justify-between gap-4 border-b border-zinc-900 pb-6 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-700">
        <div className="flex items-center gap-3">
          {/* Static, dark red dot (Offline) */}
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-950"></span>
          </span>
          <span className="text-white/80">SYSTEM: OFFLINE</span>
        </div>
        <span className="text-zinc-800">DEPLOYMENT V2 // CORE.ADI.WORKS</span>
      </div>

      {/* Center: The Main Message */}
      <div className="my-auto max-w-5xl space-y-12">
        <h1 className="space-grotesk text-5xl font-light leading-[1] tracking-tight text-white/90 md:text-7xl lg:text-8xl">
          Scheduled <span className="text-white/30">maintenance</span> in{" "}
          <span className="text-white/30">progress.</span>
        </h1>

        {/* Fill that blank left space we fixed earlier */}
        <div className="flex flex-col gap-8 font-mono text-[11px] uppercase tracking-[0.2em] md:flex-row md:gap-24">
          <div className="space-y-2">
            <p className="text-zinc-700">Total DownTime</p>
            <p className="text-white">
              {content
                ?.replace(/last seen/i, "")
                .replace(/ago/i, "")
                .trim()}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Alternate Link */}
      <div className="flex w-full items-center justify-start gap-4 border-t border-zinc-900 pt-6 font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-700">
        <p className="text-zinc-800">REDIRECT_LINK // </p>
        <a
          href="https://minimal.adithyakrishnan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="interactable group flex items-center gap-3 text-white/70 transition-colors hover:text-white"
        >
          {/* Geometric box with minimal text */}
          <div className="flex h-10 w-10 items-center justify-center border border-white/5 bg-white/[0.03] group-hover:border-white/10">
            <span className="font-sans text-xl text-white">→</span>
          </div>
          <p className="border-b border-white/10 pb-1 tracking-[0.2em]">VIEW MINIMAL PORTFOLIO</p>
        </a>
      </div>
    </div>
  );
}
