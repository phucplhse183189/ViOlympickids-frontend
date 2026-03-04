import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, RoundedBox } from "@react-three/drei";
import type { Mesh } from "three";

// ── Supported 3D shape types ──────────────────────────────────────────────────
export type Shape3DType = "cube" | "sphere" | "cylinder" | "cone" | "pyramid";

// ── Shape colour presets (kid-friendly pastels) ───────────────────────────────
const SHAPE_COLORS: Record<Shape3DType, string> = {
  cube: "#60a5fa", // sky-400
  sphere: "#f472b6", // pink-400
  cylinder: "#34d399", // emerald-400
  cone: "#fbbf24", // amber-400
  pyramid: "#a78bfa", // violet-400
};

// ── Rotating mesh wrapper ─────────────────────────────────────────────────────
function RotatingShape({
  shape,
  color,
  spinning,
}: {
  shape: Shape3DType;
  color: string;
  spinning: boolean;
}) {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    // Auto-rotate slowly, faster when spinning (click)
    const speed = spinning ? 8 : 0.6;
    meshRef.current.rotation.y += delta * speed;
    meshRef.current.rotation.x += delta * speed * 0.3;
  });

  const scale = hovered ? 1.1 : 1;

  return (
    <mesh
      ref={meshRef}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {shape === "cube" && (
        <RoundedBox args={[1.6, 1.6, 1.6]} radius={0.08} smoothness={4}>
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </RoundedBox>
      )}

      {shape === "sphere" && (
        <>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial
            color={color}
            roughness={0.25}
            metalness={0.15}
          />
        </>
      )}

      {shape === "cylinder" && (
        <>
          <cylinderGeometry args={[0.8, 0.8, 1.8, 48]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </>
      )}

      {shape === "cone" && (
        <>
          <coneGeometry args={[0.9, 1.8, 48]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </>
      )}

      {shape === "pyramid" && (
        <>
          <coneGeometry args={[1, 1.6, 4]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </>
      )}
    </mesh>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
interface Shape3DViewerProps {
  shape: Shape3DType;
  /** Override default colour */
  color?: string;
  /** CSS class for the wrapper */
  className?: string;
}

export function Shape3DViewer({ shape, color, className }: Shape3DViewerProps) {
  const [spinning, setSpinning] = useState(false);

  const fillColor = color ?? SHAPE_COLORS[shape];

  const handleClick = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 1200);
  };

  return (
    <div
      className={`w-full aspect-square max-w-[180px] mx-auto cursor-pointer ${className ?? ""}`}
      onClick={handleClick}
      title="Click để xoay nhanh!"
    >
      <Canvas
        camera={{ position: [2.5, 2, 3.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1} />
        <directionalLight position={[-2, -1, -3]} intensity={0.3} />
        <RotatingShape shape={shape} color={fillColor} spinning={spinning} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
