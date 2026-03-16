import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Text,
  Float,
  MeshWobbleMaterial,
  Stars,
  Html,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Lock,
  Crown,
  X,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  BookOpen,
  Target,
  Layers,
  Sparkles,
  Clock,
} from "lucide-react";
import {
  MATH2_TOPICS,
  type Math2Lesson,
  type Math2Topic,
  getActiveChildPlan,
  canAccessLesson,
  PLAN_LABELS,
} from "@/shared/api/math2Data";
import type { PlanType } from "@/shared/api/dashboardMockData";
import ReactDOM from "react-dom";
import { PreRollAdModal } from "@/shared/ui/PreRollAdModal";

// ── Lesson Info Popup ─────────────────────────────────────────────────────────

function LessonPopup({
  lesson,
  topic,
  isAccessible,
  onClose,
  onPlay,
  onUpgrade,
}: Readonly<{
  lesson: Math2Lesson;
  topic: Math2Topic;
  isAccessible: boolean;
  onClose: () => void;
  onPlay: () => void;
  onUpgrade: () => void;
}>) {
  const hasGame = lesson.gameType !== null;
  const lessonIdx = topic.lessons.findIndex((l) => l.id === lesson.id) + 1;
  const totalInTopic = topic.lessons.length;

  // Game type label
  const gameLabel =
    lesson.gameType === "number-sequence-chart" ? "Biểu đồ dãy số" : null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-[370px] max-w-[92vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div
          className="px-5 pt-5 pb-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${isAccessible ? "#f59e0b, #f97316" : "#9ca3af, #6b7280"})`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">{topic.emoji}</span>
            <p className="text-xs font-bold opacity-80">{topic.title}</p>
          </div>
          <h2 className="text-xl font-black">Bài {lesson.lessonNumber}</h2>
          <h3 className="text-sm font-bold opacity-90 leading-snug">
            {lesson.title}
          </h3>
          {/* Progress in topic */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full"
                style={{ width: `${(lessonIdx / totalInTopic) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold opacity-70">
              {lessonIdx}/{totalInTopic}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Description */}
          <div className="flex items-start gap-3">
            <span className="text-3xl mt-0.5 drop-shadow-sm">{lesson.emoji}</span>
            <p className="text-gray-600 text-[15px] leading-relaxed font-medium">
              {lesson.description}
            </p>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold shadow-sm border border-sky-100">
              <Layers size={14} />
              <span>Chủ đề {topic.topicNumber}</span>
            </div>
            {hasGame && gameLabel && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold shadow-sm border border-emerald-100">
                <Gamepad2 size={14} />
                {gameLabel}
              </div>
            )}
            {!hasGame && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-bold shadow-sm border border-gray-200">
                <Clock size={14} />
                Sắp ra mắt
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold shadow-sm border border-amber-100">
              <Target size={14} />
              Toán lớp 2
            </div>
          </div>

          {/* Learning objectives */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-4 border border-gray-100/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-[13px] font-black text-slate-700 mb-2.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" /> Mục tiêu bài học
            </p>
            <ul className="space-y-2">
              <li className="text-[13px] text-slate-600 flex items-start gap-2 font-medium">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {lesson.description}
              </li>
              {hasGame && (
                <li className="text-[13px] text-slate-600 flex items-start gap-2 font-medium">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  Luyện tập qua trò chơi tương tác thú vị
                </li>
              )}
              <li className="text-[13px] text-slate-600 flex items-start gap-2 font-medium">
                <span className="text-emerald-500 mt-0.5">✓</span>
                Kiểm tra kiến thức cuối bài
              </li>
            </ul>
          </div>

          {/* Plan requirement note */}
          {!isAccessible && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60 shadow-inner">
              <Lock size={16} className="text-amber-600 shrink-0" />
              <p className="text-[13px] text-amber-800 font-medium">
                Bài này yêu cầu gói{" "}
                <span className="font-black text-amber-900 bg-amber-200/40 px-1.5 py-0.5 rounded-md">
                  {PLAN_LABELS[lesson.requiredPlan].icon}{" "}
                  {PLAN_LABELS[lesson.requiredPlan].label}
                </span>{" "}
                để mở khóa
              </p>
            </div>
          )}

          {/* Action */}
          {isAccessible ? (
            hasGame ? (
              <button
                onClick={onPlay}
                className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_25px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 text-[17px] border border-emerald-300/50"
              >
                <Gamepad2 size={22} /> Chơi ngay!
              </button>
            ) : (
              <div className="w-full py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 text-center text-[15px] flex items-center justify-center gap-2 border border-gray-200 shadow-inner">
                <BookOpen size={20} /> Nội dung sắp ra mắt
              </div>
            )
          ) : (
            <button
              onClick={onUpgrade}
              className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_8px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_12px_25px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 text-[17px] border border-amber-300/50"
            >
              <Crown size={22} /> Nâng cấp{" "}
              {PLAN_LABELS[lesson.requiredPlan].label}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Upgrade Modal ─────────────────────────────────────────────────────────────

function UpgradeModal({
  requiredPlan,
  onClose,
  onUpgrade,
}: Readonly<{
  requiredPlan: PlanType;
  onClose: () => void;
  onUpgrade: () => void;
}>) {
  const planInfo = PLAN_LABELS[requiredPlan];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-kids-bounce-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
        <div className="text-center">
          <div className="text-6xl mb-3">🔒</div>
          <h2 className="text-xl font-extrabold text-gray-800 mb-2">
            Bài học yêu cầu gói {planInfo.label}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Nâng cấp tài khoản để mở khóa bài học này và nhiều nội dung hấp dẫn
            khác!
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-3">
            {(["FREE", "PRO", "VIP"] as PlanType[]).map((plan) => {
              const info = PLAN_LABELS[plan];
              const isRequired = plan === requiredPlan;
              return (
                <div
                  key={plan}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                    isRequired
                      ? "bg-white border-2 border-amber-300 shadow-sm scale-[1.02]"
                      : "opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.icon}</span>
                    <span className={`font-extrabold text-sm ${info.color}`}>
                      {info.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    {plan === "FREE"
                      ? "0₫"
                      : plan === "PRO"
                        ? "55,000₫/tháng"
                        : "89,000₫/tháng"}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={onUpgrade}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white
                       font-extrabold text-lg rounded-2xl shadow-lg shadow-orange-200
                       hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Crown size={20} />
            Nâng cấp ngay
          </button>
          <button
            onClick={onClose}
            className="mt-3 text-sm text-gray-400 font-bold hover:text-gray-600 transition-colors"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Color palette ─────────────────────────────────────────────────────────────

const TOPIC_COLORS = [
  "#f59e0b",
  "#38bdf8",
  "#34d399",
  "#a78bfa",
  "#f472b6",
  "#facc15",
  "#ef4444",
  "#2dd4bf",
  "#818cf8",
  "#fb923c",
  "#4ade80",
  "#e879f9",
];

function getTopicColor(idx: number) {
  return TOPIC_COLORS[idx % TOPIC_COLORS.length];
}

// ── Node data ─────────────────────────────────────────────────────────────────

interface Node3D {
  type: "topic" | "lesson";
  position: [number, number, number];
  topic: Math2Topic;
  topicIndex: number;
  lesson?: Math2Lesson;
  globalIndex: number;
}

function buildNodes3D(): Node3D[] {
  const nodes: Node3D[] = [];
  let cx = 0;
  let gi = 0;

  MATH2_TOPICS.forEach((topic, ti) => {
    nodes.push({
      type: "topic",
      position: [cx, 0, 0],
      topic,
      topicIndex: ti,
      globalIndex: gi++,
    });
    cx += 4;

    topic.lessons.forEach((lesson, li) => {
      const angle = (li / Math.max(topic.lessons.length - 1, 1)) * Math.PI;
      const dir = ti % 2 === 0 ? 1 : -1;
      const y = dir * Math.sin(angle) * 1.8;
      const z = Math.cos(angle) * 0.4;
      nodes.push({
        type: "lesson",
        position: [cx, y, z],
        topic,
        topicIndex: ti,
        lesson,
        globalIndex: gi++,
      });
      cx += 3;
    });
    cx += 2;
  });

  return nodes;
}

// ── Animated path ─────────────────────────────────────────────────────────────

function JourneyPath({ nodes }: { nodes: Node3D[] }) {
  const tubeRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const pts = nodes.map((n) => new THREE.Vector3(...n.position));
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);
    return new THREE.TubeGeometry(curve, nodes.length * 20, 0.07, 8, false);
  }, [nodes]);

  useFrame(({ clock }) => {
    if (!tubeRef.current) return;
    const mat = tubeRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.4 + Math.sin(clock.elapsedTime * 2.5) * 0.2;
  });

  return (
    <mesh ref={tubeRef} geometry={geometry}>
      <meshStandardMaterial
        color="#fcd34d"
        emissive="#f59e0b"
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.4}
        transparent
        opacity={0.9}
        envMapIntensity={1}
      />
    </mesh>
  );
}

// ── Particles along path ──────────────────────────────────────────────────────

function PathParticles({ nodes }: { nodes: Node3D[] }) {
  const ref = useRef<THREE.Points>(null);
  const count = 50;

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      nodes.map((n) => new THREE.Vector3(...n.position)),
      false,
      "catmullrom",
      0.5,
    );
  }, [nodes]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const p = curve.getPoint(i / count);
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, [curve]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const base = (i / count + t * 0.04) % 1;
      const p = curve.getPoint(base);
      attr.setXYZ(
        i,
        p.x + Math.sin(t * 2 + i) * 0.08,
        p.y + Math.cos(t * 3 + i) * 0.12 + 0.25,
        p.z + Math.sin(t + i * 0.5) * 0.08,
      );
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color="#fde68a"
        size={0.12}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ── Topic Island ──────────────────────────────────────────────────────────────

function TopicIsland({ node }: { node: Node3D }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = getTopicColor(node.topicIndex);
  
  // Lighter, glowier version of the color
  const glowColor = new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.3).getStyle();
  const glassColor = new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.8).getStyle();

  useFrame(({ clock }) => {
    if (meshRef.current)
      meshRef.current.rotation.y =
        Math.sin(clock.elapsedTime * 0.3 + node.topicIndex) * 0.1;
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.2}
      floatIntensity={0.4}
      position={node.position}
    >
      <group ref={meshRef}>
        {/* Base crystal/island */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[1.6, 2.0, 0.6, 16]} />
          <meshPhysicalMaterial 
            color={color} 
            roughness={0.2} 
            metalness={0.1}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </mesh>
        
        {/* Top glossy surface */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[1.55, 1.6, 0.15, 16]} />
          <meshPhysicalMaterial
            color={glassColor}
            transmission={0.6}
            opacity={0.9}
            transparent
            roughness={0.1}
            metalness={0.1}
            thickness={2}
            ior={1.5}
          />
        </mesh>

        {/* Outer aura/glow ring */}
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.7, 2.1, 32]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Secondary inner aura */}
        <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.65, 1.75, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Label */}
        <Html
          position={[0, 1.1, 0]}
          center
          distanceFactor={12}
          style={{ pointerEvents: "none" }}
        >
          <div
            className="backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-[3px] whitespace-nowrap transform transition-transform"
            style={{ 
              borderColor: 'rgba(255,255,255,0.8)',
              background: `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))`,
              boxShadow: `0 10px 25px ${color}40, inset 0 2px 0 rgba(255,255,255,1)`
            }}
          >
            <p
              className="text-[10px] font-black uppercase tracking-wider mb-0.5"
              style={{ color }}
            >
              Chủ đề {node.topic.topicNumber}
            </p>
            <p className="text-[14px] font-black text-slate-800 leading-tight flex items-center gap-1.5 drop-shadow-sm">
              <span className="text-xl">{node.topic.emoji}</span> 
              <span>{node.topic.title}</span>
            </p>
            <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-wide">
              {node.topic.lessons.length} bài học
            </p>
            
            {/* Little pointer triangle */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 rotate-45 border-b-[3px] border-r-[3px]"
                 style={{ borderColor: 'rgba(255,255,255,0.8)' }} />
          </div>
        </Html>
      </group>
    </Float>
  );
}

// ── Lesson Sphere ─────────────────────────────────────────────────────────────

function LessonSphere({
  node,
  isAccessible,
  isCurrentLesson,
  onSelect,
}: {
  node: Node3D;
  isAccessible: boolean;
  isCurrentLesson: boolean;
  onSelect: (lesson: Math2Lesson) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const lesson = node.lesson!;
  const color = getTopicColor(node.topicIndex);
  const isLocked = !isAccessible;
  const hasGame = lesson.gameType !== null;
  const isComingSoon = isAccessible && !hasGame;

  const baseColor = isLocked
    ? "#9ca3af"
    : isComingSoon
      ? new THREE.Color(color).lerp(new THREE.Color("#9ca3af"), 0.4).getStyle()
      : color;
  const emissiveColor = isLocked ? "#6b7280" : color;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    meshRef.current.position.y =
      node.position[1] + Math.sin(t * 1.5 + node.globalIndex * 0.7) * 0.12;
    const s = hovered ? 1.1 : isCurrentLesson ? 1.04 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={node.position}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(lesson);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[isCurrentLesson ? 0.6 : 0.5, 32, 32]} />
        <meshPhysicalMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? 0.8 : isCurrentLesson ? 0.6 : 0.2}
          roughness={0.1}
          metalness={0.2}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transparent
          opacity={isComingSoon ? 0.6 : 1}
        />
        
        {/* Inner glow for accessible lessons */}
        {!isLocked && (
          <mesh scale={1.05}>
            <sphereGeometry args={[isCurrentLesson ? 0.6 : 0.5, 32, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={hovered ? 0.4 : isCurrentLesson ? 0.3 : 0.1}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </mesh>

      {/* Lesson number / lock */}
      <Text
        position={[node.position[0], node.position[1], node.position[2] + (isCurrentLesson ? 0.62 : 0.52)]}
        fontSize={isCurrentLesson ? 0.4 : 0.32}
        fontWeight={900}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor={isLocked ? "#4b5563" : new THREE.Color(color).lerp(new THREE.Color("#000"), 0.4).getStyle()}
      >
        {isLocked ? "🔒" : String(lesson.lessonNumber)}
      </Text>

      {/* Coming soon / plan badge */}
      {(isComingSoon || (isLocked && lesson.requiredPlan !== "FREE")) && (
        <Html
          position={[
            node.position[0],
            node.position[1] - 0.85,
            node.position[2],
          ]}
          center
          distanceFactor={10}
          style={{ pointerEvents: "none" }}
        >
          <div
            className={`px-2 py-0.5 rounded-full text-[8px] font-black text-white whitespace-nowrap ${isComingSoon ? "bg-gray-400/90" : "bg-amber-400"}`}
          >
            {isComingSoon
              ? "Sắp ra mắt"
              : `${PLAN_LABELS[lesson.requiredPlan].icon} ${PLAN_LABELS[lesson.requiredPlan].label}`}
          </div>
        </Html>
      )}

      {/* Current lesson indicator */}
      {isCurrentLesson && (
        <Html
          position={[
            node.position[0],
            node.position[1] + 0.9,
            node.position[2],
          ]}
          center
          distanceFactor={10}
          style={{ pointerEvents: "none" }}
        >
          <div className="animate-bounce bg-white/95 backdrop-blur-md rounded-full px-3 py-1 shadow-[0_8px_20px_rgba(56,189,248,0.4)] border-[3px] border-sky-300 whitespace-nowrap">
            <span className="text-[12px] font-black text-sky-500 whitespace-nowrap drop-shadow-sm">
              Bắt đầu nào! 🌟
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Trophy at end ─────────────────────────────────────────────────────────────

function TrophyEnd({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.5;
  });
  return (
    <Float
      speed={2}
      rotationIntensity={0.4}
      floatIntensity={0.5}
      position={position}
    >
      <mesh ref={ref}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <MeshWobbleMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.5}
          roughness={0.15}
          metalness={0.8}
          factor={0.3}
          speed={1.5}
        />
      </mesh>
      <Text
        position={[0, 0, 0.85]}
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
      >
        🏆
      </Text>
    </Float>
  );
}

// ── Floating decorations ──────────────────────────────────────────────────────

function FloatingDecorations({ totalWidth }: { totalWidth: number }) {
  const items = useMemo(() => {
    const emojis = ["⭐", "☁️", "🌈", "🎈", "🦋", "✨", "🌸", "🍀", "💎", "🎀"];
    const arr: {
      emoji: string;
      pos: [number, number, number];
      size: number;
    }[] = [];
    for (let i = 0; i < 14; i++) {
      const h1 = ((42 + i * 137) % 293) / 293;
      const h2 = ((42 + i * 251) % 197) / 197;
      arr.push({
        emoji: emojis[i % emojis.length],
        pos: [h1 * totalWidth, 2.5 + h2 * 3.5, -3 - (i % 5) * 0.8],
        size: 0.14 + (i % 4) * 0.03,
      });
    }
    return arr;
  }, [totalWidth]);

  return (
    <>
      {items.map((d, i) => (
        <Float key={i} speed={0.8 + i * 0.08} floatIntensity={0.4 + i * 0.03}>
          <Text
            position={d.pos}
            fontSize={d.size}
            anchorX="center"
            anchorY="middle"
          >
            {d.emoji}
          </Text>
        </Float>
      ))}
    </>
  );
}

// ── Camera animator ───────────────────────────────────────────────────────────

function CameraAnimator({
  nodes,
  currentIndex,
  controlsRef,
}: {
  nodes: Node3D[];
  currentIndex: number;
  controlsRef: React.RefObject<any>;
}) {
  useEffect(() => {
    const target = nodes[currentIndex];
    const controls = controlsRef.current;
    if (!target || !controls) return;

    const startTarget = controls.target.clone();
    const startPos = controls.object.position.clone();
    const endTarget = new THREE.Vector3(target.position[0], 0, 0);
    const endPos = new THREE.Vector3(target.position[0], 3, 14);
    let t = 0;

    const step = () => {
      t = Math.min(t + 0.025, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      controls.target.lerpVectors(startTarget, endTarget, ease);
      controls.object.position.lerpVectors(startPos, endPos, ease);
      controls.update();
      if (t < 1) requestAnimationFrame(step);
    };
    step();
  }, [currentIndex, nodes, controlsRef]);

  return null;
}

// ── Scene environment ─────────────────────────────────────────────────────────

function SceneEnvironment() {
  return (
    <>
      <color attach="background" args={["#0c1033"]} />
      <fog attach="fog" args={["#0c1033", 20, 80]} />
      
      <ambientLight intensity={0.6} color="#e0e7ff" />
      <directionalLight 
        position={[15, 20, 10]} 
        intensity={1.2} 
        color="#ffffff" 
        castShadow 
      />
      <directionalLight 
        position={[-15, -5, -10]} 
        intensity={0.4} 
        color="#818cf8" 
      />
      
      <pointLight position={[-10, 8, 5]} intensity={0.8} color="#38bdf8" />
      <pointLight position={[10, 6, -5]} intensity={0.6} color="#f472b6" />
      <pointLight position={[0, -5, 10]} intensity={0.5} color="#8b5cf6" />
      
      <hemisphereLight args={["#e0e7ff", "#0f172a", 0.6]} />
      
      <Stars
        radius={70}
        depth={40}
        count={1200}
        factor={3}
        saturation={0.8}
        fade
        speed={0.4}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[1000, 100]} />
        <meshStandardMaterial
          color="#0a0d26"
          transparent
          opacity={0.8}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
    </>
  );
}

// ── Journey scene content ─────────────────────────────────────────────────────

function JourneyScene({
  nodes,
  userPlan,
  currentLessonIndex,
  cameraFocusIndex,
  onSelectLesson,
  controlsRef,
}: {
  nodes: Node3D[];
  userPlan: PlanType;
  currentLessonIndex: number;
  cameraFocusIndex: number;
  onSelectLesson: (lesson: Math2Lesson) => void;
  controlsRef: React.RefObject<any>;
}) {
  const totalWidth =
    nodes.length > 0 ? nodes[nodes.length - 1].position[0] + 5 : 50;

  return (
    <>
      <SceneEnvironment />
      <CameraAnimator
        nodes={nodes}
        currentIndex={cameraFocusIndex}
        controlsRef={controlsRef}
      />
      <JourneyPath nodes={nodes} />
      <PathParticles nodes={nodes} />
      <FloatingDecorations totalWidth={totalWidth} />
      {nodes.map((node) =>
        node.type === "topic" ? (
          <TopicIsland key={node.topic.id} node={node} />
        ) : (
          <LessonSphere
            key={node.lesson!.id}
            node={node}
            isAccessible={canAccessLesson(node.lesson!, userPlan)}
            isCurrentLesson={node.globalIndex === currentLessonIndex}
            onSelect={onSelectLesson}
          />
        ),
      )}
      {nodes.length > 0 && (
        <TrophyEnd position={[nodes[nodes.length - 1].position[0] + 4, 0, 0]} />
      )}
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 6}
        maxDistance={22}
        minDistance={6}
        panSpeed={0.5}
        zoomSpeed={0.5}
      />
    </>
  );
}

// ── Loading screen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-400 border-t-amber-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          ✨
        </div>
      </div>
      <p className="mt-4 text-sm font-black text-indigo-300 animate-pulse">
        Đang tải thế giới 3D...
      </p>
    </div>
  );
}

// ── Navigation HUD ────────────────────────────────────────────────────────────

function NavigationHUD({
  currentTopicIndex,
  totalTopics,
  onPrev,
  onNext,
  topicName,
}: {
  currentTopicIndex: number;
  totalTopics: number;
  onPrev: () => void;
  onNext: () => void;
  topicName: string;
}) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
      <button
        onClick={onPrev}
        disabled={currentTopicIndex <= 0}
        className="w-12 h-12 rounded-full bg-white/10 border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.2)] flex items-center justify-center hover:bg-white/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none backdrop-blur-xl group"
      >
        <ChevronLeft size={26} className="text-white group-hover:text-amber-300 transition-colors" />
      </button>
      <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-full px-6 py-2.5 shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
        <p className="text-sm font-black text-white text-center whitespace-nowrap drop-shadow-md">
          📐 {topicName}
        </p>
        <div className="flex items-center gap-2 mt-1.5 justify-center">
          {Array.from({ length: totalTopics }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentTopicIndex 
                  ? "bg-amber-400 scale-125 shadow-[0_0_8px_rgba(251,191,36,0.8)]" 
                  : i < currentTopicIndex 
                    ? "bg-emerald-400 opacity-80" 
                    : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
      <button
        onClick={onNext}
        disabled={currentTopicIndex >= totalTopics - 1}
        className="w-12 h-12 rounded-full bg-white/10 border border-white/20 shadow-[0_4px_15px_rgba(0,0,0,0.2)] flex items-center justify-center hover:bg-white/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none backdrop-blur-xl group"
      >
        <ChevronRight size={26} className="text-white group-hover:text-amber-300 transition-colors" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Math2TableOfContents() {
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState<PlanType>(() => getActiveChildPlan());
  const [upgradeLesson, setUpgradeLesson] = useState<Math2Lesson | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Math2Lesson | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [canvasKey, setCanvasKey] = useState(0);
  const [webglFailed, setWebglFailed] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingLessonRoute, setPendingLessonRoute] = useState<string | null>(null);
  const controlsRef = useRef<any>(null);
  const webglLossCountRef = useRef(0);

  const nodes = useMemo(() => buildNodes3D(), []);

  const currentLessonIndex = useMemo(() => {
    const node = nodes.find(
      (n) =>
        n.type === "lesson" &&
        n.lesson?.gameType !== null &&
        canAccessLesson(n.lesson!, userPlan),
    );
    return node?.globalIndex ?? -1;
  }, [nodes, userPlan]);

  const topicStartIndices = useMemo(() => {
    return nodes.filter((n) => n.type === "topic").map((n) => nodes.indexOf(n));
  }, [nodes]);

  const cameraFocusIndex = topicStartIndices[currentTopicIndex] ?? 0;

  useEffect(() => {
    const refresh = () => setUserPlan(getActiveChildPlan());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")
        setCurrentTopicIndex((p) => Math.max(0, p - 1));
      else if (e.key === "ArrowRight")
        setCurrentTopicIndex((p) => Math.min(MATH2_TOPICS.length - 1, p + 1));
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  const handleSelectLesson = useCallback(
    (lesson: Math2Lesson) => setSelectedLesson(lesson),
    [],
  );

  const handlePlay = useCallback(
    (lesson: Math2Lesson) => {
      setSelectedLesson(null);
      let targetRoute = "";
      if (lesson.gameType === "number-sequence-chart") {
        targetRoute = "/student/game/number-sequence";
      } else if (lesson.gameType === "math2-quiz-3d") {
        targetRoute = "/student/game/math2-quiz-3d";
      }
      
      if (targetRoute) {
        if (userPlan === "FREE") {
          setPendingLessonRoute(targetRoute);
          setShowAd(true);
        } else {
          navigate(targetRoute);
        }
      }
    },
    [userPlan, navigate],
  );

  const handleAdComplete = useCallback(() => {
    setShowAd(false);
    if (pendingLessonRoute) {
      navigate(pendingLessonRoute);
      setPendingLessonRoute(null);
    }
  }, [pendingLessonRoute, navigate]);

  const handleCanvasCreated = useCallback(
    ({ gl }: { gl: THREE.WebGLRenderer }) => {
      gl.setClearColor("#0f1847", 1);
      const canvas = gl.domElement;
      const onContextLost = (event: Event) => {
        event.preventDefault();
        webglLossCountRef.current += 1;

        if (webglLossCountRef.current >= 3) {
          setWebglFailed(true);
          return;
        }

        setCanvasKey((k) => k + 1);
      };

      canvas.addEventListener("webglcontextlost", onContextLost, {
        passive: false,
      });
    },
    [],
  );

  return (
    <div className="relative h-[calc(100vh-5rem)] overflow-hidden bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900">
      <PreRollAdModal 
        isOpen={showAd} 
        onClose={() => setShowAd(false)} 
        onAdComplete={handleAdComplete} 
      />
      
      {/* Title overlay */}
      <div className="absolute top-3 left-4 z-30 flex items-center gap-2">
        <span className="text-3xl">📐</span>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-lg">
            Hành trình Toán 2
          </h1>
          <p className="text-sky-200 text-xs font-bold">
            Khám phá thế giới toán học 3D! 🚀
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-3 right-4 z-30">
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/20">
          <p className="text-[10px] text-white/80 font-bold">
            🖱️ Kéo để xoay • Scroll để zoom • Click bài học
          </p>
        </div>
      </div>

      {/* 3D Canvas */}
      {webglFailed ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <div className="max-w-md rounded-2xl border border-white/20 bg-slate-900/65 p-4 text-center backdrop-blur-sm">
            <p className="text-sm font-bold text-white">
              Thiết bị đang gặp lỗi hiển thị 3D tạm thời.
            </p>
            <button
              onClick={() => {
                webglLossCountRef.current = 0;
                setWebglFailed(false);
                setCanvasKey((k) => k + 1);
              }}
              className="mt-3 rounded-xl bg-sky-500 px-4 py-2 text-xs font-black text-white hover:bg-sky-400"
            >
              Tải lại bản đồ
            </button>
          </div>
        </div>
      ) : (
        <Suspense fallback={<LoadingScreen />}>
          <Canvas
            key={canvasKey}
            camera={{ position: [0, 3, 14], fov: 55, near: 0.1, far: 200 }}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 10,
            }}
            dpr={[1, 1.2]}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            onCreated={handleCanvasCreated}
          >
            <JourneyScene
              nodes={nodes}
              userPlan={userPlan}
              currentLessonIndex={currentLessonIndex}
              cameraFocusIndex={cameraFocusIndex}
              onSelectLesson={handleSelectLesson}
              controlsRef={controlsRef}
            />
          </Canvas>
        </Suspense>
      )}

      {/* Navigation HUD */}
      <NavigationHUD
        currentTopicIndex={currentTopicIndex}
        totalTopics={MATH2_TOPICS.length}
        onPrev={() => setCurrentTopicIndex((p) => Math.max(0, p - 1))}
        onNext={() =>
          setCurrentTopicIndex((p) => Math.min(MATH2_TOPICS.length - 1, p + 1))
        }
        topicName={MATH2_TOPICS[currentTopicIndex]?.title ?? ""}
      />

      {/* Lesson Info Popup */}
      {selectedLesson &&
        (() => {
          const topic = MATH2_TOPICS.find((t) =>
            t.lessons.some((l) => l.id === selectedLesson.id),
          )!;
          const accessible = canAccessLesson(selectedLesson, userPlan);
          return (
            <LessonPopup
              lesson={selectedLesson}
              topic={topic}
              isAccessible={accessible}
              onClose={() => setSelectedLesson(null)}
              onPlay={() => handlePlay(selectedLesson)}
              onUpgrade={() => {
                setSelectedLesson(null);
                setUpgradeLesson(selectedLesson);
              }}
            />
          );
        })()}

      {/* Upgrade Modal */}
      {upgradeLesson && (
        <UpgradeModal
          requiredPlan={upgradeLesson.requiredPlan}
          onClose={() => setUpgradeLesson(null)}
          onUpgrade={() => {
            setUpgradeLesson(null);
            navigate("/dashboard/subscription");
          }}
        />
      )}
    </div>
  );
}
