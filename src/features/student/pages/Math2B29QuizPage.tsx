import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, RotateCcw, Sparkles, Trophy, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InteractiveAnalogClock } from "@/features/student/components/InteractiveAnalogClock";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import * as lessonService from "@/features/student/api/lessonService";
import * as leaderboardService from "@/features/student/api/leaderboardService";

type ChoiceQuestion = { kind: "choice"; prompt: string; hour: number; minute: number; choices: string[]; answer: string; tip: string };
type SetQuestion = { kind: "set"; prompt: string; hour: number; minute: number; startHour: number; startMinute: number; tip: string };
type Question = ChoiceQuestion | SetQuestion;

const QUESTIONS: Question[] = [
  { kind: "choice", prompt: "Đồng hồ đang chỉ mấy giờ?", hour: 7, minute: 0, choices: ["7 giờ", "12 giờ", "5 giờ", "7 giờ 30 phút"], answer: "7 giờ", tip: "Kim dài ở số 12 là 00 phút. Hãy nhìn kim ngắn." },
  { kind: "choice", prompt: "Tí Tách ăn trưa vào giờ nào?", hour: 11, minute: 30, choices: ["11 giờ", "11 giờ 30 phút", "6 giờ 55 phút", "12 giờ 30 phút"], answer: "11 giờ 30 phút", tip: "Kim dài ở số 6 nghĩa là 30 phút." },
  { kind: "set", prompt: "Hãy chỉnh đồng hồ đến 8 giờ 15 phút để mở cổng!", hour: 8, minute: 15, startHour: 3, startMinute: 40, tip: "15 phút: kim dài chỉ số 3; kim ngắn ở gần số 8." },
  { kind: "choice", prompt: "Kim dài màu cam cho chúng ta biết gì?", hour: 3, minute: 45, choices: ["Giờ", "Phút", "Buổi trong ngày", "Ngày trong tuần"], answer: "Phút", tip: "Kim dài đi qua mỗi số là thêm 5 phút." },
  { kind: "choice", prompt: "Chiếc đồng hồ này phù hợp với hoạt động nào?", hour: 9, minute: 0, choices: ["Đi ngủ buổi tối", "Ăn trưa", "Đến trường lúc 7 giờ", "Thức dậy lúc 6 giờ"], answer: "Đi ngủ buổi tối", tip: "9 giờ tối thường là thời gian nghỉ ngơi của bạn nhỏ." },
  { kind: "set", prompt: "Nhiệm vụ cuối: chỉnh đồng hồ đến 6 giờ 45 phút!", hour: 6, minute: 45, startHour: 10, startMinute: 10, tip: "45 phút: kim dài chỉ số 9." },
];

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "vi-VN";
  utterance.rate = 0.92;
  utterance.voice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("vi")) ?? null;
  window.speechSynthesis.speak(utterance);
}

const normalizeHour = (hour: number) => ((hour - 1 + 12) % 12) + 1;
const initialTimeFor = (question: Question) => question.kind === "set"
  ? { hour: question.startHour, minute: question.startMinute }
  : { hour: 12, minute: 0 };

export function Math2B29QuizPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { activeChild } = useActiveChild();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [clockTime, setClockTime] = useState({ hour: 12, minute: 0 });
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = QUESTIONS[index];
  const stars = useMemo(() => score === QUESTIONS.length ? 3 : score >= 4 ? 2 : 1, [score]);

  useEffect(() => {
    const id = window.setTimeout(() => speak(question.prompt), 350);
    return () => { window.clearTimeout(id); window.speechSynthesis?.cancel(); };
  }, [question]);

  const check = () => {
    const correct = question.kind === "choice" ? selected === question.answer : normalizeHour(clockTime.hour) === normalizeHour(question.hour) && Math.round(clockTime.minute / 5) * 5 % 60 === question.minute;
    setResult(correct ? "correct" : "wrong");
    if (correct) { setScore((value) => value + 1); speak("Chính xác! Bạn nhận được một ngôi sao năng lượng."); }
    else speak(`Chưa đúng rồi. ${question.tip}`);
  };

  const saveProgress = async () => {
    if (!activeChild) return;
    try {
      const map = await lessonService.getStudentMap(activeChild.id);
      const lesson = map.topics.flatMap((topic) => topic.lessons).find((item) => item.lessonNumber === 29);
      if (lesson) await leaderboardService.submitAttempt(activeChild.id, lesson.id, score, QUESTIONS.length);
      window.dispatchEvent(new Event("math2-progress-updated"));
    } catch (error) { console.error(error); }
  };

  const next = () => {
    if (index === QUESTIONS.length - 1) { setFinished(true); void saveProgress(); speak("Xuất sắc! Bạn đã hoàn thành thử thách Cỗ máy Thời gian."); return; }
    const nextIndex = index + 1;
    setIndex(nextIndex); setSelected(null); setClockTime(initialTimeFor(QUESTIONS[nextIndex])); setResult("idle");
  };
  const restart = () => { setIndex(0); setScore(0); setFinished(false); setResult("idle"); setSelected(null); setClockTime({ hour: 12, minute: 0 }); };
  const retry = () => { setSelected(null); setResult("idle"); if (question.kind === "set") setClockTime(initialTimeFor(question)); };

  useEffect(() => {
    if (result !== "correct") return;
    const id = window.setTimeout(next, 1600);
    return () => window.clearTimeout(id);
  }, [result, index]);

  if (finished) return <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#071127] p-5 text-white"><Backdrop />
    {Array.from({ length: 18 }, (_, i) => <motion.span key={i} className="absolute text-2xl" initial={{ y: -80, x: `${(i * 37) % 100}vw` }} animate={reduceMotion ? { opacity: .7 } : { y: "110vh", rotate: i * 80, opacity: [0, 1, 1, 0] }} transition={{ duration: 3 + i % 3, delay: i * .12, repeat: Infinity }}>✨</motion.span>)}
    <motion.section initial={reduceMotion ? false : { scale: .75, y: 35, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="relative z-10 w-full max-w-xl rounded-[40px] border border-cyan-200/30 bg-slate-950/80 p-8 text-center shadow-[0_30px_100px_rgba(34,211,238,.25)] backdrop-blur-2xl">
      <motion.img src="/robot-head.png" alt="Tí Tách" className="mx-auto h-28 w-28 rounded-[32px] bg-cyan-400/15 p-2 ring-2 ring-cyan-300/30" animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [-2, 2, -2] }} transition={{ duration: 2.3, repeat: Infinity }} />
      <div className="mt-4 text-6xl">🏆</div><h1 className="mt-3 text-3xl font-black sm:text-4xl">Bậc thầy Thời gian!</h1><p className="mt-3 text-lg font-bold text-cyan-100">Bạn trả lời đúng <strong className="text-amber-300">{score}/{QUESTIONS.length}</strong> câu và nhận được {stars} ngôi sao.</p>
      <div className="my-6 text-4xl">{Array.from({ length: 3 }, (_, i) => <motion.span key={i} animate={i < stars && !reduceMotion ? { scale: [1, 1.3, 1] } : undefined} transition={{ delay: i * .2 }}> {i < stars ? "⭐" : "☆"}</motion.span>)}</div>
      <div className="grid gap-3 sm:grid-cols-2"><button onClick={() => navigate("/student")} className="h-14 rounded-2xl border border-white/15 bg-white/10 font-black hover:bg-white/15">Về bản đồ</button><button onClick={restart} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 font-black"><RotateCcw className="h-5 w-5" />Chơi lại</button></div>
    </motion.section></main>;

  return <main className="scrollbar-hide relative h-screen overflow-x-hidden overflow-y-auto bg-[#071127] text-white"><Backdrop /><motion.div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" animate={reduceMotion ? undefined : { x: [0, 80, 0], y: [0, -50, 0] }} transition={{ duration: 8, repeat: Infinity }} />
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[1450px] flex-col p-4 sm:p-6"><Header index={index} score={score} onBack={() => navigate("/student/game/math2-b29-time-lab")} />
      <AnimatePresence mode="wait"><motion.div key={index} initial={reduceMotion ? false : { opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -25 }} className="flex flex-1 flex-col gap-4 py-4">
        <QuizQuestionBanner question={question} index={index} result={result} reduceMotion={reduceMotion} />
        <div className="grid flex-1 items-stretch gap-5 lg:grid-cols-[minmax(420px,1.1fr)_minmax(390px,.9fr)]">
          <section className={`relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-[44px] border-4 border-white/70 bg-gradient-to-br from-amber-50/90 via-sky-50/88 to-violet-100/86 p-3 shadow-[0_25px_80px_rgba(8,47,73,.35)] ${result === "wrong" ? "animate-pulse" : ""}`}>
            <img src="/assets/lessons/math2-b29/quiz-clock-portal-background.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/20 to-white/10" />
            <motion.div className="absolute h-[78%] w-[78%] rounded-full border-2 border-cyan-300/35" animate={reduceMotion ? undefined : { rotate: 360, scale: [1, 1.025, 1] }} transition={{ rotate: { duration: 18, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity } }} />
            <motion.div className="absolute h-[70%] w-[70%] rounded-full border border-dashed border-amber-300/45" animate={reduceMotion ? undefined : { rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} />
            <motion.div className="absolute left-6 top-6 rounded-full bg-indigo-950 px-4 py-2 text-xs font-black tracking-widest text-cyan-200" animate={reduceMotion ? undefined : { y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>CỔNG ĐỒNG HỒ</motion.div>
            <div className="relative h-[420px] w-full max-w-[470px]"><InteractiveAnalogClock hour={question.kind === "choice" ? question.hour : clockTime.hour} minute={question.kind === "choice" ? question.minute : clockTime.minute} onChange={(hour, minute) => { if (question.kind === "set" && result === "idle") setClockTime({ hour, minute }); }} disabled={question.kind === "choice" || result !== "idle"} showControls={question.kind === "set"} /></div>
            <motion.div className="absolute bottom-5 right-6 h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_25px_8px_rgba(34,211,238,.7)]" animate={reduceMotion ? undefined : { scale: [1, 1.7, 1], opacity: [.5, 1, .5] }} transition={{ duration: 1.6, repeat: Infinity }} />
            <AnimatePresence>{result === "correct" && <motion.div initial={{ opacity: 0, scale: .6, y: -12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .8 }} className="absolute right-5 top-5 z-30 flex items-center gap-3 rounded-2xl border-2 border-white bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-3 text-white shadow-[0_12px_35px_rgba(16,185,129,.4)]"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/20"><Trophy className="h-6 w-6" /></span><div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-50">Tuyệt vời</p><p className="text-xl font-black">Chính xác!</p></div></motion.div>}</AnimatePresence>
            <AnimatePresence>{result === "correct" && <div className="pointer-events-none absolute inset-0 z-20">{Array.from({ length: 12 }, (_, particle) => <motion.span key={particle} className="absolute left-1/2 top-1/2 text-xl" initial={{ x: 0, y: 0, opacity: 0, scale: .4 }} animate={{ x: Math.cos(particle * Math.PI / 6) * (130 + particle % 3 * 24), y: Math.sin(particle * Math.PI / 6) * (130 + particle % 3 * 24), opacity: [0, 1, 0], scale: [0.4, 1.2, .7], rotate: particle * 55 }} transition={{ duration: 1.25, ease: "easeOut" }}>✨</motion.span>)}</div>}</AnimatePresence>
          </section>
          <div className="relative min-h-[440px] overflow-hidden rounded-[32px] border border-white/15 bg-slate-950/75 shadow-2xl backdrop-blur-xl lg:min-h-[620px]">
            <QuizAnswerPanel question={question} result={result} selected={selected} clockTime={clockTime} onSelect={setSelected} onAction={result === "wrong" ? retry : check} reduceMotion={reduceMotion} />
            {question.kind === "set" && <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pointer-events-none absolute inset-x-5 bottom-5 top-[245px] overflow-hidden rounded-[24px] border border-cyan-300/25 bg-indigo-950 shadow-[0_15px_35px_rgba(2,6,23,.35)]">
              <img src="/assets/lessons/math2-b29/ti-tach-hologram-hint.png" alt="" className="h-full w-full object-cover object-left" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4"><p className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">Trạm năng lượng thời gian</p><p className="mt-1 text-sm font-bold text-white">Tí Tách đang chờ bạn điều khiển hai kim!</p></div>
              <motion.span className="absolute right-5 top-5 text-2xl" animate={reduceMotion ? undefined : { rotate: [0, 20, 0], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.span>
            </motion.div>}
          </div>
        </div>
      </motion.div></AnimatePresence>
    </div></main>;
}

function Backdrop() { return <><img src="/assets/lessons/math2-b29/quiz-time-workshop-background.png" alt="" className="fixed inset-0 h-dvh w-full object-cover" /><div className="fixed inset-0 bg-gradient-to-b from-indigo-950/15 via-sky-900/5 to-indigo-950/30" /><div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(30,27,75,.2)_100%)]" /></>; }

// Keep the former card available while the new banner layout is rolled out.
void QuestionCard;
void AnswerCard;

function QuizQuestionBanner({ question, index, result, reduceMotion }: { question: Question; index: number; result: string; reduceMotion: boolean | null }) {
  return <section className="relative flex items-stretch gap-3 sm:gap-4">
    <motion.div className="relative hidden w-24 shrink-0 overflow-visible rounded-[26px] border-2 border-white/70 bg-gradient-to-b from-indigo-900 to-violet-950 shadow-[0_14px_35px_rgba(30,27,75,.38)] sm:grid sm:place-items-center" animate={reduceMotion ? undefined : { y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity }}>
      <div className="absolute inset-2 rounded-[19px] border border-cyan-300/20" />
      <motion.img src="/robot-head.png" alt="Tí Tách" className="relative h-16 w-16 object-contain drop-shadow-[0_8px_14px_rgba(34,211,238,.35)]" animate={reduceMotion ? undefined : { rotate: [-3, 3, -3] }} transition={{ duration: 2.2, repeat: Infinity }} />
      <span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-amber-400 text-sm font-black text-amber-950 shadow-lg">{index + 1}</span>
    </motion.div>
    <div className="relative min-w-0 flex-1 rounded-[26px] border-2 border-white/80 bg-white/95 px-5 py-4 text-indigo-950 shadow-[0_14px_40px_rgba(30,27,75,.25)] sm:px-7">
      <div className="flex items-center gap-3"><span className="grid h-8 min-w-8 place-items-center rounded-full bg-amber-400 text-xs font-black text-amber-950 sm:hidden">{index + 1}</span><p className="text-[10px] font-black uppercase tracking-[.22em] text-violet-600">Tí Tách giao nhiệm vụ</p></div>
      <h1 className="mt-1 text-lg font-black leading-tight sm:text-2xl lg:text-[28px]">{question.prompt}</h1>
      {result === "wrong" && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 rounded-xl bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700"><Sparkles className="mr-2 inline h-4 w-4" />{question.tip}</motion.div>}
    </div>
    <motion.button onClick={() => speak(question.prompt)} whileHover={reduceMotion ? undefined : { y: -3, scale: 1.03 }} whileTap={{ scale: .96 }} className="group flex w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-[24px] border-2 border-white/60 bg-gradient-to-b from-indigo-800 to-indigo-950 text-white shadow-[0_14px_35px_rgba(30,27,75,.35)] sm:w-24">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-cyan-400/20 ring-1 ring-cyan-300/30 transition group-hover:bg-cyan-400/30"><Volume2 className="h-5 w-5 text-cyan-200" /></span>
      <span className="text-[10px] font-black sm:text-xs">Nghe lại</span>
    </motion.button>
  </section>;
}

function QuizAnswerPanel({ question, result, selected, clockTime, onSelect, onAction, reduceMotion }: { question: Question; result: "idle" | "correct" | "wrong"; selected: string | null; clockTime: { hour: number; minute: number }; onSelect: (value: string) => void; onAction: () => void; reduceMotion: boolean | null }) {
  const disabled = result === "idle" && question.kind === "choice" && !selected;
  const optionTones = ["from-cyan-400 to-sky-500", "from-violet-400 to-indigo-500", "from-amber-300 to-orange-500", "from-rose-400 to-pink-500"];
  return <section className="relative z-10 rounded-[32px] p-5">
    {question.kind === "choice" ? <div className="grid gap-3">{question.choices.map((choice, i) => { const active = selected === choice; return <motion.button key={choice} disabled={result !== "idle"} onClick={() => onSelect(choice)} initial={reduceMotion ? false : { opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0, scale: active ? 1.018 : 1 }} transition={{ delay: i * .07, type: "spring", stiffness: 260, damping: 22 }} whileHover={reduceMotion || result !== "idle" ? undefined : { x: 6, scale: 1.012 }} whileTap={{ scale: .97 }} className={`group relative flex min-h-[66px] items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left font-black shadow-[0_5px_0_rgba(2,6,23,.3)] transition-colors ${active && result === "correct" ? "border-emerald-300 bg-emerald-400/25 ring-2 ring-emerald-300/30" : active ? "border-cyan-300 bg-cyan-400/20 ring-2 ring-cyan-300/20" : "border-white/15 bg-gradient-to-r from-slate-800/95 to-indigo-950/80 hover:border-white/30"}`}><motion.span animate={active && !reduceMotion ? { rotate: [0, -6, 6, 0] } : undefined} className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${optionTones[i]} font-black text-white shadow-lg`}>{String.fromCharCode(65 + i)}</motion.span><span className="text-[15px] text-white sm:text-base">{choice}</span><span className={`ml-auto h-5 w-5 rounded-full border-2 transition ${active ? "border-cyan-300 bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.7)]" : "border-slate-500 group-hover:border-slate-300"}`} /></motion.button>; })}</div> : <motion.div initial={reduceMotion ? false : { opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center"><motion.div animate={reduceMotion ? undefined : { rotate: [0, 8, 0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}><Clock3 className="mx-auto h-10 w-10 text-cyan-300" /></motion.div><p className="mt-3 font-bold text-slate-300">Kéo trực tiếp hai kim hoặc chọn kim bên dưới.</p><motion.p key={`${clockTime.hour}-${clockTime.minute}`} initial={reduceMotion ? false : { scale: .85, opacity: .5 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 text-3xl font-black tabular-nums text-cyan-300">{String(clockTime.hour).padStart(2, "0")}:{String(Math.round(clockTime.minute / 5) * 5 % 60).padStart(2, "0")}</motion.p></motion.div>}
    <motion.button onClick={onAction} disabled={disabled || result === "correct"} whileHover={disabled || result === "correct" || reduceMotion ? undefined : { y: -2 }} whileTap={{ scale: .98 }} className={`relative mt-5 inline-flex h-16 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-lg font-black shadow-[0_7px_0_rgba(15,23,42,.7)] disabled:cursor-default ${result === "correct" ? "bg-emerald-400 text-emerald-950" : result === "wrong" ? "bg-amber-400 text-amber-950" : "bg-gradient-to-r from-cyan-400 to-violet-500 disabled:opacity-40"}`}>
      {result === "correct" && <motion.span className="absolute inset-y-0 left-0 bg-white/30" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.6, ease: "linear" }} />}
      <span className="relative inline-flex items-center gap-2">{result === "correct" ? <><CheckCircle2 />Đang mở câu tiếp theo...</> : result === "wrong" ? <><RotateCcw />Thử lại</> : disabled ? <>Chọn một đáp án</> : <>Kiểm tra<Sparkles /></>}</span>
    </motion.button>
  </section>;
}

function Header({ index, score, onBack }: { index: number; score: number; onBack: () => void }) { return <header className="flex items-center gap-3"><button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-slate-950/60"><ArrowLeft className="h-5 w-5" /></button><div className="min-w-0 flex-1"><div className="flex justify-between text-xs font-black"><span className="truncate text-cyan-200">BÀI 29 · CỖ MÁY THỜI GIAN</span><span>{index + 1}/{QUESTIONS.length}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-950/70"><motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" animate={{ width: `${(index / QUESTIONS.length) * 100}%` }} /></div></div><div className="rounded-2xl bg-amber-400/15 px-4 py-3 font-black text-amber-300">⭐ {score}</div></header>; }

function QuestionCard({ question, index, result, reduceMotion }: { question: Question; index: number; result: string; reduceMotion: boolean | null }) { return <section className="rounded-[32px] border border-cyan-300/20 bg-slate-950/72 p-5 shadow-2xl backdrop-blur-xl"><div className="flex items-center gap-3"><motion.img src="/robot-head.png" alt="Tí Tách" className="h-20 w-20 rounded-3xl bg-cyan-400/15 p-1 ring-1 ring-cyan-300/30" animate={reduceMotion ? undefined : { y: [0, -7, 0] }} transition={{ duration: 2.2, repeat: Infinity }} /><div><p className="text-[10px] font-black tracking-widest text-cyan-300">TÍ TÁCH HỎI</p><p className="font-black">Câu {index + 1}</p></div></div><h1 className="mt-5 text-2xl font-black leading-snug">{question.prompt}</h1><button onClick={() => speak(question.prompt)} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold"><Volume2 className="h-4 w-4" />Nghe câu hỏi</button>{result === "wrong" && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl border border-rose-300/30 bg-rose-500/15 p-4 text-sm font-bold text-rose-100"><Sparkles className="mb-2 h-5 w-5 text-amber-300" />{question.tip}</motion.div>}</section>; }

function AnswerCard({ question, result, selected, clockTime, onSelect, onAction }: { question: Question; result: "idle" | "correct" | "wrong"; selected: string | null; clockTime: { hour: number; minute: number }; onSelect: (value: string) => void; onAction: () => void }) { const disabled = result === "idle" && question.kind === "choice" && !selected; return <section className="rounded-[32px] border border-white/15 bg-slate-950/75 p-5 shadow-2xl backdrop-blur-xl">{question.kind === "choice" ? <div className="grid gap-3">{question.choices.map((choice, i) => <motion.button key={choice} disabled={result !== "idle"} onClick={() => onSelect(choice)} whileHover={{ x: 5 }} className={`flex min-h-16 items-center gap-3 rounded-2xl border p-3 text-left font-black ${selected === choice ? "border-cyan-300 bg-cyan-400/20 ring-2 ring-cyan-300/20" : "border-white/10 bg-white/5 hover:bg-white/10"}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-cyan-300">{String.fromCharCode(65 + i)}</span>{choice}</motion.button>)}</div> : <div className="text-center"><Clock3 className="mx-auto h-10 w-10 text-cyan-300" /><p className="mt-3 font-bold text-slate-300">Kéo trực tiếp hai kim hoặc chọn kim bên dưới.</p><p className="mt-4 text-3xl font-black tabular-nums text-cyan-300">{String(clockTime.hour).padStart(2, "0")}:{String(Math.round(clockTime.minute / 5) * 5 % 60).padStart(2, "0")}</p></div>}<button onClick={onAction} disabled={disabled} className={`mt-5 inline-flex h-16 w-full items-center justify-center gap-2 rounded-2xl text-lg font-black shadow-[0_7px_0_rgba(30,41,59,.7)] disabled:opacity-40 ${result === "correct" ? "bg-emerald-400 text-emerald-950" : result === "wrong" ? "bg-amber-400 text-amber-950" : "bg-gradient-to-r from-cyan-400 to-violet-500"}`}>{result === "correct" ? <><CheckCircle2 />Tiếp tục<ChevronRight /></> : result === "wrong" ? <><RotateCcw />Thử lại</> : <>Kiểm tra<Sparkles /></>}</button></section>; }
