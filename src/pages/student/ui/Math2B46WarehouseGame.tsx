import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, CheckCircle2, XCircle } from "lucide-react";

type ShapeType = "sphere" | "cylinder";

type Item = {
  id: string;
  name: string;
  emoji: string;
  shape: ShapeType;
};

const GAME_ITEMS: Item[] = [
  { id: "football", name: "Quả bóng đá", emoji: "⚽", shape: "sphere" },
  { id: "marble", name: "Viên bi", emoji: "🔵", shape: "sphere" },
  { id: "globe", name: "Quả địa cầu", emoji: "🌍", shape: "sphere" },
  { id: "soda", name: "Lon nước ngọt", emoji: "🥤", shape: "cylinder" },
  { id: "toilet-roll", name: "Cuộn giấy", emoji: "🧻", shape: "cylinder" },
  { id: "drum", name: "Cái trống", emoji: "🥁", shape: "cylinder" },
  { id: "battery", name: "Cục pin", emoji: "🔋", shape: "cylinder" },
];

function Basket({
  type,
  onDropItem,
  isActive,
  shake,
}: Readonly<{
  type: ShapeType;
  onDropItem: (type: ShapeType) => void;
  isActive: boolean;
  shake: boolean;
}>) {
  const isCylinder = type === "cylinder";

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDropItem(type);
      }}
      className={`relative flex-1 min-h-[220px] rounded-3xl border-4 p-4 sm:p-6 transition-all ${
        isCylinder
          ? "border-orange-300 bg-orange-50/85"
          : "border-sky-300 bg-sky-50/85"
      } ${isActive ? "ring-4 ring-emerald-200 scale-[1.01]" : ""} ${
        shake ? "animate-[shake_0.35s_ease-in-out_1]" : ""
      }`}
    >
      <div className="text-center mb-4">
        <div className="text-4xl mb-1">{isCylinder ? "🟧" : "🔵"}</div>
        <h3 className={`text-lg sm:text-xl font-black ${isCylinder ? "text-orange-700" : "text-sky-700"}`}>
          {isCylinder ? "Khối Trụ" : "Khối Cầu"}
        </h3>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[76%] h-12 rounded-[999px] bg-black/10" />
    </div>
  );
}

export default function Math2B46WarehouseGame() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<Item[]>(GAME_ITEMS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [message, setMessage] = useState("Kéo đồ vật vào đúng rổ nhé!");
  const [shakeCylinder, setShakeCylinder] = useState(false);
  const [shakeSphere, setShakeSphere] = useState(false);
  const [flashCorrect, setFlashCorrect] = useState(false);

  const currentItem = queue[currentIdx] ?? null;
  const total = queue.length;
  const finished = currentIdx >= total;

  const stars = useMemo(() => {
    if (!finished) return 0;
    if (wrongCount === 0) return 3;
    if (wrongCount <= 2) return 2;
    return 1;
  }, [finished, wrongCount]);

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
      // ignore audio errors
    }
  };

  const handleDropItem = (target: ShapeType) => {
    if (!currentItem) return;

    const correct = currentItem.shape === target;
    if (correct) {
      setScore((s) => s + 1);
      setFlashCorrect(true);
      setMessage(`Ting! Chuẩn rồi: ${currentItem.name} thuộc ${target === "sphere" ? "khối cầu" : "khối trụ"}.`);
      playTone(true);
      window.setTimeout(() => {
        setFlashCorrect(false);
        setCurrentIdx((i) => i + 1);
      }, 550);
    } else {
      setWrongCount((w) => w + 1);
      setMessage(`Boing! Thử lại nhé, ${currentItem.name} chưa đúng rổ.`);
      playTone(false);
      if (target === "sphere") {
        setShakeSphere(true);
        window.setTimeout(() => setShakeSphere(false), 360);
      } else {
        setShakeCylinder(true);
        window.setTimeout(() => setShakeCylinder(false), 360);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-cyan-50 p-3 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/student/game/math2-quiz-3d-shapes")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Quay lại Bài 46
          </button>

          <div className="rounded-xl bg-white/90 border border-amber-200 px-3 py-2 text-sm font-black text-amber-700">
            Điểm: {score}/{total}
          </div>
        </div>

        <h1 className="text-center text-2xl sm:text-3xl font-black text-orange-700 mb-1">Nhà Kho Của Tí Tách</h1>
        <p className="text-center text-sm sm:text-base font-bold text-slate-600 mb-5">
          Kéo đồ vật vào đúng rổ Khối Trụ hoặc Khối Cầu
        </p>

        <div className="rounded-2xl border border-cyan-200 bg-white/85 px-4 py-3 text-center mb-4">
          <p className="text-sm sm:text-base font-extrabold text-cyan-700">{message}</p>
        </div>

        {!finished && currentItem && (
          <div className="mb-6 rounded-3xl border-2 border-dashed border-amber-300 bg-white/80 p-5 sm:p-7 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-500 mb-2">Đồ vật hiện tại</p>
            <div
              draggable
              onDragStart={() => setDraggingId(currentItem.id)}
              onDragEnd={() => setDraggingId(null)}
              className={`mx-auto inline-flex flex-col items-center justify-center w-44 h-44 rounded-3xl border-2 border-amber-200 bg-gradient-to-b from-white to-amber-50 cursor-grab active:cursor-grabbing shadow-lg transition ${flashCorrect ? "scale-110 ring-4 ring-emerald-200" : ""}`}
            >
              <span className="text-6xl mb-2">{currentItem.emoji}</span>
              <span className="text-sm sm:text-base font-black text-slate-700">{currentItem.name}</span>
            </div>
            {draggingId && (
              <p className="mt-3 text-xs font-bold text-slate-500">Đang kéo: {currentItem.name}</p>
            )}
          </div>
        )}

        {!finished ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Basket
              type="cylinder"
              onDropItem={handleDropItem}
              isActive={draggingId !== null}
              shake={shakeCylinder}
            />
            <Basket
              type="sphere"
              onDropItem={handleDropItem}
              isActive={draggingId !== null}
              shake={shakeSphere}
            />
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-emerald-300 bg-emerald-50/90 p-6 sm:p-8 text-center shadow-xl">
            <Trophy className="mx-auto text-emerald-600 mb-3" size={42} />
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-700 mb-2">Hoàn thành nhà kho!</h2>
            <p className="text-base sm:text-lg font-bold text-emerald-800 mb-3">Bạn phân loại đúng {score}/{total} đồ vật.</p>
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3].map((i) => (
                <span key={i} className={`text-2xl ${i <= stars ? "opacity-100" : "opacity-30"}`}>⭐</span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
              <button
                onClick={() => {
                  setQueue(GAME_ITEMS);
                  setCurrentIdx(0);
                  setDraggingId(null);
                  setScore(0);
                  setWrongCount(0);
                  setMessage("Kéo đồ vật vào đúng rổ nhé!");
                }}
                className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3"
              >
                Chơi lại
              </button>
              <button
                onClick={() => navigate("/student/game/math2-b46-detective")}
                className="rounded-2xl bg-white border border-emerald-300 text-emerald-700 font-black py-3"
              >
                Sang map 2: Mắt Tinh Tìm Khối
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-500 font-bold flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} /> Ting! = đúng</span>
              <span className="inline-flex items-center gap-1"><XCircle size={14} /> Boing! = sai</span>
            </div>
          </div>
        )}

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
