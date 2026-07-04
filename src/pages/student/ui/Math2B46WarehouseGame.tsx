import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowRight,
  Star,
  Sparkles,
  Heart,
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
type ShapeType = "sphere" | "cylinder";

type Item = {
  id: string;
  name: string;
  emoji: string;
  shape: ShapeType;
  hint: string;
};

const GAME_ITEMS: Item[] = [
  { id: "football", name: "Quả bóng đá", emoji: "⚽", shape: "sphere", hint: "Tròn vo, lăn được mọi hướng" },
  { id: "marble", name: "Viên bi", emoji: "🔵", shape: "sphere", hint: "Nhỏ xinh, tròn trịa hoàn hảo" },
  { id: "globe", name: "Quả địa cầu", emoji: "🌍", shape: "sphere", hint: "Mô hình Trái Đất hình cầu" },
  { id: "soda", name: "Lon nước ngọt", emoji: "🥫", shape: "cylinder", hint: "Dạng ống tròn, có nắp 2 đầu" },
  { id: "toilet-roll", name: "Cuộn giấy", emoji: "🧻", shape: "cylinder", hint: "Hình trụ rỗng ở giữa" },
  { id: "drum", name: "Cái trống", emoji: "🥁", shape: "cylinder", hint: "Mặt tròn 2 đầu, thân bao quanh" },
  { id: "battery", name: "Cục pin", emoji: "🔋", shape: "cylinder", hint: "Hình trụ nhỏ, chứa năng lượng" },
];

/* ─── Progress dots ──────────────────────────────────────────── */
function ProgressDots({
  total,
  current,
  results,
}: {
  total: number;
  current: number;
  results: ("correct" | "wrong" | null)[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const r = results[i];
        let bg = "bg-slate-200";
        if (r === "correct") bg = "bg-emerald-400";
        else if (r === "wrong") bg = "bg-red-400";
        else if (i === current) bg = "bg-amber-400 animate-pulse";

        return (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${bg} ${
              i === current ? "scale-125 ring-2 ring-amber-200" : ""
            }`}
          />
        );
      })}
    </div>
  );
}

/* ─── Drop zone basket ───────────────────────────────────────── */
function Basket({
  type,
  onDropItem,
  isActive,
  shake,
  sortedItems,
}: Readonly<{
  type: ShapeType;
  onDropItem: (type: ShapeType) => void;
  isActive: boolean;
  shake: boolean;
  sortedItems: Item[];
}>) {
  const isCylinder = type === "cylinder";
  const gradFrom = isCylinder ? "#fff7ed" : "#f0f9ff";
  const gradTo = isCylinder ? "#ffedd5" : "#e0f2fe";
  const borderColor = isCylinder ? "#fdba74" : "#7dd3fc";
  const activeGlow = isCylinder
    ? "0 0 30px rgba(251,146,60,0.3)"
    : "0 0 30px rgba(56,189,248,0.3)";

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDropItem(type);
      }}
      className={`relative flex-1 min-h-[220px] sm:min-h-[280px] rounded-3xl border-3 p-5 sm:p-6 transition-all duration-300 flex flex-col ${
        shake ? "animate-[shake_0.35s_ease-in-out_1]" : ""
      }`}
      style={{
        borderWidth: "3px",
        borderStyle: "solid",
        borderColor: isActive ? (isCylinder ? "#f97316" : "#0ea5e9") : borderColor,
        background: `linear-gradient(145deg, ${gradFrom}, ${gradTo})`,
        boxShadow: isActive
          ? activeGlow
          : "0 4px 16px rgba(0,0,0,0.04)",
        transform: isActive ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* Header */}
      <div className="text-center mb-3">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-extrabold text-white shadow-md"
          style={{
            background: isCylinder
              ? "linear-gradient(135deg, #fb923c, #f97316)"
              : "linear-gradient(135deg, #38bdf8, #0ea5e9)",
          }}
        >
          <span className="text-lg">{isCylinder ? "🧡" : "💙"}</span>
          {isCylinder ? "Khối Trụ" : "Khối Cầu"}
        </div>
      </div>

      {/* Drop zone indicator */}
      <div
        className={`flex-1 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 min-h-[100px] ${
          isActive
            ? isCylinder
              ? "border-orange-400 bg-orange-100/50"
              : "border-sky-400 bg-sky-100/50"
            : "border-gray-200 bg-white/30"
        }`}
      >
        {sortedItems.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-3xl mb-2">{isActive ? "👇" : "📦"}</p>
            <p className="text-xs font-bold text-slate-400">
              {isActive ? "Thả vào đây!" : "Kéo đồ vật vào đây"}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2 p-3">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center gap-0.5 p-2 rounded-xl bg-white/70 shadow-sm animate-[popIn_0.3s_ease-out]"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[9px] font-bold text-slate-500">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item count */}
      <div className="mt-2 text-center">
        <span className="text-xs font-bold text-slate-400">
          {sortedItems.length} đồ vật
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export default function Math2B46WarehouseGame() {
  const navigate = useNavigate();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [message, setMessage] = useState("Kéo đồ vật vào đúng rổ nhé! 🎯");
  const [shakeCylinder, setShakeCylinder] = useState(false);
  const [shakeSphere, setShakeSphere] = useState(false);
  const [flashCorrect, setFlashCorrect] = useState(false);
  const [combo, setCombo] = useState(0);

  // Track sorted items per basket and per-item result
  const [cylinderItems, setCylinderItems] = useState<Item[]>([]);
  const [sphereItems, setSphereItems] = useState<Item[]>([]);
  const [results, setResults] = useState<("correct" | "wrong" | null)[]>(
    GAME_ITEMS.map(() => null),
  );

  const currentItem = GAME_ITEMS[currentIdx] ?? null;
  const total = GAME_ITEMS.length;
  const finished = currentIdx >= total || lives <= 0;

  const stars = useMemo(() => {
    if (!finished) return 0;
    if (lives <= 0) return 0;
    if (wrongCount === 0) return 3;
    if (wrongCount <= 2) return 2;
    return 1;
  }, [finished, wrongCount, lives]);

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
    const timer = setTimeout(
      () => speakMsg("Nhà Kho Của Tí Tách. Kéo đồ vật vào đúng rổ nhé!"),
      500,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playTone = (ok: boolean) => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = ok ? "triangle" : "square";
      osc.frequency.value = ok ? 880 : 260;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (ok ? 0.12 : 0.18));
    } catch {
      /* ignore */
    }
  };

  const handleDropItem = (target: ShapeType) => {
    if (!currentItem) return;
    const correct = currentItem.shape === target;

    if (correct) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore((s) => s + 1);
      setFlashCorrect(true);
      setResults((prev) => {
        const next = [...prev];
        next[currentIdx] = "correct";
        return next;
      });

      // Add to basket
      if (target === "cylinder") setCylinderItems((prev) => [...prev, currentItem]);
      else setSphereItems((prev) => [...prev, currentItem]);

      const comboText = newCombo >= 3 ? ` Combo ${newCombo}! 🔥` : "";
      setMessage(
        `✅ Đúng rồi! ${currentItem.name} thuộc ${target === "sphere" ? "khối cầu" : "khối trụ"}.${comboText}`,
      );
      playTone(true);
      window.setTimeout(() => {
        setFlashCorrect(false);
        setCurrentIdx((i) => i + 1);
      }, 650);
    } else {
      setCombo(0);
      setWrongCount((w) => w + 1);
      setLives((l) => l - 1);
      setResults((prev) => {
        const next = [...prev];
        next[currentIdx] = "wrong";
        return next;
      });
      setMessage(`❌ Sai rồi! ${currentItem.name} ${currentItem.hint.toLowerCase()}. Thử lại nhé!`);
      playTone(false);

      if (target === "sphere") {
        setShakeSphere(true);
        window.setTimeout(() => setShakeSphere(false), 360);
      } else {
        setShakeCylinder(true);
        window.setTimeout(() => setShakeCylinder(false), 360);
      }

      // Move to next item even on wrong (item is "lost")
      window.setTimeout(() => setCurrentIdx((i) => i + 1), 800);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setDraggingId(null);
    setScore(0);
    setWrongCount(0);
    setLives(3);
    setCombo(0);
    setCylinderItems([]);
    setSphereItems([]);
    setResults(GAME_ITEMS.map(() => null));
    setMessage("Kéo đồ vật vào đúng rổ nhé! 🎯");
  };

  const toggleVoice = () => {
    if (voiceEnabled) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div
      className="w-full min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(155deg, #fefce8 0%, #fff7ed 25%, #fef3c7 50%, #ffedd5 75%, #fef9c3 100%)",
      }}
    >
      {/* Decorative */}
      <div className="absolute top-[5%] left-[3%] text-3xl opacity-15 animate-float-slow select-none pointer-events-none">📦</div>
      <div className="absolute top-[15%] right-[5%] text-2xl opacity-15 animate-float-slow select-none pointer-events-none" style={{ animationDelay: "1s" }}>🏭</div>
      <div className="absolute bottom-[10%] left-[8%] text-2xl opacity-10 animate-float-slow select-none pointer-events-none" style={{ animationDelay: "2s" }}>⭐</div>
      <div className="absolute bottom-[20%] right-[3%] text-3xl opacity-10 animate-float-slow select-none pointer-events-none" style={{ animationDelay: "0.5s" }}>🎮</div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-5">
        {/* ── Top bar ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={() => navigate("/student/game/math2-quiz-3d-shapes")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-md text-sm font-bold text-slate-600 hover:bg-white hover:shadow-lg active:scale-95 transition-all"
          >
            <ArrowLeft size={16} /> Bài 46
          </button>

          {/* Stats bar */}
          <div className="flex items-center gap-3">
            {/* Lives */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur border border-red-100 shadow-sm">
              {[1, 2, 3].map((i) => (
                <Heart
                  key={i}
                  size={16}
                  className={`transition-all duration-300 ${
                    i <= lives ? "text-red-500 fill-red-500" : "text-gray-200"
                  } ${i === lives && lives < 3 ? "animate-pulse" : ""}`}
                />
              ))}
            </div>

            {/* Score */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-sm font-extrabold text-sm"
              style={{
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                border: "1px solid #fcd34d",
                color: "#b45309",
              }}
            >
              <Star size={14} className="text-amber-500 fill-amber-500" />
              {score}/{total}
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
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 bg-clip-text text-transparent">
            🏭 Nhà Kho Của Tí Tách
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
            Phân loại đồ vật theo hình khối 3D
          </p>
        </div>

        {/* ── Progress bar ─────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <ProgressDots total={total} current={currentIdx} results={results} />
          {combo >= 2 && (
            <span className="text-xs font-black text-orange-500 animate-bounce">
              🔥 x{combo}
            </span>
          )}
        </div>

        {/* ── Message bubble ───────────────────────────────────── */}
        <div
          className="rounded-2xl px-4 py-3 text-center mb-4 transition-all duration-300 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(254,243,199,0.85))",
            border: "2px solid rgba(251,146,60,0.2)",
            boxShadow: "0 4px 20px rgba(251,146,60,0.08)",
          }}
        >
          {isSpeaking && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-end gap-0.5 h-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[3px] bg-green-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: `${6 + Math.random() * 10}px`,
                    animationDuration: "0.5s",
                  }}
                />
              ))}
            </div>
          )}
          <p className="text-sm sm:text-base font-bold text-amber-800">{message}</p>
        </div>

        {/* ── Game area ────────────────────────────────────────── */}
        {!finished && currentItem ? (
          <>
            {/* Current item to drag */}
            <div className="mb-4 text-center">
              <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                Đồ vật {currentIdx + 1}/{total}
              </p>
              <div
                draggable
                onDragStart={() => setDraggingId(currentItem.id)}
                onDragEnd={() => setDraggingId(null)}
                className={`mx-auto inline-flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-3xl cursor-grab active:cursor-grabbing transition-all duration-300 ${
                  flashCorrect
                    ? "scale-110 ring-4 ring-emerald-300"
                    : draggingId
                      ? "scale-95 opacity-70 rotate-3"
                      : "hover:scale-105 hover:shadow-xl"
                }`}
                style={{
                  background: "linear-gradient(145deg, #ffffff, #fffbeb)",
                  border: "3px solid #fde68a",
                  boxShadow: flashCorrect
                    ? "0 0 30px rgba(52,211,153,0.4)"
                    : "0 8px 30px rgba(251,191,36,0.15)",
                }}
              >
                <span className="text-5xl sm:text-6xl mb-1.5 drop-shadow-md">
                  {currentItem.emoji}
                </span>
                <span className="text-sm sm:text-base font-black text-slate-700">
                  {currentItem.name}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5 px-2 text-center leading-tight">
                  {currentItem.hint}
                </span>
              </div>
            </div>

            {/* Baskets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Basket
                type="cylinder"
                onDropItem={handleDropItem}
                isActive={draggingId !== null}
                shake={shakeCylinder}
                sortedItems={cylinderItems}
              />
              <Basket
                type="sphere"
                onDropItem={handleDropItem}
                isActive={draggingId !== null}
                shake={shakeSphere}
                sortedItems={sphereItems}
              />
            </div>
          </>
        ) : (
          /* ── Finished screen ──────────────────────────────────── */
          <div
            className="rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden"
            style={{
              background:
                lives <= 0
                  ? "linear-gradient(145deg, #fff1f2, #ffe4e6)"
                  : "linear-gradient(145deg, #ecfdf5, #d1fae5)",
              border: `3px solid ${lives <= 0 ? "#fecdd3" : "#6ee7b7"}`,
              boxShadow: lives <= 0
                ? "0 8px 30px rgba(239,68,68,0.12)"
                : "0 8px 30px rgba(52,211,153,0.15)",
            }}
          >
            {/* Confetti-like particles for win */}
            {lives > 0 && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {["🎉", "⭐", "🎊", "✨", "🏆"].map((e, i) => (
                  <span
                    key={i}
                    className="absolute text-2xl animate-bounce opacity-30"
                    style={{
                      left: `${15 + i * 18}%`,
                      top: `${10 + (i % 3) * 25}%`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: `${1.2 + i * 0.2}s`,
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}

            <div className="relative z-10">
              {lives > 0 ? (
                <Trophy className="mx-auto text-emerald-500 mb-3" size={52} />
              ) : (
                <div className="text-5xl mb-3">😢</div>
              )}

              <h2
                className={`text-2xl sm:text-3xl font-black mb-2 ${
                  lives > 0 ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {lives > 0 ? "🎉 Hoàn thành nhà kho!" : "Hết mạng rồi!"}
              </h2>

              <p className="text-base sm:text-lg font-bold text-slate-600 mb-4">
                Bạn phân loại đúng{" "}
                <span className="text-emerald-600 font-black">{score}</span>/{total} đồ vật
                {wrongCount > 0 && (
                  <span className="text-red-500"> • {wrongCount} lần sai</span>
                )}
              </p>

              {/* Stars */}
              {lives > 0 && (
                <div className="flex items-center justify-center gap-3 mb-5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`transition-all duration-500 ${
                        i <= stars ? "scale-110" : "scale-90 opacity-30 grayscale"
                      }`}
                      style={{
                        animationDelay: `${i * 0.2}s`,
                      }}
                    >
                      <Star
                        size={36}
                        className={
                          i <= stars
                            ? "text-amber-400 fill-amber-400 drop-shadow-lg"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  onClick={() => navigate("/student/quiz/math2-b46")}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-base transition-all active:scale-95 shadow-lg hover:shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                    color: "white",
                    boxShadow: "0 6px 0 #0369a1, 0 8px 20px rgba(14,165,233,0.35)",
                  }}
                >
                  <ClipboardList size={18} />
                  Làm bài quiz ngay ➔
                </button>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm transition-all active:scale-95 shadow-lg hover:shadow-xl"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
                  }}
                >
                  <RotateCcw size={16} />
                  Chơi lại
                </button>
                {lives > 0 && (
                  <button
                    onClick={() => navigate("/student/game/math2-b46-detective")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm transition-all active:scale-95 shadow-lg hover:shadow-xl"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      color: "white",
                      boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
                    }}
                  >
                    <Sparkles size={16} />
                    Map 2: Mắt Tinh Tìm Khối
                    <ArrowRight size={16} />
                  </button>
                )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0) scale(1.02); }
          25% { transform: translateX(-8px) scale(1.02); }
          50% { transform: translateX(8px) scale(1.02); }
          75% { transform: translateX(-5px) scale(1.02); }
          100% { transform: translateX(0) scale(1.02); }
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
