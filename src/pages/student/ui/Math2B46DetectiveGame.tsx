import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Target, Trophy } from "lucide-react";

type ShapeType = "sphere" | "cylinder" | "other";

type HuntItem = {
  id: string;
  name: string;
  emoji: string;
  type: ShapeType;
};

type RoundConfig = {
  target: "sphere" | "cylinder";
  targetCount: number;
  pool: HuntItem[];
  seconds: number;
};

const BASE_POOL: HuntItem[] = [
  { id: "ball", name: "Bóng đá", emoji: "⚽", type: "sphere" },
  { id: "marble", name: "Viên bi", emoji: "🔵", type: "sphere" },
  { id: "globe", name: "Địa cầu", emoji: "🌍", type: "sphere" },
  { id: "orange", name: "Quả cam", emoji: "🍊", type: "sphere" },
  { id: "soda", name: "Lon nước", emoji: "🥤", type: "cylinder" },
  { id: "drum", name: "Cái trống", emoji: "🥁", type: "cylinder" },
  { id: "roll", name: "Cuộn giấy", emoji: "🧻", type: "cylinder" },
  { id: "battery", name: "Cục pin", emoji: "🔋", type: "cylinder" },
  { id: "box", name: "Hộp quà", emoji: "🎁", type: "other" },
  { id: "dice", name: "Xúc xắc", emoji: "🎲", type: "other" },
  { id: "book", name: "Sách", emoji: "📘", type: "other" },
  { id: "gift", name: "Hộp sữa", emoji: "🧃", type: "other" },
];

const ROUNDS: RoundConfig[] = [
  { target: "cylinder", targetCount: 3, pool: BASE_POOL, seconds: 25 },
  { target: "sphere", targetCount: 3, pool: BASE_POOL, seconds: 25 },
  { target: "cylinder", targetCount: 4, pool: BASE_POOL, seconds: 20 },
];

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function Math2B46DetectiveGame() {
  const navigate = useNavigate();
  const [roundIndex, setRoundIndex] = useState(0);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUNDS[0].seconds);
  const [message, setMessage] = useState("Bấm vào đúng khối theo yêu cầu nhé!");
  const [shakeId, setShakeId] = useState<string | null>(null);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];

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
  }, [roundIndex, round.pool, round.target, round.targetCount]);

  const targetIds = useMemo(
    () => items.filter((i) => i.type === round.target).map((i) => i.id),
    [items, round.target],
  );

  const foundCount = pickedIds.filter((id) => targetIds.includes(id)).length;
  const finishedRound = foundCount >= round.targetCount;
  const finishedGame = roundIndex >= ROUNDS.length;

  useEffect(() => {
    setTimeLeft(round.seconds);
    setPickedIds([]);
  }, [roundIndex, round.seconds]);

  useEffect(() => {
    if (finishedGame || finishedRound) return;
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setMessage("Hết giờ! Chuyển sang phần tiếp theo nhé.");
          window.setTimeout(() => {
            setRoundIndex((idx) => idx + 1);
          }, 900);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finishedGame, finishedRound]);

  useEffect(() => {
    if (finishedRound) {
      setMessage("Giỏi lắm! Hoàn thành vòng này rồi.");
      const next = window.setTimeout(() => {
        setRoundIndex((idx) => idx + 1);
      }, 1100);
      return () => window.clearTimeout(next);
    }
    return undefined;
  }, [finishedRound]);

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
      // ignore
    }
  };

  const handlePick = (item: HuntItem) => {
    if (timeLeft === 0 || finishedRound || finishedGame) return;
    if (pickedIds.includes(item.id)) return;

    if (item.type === round.target) {
      setPickedIds((ids) => [...ids, item.id]);
      playTone(true);
      setMessage(`Ting! ${item.name} đúng rồi.`);
    } else {
      setWrongCount((w) => w + 1);
      playTone(false);
      setMessage(`Boing! ${item.name} chưa đúng khối.`);
      setShakeId(item.id);
      window.setTimeout(() => setShakeId(null), 350);
    }
  };

  const stars = useMemo(() => {
    if (!finishedGame) return 0;
    if (wrongCount === 0) return 3;
    if (wrongCount <= 2) return 2;
    return 1;
  }, [finishedGame, wrongCount]);

  if (finishedGame) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-emerald-50 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4">
            <button
              onClick={() => navigate("/student/game/math2-quiz-3d-shapes")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft size={16} /> Quay lại Bài 46
            </button>
          </div>
          <div className="rounded-3xl border-2 border-emerald-200 bg-white/90 p-8 text-center shadow-xl">
            <Trophy className="mx-auto text-emerald-600" size={46} />
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-emerald-700">Hoàn thành mắt tinh!</h2>
            <p className="mt-2 text-sm sm:text-base font-bold text-emerald-700">
              Bạn đã tìm đúng hết các khối.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              {[1, 2, 3].map((i) => (
                <span key={i} className={`text-2xl ${i <= stars ? "opacity-100" : "opacity-30"}`}>⭐</span>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <button
                onClick={() => {
                  setRoundIndex(0);
                  setWrongCount(0);
                  setMessage("Bấm vào đúng khối theo yêu cầu nhé!");
                  setPickedIds([]);
                }}
                className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3"
              >
                Chơi lại
              </button>
              <button
                onClick={() => navigate("/student")}
                className="rounded-2xl bg-white border border-emerald-300 text-emerald-700 font-black py-3"
              >
                Quay lại mục lục
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-cyan-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/student/game/math2-quiz-3d-shapes")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Quay lại Bài 46
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-white/90 border border-amber-200 px-3 py-2 text-sm font-black text-amber-700">
            <Target size={16} /> Vòng {roundIndex + 1}/{ROUNDS.length}
          </div>
        </div>

        <div className="mx-auto mb-4 max-w-3xl rounded-2xl border-2 border-orange-200/90 bg-white/90 px-4 py-3 text-center shadow-[0_10px_26px_rgba(249,115,22,0.14)]">
          <h1 className="text-2xl sm:text-3xl font-black text-orange-700 mb-1">Mắt Tinh Tìm Khối</h1>
          <p className="text-sm sm:text-base font-bold text-slate-600">
            Hãy tìm đúng {round.target === "sphere" ? "khối cầu" : "khối trụ"} trước khi hết giờ.
          </p>
        </div>

        <div className="mb-4 rounded-2xl border-2 border-cyan-300/90 bg-gradient-to-r from-white via-cyan-50 to-white px-4 py-3 text-center shadow-[0_12px_28px_rgba(6,182,212,0.18)] ring-1 ring-cyan-100">
          <p className="text-sm sm:text-base font-extrabold text-cyan-700">{message}</p>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 border border-amber-200 text-amber-700 font-black">
            <Clock size={16} /> {timeLeft}s
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 border border-amber-200 text-amber-700 font-black">
            Đã tìm: {foundCount}/{round.targetCount}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => {
            const isFound = pickedIds.includes(item.id) && item.type === round.target;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                className={`relative flex flex-col items-center justify-center h-32 rounded-2xl border-2 bg-white shadow-sm transition-all ${
                  isFound
                    ? "border-emerald-400 bg-emerald-50 scale-[1.03]"
                    : "border-slate-200 hover:border-amber-300 hover:shadow-md"
                } ${shakeId === item.id ? "animate-[shake_0.35s_ease-in-out_1]" : ""}`}
              >
                <span className="text-4xl">{item.emoji}</span>
                <span className="mt-2 text-xs sm:text-sm font-black text-slate-700">{item.name}</span>
                {isFound && (
                  <span className="absolute top-2 right-2 text-emerald-500 text-lg">✔</span>
                )}
              </button>
            );
          })}
        </div>

        <style>{`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            50% { transform: translateX(6px); }
            75% { transform: translateX(-4px); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
