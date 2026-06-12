"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const AestheticBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance",
      precision: "mediump",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 30);

    // ── Lighting ──────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.15);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // ── 3D Ghost Mascot Creation ──────────────────────────────────────────────
    const ghostGroup = new THREE.Group();

    const segmentsX = isMobile ? 16 : 28;
    const segmentsY = isMobile ? 16 : 28;
    const radius = 3.5;
    const height = 8;

    const ghostGeom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (let y = 0; y <= segmentsY; y++) {
      const v = y / segmentsY;
      const phi = v * Math.PI;

      for (let x = 0; x <= segmentsX; x++) {
        const u = x / segmentsX;
        const theta = u * Math.PI * 2;

        let px = 0;
        let py = 0;
        let pz = 0;

        if (v < 0.4) {
          const sphereRad = radius;
          const localPhi = (v / 0.4) * (Math.PI / 2);
          px = Math.sin(localPhi) * Math.cos(theta) * sphereRad;
          pz = Math.sin(localPhi) * Math.sin(theta) * sphereRad;
          py = Math.cos(localPhi) * sphereRad + 1.0;
        } else {
          const progress = (v - 0.4) / 0.6;
          const currentRad = radius * (1.0 + progress * 0.4);

          const rippleWaves = 6;
          const rippleAmp = 0.45 * progress;
          const rippleOffset = Math.sin(theta * rippleWaves) * rippleAmp;

          px = (currentRad + rippleOffset) * Math.cos(theta);
          pz = (currentRad + rippleOffset) * Math.sin(theta);

          const unevenHeight =
            Math.sin(theta * 3) * 0.75 + Math.cos(theta * 7) * 0.35 + Math.sin(theta * 1.5) * 0.25;
          py = 1.0 - progress * height + progress * progress * unevenHeight;
        }

        positions.push(px, py, pz);

        const normal = new THREE.Vector3(px, v < 0.4 ? py : 0, pz).normalize();
        normals.push(normal.x, normal.y, normal.z);
      }
    }

    for (let y = 0; y < segmentsY; y++) {
      for (let x = 0; x < segmentsX; x++) {
        const a = y * (segmentsX + 1) + x;
        const b = y * (segmentsX + 1) + x + 1;
        const c = (y + 1) * (segmentsX + 1) + x;
        const d = (y + 1) * (segmentsX + 1) + x + 1;

        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    ghostGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    ghostGeom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    ghostGeom.setIndex(indices);
    ghostGeom.computeVertexNormals();

    // 1. Translucent front shell body
    const ghostMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      side: THREE.FrontSide,
      depthWrite: true,
      depthTest: true,
    });

    const ghostMesh = new THREE.Mesh(ghostGeom, ghostMaterial);
    ghostMesh.renderOrder = 1;
    ghostGroup.add(ghostMesh);

    // 2. Crisp wireframe overlay
    const ghostWireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(ghostGeom, 15),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        depthTest: true,
      })
    );
    ghostWireframe.renderOrder = 2;
    ghostGroup.add(ghostWireframe);

    // Eyes
    const eyeGeom = new THREE.SphereGeometry(0.48, 24, 24);
    eyeGeom.scale(1.0, 1.6, 0.2);

    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthWrite: true,
    });

    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.75, 1.8, 3.25);
    leftEye.rotation.set(0.1, 0.2, 0);

    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.75, 1.8, 3.25);
    rightEye.rotation.set(0.1, -0.2, 0);

    ghostGroup.add(leftEye);
    ghostGroup.add(rightEye);

    // ── Procedural Headset Mesh ──────────────────────────────────────────────
    const headsetGroup = new THREE.Group();

    // Ear cups
    const cupGeom = new THREE.CylinderGeometry(1.1, 1.1, 0.8, 24);
    const cupMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      shininess: 30,
    });

    // Left cup
    const leftCup = new THREE.Mesh(cupGeom, cupMat);
    leftCup.position.set(-3.7, 1.6, 0);
    leftCup.rotation.z = Math.PI / 2;
    headsetGroup.add(leftCup);

    const leftCupWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(cupGeom),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
    );
    leftCupWire.position.set(-3.7, 1.6, 0);
    leftCupWire.rotation.z = Math.PI / 2;
    headsetGroup.add(leftCupWire);

    // Right cup
    const rightCup = new THREE.Mesh(cupGeom, cupMat);
    rightCup.position.set(3.7, 1.6, 0);
    rightCup.rotation.z = Math.PI / 2;
    headsetGroup.add(rightCup);

    const rightCupWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(cupGeom),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })
    );
    rightCupWire.position.set(3.7, 1.6, 0);
    rightCupWire.rotation.z = Math.PI / 2;
    headsetGroup.add(rightCupWire);

    headsetGroup.visible = false;
    ghostGroup.add(headsetGroup);

    // ── Floating Music Notes Animation ───────────────────────────────────────
    const makeNoteMesh = (isDoubleNote: boolean) => {
      const group = new THREE.Group();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      });

      const headGeom = new THREE.BufferGeometry();
      const headPoints: THREE.Vector3[] = [];
      for (let j = 0; j <= 16; j++) {
        const theta = (j / 16) * Math.PI * 2;
        headPoints.push(new THREE.Vector3(Math.cos(theta) * 0.25, Math.sin(theta) * 0.2, 0));
      }
      headGeom.setFromPoints(headPoints);
      const head = new THREE.Line(headGeom, lineMaterial);
      group.add(head);

      const stemGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.23, 0.1, 0),
        new THREE.Vector3(0.23, 0.85, 0),
      ]);
      const stem = new THREE.Line(stemGeom, lineMaterial);
      group.add(stem);

      if (isDoubleNote) {
        const head2 = new THREE.Line(headGeom, lineMaterial);
        head2.position.set(0.5, 0.08, 0);
        group.add(head2);

        const stem2Geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.73, 0.18, 0),
          new THREE.Vector3(0.73, 0.93, 0),
        ]);
        const stem2 = new THREE.Line(stem2Geom, lineMaterial);
        group.add(stem2);

        const beamGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.23, 0.85, 0),
          new THREE.Vector3(0.73, 0.93, 0),
        ]);
        const beam = new THREE.Line(beamGeom, lineMaterial);
        group.add(beam);
      } else {
        const flagGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.23, 0.85, 0),
          new THREE.Vector3(0.48, 0.7, 0),
        ]);
        const flag = new THREE.Line(flagGeom, lineMaterial);
        group.add(flag);
      }

      return group;
    };

    interface FloatingNote {
      mesh: THREE.Group;
      speedY: number;
      swayAmp: number;
      swayFreq: number;
      phase: number;
      side: "left" | "right";
      age: number;
    }

    const notes: FloatingNote[] = [];
    const notesCount = 2;

    for (let i = 0; i < notesCount; i++) {
      const mesh = makeNoteMesh(i % 2 === 0);
      mesh.visible = false;
      scene.add(mesh);

      notes.push({
        mesh,
        speedY: 0.007 + Math.random() * 0.005,
        swayAmp: 0.3 + Math.random() * 0.3,
        swayFreq: 1.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        side: i % 2 === 0 ? "left" : "right",
        age: Math.random(),
      });
    }

    // Zs helper for sleeping state
    const makeZMesh = (scaleSize: number) => {
      const group = new THREE.Group();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      });

      const points: THREE.Vector3[] = [];
      // Draw a "Z"
      points.push(new THREE.Vector3(-0.16 * scaleSize, 0.16 * scaleSize, 0));
      points.push(new THREE.Vector3(0.16 * scaleSize, 0.16 * scaleSize, 0));
      points.push(new THREE.Vector3(-0.16 * scaleSize, -0.16 * scaleSize, 0));
      points.push(new THREE.Vector3(0.16 * scaleSize, -0.16 * scaleSize, 0));

      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, lineMaterial);
      group.add(line);
      return group;
    };

    interface FloatingZ {
      mesh: THREE.Group;
      speedY: number;
      swayAmp: number;
      swayFreq: number;
      phase: number;
      age: number;
      scaleSize: number;
    }

    const zs: FloatingZ[] = [];
    const zsCount = 3;

    for (let i = 0; i < zsCount; i++) {
      const scaleSize = 0.5 + i * 0.35;
      const mesh = makeZMesh(scaleSize);
      mesh.visible = false;
      scene.add(mesh);

      zs.push({
        mesh,
        speedY: 0.005 + Math.random() * 0.004,
        swayAmp: 0.2 + Math.random() * 0.2,
        swayFreq: 0.7 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        age: Math.random(),
        scaleSize,
      });
    }

    ghostGroup.position.set(0, -1, 0);
    scene.add(ghostGroup);

    // ── Concentric HUD Rings ──────────────────────────────────────────────────
    interface HUDRing {
      mesh: THREE.LineLoop;
      rotSpeed: number;
    }
    const hudRings: HUDRing[] = [];
    const ringRadii = [6.5, 8.5];

    ringRadii.forEach((rad, rIndex) => {
      const pts: THREE.Vector3[] = [];
      const segments = 36 + rIndex * 12;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        if (s % 6 !== 0) {
          pts.push(new THREE.Vector3(Math.cos(theta) * rad, Math.sin(theta) * rad, 0));
        }
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const loop = new THREE.LineLoop(
        geom,
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.08 - rIndex * 0.03,
        })
      );
      loop.rotation.x = Math.PI / 2;
      loop.position.y = -6;
      scene.add(loop);
      hudRings.push({
        mesh: loop,
        rotSpeed: (rIndex % 2 === 0 ? 1 : -1) * 0.006,
      });
    });

    // ── Mouse & Interaction & Escape States ───────────────────────────────────
    const mouse = { nx: 0, ny: 0 };
    const targetRot = { x: 0, y: 0 };
    const currentRot = { x: 0, y: 0 };

    const flags = {
      isInteracting: false,
      isEscaping: false,
      escapeStartTime: 0,
      isPlayingMusic: false,
    };

    let lastInteractionCheck = 0;
    let fallbackTimeout: NodeJS.Timeout | null = null;

    const onMouse = (e: MouseEvent) => {
      mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetRot.x = mouse.ny * 0.4;
      targetRot.y = mouse.nx * 0.5;

      const now = performance.now();
      if (now - lastInteractionCheck > 40) {
        lastInteractionCheck = now;
        const target = e.target as HTMLElement | null;
        if (target) {
          const hoverNode = target.closest(
            "a, button, [role='button'], .interactable, .githubLogo, .linkedinLogo, .resumeLogo, .mailLogo, .projImg"
          );
          const isCurrentlyHovering = !!hoverNode;

          if (isCurrentlyHovering) {
            if (fallbackTimeout) {
              clearTimeout(fallbackTimeout);
              fallbackTimeout = null;
            }
            flags.isInteracting = true;
          } else {
            if (!fallbackTimeout && flags.isInteracting) {
              fallbackTimeout = setTimeout(() => {
                flags.isInteracting = false;
                fallbackTimeout = null;
              }, 150);
            }
          }
        }
      }
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    const onEscapeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ escaping: boolean }>;
      const nextEscaping = !!customEvent.detail?.escaping;
      if (nextEscaping !== flags.isEscaping) {
        flags.isEscaping = nextEscaping;
        flags.escapeStartTime = performance.now();
      }
    };
    window.addEventListener("ghost-escape", onEscapeChange);

    // ── Spotify Polling for Headset Toggle ────────────────────────────────────
    const checkSpotifyStatus = async () => {
      try {
        const res = await fetch("/api/spotify");
        if (res.ok) {
          const data = await res.json();
          flags.isPlayingMusic = !!data.isPlaying;
        }
      } catch (err) {
        console.error("Error polling spotify status for headset:", err);
      }
    };

    // Check immediately and then poll every 10 seconds
    checkSpotifyStatus();
    const spotifyInterval = setInterval(checkSpotifyStatus, 10000);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Render loop ───────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let raf: number;
    let interactionProgress = 0;
    let headsetScale = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const is404Page =
        typeof window !== "undefined" &&
        (window.location.pathname === "/404" ||
          !!document.querySelector("h1")?.textContent?.includes("404"));

      const getISTHour = () => {
        const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
        const istTime = new Date(utc + 3600000 * 5.5);
        return istTime.getHours();
      };
      const istHour = getISTHour();

      const isSleepingTime = istHour >= 23 && istHour < 5;
      const isSleeping = !flags.isPlayingMusic && isSleepingTime;

      // Smooth camera/ghost rotation tracking mouse
      currentRot.x += (targetRot.x - currentRot.x) * 0.05;
      currentRot.y += (targetRot.y - currentRot.y) * 0.05;

      const targetProgress = flags.isInteracting ? 1 : 0;
      interactionProgress += (targetProgress - interactionProgress) * 0.08;

      // Animate Headset Visibility & Scale (Show only when music is playing and not sleeping)
      const targetHeadsetScale = flags.isPlayingMusic && !isSleeping ? 1.0 : 0.0;
      headsetScale += (targetHeadsetScale - headsetScale) * 0.06;
      if (headsetScale > 0.005) {
        headsetGroup.visible = true;
        headsetGroup.scale.setScalar(headsetScale);
      } else {
        headsetGroup.visible = false;
      }

      // Animate Floating Music Notes
      for (const n of notes) {
        if (!isSleeping && flags.isPlayingMusic && headsetScale > 0.8) {
          n.mesh.visible = true;
          n.age += n.speedY;
          if (n.age > 1.0) {
            n.age = 0.0;
          }

          const ghostX = ghostGroup.position.x;
          const ghostY = ghostGroup.position.y;
          const ghostZ = ghostGroup.position.z;

          const startX = ghostX + (n.side === "left" ? -3.8 : 3.8);
          const startY = ghostY + 1.6;

          n.mesh.position.y = startY + n.age * 6.5;
          n.mesh.position.x = startX + Math.sin(t * n.swayFreq + n.phase) * n.swayAmp;
          n.mesh.position.z = ghostZ + Math.cos(t * 0.8 + n.phase) * 0.5;

          const opacity = Math.sin(n.age * Math.PI) * 0.6;
          n.mesh.traverse((child) => {
            if (child instanceof THREE.Line) {
              (child.material as THREE.LineBasicMaterial).opacity = opacity;
            }
          });
        } else {
          n.mesh.visible = false;
        }
      }

      // Animate Floating Zs (Only when sleeping)
      for (const z of zs) {
        if (isSleeping) {
          z.mesh.visible = true;
          z.age += z.speedY;
          if (z.age > 1.0) {
            z.age = 0.0;
          }

          const ghostX = ghostGroup.position.x;
          const ghostY = ghostGroup.position.y;
          const ghostZ = ghostGroup.position.z;

          // Float up from the top-right head area
          const startX = ghostX + 0.6;
          const startY = ghostY + 2.0;

          z.mesh.position.y = startY + z.age * 5.0;
          z.mesh.position.x = startX + Math.sin(t * z.swayFreq + z.phase) * z.swayAmp + z.age * 1.5;
          z.mesh.position.z = ghostZ + Math.cos(t * 0.5 + z.phase) * 0.3;

          const opacity = Math.sin(z.age * Math.PI) * 0.65;
          z.mesh.traverse((child) => {
            if (child instanceof THREE.Line) {
              (child.material as THREE.LineBasicMaterial).opacity = opacity;
            }
          });
        } else {
          z.mesh.visible = false;
        }
      }

      if (flags.isEscaping) {
        const duration = (performance.now() - flags.escapeStartTime) / 1000;

        ghostGroup.position.y += (12 - ghostGroup.position.y) * 0.04;
        ghostGroup.position.z += (-50 - ghostGroup.position.z) * 0.04;
        ghostGroup.position.x += (Math.sin(duration * 2) * 2 - ghostGroup.position.x) * 0.04;

        ghostGroup.rotation.y += 0.08;
        ghostGroup.rotation.x += 0.03;

        const targetScale = Math.max(1.0 - duration * 0.5, 0.05);
        ghostGroup.scale.setScalar(targetScale);

        ghostMaterial.opacity = Math.max(0.12 - duration * 0.05, 0.01);
      } else if (is404Page) {
        const targetZ = 12;
        ghostGroup.position.z += (targetZ - ghostGroup.position.z) * 0.05;
        ghostGroup.position.y = -0.5 + Math.sin(t * 2.2) * 1.2;
        ghostGroup.position.x = Math.sin(t * 0.8) * 1.5;

        ghostGroup.rotation.y = currentRot.y + Math.sin(t * 0.7) * 0.25;
        ghostGroup.rotation.x = currentRot.x + Math.cos(t * 0.6) * 0.12;
        ghostGroup.rotation.z = Math.sin(t * 1.1) * 0.1;

        const eyePulse = 1.0 + Math.sin(t * 4.0) * 0.15;
        leftEye.scale.set(eyePulse, eyePulse, 1.0);
        rightEye.scale.set(eyePulse, eyePulse, 1.0);

        ghostGroup.scale.setScalar(1.15);

        ghostMaterial.opacity = 0.24 + Math.abs(Math.sin(t * 1.5)) * 0.06;
      } else if (isSleeping) {
        if (ghostGroup.scale.x !== 1) {
          ghostGroup.scale.setScalar(ghostGroup.scale.x + (1.0 - ghostGroup.scale.x) * 0.1);
        }

        // Slow deep-breathing float (breathe cycle)
        const baseFloatY = -1.2 + Math.sin(t * 0.8) * 0.4;
        ghostGroup.position.y = baseFloatY;

        ghostGroup.position.x += (0 - ghostGroup.position.x) * 0.1;
        ghostGroup.position.z += (0 - ghostGroup.position.z) * 0.1;

        // Gentle, slow sway
        ghostGroup.rotation.y = currentRot.y + Math.sin(t * 0.3) * 0.06;
        ghostGroup.rotation.x = currentRot.x + Math.cos(t * 0.25) * 0.04;
        ghostGroup.rotation.z = Math.sin(t * 0.4) * 0.02;

        // Closed eyes (scaled flat on Y)
        leftEye.scale.set(1.0, 0.08, 1.0);
        rightEye.scale.set(1.0, 0.08, 1.0);

        // Dimmer/sleeping opacity
        ghostMaterial.opacity = 0.08;
      } else {
        if (ghostGroup.scale.x !== 1) {
          ghostGroup.scale.setScalar(ghostGroup.scale.x + (1.0 - ghostGroup.scale.x) * 0.1);
        }

        const baseFloatY = -1 + Math.sin(t * 1.5) * 0.8;
        const interactionShiftY = Math.sin(t * 2.5) * 0.25 * interactionProgress;
        ghostGroup.position.y = baseFloatY + interactionShiftY;

        ghostGroup.position.x += (0 - ghostGroup.position.x) * 0.1;
        ghostGroup.position.z += (0 - ghostGroup.position.z) * 0.1;

        const interactionWiggleY = Math.sin(t * 2.0) * 0.08 * interactionProgress;
        ghostGroup.rotation.y = currentRot.y + Math.sin(t * 0.5) * 0.15 + interactionWiggleY;

        const interactionWiggleX = Math.cos(t * 1.8) * 0.05 * interactionProgress;
        ghostGroup.rotation.x = currentRot.x + Math.cos(t * 0.4) * 0.08 + interactionWiggleX;

        ghostGroup.rotation.z = Math.sin(t * 0.8) * 0.05;

        let blinkScaleY = 1.0;
        const blinkCycle = t % 2.0;
        if (interactionProgress > 0.1 && blinkCycle > 1.85) {
          blinkScaleY = Math.abs(Math.sin((blinkCycle - 1.85) * Math.PI * 6.67));
        }

        leftEye.scale.set(1.0, blinkScaleY, 1.0);
        rightEye.scale.set(1.0, blinkScaleY, 1.0);

        ghostMaterial.opacity = 0.12 + interactionProgress * 0.12;
      }

      (ghostWireframe.material as THREE.LineBasicMaterial).opacity = ghostMaterial.opacity * 2.2;

      for (const r of hudRings) {
        if (flags.isEscaping) {
          r.mesh.rotation.z += r.rotSpeed * 10;
          r.mesh.scale.setScalar(
            Math.max(1 - (performance.now() - flags.escapeStartTime) / 500, 0)
          );
        } else if (is404Page) {
          r.mesh.rotation.z += r.rotSpeed * 4.0;
          r.mesh.scale.setScalar(1.3);
        } else {
          r.mesh.rotation.z += r.rotSpeed * (1.0 + interactionProgress * 2.0);
          r.mesh.scale.setScalar(1.0);
        }
      }

      renderer.render(scene, camera);
    };

    tick();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(spotifyInterval);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("ghost-escape", onEscapeChange);
      window.removeEventListener("resize", onResize);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      // Clean up notes from scene
      for (const n of notes) {
        scene.remove(n.mesh);
      }
      // Clean up zs from scene
      for (const z of zs) {
        scene.remove(z.mesh);
      }
    };
  }, []); // Static mount execution

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default AestheticBackground;
