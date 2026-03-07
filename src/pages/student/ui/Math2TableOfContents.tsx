import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import robotMascot from "@/assets/robot-mascot.png";

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
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
        <div className="px-5 py-4 space-y-3">
          {/* Description */}
          <div className="flex items-start gap-2.5">
            <span className="text-2xl mt-0.5">{lesson.emoji}</span>
            <p className="text-gray-600 text-sm leading-relaxed">
              {lesson.description}
            </p>
          </div>

          {/* Info chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-bold">
              <Layers size={12} />
              Chủ đề {topic.topicNumber}
            </div>
            {hasGame && gameLabel && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                <Gamepad2 size={12} />
                {gameLabel}
              </div>
            )}
            {!hasGame && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-400 rounded-full text-xs font-bold">
                <Clock size={12} />
                Sắp có game
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold">
              <Target size={12} />
              Toán lớp 2
            </div>
          </div>

          {/* Learning objectives */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
              <Sparkles size={12} /> Mục tiêu bài học
            </p>
            <ul className="space-y-1">
              <li className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">✓</span>
                {lesson.description}
              </li>
              {hasGame && (
                <li className="text-xs text-gray-600 flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  Luyện tập qua trò chơi tương tác
                </li>
              )}
              <li className="text-xs text-gray-600 flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Kiểm tra kiến thức cuối bài
              </li>
            </ul>
          </div>

          {/* Plan requirement note */}
          {!isAccessible && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
              <Lock size={14} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                Bài này yêu cầu gói{" "}
                <span className="font-black">
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
                className="w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-base"
              >
                <Gamepad2 size={20} /> Chơi ngay!
              </button>
            ) : (
              <div className="w-full py-3 rounded-xl font-bold text-gray-400 bg-gray-100 text-center text-sm flex items-center justify-center gap-2">
                <BookOpen size={18} /> Sắp ra mắt
              </div>
            )
          ) : (
            <button
              onClick={onUpgrade}
              className="w-full py-3 rounded-xl font-black text-white bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-base"
            >
              <Crown size={20} /> Nâng cấp{" "}
              {PLAN_LABELS[lesson.requiredPlan].label}
            </button>
          )}
        </div>
      </div>
    </div>
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

// ── Layout constants ──────────────────────────────────────────────────────────

const NODE_W = 90; // node circle diameter
const NODE_GAP_X = 160; // horizontal gap between lesson nodes
const TOPIC_W = 220; // topic gate width
const WAVE_AMP = 80; // vertical wave amplitude (up/down)
const CANVAS_PAD_X = 120; // left/right padding
const CANVAS_H = 480; // total viewport height for the roadmap area
const CENTER_Y = CANVAS_H / 2; // center line

// Themed background colors for variety
const THEME_BGS = [
  "from-sky-200 via-sky-100 to-cyan-100",
  "from-emerald-200 via-green-100 to-teal-100",
  "from-amber-200 via-yellow-100 to-orange-100",
  "from-violet-200 via-purple-100 to-fuchsia-100",
  "from-pink-200 via-rose-100 to-red-100",
  "from-cyan-200 via-sky-100 to-blue-100",
  "from-lime-200 via-green-100 to-emerald-100",
];

// Scattered decoration emojis along the path
const SCATTER_DECO = [
  "⭐",
  "☁️",
  "🌈",
  "🎈",
  "🦋",
  "✨",
  "🌸",
  "🍀",
  "🌻",
  "💎",
  "🎀",
  "🍭",
];

// ── Build node positions ─────────────────────────────────────────────────────

interface NodePos {
  type: "topic" | "lesson";
  x: number;
  y: number;
  topic: Math2Topic;
  lesson?: Math2Lesson;
  globalIndex: number;
}

function buildNodePositions(): NodePos[] {
  const nodes: NodePos[] = [];
  let cursorX = CANVAS_PAD_X;
  let globalIdx = 0;

  MATH2_TOPICS.forEach((topic) => {
    // Topic gate node
    nodes.push({
      type: "topic",
      x: cursorX,
      y: CENTER_Y,
      topic,
      globalIndex: globalIdx++,
    });
    cursorX += TOPIC_W;

    // Lesson nodes in a sine wave pattern
    topic.lessons.forEach((lesson, li) => {
      const angle = (li / Math.max(topic.lessons.length - 1, 1)) * Math.PI;
      // Alternate: odd topics wave down first, even wave up first
      const dir = topic.topicNumber % 2 === 1 ? 1 : -1;
      const y = CENTER_Y + dir * Math.sin(angle) * WAVE_AMP;

      nodes.push({
        type: "lesson",
        x: cursorX,
        y,
        topic,
        lesson,
        globalIndex: globalIdx++,
      });
      cursorX += NODE_GAP_X;
    });

    // Gap between topics
    cursorX += 60;
  });

  return nodes;
}

// ── SVG path between nodes ───────────────────────────────────────────────────

function RoadmapPath({ nodes }: Readonly<{ nodes: NodePos[] }>) {
  if (nodes.length < 2) return null;

  // Build a smooth path through all node centers
  let d = `M ${nodes[0].x} ${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  return (
    <>
      {/* Shadow path */}
      <path
        d={d}
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Main path */}
      <path
        d={d}
        fill="none"
        stroke="url(#candyGrad)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Dashed overlay that marches */}
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="12 10"
        className=""
      />
      <defs>
        <linearGradient id="candyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="25%" stopColor="#f472b6" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="75%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </>
  );
}

// ── Scatter decorations ──────────────────────────────────────────────────────

// @ts-ignore: kept for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ScatterDecorations({ totalWidth }: Readonly<{ totalWidth: number }>) {
  // Place decorations pseudo-randomly
  const items: Array<{
    emoji: string;
    x: number;
    y: number;
    size: number;
    animClass: string;
  }> = [];
  const seed = 42;
  for (let i = 0; i < 30; i++) {
    const hash = ((seed + i * 137) % 293) / 293;
    const hash2 = ((seed + i * 251) % 197) / 197;
    items.push({
      emoji: SCATTER_DECO[i % SCATTER_DECO.length],
      x: hash * totalWidth,
      y: 20 + hash2 * (CANVAS_H - 40),
      size: 20 + (i % 3) * 10,
      animClass: ``,
    });
  }

  return (
    <>
      {items.map((item, i) => (
        <text
          key={i}
          x={item.x}
          y={item.y}
          fontSize={item.size}
          className={`${item.animClass} pointer-events-none select-none`}
          opacity={0.4}
        >
          {item.emoji}
        </text>
      ))}
    </>
  );
}

// ── Topic Gate ───────────────────────────────────────────────────────────────

function TopicGateNode({
  node,
  topicIndex,
}: Readonly<{
  node: NodePos;
  topicIndex: number;
}>) {
  const { topic, x, y } = node;
  const gateW = 210;
  const gateH = 110;
  const bgIdx = topicIndex % THEME_BGS.length;
  const _themeBg = THEME_BGS[bgIdx]; // just for reference
  void _themeBg;

  const textX = x - gateW / 2 + 14;

  return (
    <g className="" style={{}}>
      {/* Glow */}
      <ellipse
        cx={x}
        cy={y}
        rx={gateW / 2 + 10}
        ry={gateH / 2 + 10}
        className=""
        fill="url(#topicGlow)"
        opacity={0.3}
      />

      {/* Card background */}
      <rect
        x={x - gateW / 2}
        y={y - gateH / 2}
        width={gateW}
        height={gateH}
        rx={20}
        fill={`url(#topicFill${topicIndex % 7})`}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="3"
        className="drop-shadow-xl"
      />

      {/* "Chủ đề X" label */}
      <text
        x={textX}
        y={y - gateH / 2 + 22}
        fontSize={10}
        fill="rgba(255,255,255,0.85)"
        fontWeight="900"
        className="uppercase pointer-events-none select-none"
      >
        Chủ đề {topic.topicNumber}
      </text>

      {/* Topic title */}
      <foreignObject
        x={textX}
        y={y - gateH / 2 + 26}
        width={gateW - 28}
        height={58}
      >
        <p className="text-white font-black text-[13px] leading-[1.25] drop-shadow pointer-events-none">
          {topic.emoji} {topic.title}
        </p>
      </foreignObject>

      {/* Lesson count */}
      <text
        x={textX}
        y={y + gateH / 2 - 12}
        fontSize={10}
        fill="rgba(255,255,255,0.7)"
        fontWeight="700"
        className="pointer-events-none select-none"
      >
        {topic.lessons.length} bài học
      </text>
    </g>
  );
}

// ── Lesson Node ──────────────────────────────────────────────────────────────

function LessonCircleNode({
  node,
  isAccessible,
  onSelect,
}: Readonly<{
  node: NodePos;
  isAccessible: boolean;
  onSelect: (lesson: Math2Lesson) => void;
}>) {
  const lesson = node.lesson!;
  const { topic, x, y } = node;
  const isLocked = !isAccessible;
  const hasGame = lesson.gameType !== null;
  const isComingSoon = isAccessible && !hasGame;
  const r = NODE_W / 2;
  const fillIdx = MATH2_TOPICS.indexOf(topic) % 7;

  return (
    <g className="cursor-pointer" onClick={() => onSelect(lesson)}>
      {/* Drop shadow */}
      <ellipse
        cx={x}
        cy={y + 6}
        rx={r - 2}
        ry={r * 0.5}
        fill="rgba(0,0,0,0.15)"
      />

      {/* Main circle with 3D gradient */}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={
          isLocked
            ? "url(#lockedFill3D)"
            : isComingSoon
              ? "url(#comingSoonFill3D)"
              : `url(#sphere3D_${fillIdx})`
        }
        stroke={
          isLocked
            ? "#c8ccd0"
            : isComingSoon
              ? "#d1d9e0"
              : "rgba(255,255,255,0.6)"
        }
        strokeWidth="3"
        opacity={isComingSoon ? 0.7 : 1}
      />

      {/* Top highlight for 3D sphere effect */}
      <ellipse
        cx={x - 8}
        cy={y - 14}
        rx={18}
        ry={12}
        fill={
          isComingSoon ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.45)"
        }
        className="pointer-events-none"
      />

      {/* Bottom rim reflection */}
      <ellipse
        cx={x + 4}
        cy={y + 20}
        rx={16}
        ry={6}
        fill="rgba(255,255,255,0.15)"
        className="pointer-events-none"
      />

      {/* Big lesson number or lock */}
      {isLocked ? (
        <text
          x={x}
          y={y + 8}
          textAnchor="middle"
          fontSize={28}
          className="pointer-events-none select-none"
        >
          🔒
        </text>
      ) : (
        <text
          x={x}
          y={y + 14}
          textAnchor="middle"
          fontSize={34}
          fontWeight="900"
          fill={isComingSoon ? "rgba(255,255,255,0.7)" : "white"}
          className="pointer-events-none select-none"
          style={{ textShadow: "0 3px 6px rgba(0,0,0,0.3)" }}
        >
          {lesson.lessonNumber}
        </text>
      )}

      {/* 'Coming soon' label for accessible lessons without game */}
      {isComingSoon && (
        <>
          <rect
            x={x - 36}
            y={y + r + 4}
            width={72}
            height={18}
            rx={9}
            fill="#94a3b8"
          />
          <text
            x={x}
            y={y + r + 16}
            textAnchor="middle"
            fontSize={9}
            fontWeight="800"
            fill="white"
            className="pointer-events-none select-none"
          >
            Sắp ra mắt
          </text>
        </>
      )}

      {/* PRO badge for locked non-free lessons */}
      {lesson.requiredPlan !== "FREE" && isLocked && (
        <>
          <rect
            x={x - 24}
            y={y + r + 4}
            width={48}
            height={18}
            rx={9}
            fill="#fbbf24"
          />
          <text
            x={x}
            y={y + r + 16}
            textAnchor="middle"
            fontSize={9}
            fontWeight="900"
            fill="white"
            className="pointer-events-none select-none"
          >
            {PLAN_LABELS[lesson.requiredPlan].icon}{" "}
            {PLAN_LABELS[lesson.requiredPlan].label}
          </text>
        </>
      )}
    </g>
  );
}

// ── Gradient defs ────────────────────────────────────────────────────────────

function GradientDefs() {
  const fills = [
    ["#fb923c", "#fbbf24"], // orange
    ["#38bdf8", "#22d3ee"], // sky
    ["#34d399", "#6ee7b7"], // emerald
    ["#a78bfa", "#c084fc"], // violet
    ["#f472b6", "#fb7185"], // pink
    ["#facc15", "#fde047"], // amber
    ["#2dd4bf", "#5eead4"], // teal
  ];
  return (
    <defs>
      {/* Flat fills (for topic gates) */}
      {fills.map(([c1, c2], i) => (
        <linearGradient
          key={i}
          id={`topicFill${i}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      ))}

      {/* 3D sphere gradients for lesson nodes */}
      {fills.map(([c1, c2], i) => (
        <radialGradient
          key={`s3d_${i}`}
          id={`sphere3D_${i}`}
          cx="35%"
          cy="30%"
          r="65%"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="30%" stopColor={c2} />
          <stop offset="100%" stopColor={c1} />
        </radialGradient>
      ))}

      {/* Locked 3D fill */}
      <radialGradient id="lockedFill3D" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#f3f4f6" />
        <stop offset="50%" stopColor="#e5e7eb" />
        <stop offset="100%" stopColor="#c8ccd0" />
      </radialGradient>

      {/* Coming soon 3D fill – lighter, desaturated */}
      <radialGradient id="comingSoonFill3D" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
        <stop offset="30%" stopColor="#c4b5fd" />
        <stop offset="100%" stopColor="#a78bfa" />
      </radialGradient>

      <radialGradient id="topicGlow">
        <stop offset="0%" stopColor="rgba(251,191,36,0.6)" />
        <stop offset="100%" stopColor="rgba(251,191,36,0)" />
      </radialGradient>

      {/* Shadow filter for robot speech bubble */}
      <filter id="robotShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
      </filter>
    </defs>
  );
}

// ─── Main Roadmap Page ────────────────────────────────────────────────────────

export function Math2TableOfContents() {
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState<PlanType>(() =>
    getActiveChildPlan(),
  );
  const [upgradeLesson, setUpgradeLesson] = useState<Math2Lesson | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Math2Lesson | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag-to-scroll state
  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const pointerIdRef = useRef<number | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    didDrag.current = false;
    pointerIdRef.current = e.pointerId;
    dragStartX.current = e.clientX;
    scrollStartX.current = scrollRef.current?.scrollLeft ?? 0;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - dragStartX.current;
    if (Math.abs(dx) > 5) {
      if (!didDrag.current) {
        didDrag.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        (e.currentTarget as HTMLElement).style.cursor = "grabbing";
      }
    }
    if (didDrag.current) {
      scrollRef.current.scrollLeft = scrollStartX.current - dx;
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (didDrag.current) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      (e.currentTarget as HTMLElement).style.cursor = "grab";
    }
    isDragging.current = false;
    pointerIdRef.current = null;
  }, []);

  // Suppress click on children after a real drag
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (didDrag.current) {
      e.stopPropagation();
      didDrag.current = false;
    }
  }, []);

  useEffect(() => {
    const refresh = () => setUserPlan(getActiveChildPlan());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const handleSelect = (lesson: Math2Lesson) => {
    setSelectedLesson(lesson);
  };

  const handlePlay = (lesson: Math2Lesson) => {
    setSelectedLesson(null);
    if (lesson.gameType === "number-sequence-chart") {
      navigate(`/student/game/number-sequence`);
    }
  };

  // Build positions
  const nodes = buildNodePositions();
  const totalWidth = (nodes.at(-1)?.x ?? 0) + CANVAS_PAD_X * 2;

  // Find current progress: first accessible lesson that has a game
  const currentLessonNode = useMemo(() => {
    return (
      nodes.find(
        (n) =>
          n.type === "lesson" &&
          n.lesson?.gameType !== null &&
          canAccessLesson(n.lesson!, userPlan),
      ) ?? null
    );
  }, [nodes, userPlan]);

  // Check scroll bounds
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  const scrollBy = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  // Track topic index for each node
  let topicIdx = -1;

  return (
    <div className="relative h-[calc(100vh-5rem)] bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-50 overflow-hidden flex flex-col">
      {/* Top bar with title */}
      <div className="relative z-20 flex items-center px-4 pt-3 pb-1 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📐</span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-800 leading-tight">
              Hành trình Toán 2
            </h1>
            <p className="text-gray-400 text-xs font-bold">
              Kéo sang trái-phải để khám phá! 👈👉
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal scrollable roadmap */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden roadmap-scroll-container select-none"
        style={{ cursor: "grab" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        <svg
          width={totalWidth}
          height={CANVAS_H}
          viewBox={`0 0 ${totalWidth} ${CANVAS_H}`}
          className="block"
        >
          <GradientDefs />
          <RoadmapPath nodes={nodes} />

          {nodes.map((node) => {
            if (node.type === "topic") {
              topicIdx++;
              return (
                <TopicGateNode
                  key={node.topic.id}
                  node={node}
                  topicIndex={topicIdx}
                />
              );
            }
            return (
              <LessonCircleNode
                key={node.lesson!.id}
                node={node}
                isAccessible={canAccessLesson(node.lesson!, userPlan)}
                onSelect={handleSelect}
              />
            );
          })}

          {/* Trophy at end */}
          <g>
            <circle
              cx={totalWidth - CANVAS_PAD_X}
              cy={CENTER_Y}
              r={50}
              fill="url(#topicFill5)"
              stroke="white"
              strokeWidth="5"
            />
            <text
              x={totalWidth - CANVAS_PAD_X}
              y={CENTER_Y + 14}
              textAnchor="middle"
              fontSize={44}
              className="pointer-events-none select-none"
            >
              🏆
            </text>
          </g>

          {/* Robot mascot at current lesson */}
          {currentLessonNode && (
            <g className="pointer-events-none">
              {/* Speech bubble */}
              <rect
                x={currentLessonNode.x - 42}
                y={currentLessonNode.y - NODE_W / 2 - 82}
                width={84}
                height={28}
                rx={14}
                fill="white"
                stroke="#38bdf8"
                strokeWidth="2"
                filter="url(#robotShadow)"
              />
              <text
                x={currentLessonNode.x}
                y={currentLessonNode.y - NODE_W / 2 - 63}
                textAnchor="middle"
                fontSize={11}
                fontWeight="800"
                fill="#0ea5e9"
                className="select-none"
              >
                Bắt đầu nào! 🌟
              </text>
              {/* Bubble pointer */}
              <polygon
                points={`${currentLessonNode.x - 6},${currentLessonNode.y - NODE_W / 2 - 54} ${currentLessonNode.x + 6},${currentLessonNode.y - NODE_W / 2 - 54} ${currentLessonNode.x},${currentLessonNode.y - NODE_W / 2 - 46}`}
                fill="white"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Robot image */}
              <image
                href={robotMascot}
                x={currentLessonNode.x - 30}
                y={currentLessonNode.y + NODE_W / 2 + 4}
                width={60}
                height={60}
                className="select-none"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Navigation arrows – centered on sides */}
      <button
        onClick={() => scrollBy(-1)}
        className={`absolute left-3 top-1/2 -translate-y-1/2 z-20
                    w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center
                    transition-all hover:scale-110 active:scale-95 backdrop-blur-sm
                    ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ChevronLeft size={26} className="text-amber-500" />
      </button>
      <button
        onClick={() => scrollBy(1)}
        className={`absolute right-3 top-1/2 -translate-y-1/2 z-20
                    w-12 h-12 rounded-full bg-white/90 shadow-xl flex items-center justify-center
                    transition-all hover:scale-110 active:scale-95 backdrop-blur-sm
                    ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <ChevronRight size={26} className="text-amber-500" />
      </button>

      {/* Fade edges */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-sky-100 to-transparent z-10 pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-sky-100 to-transparent z-10 pointer-events-none" />
      )}

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
