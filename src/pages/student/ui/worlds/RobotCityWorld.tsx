import { Float } from "@react-three/drei";
import RobotMascot3D from "../../../../components/3d/RobotMascot3D";

export default function RobotCityWorld() {
  return (
    <group>
      {/* Ground */}
      <mesh position={[0, -2.3, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8, 0.5, 32]} />
        <meshStandardMaterial color="#dbeafe" />
      </mesh>
      {/* Buildings */}
      {[...Array(6)].map((_, i) => (
        <Float key={i} speed={1.1 + i * 0.1} floatIntensity={0.3 + i * 0.1}>
          <mesh position={[-4 + i * 1.6, -0.5, -2 + (i % 2) * 2]} castShadow>
            <boxGeometry args={[0.7, 2 + i * 0.2, 0.7]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#60a5fa" : "#818cf8"} />
          </mesh>
        </Float>
      ))}
      {/* 3D Robot Mascot */}
      <RobotMascot3D position={[0, 0, 1]} scale={1.5} />
    </group>
  );
}
