"use client";

import dynamic from "next/dynamic";

// Dynamically import AestheticBackground with ssr: false so it doesn't block server rendering or hydration
const AestheticBackground = dynamic(
  () => import("./AestheticBackground").then((mod) => mod.AestheticBackground),
  { ssr: false }
);

export default function ClientBackground() {
  return <AestheticBackground />;
}
