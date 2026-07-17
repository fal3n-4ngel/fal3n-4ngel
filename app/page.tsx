"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useRef, useState, useCallback, useEffect } from "react";
import LoadingPage from "./loading";


import { SectionTransition } from "@/components/ui/SectionTransition";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { useGhostEscape, useFollowPointer } from "@/hooks";

const Navbar = dynamic(() => import("@/components/layout/Navbar").then((mod) => ({ default: mod.Navbar })), {
  ssr: true,
});
const ProjectsSection = dynamic(() => import("@/components/sections/ProjectsSection"), {
  ssr: false,
});
const Footer = dynamic(() => import("@/components/layout/Footer").then((mod) => ({ default: mod.Footer })), {
  ssr: true,
});
const AboutSection = dynamic(
  () => import("@/components/sections/AboutSection").then((mod) => ({ default: mod.AboutSection })),
  { ssr: true }
);


export default function Home() {
  const ref = useRef(null);
  const { x, y } = useFollowPointer(ref);
  const [isLoading, setIsLoading] = useState(true);
  const { isEscaping, triggerEscape, resetEscape } = useGhostEscape(x, y);

  const [traktToken, setTraktToken] = useState<string | null>(null);
  const [traktError, setTraktError] = useState<string | null>(null);
  const [isVerifyingTrakt, setIsVerifyingTrakt] = useState(false);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && !traktToken && !traktError && !isVerifyingTrakt) {
      setIsVerifyingTrakt(true);
      fetch(`/api/auth/trakt/callback?code=${code}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.refresh_token) {
            setTraktToken(data.refresh_token);
          } else {
            setTraktError(data.error || "Failed to exchange authorization code.");
          }
        })
        .catch((err) => {
          setTraktError(err.message || "Failed to exchange authorization code.");
        })
        .finally(() => {
          setIsVerifyingTrakt(false);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        });
    }
  }, [traktToken, traktError, isVerifyingTrakt]);

  return (
    <div className="h-full min-h-screen w-full text-white">
      <AnimatePresence>
        {isLoading && <LoadingPage onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <CustomCursor x={x} y={y} isEscaping={isEscaping} />

      {/* Trakt Token Modal */}
      {(traktToken || traktError || isVerifyingTrakt) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c0e]/80 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="text-xl font-bold tracking-tight text-white mb-2">
              Trakt Authentication
            </h3>
            
            {isVerifyingTrakt && (
              <div className="flex flex-col items-center py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <p className="mt-4 text-sm text-zinc-400">Verifying code with Trakt...</p>
              </div>
            )}

            {traktError && (
              <div>
                <p className="text-red-400 text-sm mb-4">Error: {traktError}</p>
                <button
                  onClick={() => setTraktError(null)}
                  className="w-full py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {traktToken && (
              <div>
                <p className="text-emerald-400 text-sm mb-4 font-semibold">
                  ✓ Successfully authenticated with Trakt!
                </p>
                <p className="text-zinc-400 text-xs mb-2">
                  Add the following environment variable to your `.env.local` (and your production Vercel/Netlify dashboard):
                </p>
                <div className="relative mb-6 rounded-lg bg-black/40 border border-white/5 p-3 font-mono text-xs select-all break-all text-zinc-300">
                  TRAKT_REFRESH_TOKEN={traktToken}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`TRAKT_REFRESH_TOKEN=${traktToken}`);
                    alert("Copied to clipboard!");
                    setTraktToken(null);
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors"
                >
                  Copy to Clipboard & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main
        className="flex min-h-screen w-full flex-col items-center justify-between text-white selection:bg-white selection:text-black"
        ref={ref}
      >
        <Navbar />

        <div id="about" className="w-full">
          <AboutSection
            isEscaping={isEscaping}
            triggerEscape={triggerEscape}
            resetEscape={resetEscape}
          />
        </div>



        <SectionTransition id="projects" direction="up" className="w-full" distance={50}>
          <ProjectsSection />
        </SectionTransition>

        <SectionTransition direction="up" delay={0.1} className="w-full" distance={30}>
          <Footer />
        </SectionTransition>
      </main>
    </div>
  );
}



