import { Float, MeshWobbleMaterial } from "@react-three/drei";

export default function SpaceWorld() {
  return (
    <group>
      {/* Planet */}
      <Float speed={1.2} floatIntensity={0.5}>
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshStandardMaterial color="#818cf8" />
        </mesh>
      </Float>
      {/* Asteroids */}
      {[...Array(8)].map((_, i) => (
        <Float key={i} speed={1.2 + i * 0.1} floatIntensity={0.7 + i * 0.1}>
          <mesh position={[-5 + i * 1.3, 2 + (i % 2), -2 + (i % 3)]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <MeshWobbleMaterial color="#fbbf24" factor={0.7} speed={2} />
          </mesh>
        </Float>
      ))}
      {/* Rocket */}
      <Float speed={2} floatIntensity={0.8}>
        <mesh position={[2, 1, 2]}>
          <cylinderGeometry args={[0.1, 0.2, 1, 16]} />
          <meshStandardMaterial color="#f87171" />
        </mesh>
        <mesh position={[2, 1.5, 2]}>
          <coneGeometry args={[0.2, 0.3, 16]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      </Float>
    </group>
  );
}
