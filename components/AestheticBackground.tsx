"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import * as THREE from "three";

export const AestheticBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    const is404Page = pathname === "/_not-found" || pathname === "/404" || 
                      (!["/", "/blogs", "/sitemap.xml", "/robots.txt"].includes(pathname) && !pathname.startsWith("/blogs/"));

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ 
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
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

    const segmentsX = isMobile ? 24 : 40;
    const segmentsY = isMobile ? 24 : 40;
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
          
          const unevenHeight = Math.sin(theta * 3) * 0.75 + Math.cos(theta * 7) * 0.35 + Math.sin(theta * 1.5) * 0.25;
          py = 1.0 - progress * height + (progress * progress * unevenHeight);
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

    const ghostMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 30,
      specular: 0x333333,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    });

    const ghostMesh = new THREE.Mesh(ghostGeom, ghostMaterial);
    ghostGroup.add(ghostMesh);

    const ghostWireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(ghostGeom, 15),
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
      })
    );
    ghostGroup.add(ghostWireframe);

    // Eyes
    const eyeGeom = new THREE.SphereGeometry(0.48, 16, 16);
    eyeGeom.scale(1.0, 1.0, 0.2); 
    
    const eyeMat = new THREE.MeshBasicMaterial({ 
      color: 0x000000, 
      depthWrite: true
    });
    
    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.position.set(-0.75, 1.8, 3.25);
    leftEye.rotation.set(0.1, 0.2, 0);

    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.position.set(0.75, 1.8, 3.25);
    rightEye.rotation.set(0.1, -0.2, 0);

    ghostGroup.add(leftEye);
    ghostGroup.add(rightEye);

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
      const segments = isMobile ? 24 : 36 + rIndex * 12;
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
      escapeStartTime: 0
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
          const hoverNode = target.closest("a, button, [role='button'], .interactable, .githubLogo, .linkedinLogo, .resumeLogo, .mailLogo, .projImg");
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

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      // Smooth camera/ghost rotation tracking mouse
      currentRot.x += (targetRot.x - currentRot.x) * 0.05;
      currentRot.y += (targetRot.y - currentRot.y) * 0.05;
      
      const targetProgress = flags.isInteracting ? 1 : 0;
      interactionProgress += (targetProgress - interactionProgress) * 0.08;

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
        // ── 404 Route Animated Behavior ──
        // Floating closer (higher Z position) and drifting inquisitively
        const targetZ = 12; // closer to screen
        ghostGroup.position.z += (targetZ - ghostGroup.position.z) * 0.05;
        ghostGroup.position.y = -0.5 + Math.sin(t * 2.2) * 1.2; // faster, wider float
        ghostGroup.position.x = Math.sin(t * 0.8) * 1.5; // slight horizontal weave
        
        // Tilt inquisitively
        ghostGroup.rotation.y = currentRot.y + Math.sin(t * 0.7) * 0.25;
        ghostGroup.rotation.x = currentRot.x + Math.cos(t * 0.6) * 0.12;
        ghostGroup.rotation.z = Math.sin(t * 1.1) * 0.1;

        // Scale eyes (pulsate size on 404 page)
        const eyePulse = 1.0 + Math.sin(t * 4.0) * 0.15;
        leftEye.scale.set(eyePulse, eyePulse, 0.2);
        rightEye.scale.set(eyePulse, eyePulse, 0.2);

        // Scale mascot up slightly
        ghostGroup.scale.setScalar(1.15);

        // Brighter glowing opacities
        ghostMaterial.opacity = 0.24 + Math.abs(Math.sin(t * 1.5)) * 0.06;
      } else {
        // Normal behavior
        if (ghostGroup.scale.x !== 1) {
          ghostGroup.scale.setScalar(ghostGroup.scale.x + (1.0 - ghostGroup.scale.x) * 0.1);
        }

        // Float movement
        const baseFloatY = -1 + Math.sin(t * 1.5) * 0.8;
        const interactionShiftY = Math.sin(t * 2.5) * 0.25 * interactionProgress;
        ghostGroup.position.y = baseFloatY + interactionShiftY;
        
        ghostGroup.position.x += (0 - ghostGroup.position.x) * 0.1;
        ghostGroup.position.z += (0 - ghostGroup.position.z) * 0.1;

        // Rotation
        const interactionWiggleY = Math.sin(t * 2.0) * 0.08 * interactionProgress;
        ghostGroup.rotation.y = currentRot.y + Math.sin(t * 0.5) * 0.15 + interactionWiggleY;
        
        const interactionWiggleX = Math.cos(t * 1.8) * 0.05 * interactionProgress;
        ghostGroup.rotation.x = currentRot.x + Math.cos(t * 0.4) * 0.08 + interactionWiggleX;
        
        ghostGroup.rotation.z = Math.sin(t * 0.8) * 0.05;

        // Make eyes normal size
        leftEye.scale.set(1, 1, 0.2);
        rightEye.scale.set(1, 1, 0.2);

        ghostMaterial.opacity = 0.12 + interactionProgress * 0.12;
      }

      (ghostWireframe.material as THREE.LineBasicMaterial).opacity = ghostMaterial.opacity * 2.2;

      // Animate holo HUD rings
      for (const r of hudRings) {
        if (flags.isEscaping) {
          r.mesh.rotation.z += r.rotSpeed * 10;
          r.mesh.scale.setScalar(Math.max(1 - (performance.now() - flags.escapeStartTime)/500, 0));
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
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("ghost-escape", onEscapeChange);
      window.removeEventListener("resize", onResize);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [pathname]);

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
