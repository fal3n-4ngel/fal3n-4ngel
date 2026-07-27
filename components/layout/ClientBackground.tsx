"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Dynamically import AestheticBackground with ssr: false so it doesn't block server rendering or hydration
const AestheticBackground = dynamic(
  () => import("./AestheticBackground").then((mod) => mod.AestheticBackground),
  { ssr: false }
);

// The interactive ghost mascot is a homepage easter egg (it reacts to the
// cursor, Spotify, Discord, and has its own dance for the 404 page). On the
// blog reading pages it's just a distracting silhouette floating behind
// body text, so it's excluded there specifically.
export default function ClientBackground() {
  const pathname = usePathname();
  if (pathname?.startsWith("/blogs")) return null;
  return <AestheticBackground />;
}
