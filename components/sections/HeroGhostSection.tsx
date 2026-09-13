"use client";

import { useLanyard } from "@/hooks";
import { getCalendarAvailabilityStatus } from "@/lib/integrations/google-calendar";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const HeroGhostSection: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [statusText, setStatusText] = useState("Available for work");
  const [statusDotColor, setStatusDotColor] = useState("bg-emerald-400 shadow-[0_0_8px_#34d399]");
  const [calendarStatus, setCalendarStatus] = useState<string | null>(null);
  const [forceHeadset, setForceHeadset] = useState(false);

  const flagsRef = useRef({
    isCoding: false,
    isMusic: false,
    isGaming: false,
    forceHeadset: false,
  });

  // Keep ref in sync with forceHeadset
  useEffect(() => {
    flagsRef.current.forceHeadset = forceHeadset;
  }, [forceHeadset]);

  // Hook into live Discord / Calendar status if available
  const { data: lanyardData } = useLanyard("849515993546096660");

  useEffect(() => {
    getCalendarAvailabilityStatus().then((cal) => {
      if (cal?.status) {
        setCalendarStatus(cal.status);
      }
    });
  }, []);

  // Poll Spotify directly as well (for when Discord RPC isn't active)
  useEffect(() => {
    const checkSpotifyStatus = async () => {
      try {
        const res = await fetch("/api/spotify");
        if (res.ok) {
          const data = await res.json();
          if (data?.isPlaying) {
            flagsRef.current.isMusic = true;
            setStatusText(`Listening to: ${data.title} - ${data.artist}`);
            setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse");
          }
        }
      } catch {
        // silent fallback
      }
    };
    checkSpotifyStatus();
    const interval = setInterval(checkSpotifyStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!lanyardData) {
      if (calendarStatus === "Busy") {
        setStatusText("Busy (In a meeting)");
        setStatusDotColor("bg-amber-400 shadow-[0_0_8px_#fbbf24]");
      } else if (!flagsRef.current.isMusic) {
        setStatusText("Available for work");
        setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399]");
      }
      return;
    }

    const vsCodeAct = lanyardData.activities?.find(
      (act) =>
        act.type === 0 &&
        (act.name.toLowerCase().includes("code") ||
          act.name.toLowerCase().includes("cursor") ||
          act.name.toLowerCase().includes("visual studio"))
    );
    const gameAct = lanyardData.activities?.find(
      (act) =>
        act.type === 0 &&
        !act.name.toLowerCase().includes("code") &&
        !act.name.toLowerCase().includes("cursor")
    );

    const coding = !!vsCodeAct;
    const music = lanyardData.listening_to_spotify;

    flagsRef.current.isCoding = coding;
    flagsRef.current.isMusic = music || flagsRef.current.isMusic;
    flagsRef.current.isGaming = !!gameAct;

    if (coding && vsCodeAct) {
      const detail = vsCodeAct.details || vsCodeAct.state || "VS Code";
      setStatusText(`Coding: ${detail}`);
      setStatusDotColor("bg-blue-400 shadow-[0_0_8px_#60a5fa] animate-pulse");
    } else if (gameAct) {
      setStatusText(`Playing: ${gameAct.name}`);
      setStatusDotColor("bg-purple-400 shadow-[0_0_8px_#c084fc] animate-pulse");
    } else if (music) {
      const spotify = lanyardData.activities?.find((act) => act.name === "Spotify");
      const song = spotify?.details ? `${spotify.details} - ${spotify.state}` : "Spotify";
      setStatusText(`Listening to: ${song}`);
      setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse");
    } else if (calendarStatus === "Busy") {
      setStatusText("Busy (In a meeting)");
      setStatusDotColor("bg-amber-400 shadow-[0_0_8px_#fbbf24]");
    } else if (lanyardData.discord_status === "online") {
      setStatusText("Online Now");
      setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399]");
    } else if (lanyardData.discord_status === "idle") {
      setStatusText("Away");
      setStatusDotColor("bg-yellow-400 shadow-[0_0_8px_#facc15]");
    } else if (lanyardData.discord_status === "dnd") {
      setStatusText("Do Not Disturb");
      setStatusDotColor("bg-red-400 shadow-[0_0_8px_#f87171]");
    } else {
      setStatusText("Available for work");
      setStatusDotColor("bg-emerald-400 shadow-[0_0_8px_#34d399]");
    }
  }, [lanyardData, calendarStatus]);

  // ── Three.js Chrome 3D Ghost ──────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let animFrameId: number;

    // Robust measurement function so canvas is never 0x0
    const getDims = () => {
      const rect = mount.getBoundingClientRect();
      const w = rect.width || mount.clientWidth || 800;
      const h = rect.height || mount.clientHeight || 450;
      return { w: Math.max(w, 200), h: Math.max(h, 200) };
    };

    const { w: initW, h: initH } = getDims();

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initW, initH);
    mount.appendChild(renderer.domElement);

    // Scene & Camera - positioned to view the entire ghost floating freely
    const scene = new THREE.Scene();
    const isMobileInit = initW < 768;
    const camera = new THREE.PerspectiveCamera(40, initW / initH, 0.1, 100);
    if (isMobileInit) {
      camera.position.set(0, 0.35, 15.0);
    } else {
      camera.position.set(0, -0.2, 13.5);
    }

    // ── Soft Ethereal Lighting (Original Ghost Look) ─────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // ── Build Chrome Ghost Geometry ──────────────────────────────────────────
    const ghostGroup = new THREE.Group();
    const initGhostScale = isMobileInit ? 0.52 : 0.66;
    ghostGroup.scale.set(initGhostScale, initGhostScale, initGhostScale);

    const segmentsX = 40;
    const segmentsY = 40;
    const radius = 2.4;
    const bodyHeight = 5.5;

    const basePositions: THREE.Vector3[] = [];
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (let y = 0; y <= segmentsY; y++) {
      const v = y / segmentsY;

      for (let x = 0; x <= segmentsX; x++) {
        const u = x / segmentsX;
        const theta = u * Math.PI * 2;

        let px = 0;
        let py = 0;
        let pz = 0;

        if (v < 0.38) {
          // Dome head
          const localPhi = (v / 0.38) * (Math.PI / 2);
          px = Math.sin(localPhi) * Math.cos(theta) * radius;
          pz = Math.sin(localPhi) * Math.sin(theta) * radius;
          py = Math.cos(localPhi) * radius + 0.8;
        } else {
          // Skirt / body with flowing pleats
          const progress = (v - 0.38) / 0.62;
          const currentRad = radius * (1.0 + progress * 0.45);

          const pleatWaves = 6;
          const pleatAmp = 0.35 * progress;
          const pleatOffset = Math.sin(theta * pleatWaves) * pleatAmp;

          px = (currentRad + pleatOffset) * Math.cos(theta);
          pz = (currentRad + pleatOffset) * Math.sin(theta);

          const bottomFrill = Math.sin(theta * 3) * 0.4 + Math.cos(theta * 6) * 0.2;
          py = 0.8 - progress * bodyHeight + progress * progress * bottomFrill;
        }

        basePositions.push(new THREE.Vector3(px, py, pz));
        positions.push(px, py, pz);
        normals.push(0, 1, 0);
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

    const ghostGeom = new THREE.BufferGeometry();
    const posAttr = new THREE.Float32BufferAttribute(positions, 3);
    ghostGeom.setAttribute("position", posAttr);
    ghostGeom.setIndex(indices);
    ghostGeom.computeVertexNormals();

    // Translucent ethereal ghost material matching original reference
    const ghostMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.14,
      side: THREE.FrontSide,
      depthWrite: true,
      depthTest: true,
    });

    const ghostMesh = new THREE.Mesh(ghostGeom, ghostMaterial);
    ghostMesh.renderOrder = 1;
    ghostGroup.add(ghostMesh);

    // Cute Pitch-Black Cutout Eyes
    const eyeGeom = new THREE.SphereGeometry(0.32, 24, 24);
    eyeGeom.scale(1.0, 1.6, 0.2);
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      depthWrite: true,
    });

    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.55, 1.5, 2.3);
    leftEye.rotation.set(0.1, 0.15, 0);

    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.55, 1.5, 2.3);
    rightEye.rotation.set(0.1, -0.15, 0);

    ghostGroup.add(leftEye);
    ghostGroup.add(rightEye);

    // Center ghost group vertically
    ghostGroup.position.y = 0.6;
    scene.add(ghostGroup);

    // ── Procedural Headset Mesh (Matching Earlier Design) ─────────────────────
    const headsetGroup = new THREE.Group();

    const cupMat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      shininess: 30,
    });
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
    });

    // Ear cups positioned on the ghost head
    const cupGeom = new THREE.CylinderGeometry(0.72, 0.72, 0.55, 24);

    // Left ear cup
    const leftCup = new THREE.Mesh(cupGeom, cupMat);
    leftCup.position.set(-2.48, 1.4, 0);
    leftCup.rotation.z = Math.PI / 2;
    headsetGroup.add(leftCup);

    const leftCupWire = new THREE.LineSegments(new THREE.EdgesGeometry(cupGeom), wireMat);
    leftCupWire.position.set(-2.48, 1.4, 0);
    leftCupWire.rotation.z = Math.PI / 2;
    headsetGroup.add(leftCupWire);

    // Right ear cup
    const rightCup = new THREE.Mesh(cupGeom, cupMat);
    rightCup.position.set(2.48, 1.4, 0);
    rightCup.rotation.z = Math.PI / 2;
    headsetGroup.add(rightCup);

    const rightCupWire = new THREE.LineSegments(new THREE.EdgesGeometry(cupGeom), wireMat);
    rightCupWire.position.set(2.48, 1.4, 0);
    rightCupWire.rotation.z = Math.PI / 2;
    headsetGroup.add(rightCupWire);

    // Headband (Torus arc over head)
    const bandGeom = new THREE.TorusGeometry(2.48, 0.12, 8, 36, Math.PI);
    const band = new THREE.Mesh(bandGeom, cupMat);
    band.position.set(0, 1.4, 0);
    headsetGroup.add(band);

    const bandWire = new THREE.LineSegments(new THREE.EdgesGeometry(bandGeom), wireMat);
    bandWire.position.set(0, 1.4, 0);
    headsetGroup.add(bandWire);

    // Microphone Boom Arm (Curves from left ear cup towards mouth)
    const micPoints = [
      new THREE.Vector3(-2.35, 0.9, 0.15),
      new THREE.Vector3(-2.0, 0.4, 1.0),
      new THREE.Vector3(-1.0, 0.2, 1.9),
      new THREE.Vector3(-0.25, 0.35, 2.2),
    ];
    const micCurve = new THREE.CatmullRomCurve3(micPoints);
    const micGeom = new THREE.TubeGeometry(micCurve, 20, 0.055, 8, false);
    const mic = new THREE.Mesh(micGeom, cupMat);
    headsetGroup.add(mic);

    const micWire = new THREE.LineSegments(new THREE.EdgesGeometry(micGeom), wireMat);
    headsetGroup.add(micWire);

    // Microphone Tip / Capsule
    const tipGeom = new THREE.CylinderGeometry(0.11, 0.11, 0.24, 12);
    const tip = new THREE.Mesh(tipGeom, cupMat);
    const lastMicPoint = micPoints[micPoints.length - 1] || new THREE.Vector3(-0.25, 0.35, 2.2);
    tip.position.copy(lastMicPoint);
    tip.rotation.x = Math.PI / 2;
    headsetGroup.add(tip);

    const tipWire = new THREE.LineSegments(new THREE.EdgesGeometry(tipGeom), wireMat);
    tipWire.position.copy(lastMicPoint);
    tipWire.rotation.x = Math.PI / 2;
    headsetGroup.add(tipWire);

    headsetGroup.visible = false;
    ghostGroup.add(headsetGroup);

    // ── Procedural Coding Glasses ─────────────────────────────────────────────
    const createGlasses = () => {
      const group = new THREE.Group();
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
      });

      // Sleek rectangular developer glasses frame
      const makeLensGeom = (width: number, height: number, radius: number) => {
        const pts: THREE.Vector3[] = [];
        const steps = 6;
        for (let j = 0; j <= steps; j++) {
          const theta = (j / steps) * (Math.PI / 2);
          pts.push(new THREE.Vector3(
            width / 2 - radius + Math.cos(theta) * radius,
            height / 2 - radius + Math.sin(theta) * radius,
            0
          ));
        }
        for (let j = 0; j <= steps; j++) {
          const theta = Math.PI / 2 + (j / steps) * (Math.PI / 2);
          pts.push(new THREE.Vector3(
            -(width / 2 - radius) + Math.cos(theta) * radius,
            height / 2 - radius + Math.sin(theta) * radius,
            0
          ));
        }
        for (let j = 0; j <= steps; j++) {
          const theta = Math.PI + (j / steps) * (Math.PI / 2);
          pts.push(new THREE.Vector3(
            -(width / 2 - radius) + Math.cos(theta) * radius,
            -(height / 2 - radius) + Math.sin(theta) * radius,
            0
          ));
        }
        for (let j = 0; j <= steps; j++) {
          const theta = Math.PI * 1.5 + (j / steps) * (Math.PI / 2);
          pts.push(new THREE.Vector3(
            width / 2 - radius + Math.cos(theta) * radius,
            -(height / 2 - radius) + Math.sin(theta) * radius,
            0
          ));
        }
        pts.push(pts[0]!);
        return new THREE.BufferGeometry().setFromPoints(pts);
      };

      const lensGeom = makeLensGeom(0.78, 0.54, 0.1);

      const leftLens = new THREE.Line(lensGeom, lineMat);
      leftLens.position.set(-0.55, 1.5, 2.42);
      leftLens.rotation.set(0.1, 0.15, 0);
      group.add(leftLens);

      const rightLens = new THREE.Line(lensGeom, lineMat);
      rightLens.position.set(0.55, 1.5, 2.42);
      rightLens.rotation.set(0.1, -0.15, 0);
      group.add(rightLens);

      const bridgePts = [
        new THREE.Vector3(-0.16, 1.52, 2.44),
        new THREE.Vector3(0.0, 1.55, 2.46),
        new THREE.Vector3(0.16, 1.52, 2.44),
      ];
      const bridgeGeom = new THREE.BufferGeometry().setFromPoints(bridgePts);
      const bridge = new THREE.Line(bridgeGeom, lineMat);
      group.add(bridge);

      const leftTemplePts = [
        new THREE.Vector3(-0.94, 1.5, 2.38),
        new THREE.Vector3(-1.5, 1.5, 1.8),
        new THREE.Vector3(-2.1, 1.4, 0.5),
      ];
      const leftTempleGeom = new THREE.BufferGeometry().setFromPoints(leftTemplePts);
      const leftTemple = new THREE.Line(leftTempleGeom, lineMat);
      group.add(leftTemple);

      const rightTemplePts = [
        new THREE.Vector3(0.94, 1.5, 2.38),
        new THREE.Vector3(1.5, 1.5, 1.8),
        new THREE.Vector3(2.1, 1.4, 0.5),
      ];
      const rightTempleGeom = new THREE.BufferGeometry().setFromPoints(rightTemplePts);
      const rightTemple = new THREE.Line(rightTempleGeom, lineMat);
      group.add(rightTemple);

      return group;
    };

    const glassesGroup = createGlasses();
    glassesGroup.visible = false;
    ghostGroup.add(glassesGroup);

    // ── Floating Code Particles (Shown when coding) ───────────────────────────
    const makeCodeMesh = (type: number) => {
      const group = new THREE.Group();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
      });

      if (type === 0) {
        // ── Clean '</>' Dev Symbol ──
        // Left bracket '<'
        const leftGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.16, 0.16, 0),
          new THREE.Vector3(-0.30, 0.0, 0),
          new THREE.Vector3(-0.16, -0.16, 0),
        ]);
        group.add(new THREE.Line(leftGeom, lineMaterial));

        // Center slash '/'
        const slashGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.07, 0.20, 0),
          new THREE.Vector3(-0.07, -0.20, 0),
        ]);
        group.add(new THREE.Line(slashGeom, lineMaterial));

        // Right bracket '>'
        const rightGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.16, 0.16, 0),
          new THREE.Vector3(0.30, 0.0, 0),
          new THREE.Vector3(0.16, -0.16, 0),
        ]);
        group.add(new THREE.Line(rightGeom, lineMaterial));
      } else {
        // ── Smooth Curved Brackets '{ }' ──
        // Left curly brace '{'
        const curveLeft = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.16, 0.24, 0),
          new THREE.Vector3(-0.24, 0.20, 0),
          new THREE.Vector3(-0.24, 0.07, 0),
          new THREE.Vector3(-0.31, 0.0, 0),
          new THREE.Vector3(-0.24, -0.07, 0),
          new THREE.Vector3(-0.24, -0.20, 0),
          new THREE.Vector3(-0.16, -0.24, 0),
        ]);
        const geomLeft = new THREE.BufferGeometry().setFromPoints(curveLeft.getPoints(20));
        group.add(new THREE.Line(geomLeft, lineMaterial));

        // Right curly brace '}'
        const curveRight = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.16, 0.24, 0),
          new THREE.Vector3(0.24, 0.20, 0),
          new THREE.Vector3(0.24, 0.07, 0),
          new THREE.Vector3(0.31, 0.0, 0),
          new THREE.Vector3(0.24, -0.07, 0),
          new THREE.Vector3(0.24, -0.20, 0),
          new THREE.Vector3(0.16, -0.24, 0),
        ]);
        const geomRight = new THREE.BufferGeometry().setFromPoints(curveRight.getPoints(20));
        group.add(new THREE.Line(geomRight, lineMaterial));
      }

      return group;
    };

    interface FloatingCode {
      mesh: THREE.Group;
      speedY: number;
      swayAmp: number;
      swayFreq: number;
      phase: number;
      side: "left" | "right";
      age: number;
    }

    const codes: FloatingCode[] = [];
    const codesCount = 2; // Reduced to 2 sparse, clean symbols matching music notes
    for (let i = 0; i < codesCount; i++) {
      const mesh = makeCodeMesh(i % 2);
      mesh.visible = false;
      scene.add(mesh);

      codes.push({
        mesh,
        speedY: 0.0045 + Math.random() * 0.002,
        swayAmp: 0.28 + Math.random() * 0.2,
        swayFreq: 1.1 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        side: i % 2 === 0 ? "left" : "right",
        age: i === 0 ? 0.15 : 0.65,
      });
    }

    // ── Floating Music Notes (Shown when listening to Spotify) ─────────────────
    const makeNoteMesh = (isDoubleNote: boolean) => {
      const group = new THREE.Group();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
      });

      const headGeom = new THREE.BufferGeometry();
      const headPoints: THREE.Vector3[] = [];
      for (let j = 0; j <= 16; j++) {
        const th = (j / 16) * Math.PI * 2;
        headPoints.push(new THREE.Vector3(Math.cos(th) * 0.22, Math.sin(th) * 0.18, 0));
      }
      headGeom.setFromPoints(headPoints);
      const head = new THREE.Line(headGeom, lineMaterial);
      group.add(head);

      const stemGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.2, 0.1, 0),
        new THREE.Vector3(0.2, 0.75, 0),
      ]);
      const stem = new THREE.Line(stemGeom, lineMaterial);
      group.add(stem);

      if (isDoubleNote) {
        const head2 = new THREE.Line(headGeom, lineMaterial);
        head2.position.set(0.45, 0.08, 0);
        group.add(head2);

        const stem2Geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.65, 0.18, 0),
          new THREE.Vector3(0.65, 0.83, 0),
        ]);
        const stem2 = new THREE.Line(stem2Geom, lineMaterial);
        group.add(stem2);

        const beamGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.2, 0.75, 0),
          new THREE.Vector3(0.65, 0.83, 0),
        ]);
        const beam = new THREE.Line(beamGeom, lineMaterial);
        group.add(beam);
      } else {
        const flagGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.2, 0.75, 0),
          new THREE.Vector3(0.42, 0.6, 0),
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
        speedY: 0.0045 + Math.random() * 0.002,
        swayAmp: 0.28 + Math.random() * 0.2,
        swayFreq: 1.1 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        side: i % 2 === 0 ? "left" : "right",
        age: i === 0 ? 0.15 : 0.65,
      });
    }

    // ── Interaction & Mouse Tracking ──────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spinVelocity = 0;
    let glassesScale = 0;
    let headsetScale = 0;
    let eyeScaleX = 1.0;
    let eyeScaleY = 1.0;

    let lastClickTime = -10;
    let lastWinkTime = -10;

    const onPointerMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseX = nx;
      mouseY = ny;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.01;
        targetRotX += deltaY * 0.01;
        spinVelocity = deltaX * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        targetRotY = nx * 0.6;
        targetRotX = -ny * 0.35;
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      lastClickTime = clock.getElapsedTime();
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onDoubleClick = () => {
      lastWinkTime = clock.getElapsedTime();
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    let ghostBaseX = initW >= 1024 ? 2.4 : 0;

    const onResize = () => {
      if (!mount) return;
      const rect = mount.getBoundingClientRect();
      const w = rect.width || mount.clientWidth;
      const h = rect.height || mount.clientHeight;
      if (w > 20 && h > 20) {
        camera.aspect = w / h;
        const isMob = w < 768;
        const sc = isMob ? 0.52 : 0.66;
        ghostGroup.scale.set(sc, sc, sc);
        if (isMob) {
          camera.position.set(0, 0.35, 15.0);
        } else {
          camera.position.set(0, -0.2, 13.5);
        }
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        ghostBaseX = w >= 1024 ? 2.4 : 0;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      onResize();
    });
    resizeObserver.observe(mount);

    let lastCursorInteractTime = -10;
    let isCursorInteracting = false;

    const onCursorInteract = (e: Event) => {
      const customEvent = e as CustomEvent<{ isInteracting: boolean }>;
      if (customEvent.detail?.isInteracting) {
        isCursorInteracting = true;
        lastCursorInteractTime = clock.getElapsedTime();
      } else {
        isCursorInteracting = false;
      }
    };

    const onCursorClick = () => {
      lastClickTime = clock.getElapsedTime();
    };

    mount.addEventListener("mousemove", onPointerMove);
    mount.addEventListener("mousedown", onPointerDown);
    mount.addEventListener("dblclick", onDoubleClick);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("resize", onResize);
    window.addEventListener("cursor-interact", onCursorInteract);
    window.addEventListener("cursor-click", onCursorClick);

    // ── Animation Loop ────────────────────────────────────────────────────────
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Skirt wave flutter animation
      const posArray = posAttr.array as Float32Array;
      for (let i = 0; i < basePositions.length; i++) {
        const base = basePositions[i];
        if (!base) continue;
        if (base.y < 1.0) {
          const wave = Math.sin(elapsed * 2.5 + base.x * 2.0 + base.z * 1.5) * 0.08 * (1.2 - base.y);
          posArray[i * 3 + 1] = base.y + wave;
        }
      }
      posAttr.needsUpdate = true;
      ghostGeom.computeVertexNormals();

      // Gentle floating bob & desktop offset
      ghostGroup.position.x = ghostBaseX;
      ghostGroup.position.y = 0.2 + Math.sin(elapsed * 1.8) * 0.15;

      // Mouse reactive subtle opacity + extra glow when hovering interactables
      const hoverBoost = isCursorInteracting ? 0.06 : 0;
      ghostMaterial.opacity = 0.14 + Math.min(Math.abs(mouseX) + Math.abs(mouseY), 1.0) * 0.08 + hoverBoost;

      // Music head-bob rhythm
      if (flagsRef.current.isMusic || flagsRef.current.forceHeadset) {
        ghostGroup.position.y += Math.sin(elapsed * 4.0) * 0.04;
        ghostGroup.rotation.z = Math.sin(elapsed * 2.5) * 0.04;
      } else {
        // Slight idle sway
        ghostGroup.rotation.z = Math.sin(elapsed * 1.2) * 0.04;
      }

      // Headset scale transition (Shown during Spotify music, gaming, or when toggled)
      const targetHeadsetScale =
        flagsRef.current.isMusic ||
        flagsRef.current.isGaming ||
        flagsRef.current.forceHeadset
          ? 1.0
          : 0.0;
      headsetScale += (targetHeadsetScale - headsetScale) * 0.08;
      if (headsetScale > 0.01) {
        headsetGroup.visible = true;
        headsetGroup.scale.setScalar(headsetScale);
      } else {
        headsetGroup.visible = false;
      }

      // Coding glasses scale transition
      const targetGlassesScale = flagsRef.current.isCoding ? 1.0 : 0.0;
      glassesScale += (targetGlassesScale - glassesScale) * 0.1;
      glassesGroup.scale.set(glassesScale, glassesScale, glassesScale);
      glassesGroup.visible = glassesScale > 0.01;

      // ── Interactive & Natural Eye Blinking & Squash Animation ────────────────
      let blinkFactor = 1.0;
      const leftWinkFactor = 1.0;
      let rightWinkFactor = 1.0;

      // 1. Natural Periodic Blinking (Every ~3.8s)
      const blinkCycle = elapsed % 3.8;
      const cycleIndex = Math.floor(elapsed / 3.8);
      const isNaturalWink = cycleIndex % 5 === 4; // Occasional playful wink every ~19s

      if (blinkCycle < 0.15) {
        const dip = Math.sin((blinkCycle / 0.15) * Math.PI);
        if (isNaturalWink) {
          rightWinkFactor = Math.min(rightWinkFactor, 1.0 - dip * 0.95);
        } else {
          blinkFactor = Math.min(blinkFactor, 1.0 - dip * 0.95);
        }
      }

      // 2. Interactive Click / Drag Squeeze & Double-Blink
      const timeSinceClick = elapsed - lastClickTime;
      if (timeSinceClick >= 0 && timeSinceClick < 0.36) {
        // Energetic double-blink on tap/click
        let clickDip = 0;
        if (timeSinceClick < 0.14) {
          clickDip = Math.sin((timeSinceClick / 0.14) * Math.PI);
        } else if (timeSinceClick >= 0.18 && timeSinceClick < 0.32) {
          clickDip = Math.sin(((timeSinceClick - 0.18) / 0.14) * Math.PI);
        }
        blinkFactor = Math.min(blinkFactor, 1.0 - clickDip * 0.96);

        // Cheerful spring bounce on click
        const bounceP = Math.min(timeSinceClick / 0.36, 1.0);
        ghostGroup.position.y += Math.sin(bounceP * Math.PI) * 0.14;
      }

      // 3. Double-Click Interactive Cheeky Wink
      const timeSinceWink = elapsed - lastWinkTime;
      if (timeSinceWink >= 0 && timeSinceWink < 0.3) {
        const winkDip = Math.sin((timeSinceWink / 0.3) * Math.PI);
        rightWinkFactor = Math.min(rightWinkFactor, 1.0 - winkDip * 0.96);
      }

      // 4. Cursor Interaction Event Reaction (Triggered when cursor hovers an interactable element)
      const timeSinceCursorInteract = elapsed - lastCursorInteractTime;
      if (timeSinceCursorInteract >= 0 && timeSinceCursorInteract < 0.28) {
        const interactDip = Math.sin((timeSinceCursorInteract / 0.28) * Math.PI);
        blinkFactor = Math.min(blinkFactor, 1.0 - interactDip * 0.94);

        // Perky alert lift towards user
        const perkBounce = Math.sin((timeSinceCursorInteract / 0.28) * Math.PI) * 0.1;
        ghostGroup.position.y += perkBounce;
      }

      // Eye concentration scaling during coding + curious widening when tracking cursor / hovering interactables
      const curiosity = Math.min(Math.abs(mouseX) + Math.abs(mouseY), 1.0) + (isCursorInteracting ? 0.25 : 0);
      const baseEyeScaleY = flagsRef.current.isCoding ? 0.72 : 1.0 + curiosity * 0.08;
      const baseEyeScaleX = flagsRef.current.isCoding ? 0.94 : 1.0 + curiosity * 0.04;

      eyeScaleY += (baseEyeScaleY - eyeScaleY) * 0.1;
      eyeScaleX += (baseEyeScaleX - eyeScaleX) * 0.1;

      // Apply blinking and winking cleanly to eyes
      leftEye.scale.set(eyeScaleX, Math.max(eyeScaleY * blinkFactor * leftWinkFactor, 0.04), 1.0);
      rightEye.scale.set(eyeScaleX, Math.max(eyeScaleY * blinkFactor * rightWinkFactor, 0.04), 1.0);

      // Animate Floating Code Particles (When coding)
      for (const c of codes) {
        if (flagsRef.current.isCoding) {
          c.mesh.visible = true;
          c.age += c.speedY;
          if (c.age > 1.0) c.age = 0.0;

          const ghostX = ghostGroup.position.x;
          const ghostY = ghostGroup.position.y;
          const ghostZ = ghostGroup.position.z;

          // One code symbol on left, one on right (never stacked)
          const startX = ghostX + (c.side === "left" ? -2.7 : 2.7);
          const startY = ghostY + 1.2;

          c.mesh.position.y = startY + c.age * 5.5;
          c.mesh.position.x = startX + Math.sin(elapsed * c.swayFreq + c.phase) * c.swayAmp;
          c.mesh.position.z = ghostZ + Math.cos(elapsed * 0.6 + c.phase) * 0.3;
          // Gentle ambient tilt so the symbol remains clearly readable
          c.mesh.rotation.z = Math.sin(elapsed * 1.2 + c.phase) * 0.12;

          const opacity = Math.sin(c.age * Math.PI) * 0.85;
          c.mesh.traverse((child) => {
            if (child instanceof THREE.Line) {
              (child.material as THREE.LineBasicMaterial).opacity = opacity;
            }
          });
        } else {
          c.mesh.visible = false;
        }
      }

      // Animate Floating Music Notes (When playing Spotify or headset preview)
      for (const n of notes) {
        if (flagsRef.current.isMusic || flagsRef.current.forceHeadset) {
          n.mesh.visible = true;
          n.age += n.speedY;
          if (n.age > 1.0) n.age = 0.0;

          const ghostX = ghostGroup.position.x;
          const ghostY = ghostGroup.position.y;
          const ghostZ = ghostGroup.position.z;

          // One note on left, one on right (matching reference image)
          const startX = ghostX + (n.side === "left" ? -2.7 : 2.7);
          const startY = ghostY + 1.2;

          n.mesh.position.y = startY + n.age * 5.5;
          n.mesh.position.x = startX + Math.sin(elapsed * n.swayFreq + n.phase) * n.swayAmp;
          n.mesh.position.z = ghostZ + Math.cos(elapsed * 0.6 + n.phase) * 0.3;
          n.mesh.rotation.z = Math.sin(elapsed * 1.5 + n.phase) * 0.15;

          const opacity = Math.sin(n.age * Math.PI) * 0.85;
          n.mesh.traverse((child) => {
            if (child instanceof THREE.Line) {
              (child.material as THREE.LineBasicMaterial).opacity = opacity;
            }
          });
        } else {
          n.mesh.visible = false;
        }
      }

      // Rotational damping / smoothing
      if (!isDragging) {
        spinVelocity *= 0.95;
        targetRotY += spinVelocity;
        ghostGroup.rotation.y += (targetRotY - ghostGroup.rotation.y) * 0.08;
        ghostGroup.rotation.x += (targetRotX - ghostGroup.rotation.x) * 0.08;
      } else {
        ghostGroup.rotation.y = targetRotY;
        ghostGroup.rotation.x = targetRotX;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      mount.removeEventListener("mousemove", onPointerMove);
      mount.removeEventListener("mousedown", onPointerDown);
      mount.removeEventListener("dblclick", onDoubleClick);
      window.removeEventListener("mouseup", onPointerUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("cursor-interact", onCursorInteract);
      window.removeEventListener("cursor-click", onCursorClick);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }

      // Clean up dynamic meshes and materials
      for (const c of codes) {
        scene.remove(c.mesh);
        c.mesh.traverse((child) => {
          if (child instanceof THREE.Line) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
      for (const n of notes) {
        scene.remove(n.mesh);
        n.mesh.traverse((child) => {
          if (child instanceof THREE.Line) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
      ghostGroup.remove(glassesGroup);
      glassesGroup.traverse((child) => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      ghostGroup.remove(headsetGroup);
      headsetGroup.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <section className="relative flex h-screen h-[100dvh] max-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-black text-white px-6 sm:px-12 md:px-20 lg:px-28 xl:px-36 py-6 md:py-8 select-none">
      {/* ── Top Navigation (matching reference pic thieb.co) ────────────────── */}
      <header className="relative z-30 flex w-full items-center justify-between font-sans text-xs sm:text-sm tracking-wide gap-2">
        {/* Left: Branding */}
        <Link
          href="/"
          className="interactable text-white font-medium hover:text-zinc-300 transition-colors tracking-wide truncate max-w-[170px] sm:max-w-none"
        >
          adithyakrishnan.com
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden sm:flex items-center gap-6 md:gap-8 text-xs text-zinc-400">
          <a href="#achievements" className="interactable hover:text-white transition-colors">
            achievements
          </a>
          <a href="#projects" className="interactable hover:text-white transition-colors">
            projects
          </a>
          <a href="#contact" className="interactable hover:text-white transition-colors">
            contact
          </a>
        </nav>

        {/* Right: Email / Touch */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href="mailto:hello@adithyakrishnan.com"
            className="interactable text-zinc-300 hover:text-white transition-colors text-xs truncate max-w-[180px] sm:max-w-none"
          >
            hello@adithyakrishnan.com
          </a>
        </div>
      </header>

      {/* ── Three.js 3D Chrome Ghost Canvas (Absolute full hero background) ──── */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-10 h-full w-full cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ touchAction: "pan-y" }}
      />

      {/* ── Center Content: Display Typography (matching reference pic thieb.co) ─ */}
      <div className="relative z-20 flex flex-1 flex-col justify-center max-w-2xl lg:max-w-3xl pointer-events-none">
        <h1 className="interactable pointer-events-auto text-2xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[62px] font-light tracking-tight text-white leading-[1.2] sm:leading-[1.14]">
          <span className="text-white font-normal">I’m Adi</span>
          <span className="text-zinc-500 font-light mx-2 sm:mx-3">—</span>
          <span className="text-zinc-200">a Multidisciplinary Software Engineer,</span>
          <br className="hidden sm:inline" />{" "}
          <span className="text-zinc-400 font-light">
            building for the web, cloud, and everything in between.
          </span>
        </h1>
      </div>

      {/* ── Bottom Section: Location & Live Status & Scroll Arrow ───────────── */}
      <footer className="relative z-30 flex w-full items-end justify-between pt-4 pb-2 sm:pb-0 pointer-events-none gap-4">
        {/* Bottom Left: Live Activity Status & Location */}
        <div className="flex flex-col gap-1.5 pointer-events-auto max-w-[80%] sm:max-w-none">
          <button
            type="button"
            onClick={() => setForceHeadset((prev) => !prev)}
            className="interactable flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
            title="Click to toggle headset & music animation"
          >
            <span className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${statusDotColor} transition-transform group-hover:scale-125`} />
            <span className="font-mono text-[11px] sm:text-xs text-zinc-300 tracking-wide font-medium group-hover:text-white transition-colors truncate">
              {statusText}
            </span>
            {forceHeadset && (
              <span className="text-[9px] sm:text-[10px] font-mono text-zinc-300 border border-zinc-700 bg-white/5 px-1.5 py-0.5 rounded ml-1 flex-shrink-0">
                HEADSET ON
              </span>
            )}
          </button>
          <div className="font-mono text-[10px] sm:text-[11px] text-zinc-500 tracking-widest uppercase truncate">
            Software Engineer · Kerala, India
          </div>
        </div>

        {/* Bottom Right: Scroll Down Arrow */}
        <a
          href="#achievements"
          aria-label="Scroll to achievements"
          className="interactable group pointer-events-auto flex items-center justify-center p-2 text-zinc-400 hover:text-white transition-colors text-lg flex-shrink-0"
        >
          <span className="transition-transform duration-300 group-hover:translate-y-1">
            ↓
          </span>
        </a>
      </footer>
    </section>
  );
};
