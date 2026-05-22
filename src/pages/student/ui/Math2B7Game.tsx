import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Star,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useGameSound } from "@/shared/lib/useGameSound";
import { markMath2LessonCompleted } from "@/shared/api/math2Data";
import { useActiveChild } from "@/shared/lib/activeChild";

/** Cùng nền cảnh với trang lý thuyết B2 (trời, mặt trời, cỏ, hoa) — Math2B2TheoryPage */
function Math2TheorySceneBackground() {
  return (
    <>
      <div
        className="fixed inset-0 -z-30"
        style={{
          background:
            "linear-gradient(180deg, #7dd3fc 0%, #bae6fd 35%, #d1fae5 70%, #86efac 100%)",
        }}
      />
      <div className="pointer-events-none fixed top-[4%] right-[8%] -z-20 h-16 w-16 animate-pulse-slow rounded-full bg-yellow-300 shadow-[0_0_50px_15px_rgba(253,224,71,0.4)] sm:h-24 sm:w-24" />
      <div className="pointer-events-none fixed top-[5%] left-[5%] -z-20 animate-theory-cloud select-none text-5xl opacity-20 sm:text-7xl">
        ☁️
      </div>
      <div
        className="pointer-events-none fixed top-[8%] right-[12%] -z-20 animate-theory-cloud select-none text-4xl opacity-15 sm:text-6xl"
        style={{ animationDelay: "3s" }}
      >
        ☁️
      </div>
      <div
        className="pointer-events-none fixed bottom-0 left-0 right-0 h-[25%]"
        style={{
          background:
            "linear-gradient(180deg, #86efac 0%, #22c55e 50%, #16a34a 100%)",
          borderRadius: "60% 60% 0 0 / 30% 30% 0 0",
          zIndex: -15,
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-[-5%] right-[-5%] h-[18%] opacity-80"
        style={{
          background: "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)",
          borderRadius: "50% 50% 0 0 / 40% 40% 0 0",
          zIndex: -14,
        }}
      />
      {[15, 40, 65, 85].map((x, i) => (
        <div
          key={i}
          className="pointer-events-none fixed animate-theory-bounce-gentle select-none"
          style={{
            bottom: `${10 + Math.sin(i) * 3}%`,
            left: `${x}%`,
            animationDelay: `${i * 0.4}s`,
            zIndex: -5,
          }}
        >
          <span className="text-lg drop-shadow-md sm:text-xl">
            {["🌷", "🌻", "🌼", "🌸"][i]}
          </span>
        </div>
      ))}
      {[20, 50, 75].map((x, i) => (
        <div
          key={i}
          className="pointer-events-none fixed animate-theory-sparkle select-none"
          style={{
            top: `${25 + i * 10}%`,
            left: `${x}%`,
            animationDelay: `${i * 0.7}s`,
            zIndex: -10,
          }}
        >
          <span className="text-base">✨</span>
        </div>
      ))}
    </>
  );
}

function SpeakingWaveMini() {
  return (
    <div className="flex h-4 items-end gap-[3px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-indigo-300/90 animate-theory-speaking-wave"
          style={{
            height: `${10 + (i % 3) * 4}px`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Chấm tròn minh họa số lượng (không cần ảnh ngoài) */
function DotCluster({
  count,
  className,
  label,
}: {
  count: number;
  className: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label ? (
        <span className="font-black text-[10px] text-slate-600 sm:text-xs">
          {label}
        </span>
      ) : null}
      <div className="flex max-w-[11rem] flex-wrap justify-center gap-1">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${className}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Vòng tròn số bước — ít chữ, dễ đọc lớp 2 */
function StepBadge({
  n,
  x,
  y,
}: {
  n: 1 | 2 | 3;
  x: number;
  y: number;
}) {
  return (
    <>
      <circle cx={x} cy={y} r={11} fill="#4f46e5" stroke="#312e81" strokeWidth={1.5} />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontWeight={900}
      >
        {n}
      </text>
    </>
  );
}

/** Ba bước 8 + 5 — toàn hình, gần như không có câu dài */
function MakeTenThreeStepsSvg() {
  return (
    <svg
      viewBox="0 0 360 200"
      className="mx-auto h-auto w-full max-w-lg"
      aria-hidden
    >
      <title>Minh họa ba bước: tìm mảnh ghép 10, tách số, cộng nốt</title>
      <defs>
        <marker
          id="b7-arr"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 z" fill="#6366f1" />
        </marker>
      </defs>
      <StepBadge n={1} x={22} y={28} />
      <text x="42" y="24" fill="#334155" fontSize={11} fontWeight={800}>
        8 + ? = 10
      </text>
      <text x="42" y="40" fill="#0284c7" fontSize={13} fontWeight={900}>
        → 2
      </text>
      {Array.from({ length: 8 }).map((_, i) => (
        <circle
          key={`s1a-${i}`}
          cx={18 + (i % 4) * 12}
          cy={58 + Math.floor(i / 4) * 12}
          r={4.5}
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth={1}
        />
      ))}
      <text x="78" y="76" fill="#334155" fontSize={16} fontWeight={900}>
        +
      </text>
      <circle cx={98} cy={70} r={4.5} fill="#f59e0b" stroke="#d97706" strokeWidth={1} />
      <circle cx={112} cy={70} r={4.5} fill="#f59e0b" stroke="#d97706" strokeWidth={1} />
      <path
        d="M 130 70 L 198 70"
        stroke="#6366f1"
        strokeWidth={2}
        markerEnd="url(#b7-arr)"
      />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle
          key={`s1b-${i}`}
          cx={210 + (i % 5) * 11}
          cy={58 + Math.floor(i / 5) * 11}
          r={4}
          fill="#a78bfa"
          stroke="#6d28d9"
          strokeWidth={1}
        />
      ))}

      <StepBadge n={2} x={22} y={118} />
      <text x="42" y="112" fill="#334155" fontSize={11} fontWeight={800}>
        5 = 2 + 3
      </text>
      <rect
        x="14"
        y="128"
        width={44}
        height={22}
        rx={6}
        fill="none"
        stroke="#d97706"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      <circle cx={26} cy={139} r={4} fill="#f59e0b" />
      <circle cx={38} cy={139} r={4} fill="#f59e0b" />
      <text x="52" y="143" fill="#d97706" fontSize={11} fontWeight={900}>
        2
      </text>
      <text x="68" y="143" fill="#334155" fontSize={14} fontWeight={900}>
        +
      </text>
      <rect
        x="82"
        y="128"
        width={58}
        height={22}
        rx={6}
        fill="none"
        stroke="#ea580c"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      <circle cx={94} cy={139} r={4} fill="#fdba74" />
      <circle cx={106} cy={139} r={4} fill="#fdba74" />
      <circle cx={118} cy={139} r={4} fill="#fdba74" />
      <text x="128" y="143" fill="#c2410c" fontSize={11} fontWeight={900}>
        3
      </text>

      <StepBadge n={3} x={22} y={178} />
      <text x="42" y="172" fill="#334155" fontSize={11} fontWeight={800}>
        10 + 3
      </text>
      <rect
        x="14"
        y="184"
        width={200}
        height={14}
        rx={6}
        fill="#eef2ff"
        stroke="#a5b4fc"
        strokeWidth={1.2}
      />
      <text x="110" y="195" textAnchor="middle" fill="#1e293b" fontSize={12} fontWeight={900}>
        = 13
      </text>
    </svg>
  );
}

/** Sơ đồ ghép 10 cho 8 + 5 — khung + số, không câu dài */
function MakeTenFlowSvg() {
  return (
    <svg
      viewBox="0 0 320 118"
      className="mx-auto h-auto w-full max-w-md"
      aria-hidden
    >
      <title>Minh họa 8 cộng 5 bằng cách ghép thành 10</title>
      <text x="6" y="16" fill="#475569" fontSize={11} fontWeight={700}>
        8
      </text>
      {Array.from({ length: 8 }).map((_, i) => (
        <circle
          key={`a-${i}`}
          cx={14 + (i % 4) * 13}
          cy={26 + Math.floor(i / 4) * 13}
          r={5}
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth={1}
        />
      ))}
      <text x="72" y="48" fill="#334155" fontSize={18} fontWeight={900}>
        +
      </text>
      <text x="98" y="16" fill="#475569" fontSize={11} fontWeight={700}>
        5 = 2 + 3
      </text>
      <rect
        x="96"
        y="28"
        width={32}
        height={22}
        rx={5}
        fill="none"
        stroke="#d97706"
        strokeWidth={1.8}
      />
      <circle cx={104} cy={38} r={5} fill="#f59e0b" stroke="#d97706" strokeWidth={1} />
      <circle cx={118} cy={38} r={5} fill="#f59e0b" stroke="#d97706" strokeWidth={1} />
      <text x="100" y="58" fill="#b45309" fontSize={10} fontWeight={900}>
        2
      </text>
      <rect
        x="134"
        y="28"
        width={44}
        height={22}
        rx={5}
        fill="none"
        stroke="#ea580c"
        strokeWidth={1.8}
      />
      <circle cx={142} cy={38} r={5} fill="#fdba74" stroke="#ea580c" strokeWidth={1} />
      <circle cx={156} cy={38} r={5} fill="#fdba74" stroke="#ea580c" strokeWidth={1} />
      <circle cx={170} cy={38} r={5} fill="#fdba74" stroke="#ea580c" strokeWidth={1} />
      <text x="152" y="58" fill="#c2410c" fontSize={10} fontWeight={900}>
        3
      </text>
      <path
        d="M 160 58 L 160 68"
        stroke="#818cf8"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polygon points="160,74 155,66 165,66" fill="#818cf8" />
      <rect
        x="78"
        y="74"
        width={164}
        height={26}
        rx={8}
        fill="#eef2ff"
        stroke="#a5b4fc"
        strokeWidth={1.5}
      />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle
          key={`t-${i}`}
          cx={92 + i * 14}
          cy={87}
          r={4}
          fill="#a78bfa"
          stroke="#6d28d9"
          strokeWidth={1}
        />
      ))}
      <text
        x="160"
        y="112"
        textAnchor="middle"
        fill="#1e293b"
        fontSize={12}
        fontWeight={900}
      >
        10 + 3 = 13
      </text>
    </svg>
  );
}

/** Ví dụ 9 + 6 — cùng kiểu sơ đồ, không đoạn văn */
function MakeTen9Plus6Svg() {
  return (
    <svg
      viewBox="0 0 320 118"
      className="mx-auto h-auto w-full max-w-md"
      aria-hidden
    >
      <title>Minh họa 9 cộng 6</title>
      <text x="6" y="16" fill="#475569" fontSize={11} fontWeight={700}>
        9
      </text>
      {Array.from({ length: 9 }).map((_, i) => (
        <circle
          key={`n9-${i}`}
          cx={14 + (i % 3) * 13}
          cy={26 + Math.floor(i / 3) * 13}
          r={5}
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth={1}
        />
      ))}
      <text x="58" y="52" fill="#334155" fontSize={18} fontWeight={900}>
        +
      </text>
      <text x="82" y="16" fill="#475569" fontSize={11} fontWeight={700}>
        6 = 1 + 5
      </text>
      <rect x="80" y="28" width={26} height={22} rx={5} fill="none" stroke="#d97706" strokeWidth={1.8} />
      <circle cx={92} cy={38} r={5} fill="#f59e0b" stroke="#d97706" strokeWidth={1} />
      <text x="86" y="58" fill="#b45309" fontSize={10} fontWeight={900}>
        1
      </text>
      <rect x="112" y="28" width={58} height={22} rx={5} fill="none" stroke="#ea580c" strokeWidth={1.8} />
      <circle cx={122} cy={38} r={5} fill="#fdba74" stroke="#ea580c" strokeWidth={1} />
      <circle cx={136} cy={38} r={5} fill="#fdba74" stroke="#ea580c" strokeWidth={1} />
      <circle cx={150} cy={38} r={5} fill="#fdba74" stroke="#ea580c" strokeWidth={1} />
      <circle cx={164} cy={38} r={5} fill="#fdba74" stroke="#ea580c" strokeWidth={1} />
      <circle cx={178} cy={38} r={5} fill="#fdba74" stroke="#ea580c" strokeWidth={1} />
      <text x="148" y="58" fill="#c2410c" fontSize={10} fontWeight={900}>
        5
      </text>
      <path d="M 168 58 L 168 68" stroke="#818cf8" strokeWidth={2} strokeLinecap="round" />
      <polygon points="168,74 163,66 173,66" fill="#818cf8" />
      <rect x="86" y="74" width={164} height={26} rx={8} fill="#fff7ed" stroke="#fbbf24" strokeWidth={1.5} />
      {Array.from({ length: 10 }).map((_, i) => (
        <circle
          key={`t9-${i}`}
          cx={100 + i * 14}
          cy={87}
          r={4}
          fill="#a78bfa"
          stroke="#6d28d9"
          strokeWidth={1}
        />
      ))}
      <text x="168" y="112" textAnchor="middle" fill="#1e293b" fontSize={12} fontWeight={900}>
        10 + 5 = 15
      </text>
    </svg>
  );
}

/** Chú thích màu — một hàng, gần như không đọc */
function B7ColorLegend() {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-xl bg-white/80 px-2 py-2 ring-1 ring-indigo-100"
      role="img"
      aria-label="Màu xanh là số ban đầu, cam đậm là phần ghép mười, cam nhạt là phần cộng thêm"
    >
      <span className="inline-flex items-center gap-1.5 font-black text-[10px] text-slate-600 sm:text-[11px]">
        <span className="h-3 w-3 rounded-full bg-sky-400 ring-1 ring-sky-600" />
        Số đầu
      </span>
      <span className="text-slate-300">|</span>
      <span className="inline-flex items-center gap-1.5 font-black text-[10px] text-slate-600 sm:text-[11px]">
        <span className="h-3 w-3 rounded-full bg-amber-500 ring-1 ring-amber-700" />
        Ghép 10
      </span>
      <span className="text-slate-300">|</span>
      <span className="inline-flex items-center gap-1.5 font-black text-[10px] text-slate-600 sm:text-[11px]">
        <span className="h-3 w-3 rounded-full bg-orange-300 ring-1 ring-orange-500" />
        Cộng nốt
      </span>
    </div>
  );
}

/** Giảng bằng hình — ít đoạn văn cho lớp 2 */
function B7MakeTenLessonDetail() {
  return (
    <div className="mt-4 max-h-[min(58vh,520px)] space-y-3 overflow-y-auto rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-white px-3 py-3 text-left sm:px-4">
      <div className="flex items-center justify-center gap-2 border-b border-indigo-100 pb-2">
        <BookOpen className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
        <h3 className="text-center font-black text-indigo-800 text-xs sm:text-sm">
          👀 Cùng xem hình
        </h3>
      </div>

      <B7ColorLegend />

      <section aria-labelledby="b7-steps-vis">
        <h4
          id="b7-steps-vis"
          className="sr-only"
        >
          Ba bước với ví dụ 8 cộng 5
        </h4>
        <div className="rounded-lg bg-white/90 p-1 ring-1 ring-violet-100">
          <MakeTenThreeStepsSvg />
        </div>
      </section>

      <section
        className="rounded-lg bg-white/90 p-2 ring-1 ring-sky-100"
        aria-labelledby="b7-visual"
      >
        <h4
          id="b7-visual"
          className="mb-2 text-center font-black text-sky-800 text-[11px] sm:text-xs"
        >
          Chấm tròn
        </h4>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:justify-center sm:gap-4">
          <DotCluster count={8} className="bg-sky-400" label="8" />
          <span className="pb-6 font-black text-slate-400 sm:pb-0">+</span>
          <div className="flex flex-col items-center gap-1">
            <span className="font-black text-[10px] text-slate-600 sm:text-xs">
              5 = 2 + 3
            </span>
            <div className="flex items-end gap-2">
              <DotCluster count={2} className="bg-amber-500" label="2" />
              <span className="pb-5 font-black text-slate-400">+</span>
              <DotCluster count={3} className="bg-orange-300" label="3" />
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-lg bg-white p-2 ring-1 ring-indigo-100">
        <p className="mb-1 text-center font-black text-indigo-700 text-[10px] sm:text-xs">
          Một dòng 8 + 5
        </p>
        <MakeTenFlowSvg />
      </div>

      <section
        className="rounded-lg border border-dashed border-amber-200 bg-amber-50/80 p-2"
        aria-labelledby="b7-example2"
      >
        <h4
          id="b7-example2"
          className="mb-1 text-center font-black text-amber-900 text-[11px] sm:text-xs"
        >
          Ví dụ khác: 9 + 6
        </h4>
        <MakeTen9Plus6Svg />
      </section>

      <div
        className="flex items-center justify-center gap-2 rounded-xl bg-lime-50 px-2 py-2 ring-1 ring-lime-200"
        role="img"
        aria-label="Mẹo: nhìn số lớn hơn, hỏi cần thêm mấy để được mười"
      >
        <span className="text-lg" aria-hidden>
          🎯
        </span>
        <div className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-black text-indigo-600 text-sm shadow ring-1 ring-lime-300">
            10
          </span>
          <span className="font-black text-lime-950 text-[10px] sm:text-[11px]">
            Thiếu mấy để đủ 10?
          </span>
        </div>
      </div>
    </div>
  );
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Cặp số có tổng > 10 và ≤ 20 (cộng qua 10) */
function randomPair(): { a: number; b: number; sum: number } {
  let a = randInt(2, 9);
  let b = randInt(2, 9);
  while (a + b <= 10 || a + b > 20) {
    a = randInt(2, 9);
    b = randInt(2, 9);
  }
  return { a, b, sum: a + b };
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function mcOptionsInRange(
  correct: number,
  min: number,
  max: number,
  count: number,
) {
  const wrongPool: number[] = [];
  for (let x = min; x <= max; x++) {
    if (x !== correct) wrongPool.push(x);
  }
  const set = new Set<number>([correct]);
  let guard = 0;
  while (set.size < count && wrongPool.length > 0 && guard < 50) {
    guard++;
    set.add(wrongPool[randInt(0, wrongPool.length - 1)]);
  }
  return shuffle([...set]);
}

type Question =
  | { id: string; kind: "sum"; a: number; b: number; answer: number }
  | {
      id: string;
      kind: "missing";
      displayA: number | null;
      displayB: number | null;
      sum: number;
      answer: number;
    };

function makeSumQuestion(id: string): Question {
  const { a, b, sum } = randomPair();
  return { id, kind: "sum", a, b, answer: sum };
}

function makeMissingQuestion(id: string): Question {
  const { a, b, sum } = randomPair();
  const hideFirst = Math.random() < 0.5;
  if (hideFirst) {
    return {
      id,
      kind: "missing",
      displayA: null,
      displayB: b,
      sum,
      answer: a,
    };
  }
  return {
    id,
    kind: "missing",
    displayA: a,
    displayB: null,
    sum,
    answer: b,
  };
}

function optionsFor(q: Question): number[] {
  if (q.kind === "sum") {
    return mcOptionsInRange(q.answer, 11, 20, 4);
  }
  return mcOptionsInRange(q.answer, 2, 9, 4);
}

function buildRound(
  roundIndex: number,
  count: number,
): { questions: Question[]; choices: number[][] } {
  const questions: Question[] = [];
  const choices: number[][] = [];
  for (let i = 0; i < count; i++) {
    const id = `r${roundIndex}-q${i}`;
    const q =
      roundIndex === 0
        ? makeSumQuestion(id)
        : roundIndex === 1
          ? makeMissingQuestion(id)
          : Math.random() < 0.5
            ? makeSumQuestion(id)
            : makeMissingQuestion(id);
    questions.push(q);
    choices.push(optionsFor(q));
  }
  return { questions, choices };
}

const ROUND_LABELS = [
  "Vòng 1: Tính tổng",
  "Vòng 2: Tìm số còn thiếu",
  "Vòng 3: Tổng hợp",
];

const Q_PER_ROUND = 4;

/** Đoạn hội thoại intro — gõ lần lượt: lời → phép tính → kết */
const B7_INTRO_SPEECH: Array<{ kind: "text" | "badge"; value: string }> = [
  { kind: "text", value: "Ta tách số để " },
  { kind: "badge", value: "ghép thành 10" },
  { kind: "text", value: " rồi cộng nốt — ví dụ" },
];
const B7_INTRO_SPEECH_LEN = B7_INTRO_SPEECH.reduce(
  (a, s) => a + s.value.length,
  0,
);
const B7_INTRO_EQUATION_STR = "8 + 5 = 8 + 2 + 3 = 10 + 3 = 13";
const B7_INTRO_CLOSE_STR = "Cùng thử nhé! 🌼";
const B7_INTRO_TICK_TOTAL =
  B7_INTRO_SPEECH_LEN +
  B7_INTRO_EQUATION_STR.length +
  B7_INTRO_CLOSE_STR.length;

function renderB7SpeechSegments(tick: number) {
  let rem = Math.min(tick, B7_INTRO_SPEECH_LEN);
  const nodes: ReactNode[] = [];
  let k = 0;
  for (const seg of B7_INTRO_SPEECH) {
    if (rem <= 0) break;
    const take = Math.min(rem, seg.value.length);
    const piece = seg.value.slice(0, take);
    if (seg.kind === "badge") {
      nodes.push(
        <span
          key={k++}
          className="whitespace-nowrap rounded-md bg-lime-200 px-1.5 py-0.5 font-black text-lime-900"
        >
          {piece}
        </span>,
      );
    } else {
      nodes.push(<span key={k++}>{piece}</span>);
    }
    rem -= take;
  }
  return nodes;
}

export function Math2B7Game() {
  const navigate = useNavigate();
  const { activeChild } = useActiveChild();
  const sound = useGameSound();
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [roundIdx, setRoundIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [feedback, setFeedback] = useState<"idle" | "ok" | "bad">("idle");
  const [introDialogueTick, setIntroDialogueTick] = useState(0);

  const [rounds] = useState(() => [
    buildRound(0, Q_PER_ROUND),
    buildRound(1, Q_PER_ROUND),
    buildRound(2, Q_PER_ROUND),
  ]);

  const currentQ = rounds[roundIdx].questions[qIdx];
  const currentChoices = rounds[roundIdx].choices[qIdx];

  const progress = (roundIdx * Q_PER_ROUND + qIdx) / (3 * Q_PER_ROUND - 1 || 1);

  const starsEarned = wrongTotal <= 2 ? 3 : wrongTotal <= 5 ? 2 : 1;

  const toggleSound = () => {
    const on = sound.toggleSound();
    setSoundOn(on);
    sound.click();
  };

  const handleAnswer = useCallback(
    (n: number) => {
      if (feedback !== "idle" || phase !== "play") return;
      if (n === currentQ.answer) {
        setFeedback("ok");
        sound.correctVoice();
        setTimeout(() => {
          setFeedback("idle");
          if (qIdx + 1 < Q_PER_ROUND) {
            setQIdx((x) => x + 1);
          } else if (roundIdx + 1 < 3) {
            setRoundIdx((r) => r + 1);
            setQIdx(0);
          } else {
            sound.victoryVoice();
            setPhase("done");
          }
        }, 650);
      } else {
        setFeedback("bad");
        setWrongTotal((w) => w + 1);
        sound.wrongVoice();
        setTimeout(() => setFeedback("idle"), 550);
      }
    },
    [currentQ, feedback, phase, qIdx, roundIdx, sound],
  );

  const restart = () => {
    sound.click();
    window.location.reload();
  };

  const startPlay = () => {
    sound.click();
    sound.introVoice();
    setPhase("play");
  };

  useEffect(() => {
    if (phase !== "intro") return;
    setIntroDialogueTick(0);
    const ms = 28;
    const id = window.setInterval(() => {
      setIntroDialogueTick((t) => (t < B7_INTRO_TICK_TOTAL ? t + 1 : t));
    }, ms);
    return () => window.clearInterval(id);
  }, [phase]);

  const equationText = (q: Question) => {
    if (q.kind === "sum") return `${q.a} + ${q.b} = ?`;
    const left = q.displayA === null ? "?" : String(q.displayA);
    const right = q.displayB === null ? "?" : String(q.displayB);
    return `${left} + ${right} = ${q.sum}`;
  };

  const introEqTick = Math.max(0, introDialogueTick - B7_INTRO_SPEECH_LEN);
  const introEqVisible = Math.min(introEqTick, B7_INTRO_EQUATION_STR.length);
  const introCloseTick = Math.max(
    0,
    introDialogueTick - B7_INTRO_SPEECH_LEN - B7_INTRO_EQUATION_STR.length,
  );
  const introCloseVisible = Math.min(introCloseTick, B7_INTRO_CLOSE_STR.length);
  const introTypingDone = introDialogueTick >= B7_INTRO_TICK_TOTAL;

  const introSpeaking = phase === "intro" && !introTypingDone;

  return (
    <div className="relative flex h-full min-h-screen flex-col overflow-hidden font-sans select-none">
      <Math2TheorySceneBackground />

      <div className="z-40 flex shrink-0 items-center justify-between border-b-3 border-emerald-300/50 bg-white/70 px-3 py-1.5 shadow-lg backdrop-blur-xl sm:px-5 sm:py-2">
        <button
          type="button"
          onClick={() => {
            sound.click();
            navigate("/student");
          }}
          className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 transition-colors hover:text-emerald-900 sm:text-sm"
        >
          <ArrowLeft size={16} />{" "}
          <span className="hidden sm:inline">Quay lại</span>
        </button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2">
          <span className="shrink-0 text-base sm:text-lg" aria-hidden>
            🗺️
          </span>
          <span className="truncate text-center font-black text-emerald-700 text-[11px] sm:text-xs md:text-sm">
            Bài 7 · Cộng qua 10 (≤ 20)
          </span>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          className={twMerge(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:h-10 sm:w-10",
            soundOn
              ? "border-emerald-400 bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
              : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200",
          )}
          aria-label={soundOn ? "Tắt âm thanh" : "Bật âm thanh"}
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      <main className="relative z-20 mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col items-center overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
        {phase === "intro" && (
          <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-5 text-center sm:gap-6 md:gap-8">
            {/* Robot + bong bóng thoại — cùng layout Math2B2TheoryPage */}
            <div className="w-full animate-fade-in-up">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <div
                    className={twMerge(
                      "h-20 w-20 overflow-hidden rounded-2xl border-4 shadow-2xl transition-all duration-300 sm:h-24 sm:w-24 md:h-28 md:w-28",
                      introSpeaking
                        ? "animate-theory-rainbow-border scale-105 border-indigo-400"
                        : "border-white/90",
                    )}
                  >
                    <video
                      src="/videos/VideoRobotHoatDong.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {introSpeaking && (
                    <div className="absolute -right-1.5 -top-1.5 animate-bounce rounded-full bg-indigo-500 p-1 text-white shadow-lg">
                      <Volume2 size={12} />
                    </div>
                  )}
                  <div className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-2.5 py-0.5 font-black text-[9px] text-white shadow-lg sm:text-[11px]">
                    Robot toán học 🤖
                  </div>
                </div>

                <div className="relative min-w-0 flex-1 text-left">
                  <div className="absolute -right-1 -top-2 z-10 rotate-12 rounded-full bg-lime-400 px-2.5 py-0.5 font-black text-[10px] text-lime-950 shadow-md ring-2 ring-white sm:text-xs">
                    +10
                  </div>
                  <div
                    className={twMerge(
                      "relative rounded-2xl border-4 p-4 shadow-xl transition-all duration-300 sm:p-5",
                      introSpeaking
                        ? "border-indigo-200 bg-white"
                        : "border-slate-200/60 bg-white/95",
                    )}
                  >
                    <div className="absolute -left-3 top-6 h-4 w-4 rotate-45 border-b-4 border-l-4 border-indigo-200 bg-white" />
                    <p className="mb-3 text-center font-black uppercase tracking-wide text-indigo-600 text-[11px] sm:text-xs">
                      Bí kíp siêu nhanh
                    </p>
                    <div aria-live="polite">
                      <p className="min-h-[3.5rem] text-sm font-black leading-snug text-slate-700 sm:min-h-[2.75rem] sm:text-base md:text-lg">
                        {renderB7SpeechSegments(introDialogueTick)}
                        {!introTypingDone &&
                          introDialogueTick < B7_INTRO_SPEECH_LEN && (
                            <span
                              className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 bg-indigo-500 align-middle animate-pulse"
                              aria-hidden
                            />
                          )}
                      </p>
                      {introSpeaking && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <SpeakingWaveMini />
                          <span className="font-bold text-[10px] text-indigo-400 sm:text-xs">
                            Đang nói...
                          </span>
                        </div>
                      )}
                      <div className="mt-3 min-h-[2.5rem] rounded-xl bg-slate-50 px-3 py-2 text-center font-black leading-snug text-indigo-700 ring-1 ring-indigo-100 sm:min-h-[2.75rem] sm:text-lg">
                        {introEqVisible > 0 ? (
                          introEqVisible < B7_INTRO_EQUATION_STR.length ? (
                            <span className="tabular-nums tracking-tight">
                              {B7_INTRO_EQUATION_STR.slice(0, introEqVisible)}
                            </span>
                          ) : (
                            <span className="tabular-nums tracking-tight">
                              {B7_INTRO_EQUATION_STR.slice(0, -2)}
                              <span className="text-amber-500">13</span>
                            </span>
                          )
                        ) : null}
                        {!introTypingDone &&
                          introDialogueTick >= B7_INTRO_SPEECH_LEN &&
                          introDialogueTick <
                            B7_INTRO_SPEECH_LEN +
                              B7_INTRO_EQUATION_STR.length && (
                            <span
                              className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 bg-indigo-500 align-middle animate-pulse"
                              aria-hidden
                            />
                          )}
                      </div>
                      <p className="mt-2 min-h-[1.25rem] text-center font-bold text-emerald-700 text-sm sm:text-base">
                        {introCloseVisible > 0
                          ? B7_INTRO_CLOSE_STR.slice(0, introCloseVisible)
                          : null}
                        {!introTypingDone &&
                          introDialogueTick >=
                            B7_INTRO_SPEECH_LEN +
                              B7_INTRO_EQUATION_STR.length && (
                            <span
                              className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 bg-emerald-600 align-middle animate-pulse"
                              aria-hidden
                            />
                          )}
                      </p>
                    </div>

                    <B7MakeTenLessonDetail />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="w-full animate-fade-in-up rounded-2xl border-[3px] border-emerald-200/80 bg-white/95 p-4 shadow-xl backdrop-blur sm:p-5"
              style={{ animationDelay: "0.1s" }}
            >
              <p className="mb-3 flex items-center justify-center gap-2 text-center font-black text-slate-800 text-sm sm:text-base">
                <Sparkles className="inline h-5 w-5 shrink-0 text-amber-400" />
                Chơi 3 vòng — càng đúng càng nhiều sao!
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                <div className="flex items-center gap-3 rounded-2xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-3 py-2.5 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-violet-200 bg-white font-black text-violet-600 text-xl shadow-sm">
                    1
                  </span>
                  <span className="text-left font-bold leading-snug text-violet-900 text-xs sm:text-[13px]">
                    Tính tổng
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 px-3 py-2.5 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-sky-200 bg-white font-black text-sky-600 text-xl shadow-sm">
                    2
                  </span>
                  <span className="text-left font-bold leading-snug text-sky-900 text-xs sm:text-[13px]">
                    Tìm số ẩn
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-amber-200 bg-white font-black text-amber-600 text-xl shadow-sm">
                    3
                  </span>
                  <span className="text-left font-bold leading-snug text-amber-950 text-xs sm:text-[13px]">
                    Tổng hợp
                  </span>
                </div>
              </div>
              <p className="mt-3 text-center font-bold text-slate-500 text-xs sm:text-sm">
                Mỗi vòng {Q_PER_ROUND} câu hỏi — trả lời đúng để gom ⭐⭐⭐
              </p>
            </div>

            <button
              type="button"
              onClick={startPlay}
              className="group w-full max-w-lg rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 font-black text-lg text-white shadow-[0_6px_0_#4338ca] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_0_#4338ca] active:translate-y-0.5 active:shadow-[0_2px_0_#4338ca] sm:px-14 sm:py-5 sm:text-2xl"
            >
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                Bắt đầu luyện tập
                <span className="text-2xl group-hover:animate-bounce sm:text-3xl" aria-hidden>
                  🚀
                </span>
              </span>
            </button>
          </div>
        )}

        {phase === "play" && currentQ && (
          <div className="flex flex-1 flex-col w-full gap-5 pt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
            </div>
            <p className="text-center font-black text-violet-800 text-sm sm:text-base">
              {ROUND_LABELS[roundIdx]}
            </p>
            <div
              className={`rounded-3xl border-4 border-white bg-white/90 p-6 sm:p-8 shadow-xl transition ${
                feedback === "ok"
                  ? "ring-4 ring-emerald-300"
                  : feedback === "bad"
                    ? "ring-4 ring-rose-300"
                    : ""
              }`}
            >
              <p className="text-center text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                {currentQ.kind === "sum"
                  ? "Tính kết quả"
                  : "Số nào thay cho dấu ?"}
              </p>
              <p className="text-center font-black text-slate-800 text-4xl sm:text-5xl tabular-nums tracking-tight">
                {equationText(currentQ)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
              {currentChoices.map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={feedback !== "idle"}
                  onClick={() => handleAnswer(n)}
                  className="rounded-2xl border-b-4 border-violet-700 bg-gradient-to-br from-violet-400 to-indigo-500 py-4 sm:py-5 font-black text-2xl sm:text-3xl text-white shadow-lg transition hover:brightness-110 active:translate-y-1 active:border-b-0 disabled:opacity-60"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center w-full animate-fade-in">
            <Sparkles className="text-amber-400 w-16 h-16" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              Hoàn thành Bài 7! 🎉
            </h2>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  size={40}
                  className={
                    i <= starsEarned
                      ? "fill-amber-400 text-amber-500"
                      : "text-slate-300"
                  }
                />
              ))}
            </div>
            <p className="font-bold text-slate-600 max-w-sm">
              Bạn làm sai {wrongTotal} lần — cứ luyện thêm để giảm số lần sai
              nhé!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <button
                type="button"
                onClick={restart}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-md border-2 border-slate-200"
              >
                <RotateCcw size={20} />
                Chơi lại
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  markMath2LessonCompleted(activeChild?.id || "", "math2-b7");
                  navigate("/student");
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3 font-black text-white shadow-[0_4px_0_#0e7490]"
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
