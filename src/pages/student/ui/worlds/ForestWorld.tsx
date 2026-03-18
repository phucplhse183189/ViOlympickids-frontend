import { Float, MeshWobbleMaterial } from "@react-three/drei";

export default function ForestWorld() {
  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.5, 32]} />
        <meshStandardMaterial color="#a3e635" />
      </mesh>
      {/* Trees */}
      {[...Array(7)].map((_, i) => (
        <Float key={i} speed={1.2 + i * 0.1} floatIntensity={0.5 + i * 0.1}>
          <mesh position={[-5 + i * 1.7, 0, -2 + (i % 2) * 2]} castShadow>
            <cylinderGeometry args={[0.15, 0.3, 2, 8]} />
            <meshStandardMaterial color="#7c4700" />
          </mesh>
          <mesh position={[-5 + i * 1.7, 1.2, -2 + (i % 2) * 2]} castShadow>
            <sphereGeometry args={[0.7, 16, 16]} />
            <MeshWobbleMaterial color="#22c55e" factor={0.5} speed={1.5} />
          </mesh>
        </Float>
      ))}
      {/* River */}
      <mesh position={[0, -0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 8, 32, 1, true]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>
      {/* Cute animal */}
      <Float speed={1.5} floatIntensity={0.3}>
        <mesh position={[2, -0.2, 1]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[2.15, 0.1, 1.2]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      </Float>
    </group>
  );
}
