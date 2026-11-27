// src/components/HeroWebGLCanvas.tsx
"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";

interface SculptureProps {
  accentColor: string;
  secondaryColor: string;
  motionEnabled: boolean;
  pointerRef?: RefObject<{ x: number; y: number }>;
}

function CyberArchitectureSculpture({
  accentColor,
  secondaryColor,
  motionEnabled,
  pointerRef,
}: SculptureProps) {
  const rootRef = useRef<THREE.Group>(null);
  const knotRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const satellitesRef = useRef<THREE.Group>(null);
  const driftRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!rootRef.current) return;

    const rawX = pointerRef?.current ? pointerRef.current.x : state.pointer.x;
    const rawY = pointerRef?.current ? pointerRef.current.y : state.pointer.y;
    const px = THREE.MathUtils.clamp(rawX, -1, 1);
    const py = THREE.MathUtils.clamp(rawY, -1, 1);

    if (motionEnabled) {
      rootRef.current.rotation.y += delta * 0.16;
      rootRef.current.rotation.x = THREE.MathUtils.lerp(
        rootRef.current.rotation.x,
        py * 0.34 + 0.14,
        Math.min(delta * 5, 1)
      );
      rootRef.current.rotation.z = THREE.MathUtils.lerp(
        rootRef.current.rotation.z,
        -px * 0.26,
        Math.min(delta * 5, 1)
      );
      rootRef.current.position.x = THREE.MathUtils.lerp(
        rootRef.current.position.x,
        px * 0.22,
        Math.min(delta * 5, 1)
      );
      rootRef.current.position.y = THREE.MathUtils.lerp(
        rootRef.current.position.y,
        py * 0.16,
        Math.min(delta * 5, 1)
      );

      if (knotRef.current) {
        knotRef.current.rotation.z += delta * 0.08;
      }
      if (outerRingRef.current) {
        outerRingRef.current.rotation.z -= delta * 0.24;
      }
      if (innerRingRef.current) {
        innerRingRef.current.rotation.z += delta * 0.32;
      }
      if (satellitesRef.current) {
        satellitesRef.current.rotation.y -= delta * 0.38;
      }

      // Dot cloud drifts toward the cursor (slightly beyond the knot) for depth
      if (driftRef.current) {
        driftRef.current.position.x = THREE.MathUtils.lerp(
          driftRef.current.position.x,
          px * 0.34,
          Math.min(delta * 3, 1)
        );
        driftRef.current.position.y = THREE.MathUtils.lerp(
          driftRef.current.position.y,
          py * 0.24,
          Math.min(delta * 3, 1)
        );
      }
    }
  });

  return (
    <group ref={rootRef} scale={0.86}>
      {/* Central Architectural Trefoil Torus-Knot Wireframe */}
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[1.0, 0.26, 110, 18, 2, 3]} />
        <meshBasicMaterial
          color={accentColor}
          wireframe
          transparent
          opacity={0.44}
          />
      </mesh>

      {/* Luminous Vertex Node Cloud Along the Knot (drifts with the cursor) */}
      <group ref={driftRef}>
        <points>
          <torusKnotGeometry args={[1.01, 0.27, 96, 14, 2, 3]} />
          <pointsMaterial
            color={secondaryColor}
            size={0.03}
            sizeAttenuation
            transparent
            opacity={0.82}
            />
        </points>
      </group>

      {/* Primary Tilted Orbital Telemetry Ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2.45, 0.34, 0]}>
        <torusGeometry args={[2.0, 0.011, 12, 96]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.68} />
      </mesh>

      {/* Counter-Tilted Secondary Precision Ring */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 3.1, -0.42, 0.2]}>
        <torusGeometry args={[1.7, 0.007, 10, 80]} />
        <meshBasicMaterial color={secondaryColor} transparent opacity={0.34} />
      </mesh>

      {/* Orbiting Geometric Data Beacons */}
      <group ref={satellitesRef}>
        <mesh position={[2.0, 0.22, 0]}>
          <octahedronGeometry args={[0.07, 0]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
        <mesh position={[-1.78, -0.42, 0.65]}>
          <octahedronGeometry args={[0.055, 0]} />
          <meshBasicMaterial color={secondaryColor} />
        </mesh>
        <mesh position={[0.38, 1.75, -0.75]}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>
    </group>
  );
}

export interface HeroWebGLCanvasProps {
  accentColor: string;
  secondaryColor: string;
  motionEnabled: boolean;
  pointerRef?: RefObject<{ x: number; y: number }>;
  className?: string;
}

export function HeroWebGLCanvas({
  accentColor,
  secondaryColor,
  motionEnabled,
  pointerRef,
  className = "",
}: HeroWebGLCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  // Device-capability probe: static client value via useSyncExternalStore
  // (server snapshot false; no setState-in-effect, no hydration mismatch)
  const isLowSpec = useSyncExternalStore(
    () => () => {},
    () => window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4,
    () => false
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  const activeLoop = isVisible && motionEnabled;

  return (
    <div ref={containerRef} className={`relative ${className}`} aria-hidden="true">
      {/* Soft depth shadow: reads as a dark void behind the transparent sculpture */}
      <div
        style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[58%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[64px]"
        />
      <Canvas
        gl={{ alpha: true, antialias: true }}
        dpr={isLowSpec ? [1, 1] : [1, 2]}
        frameloop={activeLoop ? "always" : "demand"}
        camera={{ position: [0, 0, 6.2], fov: 38 }}
        >
        <CyberArchitectureSculpture
          accentColor={accentColor}
          secondaryColor={secondaryColor}
          motionEnabled={activeLoop}
          pointerRef={pointerRef}
          />
      </Canvas>
    </div>
  );
}
