import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  Star,
  Search,
  Zap,
  Home,
  Check,
  ClipboardList,
} from "lucide-react";

/* ─── TTS helper ─────────────────────────────────────────────── */
function speak(text: string, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "vi-VN";
  u.rate = 0.95;
  u.pitch = 1.12;
  const voices = window.speechSynthesis.getVoices();
  const vi = voices.find((v) => v.lang.startsWith("vi"));
  if (vi) u.voice = vi;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}

/* ─── Types & data ───────────────────────────────────────────── */
type ShapeType = "sphere" | "cylinder" | "other";

type HuntItem = {
  id: string;
  name: string;
  emoji: string;
  type: ShapeType;
  reason: string;
};

type RoundConfig = {
  target: "sphere" | "cylinder";
  targetCount: number;
  pool: HuntItem[];
  seconds: number;
};

const BASE_POOL: HuntItem[] = [
  { id: "ball", name: "Bóng đá", emoji: "⚽", type: "sphere", reason: "Bóng đá tròn vo mọi hướng, đó là khối cầu" },
  { id: "marble", name: "Viên bi", emoji: "🔵", type: "sphere", reason: "Viên bi tròn trịa hoàn hảo, đó là khối cầu" },
  { id: "globe", name: "Địa cầu", emoji: "🌍", type: "sphere", reason: "Quả địa cầu có dạng hình cầu tròn" },
  { id: "orange", name: "Quả cam", emoji: "🍊", type: "sphere", reason: "Quả cam tròn tròn, đó là khối cầu" },
  { id: "soda", name: "Lon nước", emoji: "🥤", type: "cylinder", reason: "Lon nước có dạng ống tròn với 2 mặt đáy, đó là khối trụ" },
  { id: "drum", name: "Cái trống", emoji: "🥁", type: "cylinder", reason: "Cái trống có 2 mặt tròn ở 2 đầu và thân bao quanh, đó là khối trụ" },
  { id: "roll", name: "Cuộn giấy", emoji: "🧻", type: "cylinder", reason: "Cuộn giấy có dạng hình trụ tròn" },
  { id: "battery", name: "Cục pin", emoji: "🔋", type: "cylinder", reason: "Cục pin có dạng hình trụ nhỏ với 2 đầu tròn" },
  { id: "box", name: "Hộp quà", emoji: "🎁", type: "other", reason: "Hộp quà có dạng hình hộp chữ nhật, không phải khối trụ hay khối cầu" },
  { id: "dice", name: "Xúc xắc", emoji: "🎲", type: "other", reason: "Xúc xắc có dạng hình lập phương (6 mặt vuông), không phải khối trụ hay khối cầu" },
  { id: "book", name: "Sách", emoji: "📘", type: "other", reason: "Sách có dạng hình hộp chữ nhật dẹt, không phải khối trụ hay khối cầu" },
  { id: "gift", name: "Hộp sữa", emoji: "🧃", type: "other", reason: "Hộp sữa có dạng hình hộp chữ nhật, không phải khối trụ hay khối cầu" },
];

const ROUNDS: RoundConfig[] = [
  { target: "cylinder", targetCount: 3, pool: BASE_POOL, seconds: 25 },
  { target: "sphere", targetCount: 3, pool: BASE_POOL, seconds: 25 },
  { target: "cylinder", targetCount: 4, pool: BASE_POOL, seconds: 20 },
];

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* ─── Timer ring ─────────────────────────────────────────────── */
function TimerRing({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = timeLeft / total;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  let color = "#22c55e"; // green
  if (pct <= 0.3) color = "#ef4444"; // red
  else if (pct <= 0.5) color = "#f59e0b"; // amber

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 w-14 h-14 -rotate-90">
        <circle cx={28} cy={28} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={4} />
        <circle
          cx={28}
          cy={28}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span
        className="text-sm font-black z-10"
        style={{ color }}
      >
        {timeLeft}
      </span>
    </div>
  );
}

/* ─── Round badge ────────────────────────────────────────────── */
function RoundBadge({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-8 h-2 rounded-full transition-all duration-300 ${
            i < current
              ? "bg-emerald-400"
              : i === current
                ? "bg-amber-400 animate-pulse"
                : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export function Math2B46DetectiveGame() {
  const navigate = useNavigate();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [roundIndex, setRoundIndex] = useState(0);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUNDS[0].seconds);
  const [message, setMessage] = useState("Bấm vào đúng khối theo yêu cầu nhé! 🔍");
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [combo, setCombo] = useState(0);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const finishedGame = roundIndex >= ROUNDS.length;

  const items = useMemo(() => {
    const correct = shuffle(round.pool.filter((i) => i.type === round.target)).slice(
      0,
      round.targetCount,
    );
    const others = shuffle(round.pool.filter((i) => i.type !== round.target)).slice(
      0,
      Math.max(5, round.targetCount + 2),
    );
    return shuffle([...correct, ...others]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex]);

  const targetIds = useMemo(
    () => items.filter((i) => i.type === round.target).map((i) => i.id),
    [items, round.target],
  );

  const foundCount = pickedIds.filter((id) => targetIds.includes(id)).length;
  const finishedRound = foundCount >= round.targetCount;

  // Voice
  const speakMsg = useCallback(
    (text: string) => {
      if (!voiceEnabled) return;
      setIsSpeaking(true);
      speak(text, () => setIsSpeaking(false));
    },
    [voiceEnabled],
  );

  const prevMsgRef = useRef(message);
  useEffect(() => {
    if (message !== prevMsgRef.current) {
      prevMsgRef.current = message;
      speakMsg(message);
    }
  }, [message, speakMsg]);

  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const timer = setTimeout(() => {
      const targetName = ROUNDS[0].target === "sphere" ? "khối cầu" : "khối trụ";
      speakMsg(`Mắt Tinh Tìm Khối! Hãy tìm tất cả ${targetName} trong vòng ${ROUNDS[0].seconds} giây.`);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset round state
  useEffect(() => {
    setTimeLeft(round.seconds);
    setPickedIds([]);
    setCombo(0);
    if (!finishedGame) {
      const targetName = round.target === "sphere" ? "khối cầu" : "khối trụ";
      setMessage(`Vòng ${roundIndex + 1}: Tìm tất cả ${targetName}! ⏱️`);
    }
  }, [roundIndex, round.seconds, round.target, finishedGame]);

  // Timer
  useEffect(() => {
    if (finishedGame || finishedRound) return;
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setMessage("⏰ Hết giờ! Chuyển sang vòng tiếp theo...");
          window.setTimeout(() => setRoundIndex((idx) => idx + 1), 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finishedGame, finishedRound, roundIndex]);

  // Round complete
  useEffect(() => {
    if (finishedRound && !finishedGame) {
      setMessage("🎉 Tuyệt vời! Hoàn thành vòng này rồi!");
      const next = window.setTimeout(() => setRoundIndex((idx) => idx + 1), 1500);
      return () => window.clearTimeout(next);
    }
    return undefined;
  }, [finishedRound, finishedGame]);

  const playTone = (ok: boolean) => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = ok ? "triangle" : "square";
      osc.frequency.value = ok ? 920 : 260;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (ok ? 0.12 : 0.18));
    } catch {
      /* ignore */
    }
  };

  const handlePick = (item: HuntItem) => {
    if (timeLeft === 0 || finishedRound || finishedGame) return;
    if (pickedIds.includes(item.id)) return;

    if (item.type === round.target) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setPickedIds((ids) => [...ids, item.id]);
      playTone(true);
      const comboText = newCombo >= 2 ? ` Combo ${newCombo}! 🔥` : "";
      setMessage(`✅ Đúng! ${item.name} là ${round.target === "sphere" ? "khối cầu" : "khối trụ"}.${comboText}`);
    } else {
      setCombo(0);
      setWrongCount((w) => w + 1);
      playTone(false);
      setMessage(`❌ Sai rồi! ${item.reason}.`);
      setShakeId(item.id);
      setPickedIds((ids) => [...ids, item.id]);
      window.setTimeout(() => setShakeId(null), 350);
    }
  };

  const stars = useMemo(() => {
    if (!finishedGame) return 0;
    if (wrongCount === 0) return 3;
    if (wrongCount <= 2) return 2;
    return 1;
  }, [finishedGame, wrongCount]);

  const handleReset = () => {
    setRoundIndex(0);
    setWrongCount(0);
    setMessage("Bấm vào đúng khối theo yêu cầu nhé! 🔍");
    setPickedIds([]);
    setCombo(0);
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const targetLabel = round.target === "sphere" ? "Khối Cầu 🔵" : "Khối Trụ 🟠";
  const targetColor = round.target === "sphere" ? "#0ea5e9" : "#f97316";

  /* ═══ Finished screen ════════════════════════════════════════ */
  if (finishedGame) {
    return (
      <div
        className="w-full min-h-screen relative overflow-hidden flex items-center justify-center px-4"
        style={{
          background: "linear-gradient(155deg, #ecfdf5 0%, #f0fdf4 30%, #d1fae5 60%, #a7f3d0 100%)",
        }}
      >
        {/* Confetti particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["🎉", "⭐", "🎊", "✨", "🏆", "🎯", "🔍"].map((e, i) => (
            <span
              key={i}
              className="absolute text-2xl sm:text-3xl animate-bounce opacity-25"
              style={{
                left: `${8 + i * 13}%`,
                top: `${5 + (i % 4) * 22}%`,
                animationDelay: `${i * 0.18}s`,
                animationDuration: `${1.3 + i * 0.15}s`,
              }}
            >
              {e}
            </span>
          ))}
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div
            className="rounded-3xl p-8 sm:p-10 text-center"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "3px solid #6ee7b7",
              boxShadow: "0 20px 60px rgba(16,185,129,0.15)",
            }}
          >
            <Trophy className="mx-auto text-emerald-500 mb-4" size={56} />
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 mb-2">
              🕵️ Thám tử xuất sắc!
            </h2>
            <p className="text-base font-bold text-slate-600 mb-1">
              Hoàn thành tất cả {ROUNDS.length} vòng tìm kiếm
            </p>
            <p className="text-sm text-slate-400 mb-5">
              {wrongCount === 0
                ? "Không sai lần nào — hoàn hảo!"
                : `Sai ${wrongCount} lần`}
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`transition-all duration-500 ${
                    i <= stars ? "scale-110" : "scale-90 opacity-25 grayscale"
                  }`}
                >
                  <Star
                    size={40}
                    className={
                      i <= stars
                        ? "text-amber-400 fill-amber-400 drop-shadow-lg"
                        : "text-gray-300"
                    }
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/student/quiz/math2-b46")}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-black text-base text-white transition-all active:scale-95 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                  boxShadow: "0 6px 0 #0369a1, 0 8px 20px rgba(14,165,233,0.35)",
                }}
              >
                <ClipboardList size={18} />
                Làm bài quiz ngay ➔
              </button>
              <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm text-white transition-all active:scale-95 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                }}
              >
                <RotateCcw size={16} />
                Chơi lại
              </button>
              <button
                onClick={() => navigate("/student/game/math2-quiz-3d-shapes")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm text-white transition-all active:scale-95 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                }}
              >
                <ArrowLeft size={16} />
                Quay lại Bài 46
              </button>
              <button
                onClick={() => navigate("/student")}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-sm border-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all active:scale-95"
              >
                <Home size={16} />
                Mục lục
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ Game screen ════════════════════════════════════════════ */
  return (
    <div
      className="w-full min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(155deg, #eff6ff 0%, #f0f9ff 25%, #e0f2fe 50%, #f5f3ff 75%, #ede9fe 100%)",
      }}
    >
      {/* Floating deco */}
      <div className="absolute top-[6%] left-[4%] text-3xl opacity-10 animate-float-slow select-none pointer-events-none">🔍</div>
      <div className="absolute top-[12%] right-[6%] text-2xl opacity-10 animate-float-slow select-none pointer-events-none" style={{ animationDelay: "1s" }}>🕵️</div>
      <div className="absolute bottom-[8%] left-[6%] text-2xl opacity-10 animate-float-slow select-none pointer-events-none" style={{ animationDelay: "1.5s" }}>🎯</div>
      <div className="absolute bottom-[15%] right-[4%] text-3xl opacity-10 animate-float-slow select-none pointer-events-none" style={{ animationDelay: "0.5s" }}>✨</div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-5">
        {/* ── Top bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            onClick={() => navigate("/student/game/math2-quiz-3d-shapes")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-md text-sm font-bold text-slate-600 hover:bg-white hover:shadow-lg active:scale-95 transition-all"
          >
            <ArrowLeft size={16} /> Bài 46
          </button>

          <div className="flex items-center gap-2.5">
            {/* Round progress */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 backdrop-blur border border-white/60 shadow-sm">
              <span className="text-xs font-bold text-slate-400">Vòng</span>
              <RoundBadge current={roundIndex} total={ROUNDS.length} />
            </div>

            {/* Voice */}
            <button
              onClick={toggleVoice}
              title={voiceEnabled ? "Tắt giọng đọc" : "Bật giọng đọc"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur border shadow-sm transition-all active:scale-90 ${
                voiceEnabled
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "bg-white/80 border-white/60 text-slate-400"
              } ${isSpeaking ? "animate-pulse" : ""}`}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* ── Title ────────────────────────────────────────────── */}
        <div className="text-center mb-3">
          <h1 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            🕵️ Mắt Tinh Tìm Khối
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
            Vòng {roundIndex + 1}/{ROUNDS.length} • Tìm tất cả đồ vật thuộc hình khối yêu cầu
          </p>
        </div>

        {/* ── Target + Stats row ─────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 sm:gap-5 mb-4">
          {/* Target badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-extrabold text-sm shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${targetColor}, ${targetColor}dd)`,
              boxShadow: `0 4px 16px ${targetColor}40`,
            }}
          >
            <Search size={16} />
            Tìm: {targetLabel}
          </div>

          {/* Found counter */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur border shadow-sm font-extrabold text-sm"
            style={{ borderColor: `${targetColor}40`, color: targetColor }}
          >
            <Check size={16} />
            {foundCount}/{round.targetCount}
          </div>

          {/* Timer */}
          <TimerRing timeLeft={timeLeft} total={round.seconds} />
        </div>

        {/* ── Message bubble ───────────────────────────────────── */}
        <div
          className="rounded-2xl px-4 py-3 text-center mb-4 transition-all duration-300 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(237,233,254,0.85))",
            border: "2px solid rgba(139,92,246,0.15)",
            boxShadow: "0 4px 20px rgba(139,92,246,0.08)",
          }}
        >
          {isSpeaking && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-end gap-0.5 h-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[3px] bg-violet-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: `${6 + Math.random() * 10}px`,
                    animationDuration: "0.5s",
                  }}
                />
              ))}
            </div>
          )}
          <p className="text-sm sm:text-base font-bold text-violet-700">{message}</p>
        </div>

        {/* ── Item grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {items.map((item) => {
            const isFound = pickedIds.includes(item.id) && item.type === round.target;
            const isWrongPicked = pickedIds.includes(item.id) && item.type !== round.target;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                disabled={isFound}
                className={`relative flex flex-col items-center justify-center py-4 sm:py-5 rounded-2xl border-2 transition-all duration-300 ${
                  isFound
                    ? "border-emerald-400 bg-emerald-50 scale-[1.03] shadow-lg"
                    : isWrongPicked
                      ? "border-red-200 bg-red-50/50 opacity-60"
                      : "border-slate-200/80 bg-white/80 backdrop-blur hover:border-violet-300 hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer"
                } ${shakeId === item.id ? "animate-[shake_0.35s_ease-in-out_1]" : ""}`}
                style={{
                  boxShadow: isFound
                    ? "0 4px 20px rgba(52,211,153,0.25)"
                    : "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <span className={`text-4xl sm:text-5xl mb-1.5 transition-transform duration-300 ${isFound ? "scale-110" : ""}`}>
                  {item.emoji}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-600">
                  {item.name}
                </span>

                {/* Found badge */}
                {isFound && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md animate-[popIn_0.3s_ease-out]">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Wrong X */}
                {isWrongPicked && (
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-400 flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-black">✕</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Combo indicator ─────────────────────────────────── */}
        {combo >= 2 && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white text-xs font-black shadow-lg animate-bounce">
              <Zap size={14} /> Combo x{combo}! 🔥
            </span>
          </div>
        )}

        {/* ── Round completion flash ──────────────────────────── */}
        {finishedRound && (
          <div className="mt-4 text-center animate-[popIn_0.3s_ease-out]">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 text-white font-extrabold text-sm shadow-xl">
              <Trophy size={18} />
              Vòng {roundIndex + 1} hoàn thành! Chuyển tiếp...
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-8px) rotate(-2deg); }
          50% { transform: translateX(8px) rotate(2deg); }
          75% { transform: translateX(-5px) rotate(-1deg); }
          100% { transform: translateX(0) rotate(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
