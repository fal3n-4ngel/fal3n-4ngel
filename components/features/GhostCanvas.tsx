"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface GhostCanvasProps {
  isMusic?: boolean;
  isCoding?: boolean;
  isGaming?: boolean;
  isAscii?: boolean;
}

export const GhostCanvas: React.FC<GhostCanvasProps> = ({
  isMusic = false,
  isCoding = false,
  isGaming = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const flagsRef = useRef({ isMusic, isCoding, isGaming });


  useEffect(() => {
    flagsRef.current = { isMusic, isCoding, isGaming };
  }, [isMusic, isCoding, isGaming]);



  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let animFrameId: number;

    const getDims = () => {
      const rect = mount.getBoundingClientRect();
      const w = rect.width || mount.clientWidth || 800;
      const h = rect.height || mount.clientHeight || 450;
      return { w: Math.max(w, 200), h: Math.max(h, 200) };
    };

    const { w: initW, h: initH } = getDims();

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initW, initH);
    renderer.domElement.className = "absolute inset-0 transition-opacity duration-300 pointer-events-none";
    mount.appendChild(renderer.domElement);

    const asciiCanvas = document.createElement("canvas");
    asciiCanvas.className = "absolute inset-0 transition-opacity duration-300 pointer-events-none";
    mount.appendChild(asciiCanvas);
    const asciiCtx = asciiCanvas.getContext("2d");

    const sampleCanvas = document.createElement("canvas");
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

    const updateAsciiSize = (w: number, h: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      asciiCanvas.width = Math.floor(w * dpr);
      asciiCanvas.height = Math.floor(h * dpr);
      asciiCanvas.style.width = `${w}px`;
      asciiCanvas.style.height = `${h}px`;
      if (asciiCtx) {
        asciiCtx.scale(dpr, dpr);
      }
    };
    updateAsciiSize(initW, initH);

    const scene = new THREE.Scene();
    const isMobileInit = initW < 768;
    const camera = new THREE.PerspectiveCamera(40, initW / initH, 0.1, 100);
    if (isMobileInit) {
      camera.position.set(0, 0.35, 15.0);
    } else {
      camera.position.set(0, -0.2, 13.5);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

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
          const localPhi = (v / 0.38) * (Math.PI / 2);
          px = Math.sin(localPhi) * Math.cos(theta) * radius;
          pz = Math.sin(localPhi) * Math.sin(theta) * radius;
          py = Math.cos(localPhi) * radius + 0.8;
        } else {
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

    ghostGroup.position.y = 0.6;
    scene.add(ghostGroup);

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

    const cupGeom = new THREE.CylinderGeometry(0.72, 0.72, 0.55, 24);

    const leftCup = new THREE.Mesh(cupGeom, cupMat);
    leftCup.position.set(-2.48, 1.4, 0);
    leftCup.rotation.z = Math.PI / 2;
    headsetGroup.add(leftCup);

    const leftCupWire = new THREE.LineSegments(new THREE.EdgesGeometry(cupGeom), wireMat);
    leftCupWire.position.set(-2.48, 1.4, 0);
    leftCupWire.rotation.z = Math.PI / 2;
    headsetGroup.add(leftCupWire);

    const rightCup = new THREE.Mesh(cupGeom, cupMat);
    rightCup.position.set(2.48, 1.4, 0);
    rightCup.rotation.z = Math.PI / 2;
    headsetGroup.add(rightCup);

    const rightCupWire = new THREE.LineSegments(new THREE.EdgesGeometry(cupGeom), wireMat);
    rightCupWire.position.set(2.48, 1.4, 0);
    rightCupWire.rotation.z = Math.PI / 2;
    headsetGroup.add(rightCupWire);

    const bandGeom = new THREE.TorusGeometry(2.48, 0.12, 8, 36, Math.PI);
    const band = new THREE.Mesh(bandGeom, cupMat);
    band.position.set(0, 1.4, 0);
    headsetGroup.add(band);

    const bandWire = new THREE.LineSegments(new THREE.EdgesGeometry(bandGeom), wireMat);
    bandWire.position.set(0, 1.4, 0);
    headsetGroup.add(bandWire);

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

    const createGlasses = () => {
      const group = new THREE.Group();
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
      });

      const makeLensGeom = (width: number, height: number, rad: number) => {
        const pts: THREE.Vector3[] = [];
        const steps = 6;
        for (let j = 0; j <= steps; j++) {
          const theta = (j / steps) * (Math.PI / 2);
          pts.push(new THREE.Vector3(
            width / 2 - rad + Math.cos(theta) * rad,
            height / 2 - rad + Math.sin(theta) * rad,
            0
          ));
        }
        for (let j = 0; j <= steps; j++) {
          const theta = Math.PI / 2 + (j / steps) * (Math.PI / 2);
          pts.push(new THREE.Vector3(
            -(width / 2 - rad) + Math.cos(theta) * rad,
            height / 2 - rad + Math.sin(theta) * rad,
            0
          ));
        }
        for (let j = 0; j <= steps; j++) {
          const theta = Math.PI + (j / steps) * (Math.PI / 2);
          pts.push(new THREE.Vector3(
            -(width / 2 - rad) + Math.cos(theta) * rad,
            -(height / 2 - rad) + Math.sin(theta) * rad,
            0
          ));
        }
        for (let j = 0; j <= steps; j++) {
          const theta = Math.PI * 1.5 + (j / steps) * (Math.PI / 2);
          pts.push(new THREE.Vector3(
            width / 2 - rad + Math.cos(theta) * rad,
            -(height / 2 - rad) + Math.sin(theta) * rad,
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

    const makeCodeMesh = (type: number) => {
      const group = new THREE.Group();
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
      });

      if (type === 0) {
        const leftGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.16, 0.16, 0),
          new THREE.Vector3(-0.30, 0.0, 0),
          new THREE.Vector3(-0.16, -0.16, 0),
        ]);
        group.add(new THREE.Line(leftGeom, lineMaterial));

        const slashGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.07, 0.20, 0),
          new THREE.Vector3(-0.07, -0.20, 0),
        ]);
        group.add(new THREE.Line(slashGeom, lineMaterial));

        const rightGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.16, 0.16, 0),
          new THREE.Vector3(0.30, 0.0, 0),
          new THREE.Vector3(0.16, -0.16, 0),
        ]);
        group.add(new THREE.Line(rightGeom, lineMaterial));
      } else {
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
    const codesCount = 2;
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

    const startTime = performance.now();
    const getElapsedTime = () => (performance.now() - startTime) * 0.001;

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
      lastClickTime = getElapsedTime();
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onDoubleClick = () => {
      lastWinkTime = getElapsedTime();
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    let ghostBaseX = initW >= 1024 ? 2.4 : 0;
    let ghostBaseY = initW < 768 ? 1.8 : (initW < 1024 ? 1.1 : 0.2);
    let lastW = initW;
    let lastH = initH;

    const onResize = () => {
      if (!mount) return;
      const rect = mount.getBoundingClientRect();
      const w = rect.width || mount.clientWidth;
      const h = rect.height || mount.clientHeight;
      if (w > 20 && h > 20) {
        const isMob = w < 768;
        const deltaW = Math.abs(w - lastW);
        const deltaH = Math.abs(h - lastH);
        if (isMob && deltaW < 10 && deltaH < 140) {
          return;
        }
        lastW = w;
        lastH = h;

        camera.aspect = w / h;
        const sc = isMob ? 0.52 : 0.66;
        ghostGroup.scale.set(sc, sc, sc);
        if (isMob) {
          camera.position.set(0, 0.35, 15.0);
        } else {
          camera.position.set(0, -0.2, 13.5);
        }
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        updateAsciiSize(w, h);
        ghostBaseX = w >= 1024 ? 2.4 : 0;
        ghostBaseY = w < 768 ? 1.8 : (w < 1024 ? 1.1 : 0.2);
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
        lastCursorInteractTime = getElapsedTime();
      } else {
        isCursorInteracting = false;
      }
    };

    const onCursorClick = () => {
      lastClickTime = getElapsedTime();
    };

    mount.addEventListener("mousemove", onPointerMove);
    mount.addEventListener("mousedown", onPointerDown);
    mount.addEventListener("dblclick", onDoubleClick);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("resize", onResize);
    window.addEventListener("cursor-interact", onCursorInteract);
    window.addEventListener("cursor-click", onCursorClick);

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsed = getElapsedTime();

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

      ghostGroup.position.x = ghostBaseX;
      ghostGroup.position.y = ghostBaseY + Math.sin(elapsed * 1.8) * 0.15;

      const hoverBoost = isCursorInteracting ? 0.06 : 0;
      ghostMaterial.opacity = 0.14 + Math.min(Math.abs(mouseX) + Math.abs(mouseY), 1.0) * 0.08 + hoverBoost;

      if (flagsRef.current.isMusic) {
        ghostGroup.position.y += Math.sin(elapsed * 4.0) * 0.04;
        ghostGroup.rotation.z = Math.sin(elapsed * 2.5) * 0.04;
      } else {
        ghostGroup.rotation.z = Math.sin(elapsed * 1.2) * 0.04;
      }

      const targetHeadsetScale =
        flagsRef.current.isMusic || flagsRef.current.isGaming ? 1.0 : 0.0;
      headsetScale += (targetHeadsetScale - headsetScale) * 0.08;
      if (headsetScale > 0.01) {
        headsetGroup.visible = true;
        headsetGroup.scale.setScalar(headsetScale);
      } else {
        headsetGroup.visible = false;
      }

      const isMusicActive = flagsRef.current.isMusic;
      const isCodingActive = flagsRef.current.isCoding && !isMusicActive;
      const targetGlassesScale = isCodingActive ? 1.0 : 0.0;
      glassesScale += (targetGlassesScale - glassesScale) * 0.1;
      glassesGroup.scale.set(glassesScale, glassesScale, glassesScale);
      glassesGroup.visible = glassesScale > 0.01;

      let blinkFactor = 1.0;
      const leftWinkFactor = 1.0;
      let rightWinkFactor = 1.0;

      const blinkCycle = elapsed % 3.8;
      const cycleIndex = Math.floor(elapsed / 3.8);
      const isNaturalWink = cycleIndex % 5 === 4;

      if (blinkCycle < 0.15) {
        const dip = Math.sin((blinkCycle / 0.15) * Math.PI);
        if (isNaturalWink) {
          rightWinkFactor = Math.min(rightWinkFactor, 1.0 - dip * 0.95);
        } else {
          blinkFactor = Math.min(blinkFactor, 1.0 - dip * 0.95);
        }
      }

      const timeSinceClick = elapsed - lastClickTime;
      if (timeSinceClick >= 0 && timeSinceClick < 0.36) {
        let clickDip = 0;
        if (timeSinceClick < 0.14) {
          clickDip = Math.sin((timeSinceClick / 0.14) * Math.PI);
        } else if (timeSinceClick >= 0.18 && timeSinceClick < 0.32) {
          clickDip = Math.sin(((timeSinceClick - 0.18) / 0.14) * Math.PI);
        }
        blinkFactor = Math.min(blinkFactor, 1.0 - clickDip * 0.96);
        const bounceP = Math.min(timeSinceClick / 0.36, 1.0);
        ghostGroup.position.y += Math.sin(bounceP * Math.PI) * 0.14;
      }

      const timeSinceWink = elapsed - lastWinkTime;
      if (timeSinceWink >= 0 && timeSinceWink < 0.3) {
        const winkDip = Math.sin((timeSinceWink / 0.3) * Math.PI);
        rightWinkFactor = Math.min(rightWinkFactor, 1.0 - winkDip * 0.96);
      }

      const timeSinceCursorInteract = elapsed - lastCursorInteractTime;
      if (timeSinceCursorInteract >= 0 && timeSinceCursorInteract < 0.28) {
        const interactDip = Math.sin((timeSinceCursorInteract / 0.28) * Math.PI);
        blinkFactor = Math.min(blinkFactor, 1.0 - interactDip * 0.94);
        const perkBounce = Math.sin((timeSinceCursorInteract / 0.28) * Math.PI) * 0.1;
        ghostGroup.position.y += perkBounce;
      }

      const curiosity = Math.min(Math.abs(mouseX) + Math.abs(mouseY), 1.0) + (isCursorInteracting ? 0.25 : 0);
      const baseEyeScaleY = isCodingActive ? 0.72 : 1.0 + curiosity * 0.08;
      const baseEyeScaleX = isCodingActive ? 0.94 : 1.0 + curiosity * 0.04;

      eyeScaleY += (baseEyeScaleY - eyeScaleY) * 0.1;
      eyeScaleX += (baseEyeScaleX - eyeScaleX) * 0.1;

      leftEye.scale.set(eyeScaleX, Math.max(eyeScaleY * blinkFactor * leftWinkFactor, 0.04), 1.0);
      rightEye.scale.set(eyeScaleX, Math.max(eyeScaleY * blinkFactor * rightWinkFactor, 0.04), 1.0);

      for (const c of codes) {
        if (isCodingActive) {
          c.mesh.visible = true;
          c.age += c.speedY;
          if (c.age > 1.0) c.age = 0.0;

          const ghostX = ghostGroup.position.x;
          const ghostY = ghostGroup.position.y;
          const ghostZ = ghostGroup.position.z;

          const startX = ghostX + (c.side === "left" ? -2.7 : 2.7);
          const startY = ghostY + 1.2;

          c.mesh.position.y = startY + c.age * 5.5;
          c.mesh.position.x = startX + Math.sin(elapsed * c.swayFreq + c.phase) * c.swayAmp;
          c.mesh.position.z = ghostZ + Math.cos(elapsed * 0.6 + c.phase) * 0.3;
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

      for (const n of notes) {
        if (flagsRef.current.isMusic) {
          n.mesh.visible = true;
          n.age += n.speedY;
          if (n.age > 1.0) n.age = 0.0;

          const ghostX = ghostGroup.position.x;
          const ghostY = ghostGroup.position.y;
          const ghostZ = ghostGroup.position.z;

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

      if (asciiCtx && sampleCtx) {
        renderer.domElement.style.opacity = "0";
        asciiCanvas.style.opacity = "1";

        const { w, h } = getDims();
        const isMob = w < 768;
        const charW = isMob ? 8.5 : 10;
        const charH = isMob ? 13 : 15;
        const cols = Math.floor(w / charW);
        const rows = Math.floor(h / charH);

        if (sampleCanvas.width !== cols || sampleCanvas.height !== rows) {
          sampleCanvas.width = cols;
          sampleCanvas.height = rows;
        }

        sampleCtx.clearRect(0, 0, cols, rows);
        sampleCtx.drawImage(renderer.domElement, 0, 0, cols, rows);
        const imgData = sampleCtx.getImageData(0, 0, cols, rows).data;

        asciiCtx.clearRect(0, 0, w, h);
        asciiCtx.font = `bold ${isMob ? 11 : 12}px monospace`;
        asciiCtx.textAlign = "center";
        asciiCtx.textBaseline = "middle";

        const ramp = " .·:+=*#";
        const rampLen = ramp.length - 1;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = (r * cols + c) * 4;
            const a = imgData[idx + 3] ?? 0;
            if (a < 10) continue;

            const red = imgData[idx] ?? 0;
            const grn = imgData[idx + 1] ?? 0;
            const blu = imgData[idx + 2] ?? 0;
            const bright = (0.299 * red + 0.587 * grn + 0.114 * blu) / 255;

            const chIdx = Math.min(Math.floor(bright * rampLen), rampLen);
            const ch = ramp[chIdx] || ".";

            const alpha = Math.min(0.28 + bright * 0.56, 0.86);
            asciiCtx.fillStyle = `rgba(230, 240, 248, ${alpha})`;
            asciiCtx.fillText(ch, c * charW + charW / 2, r * charH + charH / 2);
          }
        }
      } else {
        renderer.domElement.style.opacity = "1";
        asciiCanvas.style.opacity = "0";
      }
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
      if (mount.contains(asciiCanvas)) {
        mount.removeChild(asciiCanvas);
      }

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
    <div
      ref={mountRef}
      className="absolute inset-0 z-10 h-full w-full cursor-grab active:cursor-grabbing touch-pan-y"
      style={{ touchAction: "pan-y" }}
    />
  );
};

export default GhostCanvas;
