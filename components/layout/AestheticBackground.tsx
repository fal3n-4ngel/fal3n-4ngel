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
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      precision: "highp",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
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
      opacity: isMobile ? 0.35 : 0.16,
      shininess: 30,
    });

    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: isMobile ? 0.55 : 0.35,
    });

    // Left cup
    const leftCup = new THREE.Mesh(cupGeom, cupMat);
    leftCup.position.set(-3.7, 1.6, 0);
    leftCup.rotation.z = Math.PI / 2;
    headsetGroup.add(leftCup);

    const leftCupWire = new THREE.LineSegments(new THREE.EdgesGeometry(cupGeom), wireMat);
    leftCupWire.position.set(-3.7, 1.6, 0);
    leftCupWire.rotation.z = Math.PI / 2;
    headsetGroup.add(leftCupWire);

    // Right cup
    const rightCup = new THREE.Mesh(cupGeom, cupMat);
    rightCup.position.set(3.7, 1.6, 0);
    rightCup.rotation.z = Math.PI / 2;
    headsetGroup.add(rightCup);

    const rightCupWire = new THREE.LineSegments(new THREE.EdgesGeometry(cupGeom), wireMat);
    rightCupWire.position.set(3.7, 1.6, 0);
    rightCupWire.rotation.z = Math.PI / 2;
    headsetGroup.add(rightCupWire);

    // Headband (Torus arc over head)
    const bandGeom = new THREE.TorusGeometry(3.7, 0.18, 8, 32, Math.PI);
    const band = new THREE.Mesh(bandGeom, cupMat);
    band.position.set(0, 1.6, 0);
    headsetGroup.add(band);

    const bandWire = new THREE.LineSegments(new THREE.EdgesGeometry(bandGeom), wireMat);
    bandWire.position.set(0, 1.6, 0);
    headsetGroup.add(bandWire);

    // Microphone Boom Arm (Curves from left ear cup towards front mouth)
    const micPoints = [
      new THREE.Vector3(-3.5, 0.9, 0.2),
      new THREE.Vector3(-3.0, 0.3, 1.5),
      new THREE.Vector3(-1.5, 0.0, 2.8),
      new THREE.Vector3(-0.4, 0.2, 3.2),
    ];
    const micCurve = new THREE.CatmullRomCurve3(micPoints);
    const micGeom = new THREE.TubeGeometry(micCurve, 20, 0.08, 8, false);
    const mic = new THREE.Mesh(micGeom, cupMat);
    headsetGroup.add(mic);

    const micWire = new THREE.LineSegments(new THREE.EdgesGeometry(micGeom), wireMat);
    headsetGroup.add(micWire);

    // Microphone Tip / Capsule
    const tipGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.35, 12);
    const tip = new THREE.Mesh(tipGeom, cupMat);
    const lastMicPoint = micPoints[micPoints.length - 1] || new THREE.Vector3(-0.4, 0.6, 3.2);
    tip.position.copy(lastMicPoint);
    tip.rotation.x = Math.PI / 2;
    headsetGroup.add(tip);

    const tipWire = new THREE.LineSegments(new THREE.EdgesGeometry(tipGeom), wireMat);
    tipWire.position.copy(lastMicPoint);
    tipWire.rotation.x = Math.PI / 2;
    headsetGroup.add(tipWire);

    headsetGroup.visible = false;
    ghostGroup.add(headsetGroup);

    // ── Procedural Holographic Coding Glasses Mesh ────────────────────────────
    const createGlasses = () => {
      const group = new THREE.Group();
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
      });

      const makeLensGeom = (width: number, height: number, radius: number) => {
        const pts: THREE.Vector3[] = [];
        const steps = 8;
        for (let j = 0; j <= steps; j++) {
          const theta = (j / steps) * (Math.PI / 2);
          pts.push(
            new THREE.Vector3(
              width / 2 - radius + Math.cos(theta) * radius,
              height / 2 - radius + Math.sin(theta) * radius,
              0
            )
          );
        }
        for (let j = 0; j <= steps; j++) {
          const theta = Math.PI / 2 + (j / steps) * (Math.PI / 2);
          pts.push(
            new THREE.Vector3(
              -(width / 2 - radius) + Math.cos(theta) * radius,
              height / 2 - radius + Math.sin(theta) * radius,
              0
            )
          );
        }
        for (let j = 0; j <= steps; j++) {
          const theta = Math.PI + (j / steps) * (Math.PI / 2);
          pts.push(
            new THREE.Vector3(
              -(width / 2 - radius) + Math.cos(theta) * radius,
              -(height / 2 - radius) + Math.sin(theta) * radius,
              0
            )
          );
        }
        for (let j = 0; j <= steps; j++) {
          const theta = Math.PI * 1.5 + (j / steps) * (Math.PI / 2);
          pts.push(
            new THREE.Vector3(
              width / 2 - radius + Math.cos(theta) * radius,
              -(height / 2 - radius) + Math.sin(theta) * radius,
              0
            )
          );
        }
        pts.push(pts[0]!);
        return new THREE.BufferGeometry().setFromPoints(pts);
      };

      const lensGeom = makeLensGeom(1.15, 0.78, 0.15);

      const leftLens = new THREE.Line(lensGeom, lineMat);
      leftLens.position.set(-0.85, 1.8, 3.32);
      leftLens.rotation.y = 0.15;
      group.add(leftLens);

      const rightLens = new THREE.Line(lensGeom, lineMat);
      rightLens.position.set(0.85, 1.8, 3.32);
      rightLens.rotation.y = -0.15;
      group.add(rightLens);

      const bridgePts = [
        new THREE.Vector3(-0.275, 1.8, 3.35),
        new THREE.Vector3(0.0, 1.83, 3.37),
        new THREE.Vector3(0.275, 1.8, 3.35),
      ];
      const bridgeGeom = new THREE.BufferGeometry().setFromPoints(bridgePts);
      const bridge = new THREE.Line(bridgeGeom, lineMat);
      group.add(bridge);

      const leftTemplePts = [
        new THREE.Vector3(-1.425, 1.8, 3.25),
        new THREE.Vector3(-2.1, 1.8, 2.5),
        new THREE.Vector3(-2.7, 1.6, 0.8),
      ];
      const leftTempleGeom = new THREE.BufferGeometry().setFromPoints(leftTemplePts);
      const leftTemple = new THREE.Line(leftTempleGeom, lineMat);
      group.add(leftTemple);

      const rightTemplePts = [
        new THREE.Vector3(1.425, 1.8, 3.25),
        new THREE.Vector3(2.1, 1.8, 2.5),
        new THREE.Vector3(2.7, 1.6, 0.8),
      ];
      const rightTempleGeom = new THREE.BufferGeometry().setFromPoints(rightTemplePts);
      const rightTemple = new THREE.Line(rightTempleGeom, lineMat);
      group.add(rightTemple);

      return group;
    };

    const glassesGroup = createGlasses();
    glassesGroup.visible = false;
    ghostGroup.add(glassesGroup);

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

    const makeCodeMesh = (type: number) => {
      const group = new THREE.Group();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.65,
      });

      const points: THREE.Vector3[] = [];
      const size = 0.25;

      if (type === 0) {
        points.push(new THREE.Vector3(size, size, 0));
        points.push(new THREE.Vector3(0, size, 0));
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(-size / 2, 0, 0));
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(0, -size, 0));
        points.push(new THREE.Vector3(size, -size, 0));
      } else if (type === 1) {
        points.push(new THREE.Vector3(-size, size, 0));
        points.push(new THREE.Vector3(0, size, 0));
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(size / 2, 0, 0));
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(0, -size, 0));
        points.push(new THREE.Vector3(-size, -size, 0));
      } else if (type === 2) {
        points.push(new THREE.Vector3(size, size, 0));
        points.push(new THREE.Vector3(-size, 0, 0));
        points.push(new THREE.Vector3(size, -size, 0));
      } else if (type === 3) {
        points.push(new THREE.Vector3(-size, size, 0));
        points.push(new THREE.Vector3(size, 0, 0));
        points.push(new THREE.Vector3(-size, -size, 0));
      } else {
        points.push(new THREE.Vector3(0, size / 2, 0));
        points.push(new THREE.Vector3(0, size / 2 + 0.05, 0));
        points.push(new THREE.Vector3(0, -size / 2, 0));
        points.push(new THREE.Vector3(-size / 4, -size, 0));
      }

      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, lineMaterial);
      group.add(line);
      return group;
    };

    interface FloatingCode {
      mesh: THREE.Group;
      speedY: number;
      swayAmp: number;
      swayFreq: number;
      phase: number;
      age: number;
    }

    const codes: FloatingCode[] = [];
    const codesCount = 4;

    for (let i = 0; i < codesCount; i++) {
      const mesh = makeCodeMesh(i % 5);
      mesh.visible = false;
      scene.add(mesh);

      codes.push({
        mesh,
        speedY: 0.006 + Math.random() * 0.005,
        swayAmp: 0.35 + Math.random() * 0.3,
        swayFreq: 1.0 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        age: Math.random(),
      });
    }

    // Minecraft block particles helper for Minecraft gaming state
    const makeBlockMesh = () => {
      const group = new THREE.Group();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.7,
      });

      const geomOuter = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const edgesOuter = new THREE.EdgesGeometry(geomOuter);
      const lineOuter = new THREE.LineSegments(edgesOuter, lineMaterial);
      group.add(lineOuter);

      const geomInner = new THREE.BoxGeometry(0.25, 0.25, 0.25);
      const edgesInner = new THREE.EdgesGeometry(geomInner);
      const innerMat = new THREE.LineBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.35,
      });
      const lineInner = new THREE.LineSegments(edgesInner, innerMat);
      group.add(lineInner);

      return group;
    };

    interface FloatingBlock {
      mesh: THREE.Group;
      speedY: number;
      swayAmp: number;
      swayFreq: number;
      phase: number;
      age: number;
    }

    const blocks: FloatingBlock[] = [];
    const blocksCount = 4;

    for (let i = 0; i < blocksCount; i++) {
      const mesh = makeBlockMesh();
      mesh.visible = false;
      scene.add(mesh);

      blocks.push({
        mesh,
        speedY: 0.005 + Math.random() * 0.004,
        swayAmp: 0.4 + Math.random() * 0.3,
        swayFreq: 0.8 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        age: Math.random(),
      });
    }

    ghostGroup.position.set(0, -1, 0);
    scene.add(ghostGroup);


    // ── Mouse & Interaction & Escape States ───────────────────────────────────

    const mouse = { nx: 0, ny: 0 };
    const targetRot = { x: 0, y: 0 };
    const currentRot = { x: 0, y: 0 };

    const flags = {
      isInteracting: false,
      isEscaping: false,
      escapeStartTime: 0,
      isPlayingMusic: false,
      isCoding: false,
      isMinecraft: false,
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

    const onCodingChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ coding: boolean }>;
      flags.isCoding = !!customEvent.detail?.coding;
    };
    window.addEventListener("ghost-coding", onCodingChange);

    const onMinecraftChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ minecraft: boolean }>;
      flags.isMinecraft = !!customEvent.detail?.minecraft;
    };
    window.addEventListener("ghost-minecraft", onMinecraftChange);

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
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    const onResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const heightDiff = Math.abs(height - lastHeight);

      if (width !== lastWidth || heightDiff > 120) {
        lastWidth = width;
        lastHeight = height;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };
    window.addEventListener("resize", onResize);

    // ── Render loop ───────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let raf: number;
    let interactionProgress = 0;
    let headsetScale = 0;
    let glassesScale = 0;

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

      // Animate Headset Visibility & Scale (Show only when music is playing or playing Minecraft, and not sleeping)
      const targetHeadsetScale =
        (flags.isPlayingMusic || flags.isMinecraft) && !isSleeping ? 1.0 : 0.0;
      headsetScale += (targetHeadsetScale - headsetScale) * 0.06;
      if (headsetScale > 0.005) {
        headsetGroup.visible = true;
        headsetGroup.scale.setScalar(headsetScale);
      } else {
        headsetGroup.visible = false;
      }

      // Animate Glasses Visibility & Scale
      const targetGlassesScale = flags.isCoding && !isSleeping ? 1.0 : 0.0;
      glassesScale += (targetGlassesScale - glassesScale) * 0.08;
      if (glassesScale > 0.005) {
        glassesGroup.visible = true;
        glassesGroup.scale.setScalar(glassesScale);
      } else {
        glassesGroup.visible = false;
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

      // Animate Floating Code Particles (Only when coding)
      for (const c of codes) {
        if (!isSleeping && flags.isCoding) {
          c.mesh.visible = true;
          c.age += c.speedY;
          if (c.age > 1.0) {
            c.age = 0.0;
          }

          const ghostX = ghostGroup.position.x;
          const ghostY = ghostGroup.position.y;
          const ghostZ = ghostGroup.position.z;

          const startX = ghostX + (c.phase % 2 === 0 ? -2.2 : 2.2);
          const startY = ghostY + 0.8;

          c.mesh.position.y = startY + c.age * 6.0;
          c.mesh.position.x = startX + Math.sin(t * c.swayFreq + c.phase) * c.swayAmp;
          c.mesh.position.z = ghostZ + Math.cos(t * 0.5 + c.phase) * 0.4;

          c.mesh.rotation.z = t * 1.5 + c.phase;

          const opacity = Math.sin(c.age * Math.PI) * 0.7;
          c.mesh.traverse((child) => {
            if (child instanceof THREE.Line) {
              (child.material as THREE.LineBasicMaterial).opacity = opacity;
            }
          });
        } else {
          c.mesh.visible = false;
        }
      }

      // Animate Floating Minecraft Blocks (Only when playing Minecraft)
      for (const b of blocks) {
        if (!isSleeping && flags.isMinecraft) {
          b.mesh.visible = true;
          b.age += b.speedY;
          if (b.age > 1.0) {
            b.age = 0.0;
          }

          const ghostX = ghostGroup.position.x;
          const ghostY = ghostGroup.position.y;
          const ghostZ = ghostGroup.position.z;

          const startX = ghostX + (b.phase % 2 === 0 ? -2.4 : 2.4);
          const startY = ghostY + 0.5;

          b.mesh.position.y = startY + b.age * 5.5;
          b.mesh.position.x = startX + Math.sin(t * b.swayFreq + b.phase) * b.swayAmp;
          b.mesh.position.z = ghostZ + Math.cos(t * 0.5 + b.phase) * 0.4;

          b.mesh.rotation.x = t * 0.8 + b.phase;
          b.mesh.rotation.y = t * 0.5 + b.phase;

          const opacity = Math.sin(b.age * Math.PI) * 0.65;
          b.mesh.traverse((child) => {
            if (child instanceof THREE.LineSegments) {
              (child.material as THREE.LineBasicMaterial).opacity = opacity;
            }
          });
        } else {
          b.mesh.visible = false;
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
        const codingSwayY = flags.isCoding ? Math.sin(t * 1.0) * 0.15 : 0;
        const minecraftSwayY = flags.isMinecraft ? Math.sin(t * 2.0) * 0.12 : 0;
        ghostGroup.position.y = baseFloatY + interactionShiftY + codingSwayY + minecraftSwayY;

        const codingSwayX = flags.isCoding ? Math.cos(t * 0.8) * 0.25 : 0;
        const minecraftSwayX = flags.isMinecraft ? Math.sin(t * 1.2) * 0.35 : 0;
        ghostGroup.position.x += (codingSwayX + minecraftSwayX - ghostGroup.position.x) * 0.1;
        const targetZ =
          interactionProgress * 3.5 + (flags.isCoding ? 1.5 : 0) + (flags.isMinecraft ? 1.0 : 0);
        ghostGroup.position.z += (targetZ - ghostGroup.position.z) * 0.1;

        const interactionWiggleY = Math.sin(t * 2.0) * 0.08 * interactionProgress;
        ghostGroup.rotation.y = currentRot.y + Math.sin(t * 0.5) * 0.15 + interactionWiggleY;

        const interactionWiggleX = Math.cos(t * 1.8) * 0.05 * interactionProgress;
        const interactionTiltX = -0.18 * interactionProgress;
        ghostGroup.rotation.x =
          currentRot.x + Math.cos(t * 0.4) * 0.08 + interactionWiggleX + interactionTiltX;

        ghostGroup.rotation.z = Math.sin(t * 0.8) * 0.05;

        let blinkScaleY = 1.0;
        const blinkCycle = t % 2.0;
        if (interactionProgress > 0.1 && blinkCycle > 1.85) {
          blinkScaleY = Math.abs(Math.sin((blinkCycle - 1.85) * Math.PI * 6.67));
        }

        let eyeScaleX = 1.0 + interactionProgress * 0.22;
        let eyeScaleY = blinkScaleY * (1.0 + interactionProgress * 0.15);

        if (flags.isCoding) {
          eyeScaleY *= 0.75;
          eyeScaleX *= 0.95;
        }

        leftEye.scale.set(eyeScaleX, eyeScaleY, 1.0);
        rightEye.scale.set(eyeScaleX, eyeScaleY, 1.0);

        ghostMaterial.opacity = 0.12 + interactionProgress * 0.12;
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
      window.removeEventListener("ghost-coding", onCodingChange);
      window.removeEventListener("ghost-minecraft", onMinecraftChange);
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
      // Clean up codes from scene
      for (const c of codes) {
        scene.remove(c.mesh);
      }
      // Clean up blocks from scene
      for (const b of blocks) {
        scene.remove(b.mesh);
      }
      ghostGroup.remove(glassesGroup);
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
