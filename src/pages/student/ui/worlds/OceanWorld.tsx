import { Float } from "@react-three/drei";

export default function OceanWorld() {
  return (
    <group>
      {/* Ocean base */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.5, 32]} />
        <meshStandardMaterial color="#38bdf8" />
      </mesh>
      {/* Coral */}
      {[...Array(6)].map((_, i) => (
        <Float key={i} speed={1.1 + i * 0.1} floatIntensity={0.3 + i * 0.1}>
          <mesh position={[-4 + i * 1.6, 0, -2 + (i % 2) * 2]} castShadow>
            <coneGeometry args={[0.2, 0.8 + i * 0.2, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#fbbf24" : "#f472b6"} />
          </mesh>
        </Float>
      ))}
      {/* Fish */}
      <Float speed={1.5} floatIntensity={0.4}>
        <mesh position={[2, 0, 1]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[2.2, 0.1, 1.2]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
      </Float>
    </group>
  );
}
