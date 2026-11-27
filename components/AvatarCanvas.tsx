"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

interface AvatarModelProps {
  modelUrl: string;
}

function RiggedCartoonAvatar({ modelUrl }: AvatarModelProps) {
  const { scene } = useGLTF(modelUrl);
  const rootRef = useRef<THREE.Group>(null);

  // Cache humanoid skeleton bones by standard / Mixamo naming conventions
  // (curledFingers collected here too — the memo result is never mutated)
  const bones = useMemo(() => {
    const curledFingers: THREE.Bone[] = [];

    const findBone = (keywords: string[]): THREE.Bone | null => {
      let found: THREE.Bone | null = null;
      scene.traverse((obj) => {
        if ((obj as THREE.Bone).isBone && !found) {
          const lower = obj.name.toLowerCase();
          if (keywords.some((k) => lower.includes(k))) {
            found = obj as THREE.Bone;
          }
        }
        if ((obj as THREE.Bone).isBone) {
          const n = obj.name.toLowerCase();
          // Curl middle, ring, and pinky fingers so the index finger points
          const isRightHandFinger =
            (n.includes("righthand") || n.includes("_r")) &&
            (n.includes("middle") || n.includes("ring") || n.includes("pinky") || n.includes("little"));
          if (isRightHandFinger) {
            curledFingers.push(obj as THREE.Bone);
          }
        }
      });
      return found;
    };

    return {
      head: findBone(["head"]),
      neck: findBone(["neck"]),
      rightShoulder: findBone(["rightshoulder", "shoulder_r", "r_shoulder"]),
      rightArm: findBone(["rightarm", "upperarm_r", "r_upperarm", "arm_r"]),
      rightForeArm: findBone(["rightforearm", "lowerarm_r", "r_lowerarm", "forearm_r"]),
      rightHand: findBone(["righthand", "hand_r", "r_hand"]),
      curledFingers,
    };
  }, [scene]);

  // Apply anime cel-shaded toon look
  useEffect(() => {
    const gradientMap = new THREE.DataTexture(
      new Uint8Array([70, 165, 255]),
      3,
      1,
      THREE.RedFormat
    );
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const oldMat = (Array.isArray(mesh.material)
          ? mesh.material[0]
          : mesh.material) as THREE.MeshStandardMaterial;
        mesh.material = new THREE.MeshToonMaterial({
          color: oldMat?.color || new THREE.Color("#e4e4e7"),
          map: oldMat?.map || null,
          gradientMap,
        });
      }
    });
  }, [scene]);

  // Reusable math vectors (zero per-frame GC allocations)
  const targetWorld = useMemo(() => new THREE.Vector3(), []);
  const shoulderWorld = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const damp = Math.min(delta * 8, 1);

    // Map normalized pointer (-1..1) to a 3D point in front of the character
    const px = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    targetWorld.set(px * 2.2, py * 1.4 + 1.15, 2.0);

    // 1. Subtle torso turn toward cursor
    if (rootRef.current) {
      rootRef.current.rotation.y = THREE.MathUtils.lerp(
        rootRef.current.rotation.y,
        px * 0.22,
        damp
      );
    }

    // 2. Head & Neck track cursor smoothly
    if (bones.neck) {
      bones.neck.rotation.y = THREE.MathUtils.lerp(bones.neck.rotation.y, px * 0.18, damp);
    }
    if (bones.head) {
      bones.head.rotation.y = THREE.MathUtils.lerp(bones.head.rotation.y, px * 0.45, damp);
      bones.head.rotation.x = THREE.MathUtils.lerp(bones.head.rotation.x, -py * 0.3, damp);
    }

    // 3. Right Arm & Forearm aim directly toward the 3D cursor target
    if (bones.rightArm) {
      bones.rightArm.getWorldPosition(shoulderWorld);
      dir.subVectors(targetWorld, shoulderWorld).normalize();

      // Bring arm forward from T-pose/A-pose and pitch/yaw toward cursor
      const targetPitch = THREE.MathUtils.clamp(-dir.y * 1.15 + 0.35, -0.6, 1.35);
      const targetYaw = THREE.MathUtils.clamp(dir.x * 0.95 - 0.35, -1.2, 0.75);

      bones.rightArm.rotation.x = THREE.MathUtils.lerp(
        bones.rightArm.rotation.x,
        targetPitch,
        damp
      );
      bones.rightArm.rotation.z = THREE.MathUtils.lerp(
        bones.rightArm.rotation.z,
        -1.05 + py * 0.45,
        damp
      );
      bones.rightArm.rotation.y = THREE.MathUtils.lerp(
        bones.rightArm.rotation.y,
        targetYaw,
        damp
      );
    }

    if (bones.rightForeArm) {
      // Slight natural elbow bend that extends straighter as cursor moves outward
      const bend = THREE.MathUtils.lerp(0.45, 0.12, Math.abs(px));
      bones.rightForeArm.rotation.y = THREE.MathUtils.lerp(
        bones.rightForeArm.rotation.y,
        -bend,
        damp
      );
    }

    // 4. Keep non-index fingers curled into a clean pointing hand
    for (const finger of bones.curledFingers) {
      finger.rotation.z = THREE.MathUtils.lerp(finger.rotation.z, 1.1, damp);
    }
  });

  return (
    <group ref={rootRef} position={[0, -1.35, 0]} scale={1.45}>
      <primitive object={scene} />
    </group>
  );
}

/** Built-in Toon Mecha/Stylized Fallback so the component runs before /avatar.glb is added */
function FallbackStylizedPointer() {
  const headRef = useRef<THREE.Group>(null);
  const armPivotRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const damp = Math.min(delta * 8, 1);
    const px = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
    const py = THREE.MathUtils.clamp(state.pointer.y, -1, 1);

    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, px * 0.5, damp);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -py * 0.35, damp);
    }
    if (armPivotRef.current) {
      armPivotRef.current.rotation.y = THREE.MathUtils.lerp(
        armPivotRef.current.rotation.y,
        px * 0.85,
        damp
      );
      armPivotRef.current.rotation.x = THREE.MathUtils.lerp(
        armPivotRef.current.rotation.x,
        -py * 0.75 - 0.15,
        damp
      );
    }
  });

  return (
    <group position={[0, -0.45, 0]}>
      {/* Stylized Torso */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.38, 0.3, 1.1, 24]} />
        <meshToonMaterial color="#141418" />
      </mesh>

      {/* Head + Crimson Visor */}
      <group ref={headRef} position={[0, 0.62, 0]}>
        <mesh>
          <sphereGeometry args={[0.34, 24, 24]} />
          <meshToonMaterial color="#f4f4f5" />
        </mesh>
        <mesh position={[0, 0.03, 0.28]}>
          <boxGeometry args={[0.42, 0.11, 0.14]} />
          <meshBasicMaterial color="#ff2330" />
        </mesh>
      </group>

      {/* Pointing Right Arm */}
      <group ref={armPivotRef} position={[-0.48, 0.18, 0]}>
        <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.85, 16]} />
          <meshToonMaterial color="#27272a" />
        </mesh>
        {/* Glowing Crimson Index Finger */}
        <mesh position={[0, 0.02, 0.98]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.045, 0.24, 16]} />
          <meshBasicMaterial color="#ff2330" />
        </mesh>
      </group>
    </group>
  );
}

export interface AvatarCanvasProps {
  modelUrl?: string;
  eventSource?: React.RefObject<HTMLElement | null>;
}

export function AvatarCanvas({ modelUrl, eventSource }: AvatarCanvasProps) {
  return (
    <div className="pointer-events-none relative z-10 h-[76vh] w-full max-w-[680px]">
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.2, 3.4], fov: 38 }}
        eventSource={eventSource as React.RefObject<HTMLElement>}
        eventPrefix="client"
        >
        {/* Studio Key Light + Strong #ff2330 Anime Rim Light */}
        <ambientLight intensity={0.75} />
        <directionalLight position={[2, 4, 4]} intensity={1.6} color="#ffffff" />
        <directionalLight position={[-3, 2, -2]} intensity={3.2} color="#ff2330" />
        <pointLight position={[0, -1, 2]} intensity={1.2} color="#ff2330" />

        <Suspense fallback={<FallbackStylizedPointer />}>
          {modelUrl ? (
          <RiggedCartoonAvatar modelUrl={modelUrl} />
        ) : (
          <FallbackStylizedPointer />
        )}
        </Suspense>
      </Canvas>
    </div>
  );
}
