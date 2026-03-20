import { useMemo } from "react";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface RobotMascot3DProps {
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  animate?: boolean;
}

// Preload the model so it starts downloading immediately
useGLTF.preload("/models/robot_3D/robot.glb");

export default function RobotMascot3D({
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  animate = true,
}: RobotMascot3DProps) {

  const { scene } = useGLTF("/models/robot_3D/robot.glb");

  // Clone and fix materials + auto-scale
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const fixMat = (mat: THREE.Material) => {
            mat.side = THREE.DoubleSide;
          };
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(fixMat);
          } else {
            fixMat(mesh.material);
          }
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    // Auto-scale: normalize to ~2 units tall
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
      const s = (2 / maxDim) * scale;
      clone.scale.multiplyScalar(s);

      // Re-compute and center
      const boxScaled = new THREE.Box3().setFromObject(clone);
      const center = new THREE.Vector3();
      boxScaled.getCenter(center);
      clone.position.sub(center);
    }

    return clone;
  }, [scene, scale]);

  return (
    <Float
      speed={animate ? 2 : 0}
      floatIntensity={0.4}
      rotationIntensity={0.1}
    >
      <group position={position} rotation={rotation}>
        <primitive object={clonedScene} />
      </group>
    </Float>
  );
}
