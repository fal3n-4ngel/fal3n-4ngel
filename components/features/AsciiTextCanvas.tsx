"use client";

import { motion, useReducedMotion } from "framer-motion";
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

type AsciiIconType =
  | "github"
  | "linkedin"
  | "x"
  | "contact"
  | "navigation"
  | "projects"
  | "achievements"
  | "background"
  | "calendar"
  | "ghost";

function matchAsciiIcon(text: string): AsciiIconType | null {
  const upper = text.toUpperCase().trim();
  if (upper === "GITHUB") return "github";
  if (upper === "LINKEDIN") return "linkedin";
  if (upper === "X" || upper.includes("TWITTER")) return "x";
  if (upper === "CONTACT" || upper === "EMAIL") return "contact";
  if (upper === "NAVIGATION" || upper === "NAV") return "navigation";
  if (upper === "PROJECTS") return "projects";
  if (upper === "BACKGROUND" || upper === "ACHIEVEMENTS" || upper === "EXPERIENCE") return "background";
  if (upper === "BOOK A MEETING" || upper === "CALENDAR") return "calendar";
  if (upper.includes("GHOST") || upper.includes("MASCOT") || upper.includes("👻")) return "ghost";
  return null;
}

const GITHUB_SVG_PATH =
  "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z";

const LINKEDIN_SVG_PATH =
  "M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z";

const X_SVG_PATH =
  "M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z";

function drawSvgPath(
  ctx: CanvasRenderingContext2D,
  pathData: string,
  vbW: number,
  vbH: number,
  cx: number,
  cy: number,
  size: number
) {
  if (typeof Path2D === "undefined") return;
  const scale = size / Math.max(vbW, vbH);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.translate(-vbW / 2, -vbH / 2);
  const path = new Path2D(pathData);
  ctx.fillStyle = "#ffffff";
  ctx.fill(path);
  ctx.restore();
}

function drawAsciiIcon(
  ctx: CanvasRenderingContext2D,
  icon: AsciiIconType,
  cx: number,
  cy: number,
  size: number
) {
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";

  if (icon === "github") {
    drawSvgPath(ctx, GITHUB_SVG_PATH, 496, 512, cx, cy, size);
    return;
  }

  if (icon === "linkedin") {
    const borderSize = size * 1.08;
    const bx = cx - borderSize / 2;
    const by = cy - borderSize / 2;
    const radius = borderSize * 0.18;

    ctx.lineWidth = 14;
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(bx, by, borderSize, borderSize, radius);
    } else {
      ctx.strokeRect(bx, by, borderSize, borderSize);
    }
    ctx.stroke();

    if (typeof Path2D !== "undefined") {
      const scale = (size * 0.68) / 448;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-224, -224);
      const path = new Path2D(LINKEDIN_SVG_PATH);
      ctx.fillStyle = "#ffffff";
      ctx.fill(path);
      ctx.restore();
    }
    return;
  }

  if (icon === "x") {
    drawSvgPath(ctx, X_SVG_PATH, 512, 512, cx, cy, size);
    return;
  }

  if (icon === "contact") {
    const ew = size * 1.25;
    const eh = size * 0.8;
    const ex = cx - ew / 2;
    const ey = cy - eh / 2;

    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(ex, ey, ew, eh, 16);
    } else {
      ctx.rect(ex, ey, ew, eh);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ex + 10, ey + 10);
    ctx.lineTo(cx, cy + 18);
    ctx.lineTo(ex + ew - 10, ey + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ex + 10, ey + eh - 10);
    ctx.lineTo(cx - 30, cy + 10);
    ctx.moveTo(ex + ew - 10, ey + eh - 10);
    ctx.lineTo(cx + 30, cy + 10);
    ctx.stroke();
    return;
  }

  if (icon === "navigation") {
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const r = size * 0.44;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    const pr = r * 0.82;
    const ir = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(cx, cy - pr);
    ctx.lineTo(cx + ir, cy - ir);
    ctx.lineTo(cx + pr, cy);
    ctx.lineTo(cx + ir, cy + ir);
    ctx.lineTo(cx, cy + pr);
    ctx.lineTo(cx - ir, cy + ir);
    ctx.lineTo(cx - pr, cy);
    ctx.lineTo(cx - ir, cy - ir);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    return;
  }

  if (icon === "projects") {
    ctx.lineWidth = 16;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const w = size * 1.1;
    const h = size * 0.65;

    ctx.beginPath();
    ctx.moveTo(cx - w * 0.25, cy - h * 0.45);
    ctx.lineTo(cx - w * 0.45, cy);
    ctx.lineTo(cx - w * 0.25, cy + h * 0.45);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + w * 0.08, cy - h * 0.5);
    ctx.lineTo(cx - w * 0.08, cy + h * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + w * 0.25, cy - h * 0.45);
    ctx.lineTo(cx + w * 0.45, cy);
    ctx.lineTo(cx + w * 0.25, cy + h * 0.45);
    ctx.stroke();
    return;
  }

  if (icon === "achievements") {
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const cupW = size * 0.52;
    const cupH = size * 0.46;
    const topY = cy - size * 0.36;

    ctx.beginPath();
    ctx.moveTo(cx - cupW / 2, topY);
    ctx.lineTo(cx + cupW / 2, topY);
    ctx.lineTo(cx + cupW * 0.4, topY + cupH * 0.6);
    ctx.quadraticCurveTo(cx, topY + cupH, cx - cupW * 0.4, topY + cupH * 0.6);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - cupW * 0.52, topY + cupH * 0.3, cupH * 0.24, -Math.PI / 2, Math.PI / 2, true);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + cupW * 0.52, topY + cupH * 0.3, cupH * 0.24, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, topY + cupH);
    ctx.lineTo(cx, topY + cupH + size * 0.16);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - size * 0.25, topY + cupH + size * 0.16);
    ctx.lineTo(cx + size * 0.25, topY + cupH + size * 0.16);
    ctx.stroke();
    return;
  }

  if (icon === "background") {
    const bw = size * 1.02;
    const bh = size * 0.66;
    const bx = cx - bw / 2;
    const by = cy - size * 0.15;

    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(bx, by, bw, bh, 14);
    } else {
      ctx.rect(bx, by, bw, bh);
    }
    ctx.stroke();

    const hw = bw * 0.38;
    const hh = size * 0.20;
    ctx.beginPath();
    ctx.moveTo(cx - hw / 2, by);
    ctx.lineTo(cx - hw / 2, by - hh + 8);
    ctx.quadraticCurveTo(cx - hw / 2, by - hh, cx - hw / 2 + 10, by - hh);
    ctx.lineTo(cx + hw / 2 - 10, by - hh);
    ctx.quadraticCurveTo(cx + hw / 2, by - hh, cx + hw / 2, by - hh + 8);
    ctx.lineTo(cx + hw / 2, by);
    ctx.stroke();

    const seamY = by + bh * 0.42;
    ctx.beginPath();
    ctx.moveTo(bx + 4, seamY);
    ctx.lineTo(bx + bw - 4, seamY);
    ctx.stroke();

    const sOffset = bw * 0.25;
    ctx.beginPath();
    ctx.moveTo(cx - sOffset, by + 4);
    ctx.lineTo(cx - sOffset, by + bh - 4);
    ctx.moveTo(cx + sOffset, by + 4);
    ctx.lineTo(cx + sOffset, by + bh - 4);
    ctx.stroke();

    const cw = size * 0.15;
    const ch = size * 0.13;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(cx - cw / 2, seamY - ch / 2, cw, ch, 4);
    } else {
      ctx.rect(cx - cw / 2, seamY - ch / 2, cw, ch);
    }
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(cx, seamY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    return;
  }

  if (icon === "calendar") {
    const cw = size * 0.9;
    const ch = size * 0.72;
    const cx0 = cx - cw / 2;
    const cy0 = cy - ch / 2;

    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(cx0, cy0, cw, ch, 14);
    } else {
      ctx.strokeRect(cx0, cy0, cw, ch);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx0, cy0 + ch * 0.3);
    ctx.lineTo(cx0 + cw, cy0 + ch * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx0 + cw * 0.28, cy0 - 10);
    ctx.lineTo(cx0 + cw * 0.28, cy0 + 8);
    ctx.moveTo(cx0 + cw * 0.72, cy0 - 10);
    ctx.lineTo(cx0 + cw * 0.72, cy0 + 8);
    ctx.stroke();

    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(cx - cw * 0.18, cy + ch * 0.18);
    ctx.lineTo(cx - cw * 0.04, cy + ch * 0.3);
    ctx.lineTo(cx + cw * 0.2, cy + ch * 0.05);
    ctx.stroke();
    return;
  }

  if (icon === "ghost") {
    const gw = size * 0.72;
    const gh = size * 0.95;
    const gx = cx - gw / 2;
    const gy = cy - gh / 2;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(gx, gy + gh * 0.45);
    ctx.bezierCurveTo(gx, gy, gx + gw, gy, gx + gw, gy + gh * 0.45);
    ctx.lineTo(gx + gw, gy + gh * 0.85);
    const pleats = 4;
    const pleatW = gw / pleats;
    for (let i = pleats - 1; i >= 0; i--) {
      const px = gx + i * pleatW;
      ctx.quadraticCurveTo(px + pleatW * 0.5, gy + gh * 1.02, px, gy + gh * 0.85);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#000000";
    const eyeW = gw * 0.12;
    const eyeH = gh * 0.16;
    const eyeY = gy + gh * 0.42;

    ctx.beginPath();
    ctx.ellipse(cx - gw * 0.2, eyeY, eyeW, eyeH, -0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx + gw * 0.2, eyeY, eyeW, eyeH, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    return;
  }
}

export const AsciiTextCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    let currentText = "";

    const getTargetPoints = (text: string) => {
      let displayText = text;
      const isSmallScreen = width < 1024;
      if (isSmallScreen && (displayText === "ADITHYA KRISHNAN" || displayText === "ADITHYA")) {
        displayText = "Adi";
      }

      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return [];

      const icon = matchAsciiIcon(displayText);

      if (icon) {
        const iconSize = Math.min(Math.max(Math.floor(height * 0.58), 160), 230);
        drawAsciiIcon(offCtx, icon, width / 2, height / 2, iconSize);

        const stepX = isSmallScreen ? 7 : 8;
        const stepY = isSmallScreen ? 10 : 12;
        const imgData = offCtx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const points: { x: number; y: number }[] = [];

        const startX = Math.floor((width % stepX) / 2);
        const startY = Math.floor((height % stepY) / 2);

        for (let y = startY; y < height; y += stepY) {
          for (let x = startX; x < width; x += stepX) {
            const index = (y * width + x) * 4;
            const r = data[index] ?? 0;
            if (r > 125) {
              points.push({ x, y });
            }
          }
        }
        return points;
      }

      const stepX = isSmallScreen ? 8 : 9;
      const stepY = isSmallScreen ? 12 : 15;
      const targetWidth = isSmallScreen ? width * 0.85 : width * 0.90;
      let fontSize = Math.floor(width / (displayText.length <= 4 ? 3.2 : 9));
      fontSize = Math.min(Math.max(fontSize, 36), Math.floor(height * 0.65));

      offCtx.font = `900 ${fontSize}px sans-serif`;
      const measured = offCtx.measureText(displayText).width;
      if (measured > 0) {
        fontSize = Math.floor(fontSize * (targetWidth / measured));
      }
      fontSize = Math.min(Math.max(fontSize, 32), Math.floor(height * 0.62));

      offCtx.font = `900 ${fontSize}px sans-serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillStyle = "#ffffff";
      offCtx.fillText(displayText, width / 2, height / 2);

      const imgData = offCtx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const points: { x: number; y: number }[] = [];

      const startX = Math.floor((width % stepX) / 2);
      const startY = Math.floor((height % stepY) / 2);

      for (let y = startY; y < height; y += stepY) {
        for (let x = startX; x < width; x += stepX) {
          const index = (y * width + x) * 4;
          const r = data[index] ?? 0;
          if (r > 125) {
            points.push({ x, y });
          }
        }
      }
      return points;
    };

    const morphTo = (newText: string) => {
      if (!newText || newText === currentText || width <= 0 || height <= 0) return;
      currentText = newText;

      if (animStateRef.current !== "assembled") {
        setAnimState("assembled");
      }

      const newPoints = getTargetPoints(newText);
      if (newPoints.length === 0) return;

      if (newPoints.length <= particles.length) {
        for (let i = 0; i < particles.length; i++) {
          const pt = newPoints[i % newPoints.length];
          const p = particles[i];
          if (pt && p) {
            p.targetX = pt.x;
            p.targetY = pt.y;
            p.vx += (Math.random() - 0.5) * 5;
            p.vy += (Math.random() - 0.5) * 5;
          }
        }
      } else {
        for (let i = 0; i < particles.length; i++) {
          const pt = newPoints[i];
          const p = particles[i];
          if (pt && p) {
            p.targetX = pt.x;
            p.targetY = pt.y;
            p.vx += (Math.random() - 0.5) * 5;
            p.vy += (Math.random() - 0.5) * 5;
          }
        }
        for (let i = particles.length; i < newPoints.length; i++) {
          const pt = newPoints[i];
          if (!pt) continue;
          const parent =
            particles[Math.floor(Math.random() * particles.length)] || {
              x: width / 2,
              y: height / 2,
            };
          particles.push({
            x: parent.x + (Math.random() - 0.5) * 8,
            y: parent.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            targetX: pt.x,
            targetY: pt.y,
            char: getRandomChar(),
            charTick: Math.floor(Math.random() * 40),
            alpha: 0.88 + Math.random() * 0.12,
          });
        }
      }
    };

    const initParticles = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(rect.width, window.innerWidth || 1200);
      const isSmallScreen = width < 1024;
      const targetHeight = width < 768 ? 340 : 380;
      height = Math.max(rect.height || targetHeight, 300);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      const defaultText = isSmallScreen ? "Adi" : "ADITHYA KRISHNAN";
      currentText = defaultText;

      const points = getTargetPoints(defaultText);
      particles = points.map((pt) => ({
        x: pt.x,
        y: pt.y,
        vx: 0,
        vy: 0,
        targetX: pt.x,
        targetY: pt.y,
        char: getRandomChar(),
        charTick: Math.floor(Math.random() * 40),
        alpha: 0.88 + Math.random() * 0.12,
      }));
    };

    let revertTimeout: ReturnType<typeof setTimeout> | null = null;

    const onMorphEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string | null }>;
      const targetText = customEvent.detail?.text;
      const isSmallScreen = width < 1024;
      const defaultText = isSmallScreen ? "Adi" : "ADITHYA KRISHNAN";
      if (targetText && targetText.trim()) {
        if (revertTimeout) {
          clearTimeout(revertTimeout);
          revertTimeout = null;
        }
        let formatted = targetText.trim().toUpperCase();
        if (formatted.includes("TWITTER")) {
          formatted = "X";
        }
        if (isSmallScreen && (formatted === "ADITHYA KRISHNAN" || formatted === "ADITHYA")) {
          formatted = "Adi";
        }
        morphTo(formatted);
      } else {
        if (revertTimeout) clearTimeout(revertTimeout);
        revertTimeout = setTimeout(() => {
          morphTo(defaultText);
          revertTimeout = null;
        }, 400);
      }
    };

    window.addEventListener("ascii-text-morph", onMorphEvent);

    const timer = setTimeout(initParticles, 50);

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

    let lastState = animStateRef.current;

    const render = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      const currentState = animStateRef.current;

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

      ctx.font = width < 1024 ? "bold 13px monospace" : "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!p) continue;

        p.charTick++;
        if (p.charTick % 28 === 0 && Math.random() < 0.25) {
          p.char = getRandomChar();
        }

        if (currentState === "assembled") {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.vx += dx * 0.07;
          p.vy += dy * 0.07;
          p.vx *= 0.76;
          p.vy *= 0.76;

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
      if (revertTimeout) clearTimeout(revertTimeout);
      clearTimeout(timer);
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("ascii-text-morph", onMorphEvent);
      window.removeEventListener("resize", initParticles);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full overflow-hidden border-t border-white/10 bg-black"
    >
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
    </motion.section>
  );
};

export default AsciiTextCanvas;
