import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ThreeEvent } from "@react-three/fiber";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { animated, config, useSpring } from "@react-spring/three";
import * as THREE from "three";
import { Volume2, VolumeX, X, Gamepad2, RotateCcw, Sparkles } from "lucide-react";
import { useGameSound } from "@/shared/lib/useGameSound";

/* ─── RobotGuide (Tí Tách) ────────────────────────────────── */
function RobotGuide({ message, isSpeaking }: { message: string; isSpeaking: boolean }) {
  return (
    <div className="flex items-start gap-3 sm:gap-4 w-full max-w-3xl mx-auto mt-4">
      <div className="relative shrink-0">
        <div
          className={`w-14 h-14 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shadow-xl border-4 transition-all duration-300 ${
            isSpeaking ? "border-indigo-400 scale-105 animate-pulse" : "border-white/80"
          }`}
        >
          <img
            src="/assets/math2-b2-game/robot-guide.png"
            alt="Tí Tách"
            className="w-full h-full object-cover"
          />
        </div>
        {isSpeaking && (
          <div className="absolute -top-1 -right-1 bg-indigo-500 text-white p-1 rounded-full shadow-lg animate-bounce">
            <Volume2 size={10} />
          </div>
        )}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">
          Tí Tách 🤖
        </div>
      </div>
      <div className="relative flex-1 min-w-0">
        <div
          className={`relative p-3 sm:p-4 rounded-2xl shadow-xl border-4 transition-all duration-300 ${
            isSpeaking ? "bg-white border-indigo-200" : "bg-white/95 border-slate-200/60"
          }`}
        >
          <div className="absolute -left-3 top-5 w-3 h-3 bg-white rotate-45 border-l-4 border-b-4 border-indigo-200" />
          <p className="text-sm sm:text-base font-bold text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Shape types ────────────────────────────────────────────── */
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

/* ─── CylinderShape ─────────────────────────────────────────── */
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
      config: isHolding ? { tension: 260, friction: 24 } : config.slow,
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
      <animated.mesh castShadow receiveShadow renderOrder={0}>
        <cylinderGeometry args={[CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_HEIGHT, 64, 1, false]} />
        <animated.meshStandardMaterial
          color={color}
          roughness={0.35}
          metalness={0.15}
          transparent
          opacity={openProgress.to((v) => 1 - v)}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </animated.mesh>

      <animated.group scale={openProgress.to((v) => 0.2 + 0.8 * v)} visible={true} renderOrder={1}>
        <animated.mesh
          castShadow receiveShadow renderOrder={1}
          rotation-y={openProgress.to((v) => 0.6 * (1 - v))}
          position-z={openProgress.to((v) => CYLINDER_RADIUS * (1 - v) * 0.6 + 0.01)}
        >
          <planeGeometry args={[2 * Math.PI * CYLINDER_RADIUS, CYLINDER_HEIGHT]} />
          <animated.meshStandardMaterial color={color} roughness={0.35} metalness={0.15} transparent opacity={openProgress.to((v) => v)} depthWrite={false} side={THREE.DoubleSide} />
        </animated.mesh>

        <animated.group
          position-x={0}
          position-y={openProgress.to((v) => CYLINDER_HEIGHT / 2 + v * 0.95)}
          position-z={CYLINDER_RADIUS + 0.02}
          rotation-x={openProgress.to((v) => (-Math.PI / 2) * v)}
          renderOrder={2}
        >
          <mesh position={[0, 0, -CYLINDER_RADIUS]} castShadow receiveShadow>
            <circleGeometry args={[CYLINDER_RADIUS, 64]} />
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </animated.group>

        <animated.group
          position-x={0}
          position-y={openProgress.to((v) => -CYLINDER_HEIGHT / 2 - v * 0.95)}
          position-z={CYLINDER_RADIUS + 0.02}
          rotation-x={openProgress.to((v) => (Math.PI / 2) * v)}
          renderOrder={2}
        >
          <mesh position={[0, 0, -CYLINDER_RADIUS]} castShadow receiveShadow>
            <circleGeometry args={[CYLINDER_RADIUS, 64]} />
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.15} side={THREE.DoubleSide} />
          </mesh>
        </animated.group>
      </animated.group>
    </animated.group>
  );
}

/* ─── SphereShape ────────────────────────────────────────────── */
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

  const [{ scale }, scaleApi] = useSpring(() => ({ scale: 1, config: config.stiff }));
  const [{ bounceY }, bounceApi] = useSpring(() => ({ bounceY: 0, config: config.default }));
  const [{ splitProgress }, splitApi] = useSpring(() => ({ splitProgress: 0, config: config.slow }));

  useEffect(() => {
    scaleApi.start({ scale: hovered ? 1.1 : 1 });
  }, [hovered, scaleApi]);

  useEffect(() => {
    splitApi.start({
      splitProgress: isOpen ? 1 : 0,
      config: isHolding ? { tension: 260, friction: 24 } : config.slow,
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
      <animated.mesh position-x={splitProgress.to((v) => -2.6 * v)} position-y={splitProgress.to((v) => 0.08 * v)} castShadow receiveShadow>
        <sphereGeometry args={[1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.1} side={THREE.DoubleSide} />
      </animated.mesh>
      <animated.mesh position-x={splitProgress.to((v) => 2.6 * v)} position-y={splitProgress.to((v) => -0.08 * v)} castShadow receiveShadow>
        <sphereGeometry args={[1.2, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.1} side={THREE.DoubleSide} />
      </animated.mesh>
    </animated.group>
  );
}

/* ─── Floating particle decoration ───────────────────────────── */
function FloatingParticle({ emoji, className }: { emoji: string; className: string }) {
  return (
    <div className={`absolute select-none pointer-events-none animate-float-slow ${className}`}>
      <span className="text-2xl sm:text-3xl opacity-20">{emoji}</span>
    </div>
  );
}

/* ─── Shape info card ─────────────────────────────────────────── */
function ShapeInfoCard({
  emoji,
  name,
  features,
  color,
  isActive,
  onClick,
}: {
  emoji: string;
  name: string;
  features: string[];
  color: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 min-w-[140px] rounded-2xl border-2 p-3 sm:p-4 text-left transition-all duration-300 hover:scale-[1.03] active:scale-95"
      style={{
        borderColor: isActive ? color : "#e2e8f0",
        background: isActive
          ? `linear-gradient(135deg, ${color}15, ${color}08)`
          : "rgba(255,255,255,0.8)",
        boxShadow: isActive
          ? `0 4px 20px ${color}30`
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div className="text-3xl sm:text-4xl mb-2">{emoji}</div>
      <p className="text-sm sm:text-base font-extrabold" style={{ color }}>
        {name}
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {features.map((f) => (
          <li key={f} className="text-[11px] sm:text-xs text-slate-500 flex items-start gap-1">
            <span className="text-[10px] mt-0.5">✦</span>
            {f}
          </li>
        ))}
      </ul>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export default function Math2Quiz3DShapesPage() {
  const navigate = useNavigate();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sound = useGameSound();
  const [activeShape, setActiveShape] = useState<"cylinder" | "sphere" | null>(null);

  const defaultMsg = "Nhấn vào hình 3D để khám phá! Nhấn đúp để mở hình, giữ chuột phải để giữ mở.";
  const [message, setMessage] = useState(defaultMsg);

  const [isCylinderOpen, setIsCylinderOpen] = useState(false);
  const [isSphereOpen, setIsSphereOpen] = useState(false);
  const [isCylinderRightClickHolding, setIsCylinderRightClickHolding] = useState(false);
  const [isSphereRightClickHolding, setIsSphereRightClickHolding] = useState(false);

  const anyHolding = isCylinderRightClickHolding || isSphereRightClickHolding;

  // Speak message when it changes
  const speakMessage = useCallback(
    (text: string) => {
      if (!voiceEnabled) return;
      setIsSpeaking(true);
      sound.speak(text, () => setIsSpeaking(false));
    },
    [voiceEnabled, sound],
  );

  // Auto-speak on message change
  const prevMsgRef = useRef(message);
  useEffect(() => {
    if (message !== prevMsgRef.current) {
      prevMsgRef.current = message;
      speakMessage(message);
    }
  }, [message, speakMessage]);

  // Speak intro on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      speakMessage("Bài 46: Khối trụ và Khối cầu. " + defaultMsg);
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load voices
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", () => {
      window.speechSynthesis.getVoices();
    });
  }, []);

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

  function handleReset() {
    setIsCylinderOpen(false);
    setIsSphereOpen(false);
    setIsCylinderRightClickHolding(false);
    setIsSphereRightClickHolding(false);
    setActiveShape(null);
    setMessage(defaultMsg);
  }

  function toggleVoice() {
    if (voiceEnabled) {
      sound.stopVoice();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  }

  return (
    <div
      className="w-full min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #e0f2fe 0%, #f0f9ff 30%, #fdf4ff 60%, #ede9fe 100%)",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* ── Floating decorations ──────────────────────────────── */}
      <FloatingParticle emoji="🔵" className="top-[8%] left-[5%]" />
      <FloatingParticle emoji="🟠" className="top-[12%] right-[8%]" />
      <FloatingParticle emoji="⭐" className="bottom-[20%] left-[10%]" />
      <FloatingParticle emoji="✨" className="top-[30%] right-[4%]" />
      <FloatingParticle emoji="🫧" className="bottom-[10%] right-[15%]" />
      <FloatingParticle emoji="🎯" className="top-[50%] left-[3%]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-lg flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
            title="Đóng"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

          <div className="text-center flex-1 px-4">
            <h1 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 bg-clip-text text-transparent leading-tight">
              Bài 46: Khối trụ và Khối cầu
            </h1>
            <p className="text-[11px] sm:text-sm font-semibold text-slate-400 mt-0.5">
              Khám phá hình khối 3D • Lớp 2
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoice}
              title={voiceEnabled ? "Tắt giọng đọc" : "Bật giọng đọc"}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl backdrop-blur border shadow-lg flex items-center justify-center transition-all active:scale-90 ${
                voiceEnabled
                  ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                  : "bg-white/80 border-white/60 text-slate-400 hover:text-slate-600"
              } ${isSpeaking ? "animate-pulse" : ""}`}
            >
              {voiceEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
            </button>
          </div>
        </div>

        {/* ── 3D Canvas ────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl border-2"
          style={{
            borderColor: "rgba(148,163,184,0.2)",
            background: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
            height: "clamp(320px, 50vh, 520px)",
          }}
        >
          {/* Gradient overlay at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(transparent, rgba(186,230,253,0.5))" }}
          />

          {/* Shape labels */}
          <div className="absolute top-4 left-0 right-0 z-10 flex justify-center gap-8 sm:gap-20 pointer-events-none">
            <div
              className="px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #fb923c, #f97316)" }}
            >
              🟠 Khối trụ
            </div>
            <div
              className="px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold text-white shadow-lg"
              style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)" }}
            >
              🔵 Khối cầu
            </div>
          </div>

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
            <directionalLight position={[6, 8, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <directionalLight position={[-5, 4, -4]} intensity={0.45} color="#dbeafe" />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
              <planeGeometry args={[20, 20]} />
              <shadowMaterial opacity={0.15} />
            </mesh>

            <CylinderShape
              position={[-2.6, 0, 0]}
              color="#fb923c"
              isOpen={isCylinderOpen}
              isHolding={isCylinderRightClickHolding}
              onSingleClick={() => {
                setActiveShape("cylinder");
                setMessage("Khối trụ có 2 mặt đáy hình tròn và 1 mặt bên cong.");
              }}
              onDoubleClickOpen={() => {
                if (!isCylinderOpen) {
                  setIsCylinderOpen(true);
                  setActiveShape("cylinder");
                  setMessage("Wow! Khối trụ khi mở ra gồm: 2 hình tròn ở 2 đáy và 1 hình chữ nhật bao quanh thân.");
                }
              }}
              onRightHoldStart={() => {
                setIsCylinderRightClickHolding(true);
                setIsCylinderOpen(true);
                setActiveShape("cylinder");
                setMessage("Giữ chuột phải để quan sát khối trụ đang mở. Thả ra để gập lại nhé!");
              }}
            />

            <SphereShape
              position={[2.6, 0, 0]}
              color="#38bdf8"
              isOpen={isSphereOpen}
              isHolding={isSphereRightClickHolding}
              onSingleClick={() => {
                setActiveShape("sphere");
                setMessage("Khối cầu chỉ có 1 mặt cong, không có cạnh và đỉnh nào cả!");
              }}
              onDoubleClickOpen={() => {
                if (!isSphereOpen) {
                  setIsSphereOpen(true);
                  setActiveShape("sphere");
                  setMessage("Khối cầu tách thành 2 bán cầu. Mỗi bán cầu có 1 mặt phẳng và 1 mặt cong.");
                }
              }}
              onRightHoldStart={() => {
                setIsSphereRightClickHolding(true);
                setIsSphereOpen(true);
                setActiveShape("sphere");
                setMessage("Giữ chuột phải để quan sát khối cầu đang tách. Thả ra để ghép lại!");
              }}
            />

            <OrbitControls enableDamping dampingFactor={0.08} />
          </Canvas>
        </div>

        {/* ── Robot Guide (Tí Tách) ──────────────────────────────── */}
        <RobotGuide message={message} isSpeaking={isSpeaking} />

        <p className="mt-2 text-center text-[11px] font-semibold text-slate-400">
          {anyHolding
            ? "🖱️ Đang giữ chuột phải — thả ra để gập lại"
            : "💡 Mẹo: Nhấn 1 lần để xem thông tin, nhấn đúp để mở hình, giữ chuột phải để giữ mở"}
        </p>

        {/* ── Shape info cards ─────────────────────────────────── */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <ShapeInfoCard
            emoji="🧡"
            name="Khối trụ"
            features={[
              "Có 2 mặt đáy hình tròn",
              "Có 1 mặt bên cong (mặt xung quanh)",
              "Khi trải ra: 2 hình tròn + 1 hình chữ nhật",
              "Ví dụ: lon nước, ống tre",
            ]}
            color="#f97316"
            isActive={activeShape === "cylinder"}
            onClick={() => {
              setActiveShape("cylinder");
              const text = "Khối trụ có 2 mặt đáy hình tròn và 1 mặt bên cong bao xung quanh. Khi trải ra ta được 2 hình tròn và 1 hình chữ nhật.";
              setMessage(text);
            }}
          />
          <ShapeInfoCard
            emoji="💙"
            name="Khối cầu"
            features={[
              "Chỉ có 1 mặt cong duy nhất",
              "Không có cạnh, không có đỉnh",
              "Khi cắt đôi: 2 bán cầu",
              "Ví dụ: quả bóng, trái cam",
            ]}
            color="#0ea5e9"
            isActive={activeShape === "sphere"}
            onClick={() => {
              setActiveShape("sphere");
              const text = "Khối cầu chỉ có 1 mặt cong duy nhất, không có cạnh và không có đỉnh. Khi cắt đôi ta được 2 bán cầu.";
              setMessage(text);
            }}
          />
        </div>

        {/* ── Bottom actions ───────────────────────────────────── */}
        <div className="mt-4 mb-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 text-sm font-bold text-slate-600 shadow hover:bg-slate-50 hover:shadow-md active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            Đặt lại
          </button>
          <button
            type="button"
            onClick={() => {
              const text = "Bài 46: Khối trụ và Khối cầu. Khối trụ có 2 mặt tròn ở hai đầu và 1 mặt cong bao quanh. Khối cầu chỉ có 1 mặt cong duy nhất, không có cạnh và đỉnh.";
              setMessage(text);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-sm font-bold text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
            style={{ boxShadow: "0 4px 14px rgba(139,92,246,0.35)" }}
          >
            <Sparkles size={16} />
            Tóm tắt bài học
          </button>
          <button
            type="button"
            onClick={() => navigate("/student/game/math2-b46-warehouse")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
            style={{
              background: "linear-gradient(135deg, #fb923c, #f97316)",
              boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
            }}
          >
            <Gamepad2 size={16} />
            Chơi game: Nhà Kho Của Tí Tách
          </button>
        </div>
      </div>
    </div>
  );
}
