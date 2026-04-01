import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Float, RoundedBox } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

interface OwlSceneProps {
  equippedItems: Record<string, string>;
  message?: string;
}

function GeometricOwl({ equippedItems }: { equippedItems: Record<string, string> }) {
  const pageRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Page turn animation
    if (pageRef.current) {
      pageRef.current.rotation.z = Math.sin(t * 0.8) * Math.PI * 0.35;
    }
    // Pulsing book light
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 2) * 1.5;
    }
  });

  const hasHeadwear = !!equippedItems["headwear"];
  const hasEyewear = !!equippedItems["eyewear"];
  const hasBook = !!equippedItems["book"];

  return (
    <group position={[0, -0.3, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#8B6914" roughness={0.6} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#A0782C" roughness={0.5} />
      </mesh>

      {/* Left ear tuft */}
      <mesh position={[-0.35, 1.55, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial color="#6B4E0A" />
      </mesh>

      {/* Right ear tuft */}
      <mesh position={[0.35, 1.55, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.12, 0.35, 8]} />
        <meshStandardMaterial color="#6B4E0A" />
      </mesh>

      {/* Left eye (white) */}
      <mesh position={[-0.2, 1.1, 0.45]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          transmission={0.3}
          thickness={0.5}
        />
      </mesh>

      {/* Left pupil */}
      <mesh position={[-0.2, 1.1, 0.58]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Right eye (white) */}
      <mesh position={[0.2, 1.1, 0.45]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          transmission={0.3}
          thickness={0.5}
        />
      </mesh>

      {/* Right pupil */}
      <mesh position={[0.2, 1.1, 0.58]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Beak */}
      <mesh position={[0, 0.9, 0.55]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.08, 0.18, 8]} />
        <meshStandardMaterial color="#E8A317" />
      </mesh>

      {/* Belly patch */}
      <mesh position={[0, -0.1, 0.55]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#D4B876" roughness={0.7} />
      </mesh>

      {/* Left wing */}
      <mesh position={[-0.85, 0.1, 0]} rotation={[0, 0, 0.4]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#7A5C10" />
        <mesh scale={[1, 1.8, 0.5]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#7A5C10" />
        </mesh>
      </mesh>

      {/* Right wing */}
      <mesh position={[0.85, 0.1, 0]} rotation={[0, 0, -0.4]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#7A5C10" />
        <mesh scale={[1, 1.8, 0.5]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#7A5C10" />
        </mesh>
      </mesh>

      {/* Feet */}
      <mesh position={[-0.25, -0.85, 0.3]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#E8A317" />
      </mesh>
      <mesh position={[0.25, -0.85, 0.3]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#E8A317" />
      </mesh>

      {/* Book */}
      <group position={[0, -0.6, 0.8]}>
        {/* Book base */}
        <RoundedBox args={[0.8, 0.06, 0.6]} radius={0.02}>
          <meshStandardMaterial color={hasBook ? "#4A90D9" : "#8B4513"} />
        </RoundedBox>

        {/* Animated page */}
        <group position={[-0.2, 0.04, 0]}>
          <mesh ref={pageRef} position={[0.2, 0, 0]}>
            <RoundedBox args={[0.35, 0.01, 0.55]} radius={0.005}>
              <meshStandardMaterial color="#FFF8DC" side={THREE.DoubleSide} />
            </RoundedBox>
          </mesh>
        </group>

        {/* Pulsing light from book */}
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
          <group position={[0, 1.65, 0]}>
            {/* Hat brim */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.35, 0.05, 8, 24]} />
              <meshStandardMaterial color="#4B0082" />
            </mesh>
            {/* Hat cone */}
            <mesh position={[0, 0.35, 0]}>
              <coneGeometry args={[0.3, 0.7, 16]} />
              <meshStandardMaterial color="#6A0DAD" />
            </mesh>
            {/* Hat star */}
            <mesh position={[0.15, 0.25, 0.25]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial
                color="#FFD700"
                emissive="#FFD700"
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        </Float>
      )}

      {/* EYEWEAR — glasses */}
      {hasEyewear && (
        <Float speed={1.5} floatIntensity={0.15}>
          <group position={[0, 1.1, 0.55]}>
            {/* Left lens */}
            <mesh position={[-0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.12, 0.02, 8, 24]} />
              <meshPhysicalMaterial
                color="#C0C0C0"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            {/* Right lens */}
            <mesh position={[0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.12, 0.02, 8, 24]} />
              <meshPhysicalMaterial
                color="#C0C0C0"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            {/* Bridge */}
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
          <GeometricOwl equippedItems={equippedItems} />
          <Environment preset="sunset" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
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

/* To swap to a real .glb model:
import { useGLTF } from "@react-three/drei";
function OwlModel() {
  const { scene } = useGLTF("/models/owl.glb");
  return <primitive object={scene} />;
}
*/
