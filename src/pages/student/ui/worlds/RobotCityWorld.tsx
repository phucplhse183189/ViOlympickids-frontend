import { Float } from "@react-three/drei";

export default function RobotCityWorld() {
  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.5, 32]} />
        <meshStandardMaterial color="#dbeafe" />
      </mesh>
      {/* Buildings */}
      {[...Array(6)].map((_, i) => (
        <Float key={i} speed={1.1 + i * 0.1} floatIntensity={0.3 + i * 0.1}>
          <mesh position={[-4 + i * 1.6, 0, -2 + (i % 2) * 2]} castShadow>
            <boxGeometry args={[0.7, 2 + i * 0.2, 0.7]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#60a5fa" : "#818cf8"} />
          </mesh>
        </Float>
      ))}
      {/* Robot mascot */}
      <Float speed={1.5} floatIntensity={0.4}>
        <mesh position={[2, 0, 1]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[2.2, 0.2, 1.2]}>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </Float>
    </group>
  );
}
