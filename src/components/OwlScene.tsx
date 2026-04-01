import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Float, RoundedBox, useGLTF } from "@react-three/drei";
import { useRef, useMemo, useEffect, Suspense } from "react";
import * as THREE from "three";

interface OwlSceneProps {
  equippedItems: Record<string, string>;
  message?: string;
}

function OwlModel({ equippedItems }: { equippedItems: Record<string, string> }) {
  const { scene } = useGLTF("/models/owl.glb");
  const pageRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const headRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const head = scene.getObjectByName('Head');
    if (head) {
      headRef.current = head;
    } else {
      console.warn("Could not find 'Head' node in owl.glb for mouse tracking.");
    }
  }, [scene]);

  // Auto-center and scale the model
  const { center, scale, headY, eyeY } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 2.0 / maxDim; // fit in ~2 units
    const topY = (box.max.y - c.y) * s;
    return { center: c, scale: s, headY: topY, eyeY: topY * 0.75 };
  }, [scene]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pageRef.current) {
      pageRef.current.rotation.z = Math.sin(t * 0.8) * Math.PI * 0.35;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 2) * 1.5;
    }
    // Head tracking
    if (headRef.current) {
      const mouse = state.mouse;
      const targetY = mouse.x * (Math.PI / 6);
      const targetX = -mouse.y * (Math.PI / 10);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX, 0.1);
    }
  });

  const hasHeadwear = !!equippedItems["headwear"];
  const hasEyewear = !!equippedItems["eyewear"];
  const hasBook = !!equippedItems["book"];

  return (
    <group>
      {/* Owl model — centered and scaled */}
      <primitive
        object={scene}
        scale={scale}
        position={[-center.x * scale, -center.y * scale, -center.z * scale]}
      />

      {/* Book in front of the owl */}
      <group position={[0, -0.6, 1.0]}>
        <RoundedBox args={[0.8, 0.06, 0.6]} radius={0.02}>
          <meshStandardMaterial color={hasBook ? "#4A90D9" : "#8B4513"} />
        </RoundedBox>
        <group position={[-0.2, 0.04, 0]}>
          <mesh ref={pageRef} position={[0.2, 0, 0]}>
            <RoundedBox args={[0.35, 0.01, 0.55]} radius={0.005}>
              <meshStandardMaterial color="#FFF8DC" side={THREE.DoubleSide} />
            </RoundedBox>
          </mesh>
        </group>
        <pointLight
          ref={lightRef}
          position={[0, 0.3, 0]}
          color="#FFD700"
          intensity={1.5}
          distance={3}
          decay={2}
        />
      </group>

      {/* HEADWEAR — wizard hat */}
      {hasHeadwear && (
        <Float speed={2} floatIntensity={0.3}>
          <group position={[0, headY + 0.15, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.35, 0.05, 8, 24]} />
              <meshStandardMaterial color="#4B0082" />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <coneGeometry args={[0.3, 0.7, 16]} />
              <meshStandardMaterial color="#6A0DAD" />
            </mesh>
            <mesh position={[0.15, 0.25, 0.25]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
            </mesh>
          </group>
        </Float>
      )}

      {/* EYEWEAR — glasses */}
      {hasEyewear && (
        <Float speed={1.5} floatIntensity={0.15}>
          <group position={[0, eyeY, 0.55]}>
            <mesh position={[-0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.12, 0.02, 8, 24]} />
              <meshPhysicalMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.12, 0.02, 8, 24]} />
              <meshPhysicalMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
            </mesh>
          </group>
        </Float>
      )}
    </group>
  );
}

useGLTF.preload("/models/owl.glb");

export default function OwlScene({ equippedItems, message }: OwlSceneProps) {
  return (
    <div className="relative w-full" style={{ height: "320px" }}>
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <OwlModel equippedItems={equippedItems} />
          <Environment preset="sunset" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>

      {message && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 max-w-[260px] rounded-2xl backdrop-blur-md bg-white/30 border border-white/20 px-5 py-3 text-center text-sm font-display shadow-lg z-10">
          {message}
        </div>
      )}
    </div>
  );
}
