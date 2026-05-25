import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import * as lessonService from "@/shared/api/services/lessonService";
import * as leaderboardService from "@/shared/api/services/leaderboardService";
import { useGameSound } from "@/shared/lib/useGameSound";
import { ParentGate } from "@/shared/ui/ParentGate";
import Scene3DBackground from "./Scene3DBackground";

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

const LETTERS = ["A", "B", "C", "D"];
const CONFETTI_EMOJI = ["⭐", "🎉", "✨", "💫", "🌟", "🎊", "🥳", "🏆", "💖", "🦄"];

// ── World Themes ──────────────────────────────────────────────────────────────
const WORLD_THEMES = [
  {
    name: "Đại Dương",
    icon: "🌊",
    gradient: "linear-gradient(135deg, #06b6d4, #0284c7, #0369a1)",
    cardColors: [
      { bg: "linear-gradient(135deg, #ff6b6b, #ee5a24)", border: "#c0392b" },
      { bg: "linear-gradient(135deg, #54a0ff, #2e86de)", border: "#1e3799" },
      { bg: "linear-gradient(135deg, #feca57, #ff9f43)", border: "#c7911c" },
      { bg: "linear-gradient(135deg, #00d2d3, #01a3a4)", border: "#017a7b" },
    ],
    decorations: ["🐠", "🐙", "🦀", "🐚", "🐳", "🦑", "🐡", "🦈"],
  },
  {
    name: "Rừng Xanh",
    icon: "🌲",
    gradient: "linear-gradient(135deg, #2ed573, #26ae60, #1e8449)",
    cardColors: [
      { bg: "linear-gradient(135deg, #fc5c65, #eb3b5a)", border: "#b71540" },
      { bg: "linear-gradient(135deg, #a55eea, #8854d0)", border: "#5f27cd" },
      { bg: "linear-gradient(135deg, #fed330, #f7b731)", border: "#c49a1c" },
      { bg: "linear-gradient(135deg, #2bcbba, #0fb9b1)", border: "#0a8c86" },
    ],
    decorations: ["🌳", "🦊", "🐿️", "🍄", "🦎", "🐛", "🌻", "🐝"],
  },
  {
    name: "Vũ Trụ",
    icon: "🚀",
    gradient: "linear-gradient(135deg, #7c5ce7, #6c5ce7, #4834d4)",
    cardColors: [
      { bg: "linear-gradient(135deg, #fd79a8, #e84393)", border: "#b71c5e" },
      { bg: "linear-gradient(135deg, #74b9ff, #0984e3)", border: "#0652a3" },
      { bg: "linear-gradient(135deg, #fdcb6e, #e17055)", border: "#b5533e" },
      { bg: "linear-gradient(135deg, #55efc4, #00b894)", border: "#00806a" },
    ],
    decorations: ["🪐", "🌕", "⭐", "🛸", "🌟", "☄️", "🔭", "🌌"],
  },
  {
    name: "Kẹo Ngọt",
    icon: "🍬",
    gradient: "linear-gradient(135deg, #fd79a8, #e84393, #c44569)",
    cardColors: [
      { bg: "linear-gradient(135deg, #ff6348, #ff4757)", border: "#c0392b" },
      { bg: "linear-gradient(135deg, #cd84f1, #9b59b6)", border: "#6c3483" },
      { bg: "linear-gradient(135deg, #f8a5c2, #f78fb3)", border: "#c06c84" },
      { bg: "linear-gradient(135deg, #7bed9f, #2ed573)", border: "#1e8449" },
    ],
    decorations: ["🍭", "🧁", "🎂", "🍩", "🍬", "🍪", "🍰", "🧃"],
  },
  {
    name: "Hoàng Hôn",
    icon: "🌅",
    gradient: "linear-gradient(135deg, #f39c12, #e67e22, #d35400)",
    cardColors: [
      { bg: "linear-gradient(135deg, #e74c3c, #c0392b)", border: "#922b21" },
      { bg: "linear-gradient(135deg, #8e44ad, #6c3483)", border: "#4a235a" },
      { bg: "linear-gradient(135deg, #f1c40f, #f39c12)", border: "#b7950b" },
      { bg: "linear-gradient(135deg, #1abc9c, #16a085)", border: "#0e6655" },
    ],
    decorations: ["🌴", "🦜", "🌺", "🌈", "🦩", "🌻", "🐬", "🏖️"],
  },
];

type AnswerState = "idle" | "correct" | "wrong";
type CubePhase = "idle" | "out" | "in";

// ══════════════════════════════════════════════════════════════════════════════
// TTS VOICE HELPER
// Removed local speakText in favor of useGameSound().speak() from useVoiceManager

// ══════════════════════════════════════════════════════════════════════════════
// INLINE STYLES (all 3D keyframes embedded)
// ══════════════════════════════════════════════════════════════════════════════

const INLINE_STYLES = `
/* ── 3D Cube transition ── */
@keyframes cube-rotate-out {
  0%   { transform: perspective(1200px) rotateX(0deg) scale(1); opacity: 1; }
  100% { transform: perspective(1200px) rotateX(-95deg) scale(0.85); opacity: 0; }
}
@keyframes cube-rotate-in {
  0%   { transform: perspective(1200px) rotateX(95deg) scale(0.85); opacity: 0; }
  100% { transform: perspective(1200px) rotateX(0deg) scale(1); opacity: 1; }
}

/* ── 3D Tilt shine ── */
@keyframes tilt-idle-float {
  0%, 100% { transform: perspective(600px) rotateX(0) rotateY(0) translateY(0); }
  50%      { transform: perspective(600px) rotateX(2deg) rotateY(-1deg) translateY(-4px); }
}

/* ── Card fly-in from different directions ── */
@keyframes card-fly-0 { 0% { opacity:0; transform: perspective(600px) translateX(-60px) rotateY(25deg) scale(0.8); } 100% { opacity:1; transform: perspective(600px) translateX(0) rotateY(0) scale(1); } }
@keyframes card-fly-1 { 0% { opacity:0; transform: perspective(600px) translateX(60px) rotateY(-25deg) scale(0.8); } 100% { opacity:1; transform: perspective(600px) translateX(0) rotateY(0) scale(1); } }
@keyframes card-fly-2 { 0% { opacity:0; transform: perspective(600px) translateY(50px) rotateX(-20deg) scale(0.8); } 100% { opacity:1; transform: perspective(600px) translateY(0) rotateX(0) scale(1); } }
@keyframes card-fly-3 { 0% { opacity:0; transform: perspective(600px) translateY(50px) rotateX(20deg) scale(0.8); } 100% { opacity:1; transform: perspective(600px) translateY(0) rotateX(0) scale(1); } }

/* ── Mascot ── */
@keyframes mascot-bob {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  33%      { transform: translateY(-8px) rotate(2deg); }
  66%      { transform: translateY(-4px) rotate(-1deg); }
}
@keyframes mascot-celebrate {
  0%   { transform: scale(1) rotate(0); }
  20%  { transform: scale(1.35) rotate(-12deg); }
  40%  { transform: scale(1.35) rotate(12deg); }
  60%  { transform: scale(1.25) rotate(-6deg); }
  80%  { transform: scale(1.15) rotate(6deg); }
  100% { transform: scale(1) rotate(0); }
}

/* ── Decorations ── */
@keyframes deco-float {
  0%, 100% { transform: translateY(0) rotate(var(--deco-rot, 0deg)) scale(var(--deco-s, 1)); }
  33%      { transform: translateY(-20px) rotate(calc(var(--deco-rot, 0deg) + 8deg)) scale(calc(var(--deco-s, 1) * 1.05)); }
  66%      { transform: translateY(-10px) rotate(calc(var(--deco-rot, 0deg) - 5deg)) scale(var(--deco-s, 1)); }
}

/* ── Feedback slide ── */
@keyframes feedback-slide-up {
  0%   { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* ── Candy stripe march ── */
@keyframes stripe-march {
  0%   { transform: translateX(0); }
  100% { transform: translateX(16px); }
}

/* ── Heartbeat ── */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.25); }
}

/* ── Badge pop ── */
@keyframes badge-number-pop {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

/* ── Question number bounce ── */
@keyframes q-number-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* ── Hide scrollbar ── */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* ── Custom UI Enhancements ── */
.answer-btn {
  position: relative !important;
}
.answer-btn:not(:disabled):hover {
  transform: translateY(-4px) scale(1.02) !important;
  box-shadow: 0 15px 35px rgba(0,0,0,0.3), inset 0 3px 0 rgba(255,255,255,0.6), inset 0 -4px 0 rgba(0,0,0,0.2) !important;
}
.answer-btn:not(:disabled):active {
  transform: translateY(2px) scale(0.98) !important;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.1) !important;
}

.premium-btn {
  transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
.premium-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.8) !important;
  background: linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2)) !important;
}
.premium-btn:not(:disabled):active {
  transform: translateY(2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5) !important;
}
`;

// ══════════════════════════════════════════════════════════════════════════════
// CONFETTI BURST
// ══════════════════════════════════════════════════════════════════════════════

function ConfettiBurst({ show }: Readonly<{ show: boolean }>) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => ({
        emoji: CONFETTI_EMOJI[i % CONFETTI_EMOJI.length],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.3}s`,
        dur: `${0.8 + Math.random() * 1}s`,
        size: `${1.2 + Math.random() * 1.8}rem`,
      })),
    [],
  );
  if (!show) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 50, borderRadius: "2rem" }}>
      {pieces.map((p, i) => (
        <span key={i} style={{ position: "absolute", top: "-10%", left: p.left, fontSize: p.size, animation: `confetti-drop ${p.dur} ${p.delay} ease-in forwards` }}>
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROBOT CHARACTER
// ══════════════════════════════════════════════════════════════════════════════

function RobotCharacter({
  message,
  size = "md",
  isSpeaking = false
}: Readonly<{
  message: string;
  size?: "sm" | "md" | "lg";
  isSpeaking?: boolean;
}>) {
  const sizeMap = { sm: "w-16 h-16", md: "w-20 h-20", lg: "w-28 h-28" }; // Slightly scaled down for Quiz page

  return (
    <div className="flex items-end gap-2 mb-3">
      {/* Robot body (Video) */}
      <div className={`${sizeMap[size]} relative flex-shrink-0 transition-transform ${isSpeaking ? "scale-105" : ""}`}>
        <video
          className="w-full h-full object-cover rounded-2xl border-2 border-indigo-200 shadow-lg bg-indigo-50"
          src="/videos/VideoRobotHoatDong.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        />
      </div>

      {/* Speech bubble */}
      {message && (
        <div 
          className="relative bg-white rounded-2xl px-5 py-3 max-w-[260px] animate-fade-in-up"
          style={{
            boxShadow: isSpeaking ? "0 6px 0 #c7d2fe, 0 12px 25px rgba(99,102,241,0.3)" : "0 6px 0 #e5e7eb, 0 12px 20px rgba(0,0,0,0.12)",
            border: "3px solid white",
            background: isSpeaking ? "linear-gradient(135deg, #ffffff, #f5f3ff)" : "white",
            transform: isSpeaking ? "scale(1.03)" : "scale(1)",
            transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)"
          }}
        >
          <div className="absolute -left-2.5 bottom-4 w-5 h-5 bg-white rotate-45" style={{ 
            boxShadow: "-3px 3px 0px rgba(0,0,0,0.05)",
            background: isSpeaking ? "#fcfbff" : "white",
            borderBottom: "none", borderLeft: "none"
          }} />
          <div className="text-[0.95rem] font-black text-indigo-800 relative z-10 leading-snug">
            {isSpeaking ? (
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: "0s" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
                </div>
              </div>
            ) : (
              message
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// 3D TILT CARD WRAPPER
// ══════════════════════════════════════════════════════════════════════════════

function TiltCard({ children, disabled }: Readonly<{ children: React.ReactNode; disabled: boolean }>) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (y - 0.5) * -18;
    const tiltY = (x - 0.5) * 18;
    el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.06, 1.06, 1.06)`;
    // Move shine
    const shine = el.querySelector("[data-shine]") as HTMLElement;
    if (shine) shine.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.35), transparent 55%)`;
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(600px) rotateX(0) rotateY(0) scale3d(1,1,1)";
    const shine = el.querySelector("[data-shine]") as HTMLElement;
    if (shine) shine.style.background = "none";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d", transition: "transform 0.12s ease-out", willChange: "transform" }}
    >
      {/* Shine overlay */}
      <div data-shine="" style={{ position: "absolute", inset: 0, borderRadius: "1.5rem", pointerEvents: "none", zIndex: 10 }} />
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ANSWER CARD
// ══════════════════════════════════════════════════════════════════════════════

function AnswerCard({
  text, index, selected, answerState, correctIndex, disabled, onClick, themeColor,
}: Readonly<{
  text: string; index: number; selected: boolean; answerState: AnswerState;
  correctIndex: number; disabled: boolean; onClick: () => void; themeColor: { bg: string; border: string };
}>) {
  const isCorrectCard = index === correctIndex;
  const isWrongSelected = selected && answerState === "wrong";

  let bg = themeColor.bg;
  let borderColor = themeColor.border;
  let opacity = 1;
  let borderW = "10px";
  let badge = LETTERS[index];
  let transform = "";
  let cursor = "pointer";

  if (disabled) {
    if (isCorrectCard) {
      bg = "linear-gradient(135deg, #00b894, #00cec9)"; borderColor = "#00806a"; badge = "✅"; transform = "scale(1.05)";
    } else if (isWrongSelected) {
      bg = "linear-gradient(135deg, #ff6b6b, #ee5a24)"; borderColor = "#c0392b"; badge = "❌"; opacity = 0.85; borderW = "5px"; transform = "translateY(4px)";
    } else {
      opacity = 0.35; borderW = "5px"; transform = "translateY(4px)"; cursor = "not-allowed";
    }
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`answer-btn group ${isWrongSelected ? "animate-shake" : ""}`}
      style={{
        display: "flex", alignItems: "center", gap: "18px", width: "100%", padding: "22px 26px",
        borderRadius: "1.8rem", border: "none", borderBottom: `${borderW} solid ${borderColor}`,
        background: bg, color: "white", fontSize: "1.5rem", fontWeight: 900, textAlign: "left" as const,
        opacity, transform, cursor, transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: !disabled ? `0 10px 30px rgba(0,0,0,0.3), inset 0 3px 0 rgba(255,255,255,0.4), inset 0 -3px 0 rgba(0,0,0,0.15)` : "none",
        minHeight: "88px", position: "relative" as const, overflow: "hidden",
        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 100%)", pointerEvents: "none" }} />
      {!disabled && <div className="hover-glow" style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 70%)", opacity: 0, pointerEvents: "none", zIndex: 1 }} />}
      {/* Badge */}
      <div
        style={{
          width: "50px", height: "50px", borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))",
          border: "3px solid rgba(255,255,255,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem",
          flexShrink: 0, backdropFilter: "blur(8px)", fontWeight: 900,
          boxShadow: "0 4px 10px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.8)",
          position: "relative", zIndex: 2
        }}
      >
        {badge}
      </div>
      <span style={{ flex: 1, lineHeight: 1.3, wordBreak: "break-word" as const, position: "relative", zIndex: 2 }}>{text}</span>
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CANDY PROGRESS BAR
// ══════════════════════════════════════════════════════════════════════════════

function CandyProgress({ current, total, correctCount }: Readonly<{ current: number; total: number; correctCount: number }>) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ width: "100%", maxWidth: "22rem" }}>
      <div style={{ width: "100%", height: "26px", borderRadius: "999px", background: "rgba(0,0,0,0.15)", border: "3px solid rgba(255,255,255,0.4)", overflow: "hidden", boxShadow: "inset 0 4px 8px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.1)" }}>
        <div style={{ width: `${Math.max(pct, 4)}%`, height: "100%", borderRadius: "999px", background: "linear-gradient(90deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)", backgroundImage: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)", position: "relative", overflow: "hidden", boxShadow: "0 0 15px rgba(253,160,133,0.6)" }}>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)", animation: "stripe-march 1.5s linear infinite" }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(180deg, rgba(255,255,255,0.6), transparent)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "25%", background: "linear-gradient(0deg, rgba(0,0,0,0.15), transparent)" }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", marginTop: "6px" }}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} style={{ fontSize: i < current ? "0.85rem" : "0.6rem", transition: "all 0.3s", opacity: i < current ? 1 : 0.3, transform: i < current ? "scale(1.1)" : "scale(0.8)", filter: i < current && i >= correctCount ? "grayscale(100%)" : "none" }}>
            {i < current ? (i < correctCount ? "⭐" : "❌") : "⬜"}
          </span>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export function Math2QuizPage() {
  const navigate = useNavigate();
  const sound = useGameSound();
  const [questions, setQuestions] = useState<lessonService.QuizQuestion[]>([]);

  useEffect(() => {
    lessonService.getQuiz("math2-b2").then(setQuestions).catch(console.error);
  }, []);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [showExplanation, setShowExplanation] = useState(false);
  const [cubePhase, setCubePhase] = useState<CubePhase>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Layout Controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showPinGate, setShowPinGate] = useState(false);
  const [pinActionTarget, setPinActionTarget] = useState<"menu" | "fullscreen" | null>(null);

  const gameContainerRef = useRef<HTMLDivElement>(null);
  const hasSpokenRef = useRef(false);
  const wasFullscreenRef = useRef(false);

  const themeIdx = currentIdx % WORLD_THEMES.length;
  const theme = WORLD_THEMES[themeIdx];
  const q = questions[currentIdx] || null;

  // Stable decoration positions per theme
  const allDecoPositions = useMemo(
    () =>
      WORLD_THEMES.map((t) =>
        t.decorations.map((sym, i) => ({
          sym,
          top: `${8 + ((i * 13.7) % 75)}%`,
          left: `${3 + ((i * 17.3) % 88)}%`,
          size: `${1.8 + (i % 3) * 0.6}rem`,
          delay: `${i * 0.35}s`,
          duration: `${9 + (i % 4) * 3}s`,
          rot: `${(i * 29) % 60 - 30}deg`,
          scale: 0.8 + (i % 4) * 0.12,
        })),
      ),
    [],
  );

  // ── Fullscreen ──────────────────────────────────────────────────────────────
  const toggleFullScreen = async () => {
    sound.click();
    if (!document.fullscreenElement) {
      try {
        await gameContainerRef.current?.requestFullscreen();
        if ("keyboard" in navigator && (navigator as any).keyboard?.lock) {
          try { await (navigator as any).keyboard.lock(["Escape"]); } catch {}
        }
      } catch (err) { console.error("Fullscreen error:", err); }
    } else {
      setPinActionTarget("fullscreen");
      setShowPinGate(true);
    }
  };

  useEffect(() => {
    const onFSChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      
      if (!fs && wasFullscreenRef.current && pinActionTarget === null) {
        setPinActionTarget("fullscreen");
        setShowPinGate(true);
        gameContainerRef.current?.requestFullscreen().catch(console.error);
      }
      
      wasFullscreenRef.current = fs;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && document.fullscreenElement) { e.preventDefault(); e.stopPropagation(); }
    };
    document.addEventListener("fullscreenchange", onFSChange);
    window.addEventListener("keydown", onKey, { capture: true });
    return () => {
      document.removeEventListener("fullscreenchange", onFSChange);
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, [pinActionTarget]);

  const handleBackToMenu = () => { sound.click(); setPinActionTarget("menu"); setShowPinGate(true); };

  const handlePinSuccess = () => {
    setShowPinGate(false);
    if (pinActionTarget === "menu") {
      if (document.fullscreenElement) {
        if ("keyboard" in navigator && (navigator as any).keyboard?.unlock) (navigator as any).keyboard.unlock();
        document.exitFullscreen().catch(console.error);
      }
      window.speechSynthesis.cancel();
      navigate("/student");
    } else if (pinActionTarget === "fullscreen") {
      if (document.fullscreenElement) {
        if ("keyboard" in navigator && (navigator as any).keyboard?.unlock) (navigator as any).keyboard.unlock();
        document.exitFullscreen().catch(console.error);
      }
    }
    setPinActionTarget(null);
  };

  const handlePinCancel = () => {
    setShowPinGate(false);
    if (pinActionTarget === "fullscreen" && !document.fullscreenElement) gameContainerRef.current?.requestFullscreen().catch(console.error);
    setPinActionTarget(null);
  };

  // ── Question lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    setSelectedOption(null);
    setAnswerState("idle");
    setShowConfetti(false);
    setShowExplanation(false);
    hasSpokenRef.current = false;
    
    const timer = setTimeout(() => { handleReadQuestion(); }, 500);
    return () => clearTimeout(timer);
  }, [currentIdx]);

  const handleReadQuestion = () => {
    if (isMuted) return;
    sound.click();
    const txt = `Câu ${currentIdx + 1}. ${q.question} ${q.options.map((o, i) => `Đáp án ${LETTERS[i]}: ${o}`).join(". ")}`;
    
    setIsSpeaking(true);
    sound.speak(txt, () => setIsSpeaking(false));
  };

  // ── Answer selection ────────────────────────────────────────────────────────
  const handleSelect = (idx: number) => {
    if (answerState !== "idle" || animating) return;
    setSelectedOption(idx);
    setAnsweredCount((c) => c + 1);
    const isCorrect = idx === q.correctIndex;
    setAnswerState(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      if (!isMuted) sound.correct();
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } else {
      if (!isMuted) sound.wrong();
      setHearts((h) => Math.max(0, h - 1));
    }
    window.speechSynthesis.cancel();
    if (!isMuted) {
      setIsSpeaking(true);
      setTimeout(() => { 
        setShowExplanation(true); 
        sound.speak(isCorrect ? `Yeahhh! Bé giỏi quá! ${q.explanation}` : `Úi cha! Sai một tẹo rùi! ${q.explanation}`, () => setIsSpeaking(false)); 
      }, 800);
    } else {
      setTimeout(() => setShowExplanation(true), 800);
    }
  };

  // ── Next question with 3D cube transition ───────────────────────────────────
  const handleNext = () => {
    if (animating) return;
    if (!isMuted) sound.click();
    setAnimating(true);
    window.speechSynthesis.cancel();

    // Phase 1: Cube rotates out
    setCubePhase("out");

    setTimeout(() => {
      // Swap question
      if (currentIdx + 1 >= questions.length) {
        if (!isMuted) sound.victoryVoice();
        const childId = sessionStorage.getItem("vio_active_child_id") || localStorage.getItem("vio_active_child_id");
        if (childId) {
          leaderboardService.submitAttempt(childId, "math2-b2", correctCount, questions.length).catch(console.error);
        }
        navigate("/student/result/math2-b2", { state: { correct: correctCount, total: questions.length } });
        return;
      }
      setCurrentIdx((i) => i + 1);

      // Phase 2: Cube rotates in
      setCubePhase("in");

      setTimeout(() => {
        setCubePhase("idle");
        setAnimating(false);
      }, 500);
    }, 500);
  };

  // Cleanup
  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  // ── Cube animation style ────────────────────────────────────────────────────
  const cubeStyle: React.CSSProperties = cubePhase === "out"
    ? { animation: "cube-rotate-out 0.45s cubic-bezier(0.55,0,1,0.45) forwards" }
    : cubePhase === "in"
      ? { animation: "cube-rotate-in 0.45s cubic-bezier(0,0.55,0.45,1) forwards" }
      : {};

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  if (questions.length === 0 || !q) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        Đang tải bài tập...
      </div>
    );
  }

  return (
    <div
      ref={gameContainerRef}
      style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", color: "white", fontFamily: "'Be Vietnam Pro', 'Fredoka', sans-serif" }}
    >
      <style>{INLINE_STYLES}</style>

      {/* ═══ BACKGROUND LAYERS (cross-fade between themes) ═══ */}
      {WORLD_THEMES.map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute", inset: 0, background: t.gradient, opacity: themeIdx === i ? 1 : 0,
            transition: "opacity 0.8s ease", pointerEvents: "none", zIndex: 0,
          }}
        />
      ))}

      {/* Soft light overlay */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)", pointerEvents: "none", zIndex: 1 }} />

      {/* ═══ 3D BACKGROUND SCENE ═══ */}
      <Scene3DBackground themeIdx={themeIdx} answerState={answerState} />

      {/* ═══ FLOATING DECORATIONS (animate per theme) ═══ */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
        {allDecoPositions[themeIdx].map((d, i) => (
          <span
            key={`${themeIdx}-${i}`}
            style={{
              position: "absolute",
              top: d.top, left: d.left, fontSize: d.size, opacity: 0.3,
              animation: `deco-float ${d.duration} ${d.delay} ease-in-out infinite`,
              ["--deco-rot" as any]: d.rot,
              ["--deco-s" as any]: d.scale,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            }}
          >
            {d.sym}
          </span>
        ))}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh", maxWidth: "56rem", margin: "0 auto", width: "100%" }}>

        {/* ── TOP BAR ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 12px", flexShrink: 0, gap: "10px" }}>
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="premium-btn" onClick={handleBackToMenu} style={{ height: "52px", padding: "0 22px", borderRadius: "2.5rem", background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.1))", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.5)", borderBottom: "4px solid rgba(255,255,255,0.4)", color: "white", fontWeight: 900, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
              📚 Mục lục
            </button>
            <button className="premium-btn" onClick={() => { sound.click(); if (!isMuted) window.speechSynthesis.cancel(); setIsMuted(!isMuted); }} style={{ width: "52px", height: "52px", borderRadius: "2.5rem", background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.1))", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.5)", borderBottom: "4px solid rgba(255,255,255,0.4)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
          </div>

          {/* Middle: Progress */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "0 8px" }} className="hidden sm:flex">
            <CandyProgress current={answeredCount} total={questions.length} correctCount={correctCount} />
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", gap: "4px", background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.1))", backdropFilter: "blur(16px)", padding: "10px 18px", borderRadius: "2.5rem", border: "1px solid rgba(255,255,255,0.5)", borderBottom: "4px solid rgba(255,255,255,0.4)", boxShadow: "0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} style={{ fontSize: "1.35rem", opacity: i < hearts ? 1 : 0.3, filter: i < hearts ? "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" : "grayscale(1)", animation: i < hearts ? `heartbeat 1.5s ease-in-out ${i * 0.2}s infinite` : "none" }}>❤️</span>
              ))}
            </div>
            <button className="premium-btn" onClick={toggleFullScreen} style={{ width: "52px", height: "52px", borderRadius: "2.5rem", background: "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.1))", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.5)", borderBottom: "4px solid rgba(255,255,255,0.4)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
              {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="hide-scrollbar" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 20px 40px", overflowY: "auto" }}>

          {/* World theme badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", marginTop: "4px" }}>
            <span style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "999px", padding: "8px 24px", fontSize: "0.85rem", fontWeight: 900, letterSpacing: "0.05em", textTransform: "uppercase" as const, boxShadow: "0 6px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
              {theme.icon} {theme.name} · Bài 2: Tia số
            </span>
          </div>

          {/* Question number badge */}
          <div style={{ animation: "badge-number-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both", marginBottom: "16px" }}>
            <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))", backdropFilter: "blur(12px)", border: "3px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", fontWeight: 900, boxShadow: "0 8px 0 rgba(0,0,0,0.15), 0 12px 30px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.8)", animation: "q-number-bounce 2.5s ease-in-out infinite", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
              {currentIdx + 1}
            </div>
          </div>

          <p style={{ fontSize: "0.8rem", fontWeight: 800, opacity: 0.6, marginBottom: "10px" }}>
            Câu {currentIdx + 1} / {questions.length}
          </p>

          {/* Robot Character Video */}
          <RobotCharacter 
            size="md"
            message={
              answerState === "correct" ? "Tuyệt vời! Giỏi quá! 🌟" 
              : answerState === "wrong" ? "Cố lên nào bạn ơi!" 
              : "Chọn đáp án đúng nào! 🎯"
            } 
            isSpeaking={isSpeaking} 
          />

          {/* ── 3D CUBE QUESTION BOX ── */}
          <div style={{ perspective: "1200px", width: "100%", maxWidth: "48rem", marginBottom: "24px" }}>
            <div style={{ transformStyle: "preserve-3d" as const, ...cubeStyle }}>
              <div
                style={{
                  width: "100%", background: "rgba(255, 255, 255, 0.96)", borderRadius: "2.5rem",
                  border: "4px solid white", overflow: "hidden",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 14px 0 rgba(255,255,255,0.4), 0 24px 50px rgba(0,0,0,0.2), inset 0 4px 0 rgba(255,255,255,1)", position: "relative",
                  backfaceVisibility: "hidden" as const,
                }}
              >
                <ConfettiBurst show={showConfetti} />

                <div style={{ position: "relative", zIndex: 10, padding: "28px 32px", minHeight: "170px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                  {/* Visual hint */}
                  {q.visual && (
                    <div style={{
                      background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 50%, #fce7f3 100%)",
                      border: "4px solid #c7d2fe",
                      borderRadius: "100px",
                      padding: "16px 40px",
                      boxShadow: "0 6px 0 #a5b4fc, inset 0 3px 10px rgba(255,255,255,0.8)",
                      position: "relative",
                      transform: "translateY(-10px)",
                      zIndex: 20
                    }}>
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: "100px",
                        border: "2px dashed rgba(255,255,255,0.6)", pointerEvents: "none"
                      }} />
                      <p style={{
                        fontSize: "2.2rem", fontWeight: 900, color: "#4f46e5",
                        letterSpacing: "0.15em", fontFamily: "'Fredoka', sans-serif",
                        textShadow: "0 2px 4px rgba(79,70,229,0.2)"
                      }}>
                        {q.visual}
                      </p>
                    </div>
                  )}

                  {/* Question text + speak btn */}
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", width: "100%" }}>
                    <button
                      onClick={handleReadQuestion}
                      disabled={isMuted}
                      style={{
                        flexShrink: 0, width: "64px", height: "64px", borderRadius: "50%", border: "none",
                        background: isMuted ? "#f3f4f6" : "linear-gradient(135deg, #a78bfa, #818cf8)",
                        color: isMuted ? "#9ca3af" : "white", display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: isMuted ? "not-allowed" : "pointer",
                        boxShadow: isMuted ? "none" : "0 6px 0 #6d28d9, 0 8px 15px rgba(109,40,217,0.3)",
                        transition: "transform 0.1s",
                      }}
                      onMouseDown={(e) => { if (!isMuted) e.currentTarget.style.transform = "translateY(4px)"; }}
                      onMouseUp={(e) => { if (!isMuted) e.currentTarget.style.transform = "translateY(0)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                    </button>
                    <h2 style={{ flex: 1, fontSize: "1.85rem", fontWeight: 900, color: "#1e1b4b", lineHeight: 1.4, textAlign: "center" }}>{q.question}</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3D TILT ANSWER CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", width: "100%", maxWidth: "52rem", marginBottom: "100px" }}>
            {q.options.map((opt, idx) => (
              <div
                key={`${q.id}-${idx}`}
                style={{ animation: cubePhase === "idle" ? `card-fly-${idx % 4} 0.5s ${0.08 * idx}s cubic-bezier(0.34,1.56,0.64,1) both` : "none" }}
              >
                <TiltCard disabled={answerState !== "idle"}>
                  <AnswerCard
                    text={opt}
                    index={idx}
                    selected={selectedOption === idx}
                    answerState={answerState}
                    correctIndex={q.correctIndex}
                    disabled={answerState !== "idle"}
                    onClick={() => handleSelect(idx)}
                    themeColor={theme.cardColors[idx % 4]}
                  />
                </TiltCard>
              </div>
            ))}
          </div>

          {/* ── FEEDBACK OVERLAY ── */}
          {showExplanation && (
            <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, animation: "feedback-slide-up 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <div
                style={{
                  padding: "32px 36px 40px",
                  borderTop: `6px solid ${answerState === "correct" ? "rgba(16,185,129,0.8)" : "rgba(239,68,68,0.8)"}`,
                  borderRadius: "3rem 3rem 0 0",
                  background: answerState === "correct" ? "rgba(209, 250, 229, 0.95)" : "rgba(254, 226, 226, 0.95)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 -16px 50px rgba(0,0,0,0.15), inset 0 4px 0 rgba(255,255,255,0.8)",
                }}
              >
                <div style={{ maxWidth: "56rem", margin: "0 auto", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" as const, justifyContent: "space-between" }}>
                  {/* Mascot */}
                  <div className="hidden sm:flex" style={{ width: "90px", height: "90px", borderRadius: "2.5rem", background: "white", border: "4px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 0 rgba(0,0,0,0.08), 0 15px 30px rgba(0,0,0,0.1), inset 0 4px 0 rgba(255,255,255,1)", flexShrink: 0, animation: answerState === "correct" ? "mascot-celebrate 0.7s ease" : "shake 0.5s ease" }}>
                    <span style={{ fontSize: "3rem" }}>{answerState === "correct" ? "🥳" : "😅"}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: "220px" }}>
                    <h3 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: "8px", color: answerState === "correct" ? "#047857" : "#b91c1c", textShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                      {answerState === "correct" ? "🎉 Chính xác!" : "❌ Chưa chính xác!"}
                    </h3>
                    <p style={{ fontSize: "1.15rem", fontWeight: 700, color: answerState === "correct" ? "#065f46" : "#991b1b", lineHeight: 1.6 }}>
                      {q.explanation}
                    </p>
                  </div>

                  <button
                    className="premium-btn"
                    onClick={handleNext}
                    style={{
                      padding: "18px 46px", fontSize: "1.3rem", fontWeight: 900, borderRadius: "2.5rem",
                      border: "1px solid rgba(255,255,255,0.4)", borderBottom: `6px solid ${answerState === "correct" ? "#047857" : "#b91c1c"}`,
                      background: answerState === "correct" ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "white", cursor: "pointer", boxShadow: "0 8px 25px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.4)",
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)", whiteSpace: "nowrap" as const,
                    }}
                  >
                    {currentIdx + 1 >= questions.length ? "🏆 KẾT QUẢ" : "TIẾP TỤC ➔"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PIN Gate */}
          {showPinGate && <ParentGate onSuccess={handlePinSuccess} onClose={handlePinCancel} />}
        </div>
      </div>
    </div>
  );
}
