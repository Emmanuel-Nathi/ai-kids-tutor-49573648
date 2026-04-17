import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF, Html } from "@react-three/drei";
import { useRef, useMemo, useEffect, Suspense, useState, useCallback } from "react";
import * as THREE from "three";
import { Skeleton } from "@/components/ui/skeleton";
import { useInView } from "react-intersection-observer";
import { OwlMascot } from "@/components/OwlMascot";

interface OwlSceneProps {
  equippedItems: Record<string, string>;
  message?: string;
  containerHeight?: number;
  modelYOffset?: number;
}

const HEAD_NODE_NAMES = ["Head", "head", "Head_1", "Head_Mesh", "Neck", "neck"];

function findHeadNode(scene: THREE.Object3D): THREE.Object3D | null {
  for (const name of HEAD_NODE_NAMES) {
    const node = scene.getObjectByName(name);
    if (node) return node;
  }
  const totalBox = new THREE.Box3().setFromObject(scene);
  const totalHeight = totalBox.getSize(new THREE.Vector3()).y;
  if (totalHeight === 0) return null;
  let bestNode: THREE.Object3D | null = null;
  let bestY = -Infinity;
  scene.traverse((child) => {
    if (child === scene) return;
    if ((child as THREE.Mesh).isMesh || child.children.length > 0) {
      const box = new THREE.Box3().setFromObject(child);
      const center = box.getCenter(new THREE.Vector3());
      const nodeHeight = box.getSize(new THREE.Vector3()).y;
      if (nodeHeight < totalHeight * 0.4 && center.y > bestY) {
        bestY = center.y;
        bestNode = child;
      }
    }
  });
  return bestNode;
}

interface OwlModelProps {
  equippedItems: Record<string, string>;
  onLoaded: () => void;
  globalMouse: React.RefObject<{ x: number; y: number }>;
}

function OwlModel({ equippedItems, onLoaded, globalMouse }: OwlModelProps) {
  const { scene } = useGLTF("/models/owl.glb");
  const headRef = useRef<THREE.Object3D | null>(null);
  const sceneGroupRef = useRef<THREE.Group>(null!);
  const eyeMeshesRef = useRef<THREE.Mesh[]>([]);
  const pupilMeshesRef = useRef<{ mesh: THREE.Object3D; basePos: THREE.Vector3 }[]>([]);
  const blinkTimerRef = useRef({ nextBlink: 2 + Math.random() * 4, blinking: false, blinkStart: 0 });
  const tiltTimerRef = useRef({ next: 6 + Math.random() * 4, active: false, start: 0 });
  const perkTimerRef = useRef({ next: 12 + Math.random() * 8, active: false, start: 0 });

  useEffect(() => {
    const head = findHeadNode(scene);
    if (head) headRef.current = head;
    const eyes: THREE.Mesh[] = [];
    const pupils: { mesh: THREE.Object3D; basePos: THREE.Vector3 }[] = [];
    scene.traverse((child) => {
      const m = child as THREE.Mesh;
      if (m.isMesh) {
        if (/pupil|iris/i.test(child.name)) {
          pupils.push({ mesh: child, basePos: child.position.clone() });
        } else if (/eye/i.test(child.name)) {
          eyes.push(m);
        }
      }
    });
    // Fallback: if no pupils, use eye meshes for offset (cache base pos)
    if (pupils.length === 0 && eyes.length > 0) {
      eyes.forEach((e) => pupils.push({ mesh: e, basePos: e.position.clone() }));
    }
    eyeMeshesRef.current = eyes;
    pupilMeshesRef.current = pupils;
    onLoaded();
  }, [scene, onLoaded]);

  const { center, scale, headY, eyeY } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 2.0 / maxDim;
    const topY = (box.max.y - c.y) * s;
    return { center: c, scale: s, headY: topY, eyeY: topY * 0.75 };
  }, [scene]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const mouse = globalMouse.current ?? { x: 0, y: 0 };

    // --- Periodic perk-up scale pulse ---
    const perk = perkTimerRef.current;
    let perkScale = 1;
    if (!perk.active) {
      perk.next -= delta;
      if (perk.next <= 0) { perk.active = true; perk.start = t; }
    } else {
      const e = t - perk.start;
      if (e < 0.4) {
        const p = e / 0.4;
        perkScale = 1 + Math.sin(p * Math.PI) * 0.04;
      } else {
        perk.active = false;
        perk.next = 12 + Math.random() * 8;
      }
    }

    if (sceneGroupRef.current) {
      const breathe = 1 + Math.sin(t * 1.5) * 0.022;
      const s = breathe * perkScale;
      sceneGroupRef.current.scale.set(s, s, s);
      // tiny vertical bob
      sceneGroupRef.current.position.y = Math.sin(t * 1.2) * 0.02;
      // body counter-lean toward cursor
      const bodyTargetY = mouse.x * (Math.PI / 12) * 0.3;
      const bodyTargetX = -mouse.y * (Math.PI / 30) * 0.3;
      sceneGroupRef.current.rotation.y = THREE.MathUtils.lerp(sceneGroupRef.current.rotation.y, bodyTargetY, 0.08);
      sceneGroupRef.current.rotation.x = THREE.MathUtils.lerp(sceneGroupRef.current.rotation.x, bodyTargetX, 0.08);
    }

    // --- Head tracking + sway + micro-tilt ---
    const sway = Math.sin(t * 0.6) * 0.05 * (1 - Math.min(1, Math.abs(mouse.x) * 2));
    const targetY = mouse.x * (Math.PI / (180 / 35)) + sway; // ±35°
    const targetX = -mouse.y * (Math.PI / (180 / 12)); // ±12°

    // micro head-tilt (Z rotation)
    const tilt = tiltTimerRef.current;
    let tiltZ = 0;
    if (!tilt.active) {
      tilt.next -= delta;
      if (tilt.next <= 0) { tilt.active = true; tilt.start = t; }
    } else {
      const e = t - tilt.start;
      if (e < 0.6) {
        tiltZ = Math.sin((e / 0.6) * Math.PI) * 0.12 * (Math.random() > 0.5 ? 1 : -1);
      } else {
        tilt.active = false;
        tilt.next = 6 + Math.random() * 4;
      }
    }

    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY, 0.25);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX, 0.25);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, tiltZ, 0.1);
    }

    // --- Pupil tracking ---
    pupilMeshesRef.current.forEach(({ mesh, basePos }) => {
      const tx = basePos.x + mouse.x * 0.03;
      const ty = basePos.y + -mouse.y * 0.02;
      mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, tx, 0.15);
      mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, ty, 0.15);
    });

    // --- Blink ---
    const blink = blinkTimerRef.current;
    if (!blink.blinking) {
      blink.nextBlink -= delta;
      if (blink.nextBlink <= 0) { blink.blinking = true; blink.blinkStart = t; }
    }
    let scaleYVal = 1;
    if (blink.blinking) {
      const elapsed = t - blink.blinkStart;
      if (elapsed < 0.08) scaleYVal = 1 - elapsed / 0.08;
      else if (elapsed < 0.15) scaleYVal = (elapsed - 0.08) / 0.07;
      else { blink.blinking = false; blink.nextBlink = 2 + Math.random() * 4; scaleYVal = 1; }
      scaleYVal = Math.max(0.05, scaleYVal);
    }
    eyeMeshesRef.current.forEach((mesh) => { mesh.scale.y = scaleYVal; });
  });

  const hasHeadwear = !!equippedItems["headwear"];
  const hasEyewear = !!equippedItems["eyewear"];

  return (
    <group ref={sceneGroupRef}>
      <primitive object={scene} scale={scale} position={[-center.x * scale, -center.y * scale, -center.z * scale]} />
      {hasHeadwear && (
        <group position={[0, headY + 0.15, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.35, 0.05, 8, 24]} /><meshStandardMaterial color="#4B0082" /></mesh>
          <mesh position={[0, 0.35, 0]}><coneGeometry args={[0.3, 0.7, 16]} /><meshStandardMaterial color="#6A0DAD" /></mesh>
          <mesh position={[0.15, 0.25, 0.25]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} /></mesh>
        </group>
      )}
      {hasEyewear && (
        <group position={[0, eyeY, 0.55]}>
          <mesh position={[-0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.02, 8, 24]} /><meshPhysicalMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} /></mesh>
          <mesh position={[0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.12, 0.02, 8, 24]} /><meshPhysicalMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} /></mesh>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.015, 0.015, 0.16, 8]} /><meshStandardMaterial color="#C0C0C0" metalness={0.8} /></mesh>
        </group>
      )}
    </group>
  );
}

useGLTF.preload("/models/owl.glb");

function OwlLoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-md" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading 3D owl…</p>
      </div>
    </Html>
  );
}

export default function OwlScene({ equippedItems, message, containerHeight = 420, modelYOffset = 0 }: OwlSceneProps) {
  const [loaded, setLoaded] = useState(false);
  const handleLoaded = useCallback(() => setLoaded(true), []);
  const globalMouseRef = useRef({ x: 0, y: 0 });
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true, threshold: 0.01, rootMargin: "200px" });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      globalMouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={inViewRef} className="relative w-full" style={{ height: `${containerHeight}px` }}>
      {!inView ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <OwlMascot size="xl" animate={false} />
        </div>
      ) : (
        <>
          {!loaded && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm rounded-xl transition-opacity duration-500">
              <Skeleton className="h-40 w-40 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-md" />
              <p className="text-xs text-muted-foreground animate-pulse">Loading 3D owl…</p>
            </div>
          )}
          <Canvas camera={{ position: [0, 0.5 + modelYOffset, 3.2], fov: 45 }} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={<OwlLoadingFallback />}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={0.6} />
              <OwlModel equippedItems={equippedItems} onLoaded={handleLoaded} globalMouse={globalMouseRef} />
              <Environment preset="sunset" />
              <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} autoRotate={false} />
            </Suspense>
          </Canvas>
        </>
      )}

      {message && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 max-w-[260px] rounded-2xl backdrop-blur-md bg-white/30 border border-white/20 px-5 py-3 text-center text-sm font-display shadow-lg z-10">
          {message}
        </div>
      )}
    </div>
  );
}
