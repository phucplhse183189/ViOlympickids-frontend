import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import ForestWorld from "./worlds/ForestWorld";
import RobotCityWorld from "./worlds/RobotCityWorld";
import SpaceWorld from "./worlds/SpaceWorld";
import OceanWorld from "./worlds/OceanWorld";
import CastleWorld from "./worlds/CastleWorld";

// Mapping topic index to world component
const worlds = [
  ForestWorld,
  RobotCityWorld,
  SpaceWorld,
  OceanWorld,
  CastleWorld,
];

export default function Student3DMain({ topicIndex = 0 }) {
  const World = worlds[topicIndex % worlds.length];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 2, 10], fov: 60 }} gl={{ alpha: true }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <Stars
            radius={60}
            depth={30}
            count={1200}
            factor={2.5}
            fade
            speed={0.3}
          />
          <World />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
        </Canvas>
      </Suspense>
    </div>
  );
}
