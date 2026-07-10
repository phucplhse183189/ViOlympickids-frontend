import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

// ─── Theme Colors ────────────────────────────────────────────────────────────
const THEME_PALETTES = [
  { primary: "#06b6d4", secondary: "#0284c7", accent: "#67e8f9" },
  { primary: "#22c55e", secondary: "#16a34a", accent: "#86efac" },
  { primary: "#a78bfa", secondary: "#7c3aed", accent: "#c4b5fd" },
  { primary: "#f472b6", secondary: "#ec4899", accent: "#fbcfe8" },
  { primary: "#fb923c", secondary: "#f97316", accent: "#fed7aa" },
];

// ─── Spinning Geometric Shape ────────────────────────────────────────────────
function SpinningShape({
  position,
  shape,
  color,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  shape: "box" | "sphere" | "torus" | "octahedron" | "cone" | "dodecahedron" | "icosahedron" | "torusKnot";
  color: string;
  scale?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.3 * speed;
    meshRef.current.rotation.y += delta * 0.5 * speed;
    meshRef.current.rotation.z += delta * 0.15 * speed;
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case "box": return <boxGeometry args={[1, 1, 1]} />;
      case "sphere": return <sphereGeometry args={[0.6, 32, 32]} />;
      case "torus": return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case "octahedron": return <octahedronGeometry args={[0.6]} />;
      case "cone": return <coneGeometry args={[0.5, 1, 32]} />;
      case "dodecahedron": return <dodecahedronGeometry args={[0.55]} />;
      case "icosahedron": return <icosahedronGeometry args={[0.6]} />;
      case "torusKnot": return <torusKnotGeometry args={[0.4, 0.15, 64, 16]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [shape]);

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          roughness={0.2}
          metalness={0.8}
          distort={0.15}
          speed={2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

// ─── Wobbling Decorative Shape ───────────────────────────────────────────────
function WobblyShape({
  position, color, scale = 1,
}: {
  position: [number, number, number]; color: string; scale?: number;
}) {
  return (
    <Float speed={2} floatIntensity={2} rotationIntensity={0.8}>
      <mesh position={position} scale={scale}>
        <torusGeometry args={[0.4, 0.18, 16, 32]} />
        <MeshWobbleMaterial color={color} factor={0.6} speed={1.5} transparent opacity={0.6} />
      </mesh>
    </Float>
  );
}

// ─── Orbiting Ring ───────────────────────────────────────────────────────────
function OrbitingRing({
  radius, color, speed = 1, yOffset = 0,
}: {
  radius: number; color: string; speed?: number; yOffset?: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    ringRef.current.rotation.z = state.clock.elapsedTime * speed * 0.3;
  });

  return (
    <mesh ref={ringRef} position={[0, yOffset, 0]}>
      <torusGeometry args={[radius, 0.04, 16, 100]} />
      <meshStandardMaterial color={color} transparent opacity={0.3} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
}

// ─── Floating Number made from mesh (no font needed) ─────────────────────────
function FloatingGem({
  position, color, size = 0.5,
}: {
  position: [number, number, number]; color: string; size?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.8;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
  });

  return (
    <Float speed={1.2} floatIntensity={2} rotationIntensity={0.3}>
      <mesh ref={ref} position={position} scale={size}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

// ─── Plus/Minus shaped mesh ──────────────────────────────────────────────────
function PlusShape({
  position, color, scale = 1,
}: {
  position: [number, number, number]; color: string; scale?: number;
}) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.4;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.5;
  });

  return (
    <Float speed={0.8} floatIntensity={1.8} rotationIntensity={0.4}>
      <group ref={ref} position={position} scale={scale}>
        {/* Horizontal bar */}
        <mesh>
          <boxGeometry args={[0.8, 0.2, 0.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.7} roughness={0.2} transparent opacity={0.8} />
        </mesh>
        {/* Vertical bar */}
        <mesh>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.7} roughness={0.2} transparent opacity={0.8} />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Equals sign mesh ────────────────────────────────────────────────────────
function EqualsShape({
  position, color, scale = 1,
}: {
  position: [number, number, number]; color: string; scale?: number;
}) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
  });

  return (
    <Float speed={1} floatIntensity={1.5} rotationIntensity={0.3}>
      <group ref={ref} position={position} scale={scale}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.6, 0.15, 0.15]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.7} roughness={0.2} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.6, 0.15, 0.15]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.7} roughness={0.2} transparent opacity={0.8} />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Multiply (X) shape ──────────────────────────────────────────────────────
function MultiplyShape({
  position, color, scale = 1,
}: {
  position: [number, number, number]; color: string; scale?: number;
}) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.6;
  });

  return (
    <Float speed={0.9} floatIntensity={1.6} rotationIntensity={0.5}>
      <group ref={ref} position={position} scale={scale}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.8, 0.18, 0.18]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.7} roughness={0.2} transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.8, 0.18, 0.18]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.7} roughness={0.2} transparent opacity={0.8} />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Celebration Particles ───────────────────────────────────────────────────
function CelebrationParticles({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshes = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      pos: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4] as [number, number, number],
      color: ["#fbbf24", "#ef4444", "#22c55e", "#3b82f6", "#ec4899", "#a855f7"][i % 6],
      scale: 0.1 + Math.random() * 0.15,
      speed: 1 + Math.random() * 2,
    })),
  []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.visible = active;
    if (active) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x = state.clock.elapsedTime * meshes[i].speed;
        child.rotation.y = state.clock.elapsedTime * meshes[i].speed * 0.7;
        child.position.y = meshes[i].pos[1] + Math.sin(state.clock.elapsedTime * meshes[i].speed + i) * 2;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {meshes.map((m, i) => (
        <mesh key={i} position={m.pos} scale={m.scale}>
          <dodecahedronGeometry args={[1]} />
          <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.5} metalness={0.8} roughness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Main 3D Scene ───────────────────────────────────────────────────────────
function Scene({
  themeIdx, answerState,
}: {
  themeIdx: number; answerState: "idle" | "correct" | "wrong";
}) {
  const palette = THEME_PALETTES[themeIdx % THEME_PALETTES.length];

  const shapes = useMemo(() => [
    { pos: [-5.5, 3, -4] as [number, number, number], shape: "box" as const, scale: 0.8 },
    { pos: [5, 2.5, -5] as [number, number, number], shape: "octahedron" as const, scale: 0.7 },
    { pos: [-4, -2, -3] as [number, number, number], shape: "torus" as const, scale: 0.9 },
    { pos: [4.5, -3, -4] as [number, number, number], shape: "dodecahedron" as const, scale: 0.65 },
    { pos: [-6, 0.5, -6] as [number, number, number], shape: "icosahedron" as const, scale: 0.6 },
    { pos: [6, 0, -5] as [number, number, number], shape: "cone" as const, scale: 0.7 },
    { pos: [0, 4, -7] as [number, number, number], shape: "torusKnot" as const, scale: 0.55 },
    { pos: [-3, 4.5, -8] as [number, number, number], shape: "sphere" as const, scale: 0.5 },
    { pos: [3, -4, -6] as [number, number, number], shape: "box" as const, scale: 0.5 },
    { pos: [-5, -4.5, -7] as [number, number, number], shape: "torus" as const, scale: 0.45 },
    { pos: [5.5, 4, -9] as [number, number, number], shape: "icosahedron" as const, scale: 0.4 },
    { pos: [-2, -5, -5] as [number, number, number], shape: "octahedron" as const, scale: 0.55 },
  ], []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-3, -3, 2]} intensity={0.4} color={palette.accent} />
      <pointLight position={[0, 0, 5]} intensity={0.8} color={palette.primary} distance={20} />

      {/* Stars background */}
      <Stars radius={50} depth={30} count={800} factor={3} fade speed={0.5} />

      {/* Orbiting decorative rings */}
      <OrbitingRing radius={8} color={palette.primary} speed={0.5} yOffset={0} />
      <OrbitingRing radius={6} color={palette.accent} speed={-0.7} yOffset={1} />
      <OrbitingRing radius={10} color={palette.secondary} speed={0.3} yOffset={-1} />

      {/* Spinning geometric shapes */}
      {shapes.map((s, i) => (
        <SpinningShape
          key={`shape-${i}`}
          position={s.pos}
          shape={s.shape}
          color={i % 2 === 0 ? palette.primary : palette.accent}
          scale={s.scale}
          speed={0.5 + (i % 3) * 0.3}
        />
      ))}

      {/* Wobbly accent shapes */}
      <WobblyShape position={[-3, -1.5, -4]} color={palette.secondary} scale={0.7} />
      <WobblyShape position={[3, 1, -5]} color={palette.accent} scale={0.6} />
      <WobblyShape position={[0, -3, -6]} color={palette.primary} scale={0.5} />

      {/* Floating gems (replacing Text numbers) */}
      <FloatingGem position={[-7, 2, -6]} color={palette.accent} size={0.6} />
      <FloatingGem position={[7, -1, -7]} color={palette.primary} size={0.7} />
      <FloatingGem position={[-6, -3, -5]} color={palette.accent} size={0.5} />
      <FloatingGem position={[6, 3.5, -8]} color={palette.secondary} size={0.55} />
      <FloatingGem position={[-4, 5, -9]} color={palette.accent} size={0.6} />
      <FloatingGem position={[4, -5, -6]} color={palette.primary} size={0.45} />
      <FloatingGem position={[0, -4.5, -8]} color={palette.accent} size={0.4} />
      <FloatingGem position={[-7.5, -1, -10]} color={palette.secondary} size={0.5} />

      {/* Math operator shapes (pure geometry, no fonts) */}
      <PlusShape position={[-3, 3.5, -6]} color={palette.primary} scale={0.8} />
      <PlusShape position={[2, -3.5, -7]} color={palette.accent} scale={0.6} />
      <MultiplyShape position={[-5.5, -4, -8]} color={palette.secondary} scale={0.7} />
      <EqualsShape position={[5, -4.5, -9]} color={palette.accent} scale={0.8} />

      {/* Celebration particles on correct answer */}
      <CelebrationParticles active={answerState === "correct"} />
    </>
  );
}

// ─── Exported Component ──────────────────────────────────────────────────────
export function Scene3DBackground({
  themeIdx, answerState,
}: {
  themeIdx: number; answerState: "idle" | "correct" | "wrong";
}) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 60 }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 1.5]}
        >
          <Scene themeIdx={themeIdx} answerState={answerState} />
        </Canvas>
      </Suspense>
    </div>
  );
}
