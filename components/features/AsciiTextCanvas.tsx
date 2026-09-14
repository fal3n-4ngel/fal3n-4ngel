"use client";

import React, { useEffect, useRef, useState } from "react";

interface AsciiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  char: string;
  charTick: number;
  alpha: number;
}

const ASCII_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@&%$*!?+=<>~";

export const AsciiTextCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [animState, setAnimState] = useState<"assembled" | "scattered" | "gravity">("assembled");
  const animStateRef = useRef<"assembled" | "scattered" | "gravity">("assembled");

  useEffect(() => {
    animStateRef.current = animState;
  }, [animState]);

  const toggleInteraction = () => {
    if (animStateRef.current === "assembled") {
      setAnimState("scattered");
    } else if (animStateRef.current === "scattered") {
      setAnimState("gravity");
    } else {
      setAnimState("assembled");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animFrameId: number;
    let particles: AsciiParticle[] = [];
    let width = 0;
    let height = 0;
    let canvasMouseX = -9999;
    let canvasMouseY = -9999;
    let isMouseInside = false;

    const getRandomChar = () =>
      ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)] || "A";

    const initParticles = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(rect.width, window.innerWidth || 1200);
      const isMobile = width < 768;
      const targetHeight = isMobile ? 340 : 380;
      height = Math.max(rect.height || targetHeight, 300);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Offscreen canvas for typography raster sampling
      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      const text = isMobile ? "Adi" : "ADITHYA KRISHNAN";


      const stepX = isMobile ? 12 : 9;
      const stepY = isMobile ? 19 : 15;

      const targetWidth = isMobile ? width * 0.75 : width * 0.90;
      let fontSize = Math.floor(width / (isMobile ? 3 : 10));
      fontSize = Math.min(Math.max(fontSize, 40), Math.floor(height * (isMobile ? 0.65 : 0.65)));

      offCtx.font = `900 ${fontSize}px sans-serif`;
      const measured = offCtx.measureText(text).width;
      if (measured > 0) {
        fontSize = Math.floor(fontSize * (targetWidth / measured));
      }
      fontSize = Math.min(Math.max(fontSize, 36), Math.floor(height * (isMobile ? 0.62 : 0.62)));

      offCtx.font = `900 ${fontSize}px sans-serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillStyle = "#ffffff";
      offCtx.fillText(text, width / 2, height / 2);

      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;

      particles = [];

      const startX = Math.floor((width % stepX) / 2);
      const startY = Math.floor((height % stepY) / 2);

      for (let y = startY; y < height; y += stepY) {
        for (let x = startX; x < width; x += stepX) {
          const index = (y * width + x) * 4;
          const r = data[index] ?? 0;
          if (r > 125) {
            particles.push({
              x: x,
              y: y,
              vx: 0,
              vy: 0,
              targetX: x,
              targetY: y,
              char: getRandomChar(),
              charTick: Math.floor(Math.random() * 40),
              alpha: 0.88 + Math.random() * 0.12,
            });
          }
        }
      }
    };

    const timer = setTimeout(initParticles, 50);

    // Mouse handlers: tracks canvas coordinates for particle repulsion
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      canvasMouseX = e.clientX - rect.left;
      canvasMouseY = e.clientY - rect.top;
      isMouseInside = true;
    };

    const onMouseLeave = () => {
      canvasMouseX = -9999;
      canvasMouseY = -9999;
      isMouseInside = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        const rect = canvas.getBoundingClientRect();
        canvasMouseX = touch.clientX - rect.left;
        canvasMouseY = touch.clientY - rect.top;
        isMouseInside = true;
      }
    };

    const onTouchEnd = () => {
      canvasMouseX = -9999;
      canvasMouseY = -9999;
      isMouseInside = false;
    };

    window.addEventListener("resize", initParticles);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    // Physics Animation Loop
    let lastState = animStateRef.current;

    const render = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      const currentState = animStateRef.current;

      // Handle transitions
      if (currentState !== lastState) {
        if (currentState === "scattered") {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!p) continue;
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 12;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
          }
        } else if (currentState === "gravity") {
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!p) continue;
            p.vy = 2 + Math.random() * 6;
            p.vx = (Math.random() - 0.5) * 5;
          }
        }
        lastState = currentState;
      }

      ctx.font = width < 768 ? "bold 14px monospace" : "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p) continue;

        // Subtle character flicker
        p.charTick++;
        if (p.charTick % 28 === 0 && Math.random() < 0.25) {
          p.char = getRandomChar();
        }

        if (currentState === "assembled") {
          // Spring force towards target
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.08;
          p.vy += dy * 0.08;
          p.vx *= 0.72;
          p.vy *= 0.72;

          // Local cursor repulsion
          if (isMouseInside) {
            const mdx = p.x - canvasMouseX;
            const mdy = p.y - canvasMouseY;
            const mdistSq = mdx * mdx + mdy * mdy;
            const radius = 80;
            if (mdistSq < radius * radius && mdistSq > 0.01) {
              const mdist = Math.sqrt(mdistSq);
              const force = (1 - mdist / radius) * 12;
              p.vx += (mdx / mdist) * force;
              p.vy += (mdy / mdist) * force;
            }
          }
        } else if (currentState === "scattered") {
          // Space drift
          p.vx *= 0.95;
          p.vy *= 0.95;
          p.vx += (Math.random() - 0.5) * 0.2;
          p.vy += (Math.random() - 0.5) * 0.2;

          if (isMouseInside) {
            const mdx = p.x - canvasMouseX;
            const mdy = p.y - canvasMouseY;
            const mdistSq = mdx * mdx + mdy * mdy;
            const radius = 120;
            if (mdistSq < radius * radius && mdistSq > 0.01) {
              const mdist = Math.sqrt(mdistSq);
              const force = (1 - mdist / radius) * 8;
              p.vx += (mdx / mdist) * force;
              p.vy += (mdy / mdist) * force;
            }
          }

          if (p.x < 10) { p.x = 10; p.vx = -p.vx * 0.6; }
          if (p.x > width - 10) { p.x = width - 10; p.vx = -p.vx * 0.6; }
          if (p.y < 10) { p.y = 10; p.vy = -p.vy * 0.6; }
          if (p.y > height - 10) { p.y = height - 10; p.vy = -p.vy * 0.6; }
        } else if (currentState === "gravity") {
          // Gravitational fall and floor bouncing
          p.vy += 0.35;
          p.vx *= 0.96;

          const floorY = height - 18;
          if (p.y >= floorY) {
            p.y = floorY - Math.random() * 2;
            p.vy = -p.vy * 0.25;
            p.vx *= 0.82;
          }

          if (isMouseInside) {
            const mdx = p.x - canvasMouseX;
            const mdy = p.y - canvasMouseY;
            const mdistSq = mdx * mdx + mdy * mdy;
            const radius = 85;
            if (mdistSq < radius * radius && mdistSq > 0.01) {
              const mdist = Math.sqrt(mdistSq);
              const force = (1 - mdist / radius) * 10;
              p.vx += (mdx / mdist) * force;
              p.vy -= Math.abs(force) * 0.8;
            }
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fillText(p.char, p.x, p.y);
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", initParticles);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden border-t border-white/10 bg-black">
      {/* Reduced height container tightly framing contents, non-interactable so cursor stays compact */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none bg-black cursor-pointer touch-pan-y"
        style={{ minHeight: "320px", height: "360px", touchAction: "pan-y" }}
      >
        <canvas
          ref={canvasRef}
          onClick={toggleInteraction}
          className="block h-full w-full cursor-pointer touch-pan-y"
          style={{ touchAction: "pan-y" }}
        />
      </div>
    </section>
  );
};

export default AsciiTextCanvas;
