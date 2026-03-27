import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ThreeEvent } from "@react-three/fiber";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { animated, config, useSpring } from "@react-spring/three";
import * as THREE from "three";

type ShapeProps = {
  position: [number, number, number];
  color: string;
  isOpen: boolean;
  isHolding: boolean;
  onSingleClick: () => void;
  onDoubleClickOpen: () => void;
  onRightHoldStart: () => void;
};

const CYLINDER_RADIUS = 1;
const CYLINDER_HEIGHT = 2.2;
const CLICK_DELAY_MS = 220;

function CylinderShape({
  position,
  color,
  isOpen,
  isHolding,
  onSingleClick,
  onDoubleClickOpen,
  onRightHoldStart,
}: Readonly<ShapeProps>) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group | null>(null);
  const clickTimerRef = useRef<number | null>(null);

  const [{ scale }, scaleApi] = useSpring(() => ({
    scale: 1,
    config: config.stiff,
  }));

  const [{ wobbleZ }, wobbleApi] = useSpring(() => ({
    wobbleZ: 0,
    config: config.default,
  }));

  const [{ openProgress }, openApi] = useSpring(() => ({
    openProgress: 0,
    config: config.slow,
  }));

  useEffect(() => {
    scaleApi.start({ scale: hovered ? 1.1 : 1 });
  }, [hovered, scaleApi]);

  useEffect(() => {
    openApi.start({
      openProgress: isOpen ? 1 : 0,
      config: isHolding ? { tension: 250, friction: 24 } : config.slow,
    });
  }, [isOpen, isHolding, openApi]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.5;
  });

  const handleClick = () => {
    if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = window.setTimeout(() => {
      void wobbleApi.start({
        to: async (next) => {
          await next({ wobbleZ: 0.24, config: config.wobbly });
          await next({ wobbleZ: -0.2, config: config.wobbly });
          await next({ wobbleZ: 0.14, config: config.wobbly });
          await next({ wobbleZ: -0.1, config: config.wobbly });
          await next({ wobbleZ: 0, config: config.gentle });
        },
      });
      onSingleClick();
    }, CLICK_DELAY_MS);
  };

  const handleDoubleClick = () => {
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    onDoubleClickOpen();
  };

  const handleRightPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.button !== 2) return;
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    onRightHoldStart();
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    };
  }, []);

  return (
    <animated.group
      ref={(el) => {
        groupRef.current = el;
      }}
      position={position}
      scale={scale}
      rotation-z={wobbleZ}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handleRightPointerDown}
    >
      {/* Tube body (closed state) */}
      <animated.mesh castShadow receiveShadow scale-x={openProgress.to((v) => 1 - 0.94 * v)}>
        <cylinderGeometry args={[CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_HEIGHT, 64, 1, true]} />
        <animated.meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.15}
          transparent
          opacity={openProgress.to((v) => 1 - v)}
          side={THREE.DoubleSide}
        />
      </animated.mesh>

      {/* Net rectangle (open state) */}
      <animated.mesh
        castShadow
        receiveShadow
        rotation-y={openProgress.to((v) => -Math.PI * 0.15 * v)}
        scale-x={openProgress.to((v) => 0.08 + 0.92 * v)}
      >
        <planeGeometry args={[2 * Math.PI * CYLINDER_RADIUS, CYLINDER_HEIGHT]} />
        <animated.meshStandardMaterial
          color="#fed7aa"
          roughness={0.62}
          metalness={0.05}
          transparent
          opacity={openProgress.to((v) => 0.06 + 0.94 * v)}
          side={THREE.DoubleSide}
        />
      </animated.mesh>

      {/* TOP LID with precise hinge at top edge of net (z = +radius rim) */}
      <animated.group
        position={[0, CYLINDER_HEIGHT / 2, CYLINDER_RADIUS]}
        rotation-x={openProgress.to((v) => -Math.PI / 2 * v)}
      >
        <mesh position={[0, 0, -CYLINDER_RADIUS]} castShadow receiveShadow>
          <circleGeometry args={[CYLINDER_RADIUS, 64]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} side={THREE.DoubleSide} />
        </mesh>
      </animated.group>

      {/* BOTTOM LID with precise hinge at bottom edge of net (z = +radius rim) */}
      <animated.group
        position={[0, -CYLINDER_HEIGHT / 2, CYLINDER_RADIUS]}
        rotation-x={openProgress.to((v) => Math.PI / 2 * v)}
      >
        <mesh position={[0, 0, -CYLINDER_RADIUS]} castShadow receiveShadow>
          <circleGeometry args={[CYLINDER_RADIUS, 64]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} side={THREE.DoubleSide} />
        </mesh>
      </animated.group>
    </animated.group>
  );
}

function SphereShape({
  position,
  color,
  isOpen,
  isHolding,
  onSingleClick,
  onDoubleClickOpen,
  onRightHoldStart,
}: Readonly<ShapeProps>) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group | null>(null);
  const clickTimerRef = useRef<number | null>(null);

  const [{ scale }, scaleApi] = useSpring(() => ({
    scale: 1,
    config: config.stiff,
  }));

  const [{ bounceY }, bounceApi] = useSpring(() => ({
    bounceY: 0,
    config: config.default,
  }));

  const [{ splitProgress }, splitApi] = useSpring(() => ({
    splitProgress: 0,
    config: config.slow,
  }));

  useEffect(() => {
    scaleApi.start({ scale: hovered ? 1.1 : 1 });
  }, [hovered, scaleApi]);

  useEffect(() => {
    splitApi.start({
      splitProgress: isOpen ? 1 : 0,
      config: isHolding ? { tension: 250, friction: 24 } : config.slow,
    });
  }, [isOpen, isHolding, splitApi]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.56;
  });

  const handleClick = () => {
    if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = window.setTimeout(() => {
      void bounceApi.start({
        to: async (next) => {
          await next({ bounceY: 1.05, config: config.wobbly });
          await next({ bounceY: 0, config: config.gentle });
        },
      });
      onSingleClick();
    }, CLICK_DELAY_MS);
  };

  const handleDoubleClick = () => {
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    onDoubleClickOpen();
  };

  const handleRightPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.button !== 2) return;
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    onRightHoldStart();
  };

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) window.clearTimeout(clickTimerRef.current);
    };
  }, []);

  return (
    <animated.group
      ref={(el) => {
        groupRef.current = el;
      }}
      position-x={position[0]}
      position-y={bounceY.to((v) => position[1] + v)}
      position-z={position[2]}
      scale={scale}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onPointerDown={handleRightPointerDown}
    >
      {/* Upper hemisphere */}
      <animated.mesh
        position-x={splitProgress.to((v) => -1.7 * v)}
        position-y={splitProgress.to((v) => 0.04 * v)}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.1} side={THREE.DoubleSide} />
      </animated.mesh>

      {/* Lower hemisphere */}
      <animated.mesh
        position-x={splitProgress.to((v) => 1.7 * v)}
        position-y={splitProgress.to((v) => -0.04 * v)}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1.2, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.1} side={THREE.DoubleSide} />
      </animated.mesh>
    </animated.group>
  );
}

export default function Math2Quiz3DShapesPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(
    "Nhấn 1 lần để phản ứng vui nhộn, nhấn đúp để mở hình. Giữ chuột phải để giữ trạng thái mở.",
  );

  const [isCylinderOpen, setIsCylinderOpen] = useState(false);
  const [isSphereOpen, setIsSphereOpen] = useState(false);

  const [isCylinderRightClickHolding, setIsCylinderRightClickHolding] = useState(false);
  const [isSphereRightClickHolding, setIsSphereRightClickHolding] = useState(false);

  const anyHolding = isCylinderRightClickHolding || isSphereRightClickHolding;

  const handleGlobalRightRelease = useMemo(
    () => () => {
      if (isCylinderRightClickHolding) {
        setIsCylinderRightClickHolding(false);
        setIsCylinderOpen(false);
      }
      if (isSphereRightClickHolding) {
        setIsSphereRightClickHolding(false);
        setIsSphereOpen(false);
      }
    },
    [isCylinderRightClickHolding, isSphereRightClickHolding],
  );

  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2) handleGlobalRightRelease();
    };

    window.addEventListener("contextmenu", preventContextMenu);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("contextmenu", preventContextMenu);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleGlobalRightRelease]);

  return (
    <div
      className="w-full min-h-screen bg-gradient-to-b from-cyan-50 via-sky-50 to-indigo-100 p-4 sm:p-6"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-2xl sm:text-3xl font-black text-sky-700 mb-2">
          Bài 46: Khối trụ và Khối cầu
        </h1>
        <p className="text-center text-sm sm:text-base font-bold text-slate-600 mb-4">
          Nhấn đúp để mở hình. Giữ chuột phải để giữ mở, thả chuột phải để gập lại.
        </p>

        <div className="h-[500px] w-full rounded-3xl border-2 border-sky-200 bg-white/60 shadow-xl overflow-hidden">
          <Canvas
            shadows
            camera={{ position: [0, 1.8, 8], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            onPointerUp={(e) => {
              if (e.nativeEvent.button === 2) handleGlobalRightRelease();
            }}
            onPointerMissed={(e) => {
              if ((e as PointerEvent).button === 2) handleGlobalRightRelease();
            }}
          >
            <color attach="background" args={["#eef9ff"]} />

            <ambientLight intensity={0.72} />
            <directionalLight
              position={[6, 8, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight position={[-5, 4, -4]} intensity={0.45} color="#dbeafe" />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <shadowMaterial opacity={0.2} />
            </mesh>

            <CylinderShape
              position={[-2.6, 0, 0]}
              color="#fb923c"
              isOpen={isCylinderOpen}
              isHolding={isCylinderRightClickHolding}
              onSingleClick={() => {
                setMessage("Khối trụ đang lắc như thạch!");
              }}
              onDoubleClickOpen={() => {
                setIsCylinderOpen(true);
                setMessage("Khối trụ mở: nắp xoay theo bản lề, thân trụ trải thành hình chữ nhật.");
              }}
              onRightHoldStart={() => {
                setIsCylinderRightClickHolding(true);
                setIsCylinderOpen(true);
                setMessage("Đang giữ chuột phải: khối trụ được giữ ở trạng thái mở.");
              }}
            />

            <SphereShape
              position={[2.6, 0, 0]}
              color="#38bdf8"
              isOpen={isSphereOpen}
              isHolding={isSphereRightClickHolding}
              onSingleClick={() => {
                setMessage("Khối cầu bật nảy như bóng cao su!");
              }}
              onDoubleClickOpen={() => {
                setIsSphereOpen(true);
                setMessage("Khối cầu đã tách thành 2 bán cầu, tách rời rõ ràng.");
              }}
              onRightHoldStart={() => {
                setIsSphereRightClickHolding(true);
                setIsSphereOpen(true);
                setMessage("Đang giữ chuột phải: khối cầu được giữ ở trạng thái tách.");
              }}
            />

            <OrbitControls enableDamping dampingFactor={0.08} />
          </Canvas>
        </div>

        <div className="mt-4 rounded-2xl border border-cyan-200 bg-white/80 px-4 py-3 text-center">
          <p className="text-base sm:text-lg font-extrabold text-cyan-700">{message}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {anyHolding
              ? "Đang giữ chuột phải: thả ra để gập lại."
              : "Mẹo: Nhấn đúp để mở hình, giữ chuột phải để giữ nguyên trạng thái mở."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/student/game/math2-b46-warehouse")}
            className="mt-3 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 px-5 py-2.5 text-sm sm:text-base font-black text-white shadow-lg hover:from-orange-500 hover:to-amber-600 active:scale-95 transition"
          >
            Chơi game: Nhà Kho Của Tí Tách
          </button>
        </div>
      </div>
    </div>
  );
}
