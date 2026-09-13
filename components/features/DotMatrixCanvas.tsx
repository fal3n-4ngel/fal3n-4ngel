"use client";

import React, { useEffect, useRef, useState } from "react";

interface Dot {
  x0: number;
  y0: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const DotMatrixCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [repulsionDist, setRepulsionDist] = useState<number>(10);
  const [maskForce, setMaskForce] = useState<number>(8);

  const repulsionDistRef = useRef(repulsionDist);
  const maskForceRef = useRef(maskForce);

  useEffect(() => {
    repulsionDistRef.current = repulsionDist;
  }, [repulsionDist]);

  useEffect(() => {
    maskForceRef.current = maskForce;
  }, [maskForce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let dots: Dot[] = [];
    const spacing = 16;
    let width = 0;
    let height = 0;

    let mouseX = -9999;
    let mouseY = -9999;
    let isHovering = false;

    const initGrid = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = Math.max(rect.height, 320);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      dots = [];
      const cols = Math.floor(width / spacing);
      const rows = Math.floor(height / spacing);
      const offsetX = (width - cols * spacing) / 2 + spacing / 2;
      const offsetY = (height - rows * spacing) / 2 + spacing / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = offsetX + c * spacing;
          const y0 = offsetY + r * spacing;
          dots.push({
            x0,
            y0,
            x: x0,
            y: y0,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    initGrid();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovering = true;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      isHovering = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const rect = canvas.getBoundingClientRect();
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
        isHovering = true;
      }
    };

    const handleTouchEnd = () => {
      mouseX = -9999;
      mouseY = -9999;
      isHovering = false;
    };

    window.addEventListener("resize", initGrid);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    // Spring physics constants
    const stiffness = 0.09;
    const damping = 0.82;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const rRadius = repulsionDistRef.current * 10;
      const mForce = maskForceRef.current * 4.5;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        if (!d) continue;

        if (isHovering) {
          const dx = d.x - mouseX;
          const dy = d.y - mouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < rRadius * rRadius && distSq > 0.01) {
            const dist = Math.sqrt(distSq);
            const factor = (1 - dist / rRadius) * mForce;
            const fx = (dx / dist) * factor;
            const fy = (dy / dist) * factor;

            d.vx += fx;
            d.vy += fy;
          }
        }

        const springX = (d.x0 - d.x) * stiffness;
        const springY = (d.y0 - d.y) * stiffness;

        d.vx = (d.vx + springX) * damping;
        d.vy = (d.vy + springY) * damping;

        d.x += d.vx;
        d.y += d.vy;

        const disp = Math.hypot(d.x - d.x0, d.y - d.y0);
        const alpha = Math.min(0.28 + disp * 0.05, 0.95);
        const dotRadius = disp > 3 ? 1.4 : 1.1;

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", initGrid);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden border-t border-white/10 bg-black pt-8 pb-12">
      <div ref={containerRef} className="relative w-full h-[320px] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-crosshair select-none"
        />

        {/* Physics Control Sliders matching Image 5 */}
        <div className="pointer-events-auto absolute bottom-4 left-6 sm:left-12 md:left-20 lg:left-28 xl:left-36 z-10 flex flex-col gap-2 rounded-sm bg-black/80 px-4 py-3 backdrop-blur-md border border-white/10 sm:bottom-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-zinc-400">
              Neighbor Repulsion Distance: <span className="text-white">{repulsionDist}</span>
            </span>
            <input
              type="range"
              min={5}
              max={30}
              value={repulsionDist}
              onChange={(e) => setRepulsionDist(Number(e.target.value))}
              className="h-1.5 w-24 sm:w-28 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-blue-500 hover:accent-blue-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-zinc-400">
              Mask Force: <span className="text-white">{maskForce}</span>
            </span>
            <input
              type="range"
              min={1}
              max={20}
              value={maskForce}
              onChange={(e) => setMaskForce(Number(e.target.value))}
              className="h-1.5 w-24 sm:w-28 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-blue-500 hover:accent-blue-400"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
