import { Float } from "@react-three/drei";

export default function CastleWorld() {
  return (
    <group>
      {/* Castle base */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.5, 32]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      {/* Towers */}
      {[...Array(4)].map((_, i) => (
        <Float key={i} speed={1.1 + i * 0.1} floatIntensity={0.3 + i * 0.1}>
          <mesh position={[-2 + i * 1.3, 0, -2 + (i % 2) * 2]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 1.5 + i * 0.2, 12]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#f472b6" : "#a78bfa"} />
          </mesh>
        </Float>
      ))}
      {/* Dragon mascot */}
      <Float speed={1.5} floatIntensity={0.4}>
        <mesh position={[2, 0, 1]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
        <mesh position={[2.2, 0.1, 1.2]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </Float>
    </group>
  );
}
