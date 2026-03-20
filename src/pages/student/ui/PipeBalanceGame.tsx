import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useGameSound } from "@/shared/lib/useGameSound";
import { markMath2LessonCompleted } from "@/shared/api/math2Data";
import { useActiveChild } from "@/shared/lib/activeChild";

const PAIRS_PER_ROUND = 4;
const ROUNDS = 3;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Một biểu thức cộng hoặc trừ (phạm vi lớp 2, kết quả 5–18) */
function makeExpressionForValue(
  v: number,
  exclude: ReadonlySet<string>,
): { expr: string; value: number } {
  for (let t = 0; t < 45; t++) {
    if (Math.random() < 0.55) {
      const a = randInt(2, Math.min(9, v - 2));
      const b = v - a;
      if (b >= 2 && b <= 9) {
        const expr = `${a} + ${b}`;
        if (!exclude.has(expr)) return { expr, value: v };
      }
    } else {
      const y = randInt(2, 9);
      const x = v + y;
      if (x >= 10 && x <= 18) {
        const expr = `${x} − ${y}`;
        if (!exclude.has(expr)) return { expr, value: v };
      }
    }
  }
  const a = randInt(2, v - 2);
  const b = v - a;
  return { expr: `${a} + ${b}`, value: v };
}

type Card = { id: string; expr: string; value: number };

function buildRound(roundSeed: number): { left: Card[]; right: Card[] } {
  const values = new Set<number>();
  while (values.size < PAIRS_PER_ROUND) {
    values.add(randInt(6, 17));
  }
  const list = [...values];
  const left: Card[] = [];
  const right: Card[] = [];
  list.forEach((v, i) => {
    const ex = new Set<string>();
    const L = makeExpressionForValue(v, ex);
    ex.add(L.expr);
    const R = makeExpressionForValue(v, ex);
    left.push({ id: `r${roundSeed}-L${i}`, expr: L.expr, value: v });
    right.push({ id: `r${roundSeed}-R${i}`, expr: R.expr, value: v });
  });
  return { left, right: shuffle(right) };
}

type Matched = {
  leftId: string;
  rightId: string;
  exprL: string;
  exprR: string;
  value: number;
};

type PipeKind = "left" | "right";

function PipeEndsHeroSvg() {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/70 bg-white/70 px-3 py-2 shadow-sm">
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800 text-xl shadow-sm ring-1 ring-cyan-200">
            🔵
          </span>
          <span className="font-black text-cyan-900 text-xs sm:text-sm">Bên trái</span>
        </div>
        <svg
          viewBox="0 0 260 34"
          className="h-[34px] w-full max-w-[260px]"
          aria-hidden
        >
          <defs>
            <linearGradient id="pipeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <path
            d="M16 17 C 36 17, 40 7, 60 7 L 100 7 C 120 7, 124 17, 140 17 C 156 17, 160 27, 180 27 L 220 27 C 236 27, 244 22, 244 17"
            fill="none"
            stroke="url(#pipeGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.95"
          />
          <circle cx="16" cy="17" r="6.5" fill="#22d3ee" />
          <circle cx="60" cy="7" r="6.5" fill="#14b8a6" />
          <circle cx="140" cy="17" r="6.5" fill="#14b8a6" />
          <circle cx="180" cy="27" r="6.5" fill="#f97316" />
        </svg>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-100 text-orange-900 text-xl shadow-sm ring-1 ring-orange-200">
            🟠
          </span>
          <span className="font-black text-orange-900 text-xs sm:text-sm">Bên phải</span>
        </div>
      </div>
    </div>
  );
}

function PipeExprButton({
  kind,
  expr,
  onClick,
  disabled,
  selected,
}: {
  kind: PipeKind;
  expr: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
}) {
  const left = kind === "left";

  const border = left
    ? "border-cyan-600"
    : "border-orange-600";
  const idleBg = left
    ? "from-cyan-50 to-sky-100"
    : "from-amber-50 to-orange-100";
  const activeBg = left
    ? "from-cyan-300 to-sky-400 text-white"
    : "from-amber-200 to-orange-300 text-slate-900";

  const glow = left ? "ring-cyan-200" : "ring-orange-200";
  const dot = left ? "bg-cyan-600" : "bg-orange-600";
  const selectedBorder = left ? "border-cyan-700" : "border-orange-700";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        "w-full rounded-2xl border-b-4 px-3 py-3 font-black text-lg transition active:translate-y-0.5 active:border-b-0 sm:text-xl",
        border,
        "shadow-sm",
        selected
          ? `${selectedBorder} bg-gradient-to-br ${activeBg} ring-2 ${glow} shadow-inner`
          : `bg-gradient-to-br ${idleBg} text-slate-800 hover:brightness-105`,
        disabled ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400 opacity-90" : "cursor-pointer",
      )}
    >
      <span className="flex items-center justify-center gap-2">
        <span className={twMerge("h-2.5 w-2.5 rounded-full", dot)} aria-hidden />
        <span className="font-mono tabular-nums">{expr}</span>
        <span
          className={twMerge(
            "h-2.5 w-2.5 rounded-full",
            left ? "bg-sky-400" : "bg-amber-400",
          )}
          aria-hidden
        />
      </span>
    </button>
  );
}

export function PipeBalanceGame() {
  const navigate = useNavigate();
  const { activeChild } = useActiveChild();
  const sound = useGameSound();
  const [roundIdx, setRoundIdx] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Matched[]>([]);

  const round = useMemo(() => buildRound(roundIdx), [roundIdx]);

  const matchedLeftIds = new Set(matched.map((m) => m.leftId));
  const matchedRightIds = new Set(matched.map((m) => m.rightId));
  const leftOpen = round.left.filter((c) => !matchedLeftIds.has(c.id));
  const rightOpen = round.right.filter((c) => !matchedRightIds.has(c.id));

  const starsEarned = wrongTotal <= 2 ? 3 : wrongTotal <= 6 ? 2 : 1;

  const goNextRound = useCallback(() => {
    setMatched([]);
    setSelectedLeftId(null);
    if (roundIdx + 1 < ROUNDS) {
      sound.correctVoice();
      setRoundIdx((r) => r + 1);
    } else {
      sound.victoryVoice();
      setPhase("done");
    }
  }, [roundIdx, sound]);

  const onPickLeft = (id: string) => {
    sound.click();
    setSelectedLeftId((s) => (s === id ? null : id));
  };

  const onPickRight = (card: Card) => {
    if (!selectedLeftId) {
      sound.click();
      return;
    }
    sound.click();
    const leftCard = round.left.find((c) => c.id === selectedLeftId);
    if (!leftCard) return;

    if (leftCard.value === card.value) {
      sound.correctVoice();
      setMatched((m) => [
        ...m,
        {
          leftId: leftCard.id,
          rightId: card.id,
          exprL: leftCard.expr,
          exprR: card.expr,
          value: leftCard.value,
        },
      ]);
      setSelectedLeftId(null);
    } else {
      setWrongTotal((w) => w + 1);
      sound.wrongVoice();
      setSelectedLeftId(null);
    }
  };

  useEffect(() => {
    if (phase !== "play") return;
    if (matched.length < PAIRS_PER_ROUND) return;
    const t = window.setTimeout(() => goNextRound(), 850);
    return () => window.clearTimeout(t);
  }, [matched.length, phase, goNextRound]);

  const restart = () => {
    sound.click();
    window.location.reload();
  };

  const selectedLeftCard = selectedLeftId
    ? round.left.find((c) => c.id === selectedLeftId) || null
    : null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-sky-200 via-cyan-100 to-emerald-200 font-sans select-none">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, #0f766e 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <header className="relative z-10 flex shrink-0 items-center justify-between border-b-2 border-teal-400/40 bg-white/80 px-3 py-2 shadow-md backdrop-blur-md sm:px-5">
        <button
          type="button"
          onClick={() => {
            sound.click();
            navigate("/student");
          }}
          className="flex items-center gap-1.5 font-extrabold text-teal-800 text-xs sm:text-sm"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>
        <div className="flex flex-col items-center">
          <span className="font-black text-teal-900 text-xs sm:text-sm">
            Nối ống cân bằng
          </span>
          <span className="font-bold text-teal-700/80 text-[10px] sm:text-xs">
            Cộng & trừ — ghép hai biểu thức bằng nhau
          </span>
        </div>
        <span className="w-16 text-right font-black text-amber-700 text-xs sm:w-24 sm:text-sm">
          Vòng {Math.min(roundIdx + 1, ROUNDS)}/{ROUNDS}
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-6 sm:py-6">
        {phase === "play" && (
          <>
            <PipeEndsHeroSvg />
            <p className="text-center font-bold text-teal-900 text-sm sm:text-base">
              Chọn biểu thức bên trái, rồi chọn biểu thức{" "}
              <span className="whitespace-nowrap">cùng kết quả</span> bên phải
              🔧
            </p>

            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <section
                className="rounded-2xl border-4 border-white bg-white/90 p-3 shadow-lg ring-2 ring-cyan-300/50"
                aria-label="Biểu thức bên trái"
              >
                <h2 className="mb-2 flex items-center gap-2 font-black text-cyan-800 text-xs uppercase tracking-wide sm:text-sm">
                  <span className="text-lg">🔵</span> Đầu ống trái
                </h2>
                <ul className="flex flex-col gap-2">
                  {leftOpen.map((c) => (
                    <li key={c.id}>
                      <PipeExprButton
                        kind="left"
                        expr={c.expr}
                        selected={selectedLeftId === c.id}
                        onClick={() => onPickLeft(c.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>

              <section
                className="rounded-2xl border-4 border-white bg-white/90 p-3 shadow-lg ring-2 ring-orange-300/50"
                aria-label="Biểu thức bên phải"
              >
                <h2 className="mb-2 flex items-center gap-2 font-black text-orange-900 text-xs uppercase tracking-wide sm:text-sm">
                  <span className="text-lg">🟠</span> Đầu ống phải
                </h2>
                {selectedLeftCard && (
                  <div className="mb-3 rounded-xl border border-orange-200 bg-orange-50/70 px-3 py-2 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-orange-900 text-xs sm:text-sm">
                        Nối với:
                      </span>
                      <span className="font-mono text-orange-950 tabular-nums text-xs sm:text-sm">
                        {selectedLeftCard.expr}
                      </span>
                    </div>
                  </div>
                )}
                <ul className="flex flex-col gap-2">
                  {rightOpen.map((c) => (
                    <li key={c.id}>
                      <PipeExprButton
                        kind="right"
                        expr={c.expr}
                        disabled={!selectedLeftId}
                        onClick={() => onPickRight(c)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {matched.length > 0 && (
              <div className="rounded-2xl border-2 border-dashed border-teal-400 bg-teal-50/80 p-3 shadow-inner">
                <h3 className="mb-2 flex items-center justify-center gap-2 font-black text-teal-900 text-xs sm:text-sm">
                  <Wrench className="h-4 w-4" aria-hidden />
                  Ống đã nối (các cặp bằng nhau)
                </h3>
                <div className="flex flex-col gap-2">
                  {matched.map((m, i) => (
                    <div
                      key={`${m.leftId}-${m.rightId}`}
                      className="flex items-center justify-center gap-3 rounded-xl bg-white/70 px-2 py-2 shadow-sm ring-1 ring-teal-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-cyan-500 shadow" aria-hidden />
                        <span className="rounded-lg bg-cyan-50 px-2 py-1 font-mono text-cyan-950 tabular-nums text-xs sm:text-sm">
                          {m.exprL}
                        </span>
                      </div>
                      <div className="relative flex h-8 w-[5.5rem] items-center justify-center">
                        <div className="absolute left-1 right-1 top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-orange-400" />
                        <div className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-cyan-300 shadow" />
                        <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-orange-300 shadow" />
                        <span className="relative font-black text-teal-900 text-xs">#{i + 1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-orange-500 shadow" aria-hidden />
                        <span className="rounded-lg bg-orange-50 px-2 py-1 font-mono text-orange-950 tabular-nums text-xs sm:text-sm">
                          {m.exprR}
                        </span>
                      </div>
                      <span className="ml-1 inline-flex items-center justify-center rounded-full bg-teal-100 px-2 py-1 font-black text-teal-900 text-xs sm:text-sm">
                        = {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {phase === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center animate-fade-in">
            <Sparkles className="h-14 w-14 text-amber-400" />
            <h2 className="font-black text-slate-800 text-2xl sm:text-3xl">
              Giỏi lắm! 🎉
            </h2>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  size={44}
                  className={
                    i <= starsEarned
                      ? "fill-amber-400 text-amber-500"
                      : "text-slate-300"
                  }
                />
              ))}
            </div>
            <p className="max-w-sm font-bold text-slate-600 text-sm">
              Bạn nối nhầm {wrongTotal} lần — luyện thêm để nối đúng ngay từ lần
              đầu nhé!
            </p>
            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={restart}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-3 font-black text-slate-700 shadow-md"
              >
                <RotateCcw size={20} />
                Chơi lại
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  markMath2LessonCompleted(activeChild.id, "math2-b5");
                  navigate("/student");
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-600 py-3 font-black text-white shadow-[0_4px_0_#0e7490]"
              >
                Về mục lục
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
