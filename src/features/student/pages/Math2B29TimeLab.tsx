import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Bot, CheckCircle2, ChevronRight, Clock3, Lightbulb, Minus, Plus, Sparkles, Volume2, WandSparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { useLang } from "@/shared/lib/i18n";
import * as lessonService from "@/features/student/api/lessonService";
import { InteractiveAnalogClock } from "@/features/student/components/InteractiveAnalogClock";

type Mission = { hour: number; minute: number; vi: string; en: string; scene: "morning" | "day" | "evening" | "night" };
const MISSIONS: Mission[] = [
  { hour: 7, minute: 0, vi: "Bạn An đến trường lúc 7 giờ. Bé hãy chỉnh đồng hồ đúng giờ nhé!", en: "An arrives at school at 7 o'clock. Set the clock correctly!", scene: "morning" },
  { hour: 8, minute: 30, vi: "Lớp học bắt đầu lúc 8 giờ 30 phút.", en: "Class starts at 8:30.", scene: "morning" },
  { hour: 11, minute: 45, vi: "Bữa trưa bắt đầu lúc 11 giờ 45 phút.", en: "Lunch starts at 11:45.", scene: "day" },
  { hour: 6, minute: 15, vi: "Buổi tập chiều bắt đầu lúc 6 giờ 15 phút.", en: "Evening practice starts at 6:15.", scene: "evening" },
  { hour: 9, minute: 0, vi: "Tí Tách sạc pin lúc 9 giờ tối.", en: "Ti Tach charges at 9 o'clock at night.", scene: "night" },
];
const normalizeHour = (hour: number) => ((hour - 1 + 12) % 12) + 1;
function speak(text: string, lang: "vi" | "en") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const locale = lang === "vi" ? "vi-VN" : "en-US";
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = locale;
  utterance.rate = .9;
  utterance.pitch = 1.04;
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === locale.toLowerCase())
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(lang))
    ?? null;
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(utterance);
}
function stopSpeaking() {
  window.speechSynthesis?.cancel();
}

export function LegacyTimeLabClock({ hour, minute, onChange, disabled }: { hour: number; minute: number; onChange: (hour: number, minute: number) => void; disabled: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<"hour" | "minute" | null>(null);
  const update = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !dragRef.current) return;
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    const angle = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
    if (dragRef.current === "minute") onChange(hour, Math.round(angle / 30) * 5 % 60);
    else onChange(normalizeHour(Math.round(angle / 30) || 12), minute);
  }, [hour, minute, onChange]);
  const start = (hand: "hour" | "minute", event: React.PointerEvent<SVGElement>) => {
    if (disabled) return;
    event.stopPropagation();
    dragRef.current = hand;
    svgRef.current?.setPointerCapture(event.pointerId);
    update(event.clientX, event.clientY);
  };
  const stop = (event: React.PointerEvent<SVGElement>) => {
    dragRef.current = null;
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
  };
  const hourAngle = hour * 30 + minute / 2;
  const minuteAngle = minute * 6;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[430px]">
      <svg ref={svgRef} viewBox="0 0 520 520" className="h-full w-full touch-none select-none drop-shadow-[0_24px_25px_rgba(0,0,0,.45)]" onPointerMove={(event) => dragRef.current && update(event.clientX, event.clientY)} onPointerUp={stop} onPointerCancel={stop}>
        <defs>
          <radialGradient id="gameClockFace" cx="38%" cy="28%"><stop offset="0" stopColor="#fff"/><stop offset=".7" stopColor="#edf8ff"/><stop offset="1" stopColor="#c9dfed"/></radialGradient>
          <linearGradient id="gameGoldFrame" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff1a3"/><stop offset=".2" stopColor="#ffbd16"/><stop offset=".55" stopColor="#c66a00"/><stop offset=".78" stopColor="#ffb800"/><stop offset="1" stopColor="#7b3400"/></linearGradient>
          <linearGradient id="gameHourHand"><stop stopColor="#35117f"/><stop offset=".5" stopColor="#8051ff"/><stop offset="1" stopColor="#321070"/></linearGradient>
          <linearGradient id="gameMinuteHand"><stop stopColor="#b42d10"/><stop offset=".5" stopColor="#ff7557"/><stop offset="1" stopColor="#a8260d"/></linearGradient>
          <filter id="gameHandGlow"><feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity=".35"/></filter>
        </defs>
        <circle cx="260" cy="270" r="226" fill="#7d3500" opacity=".9"/>
        <circle cx="260" cy="252" r="226" fill="url(#gameGoldFrame)" stroke="#ffe797" strokeWidth="4"/>
        <circle cx="260" cy="252" r="204" fill="url(#gameClockFace)" stroke="#75400e" strokeWidth="5"/>
        <circle cx="260" cy="252" r="196" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="3"/>
        {Array.from({length:60},(_,index)=>{const angle=index*6*Math.PI/180,major=index%5===0,outer=187,inner=major?171:179;return <line key={index} x1={260+Math.sin(angle)*inner} y1={252-Math.cos(angle)*inner} x2={260+Math.sin(angle)*outer} y2={252-Math.cos(angle)*outer} stroke={major?"#173e67":"#91abc0"} strokeWidth={major?5:2} strokeLinecap="round"/>;})}
        {Array.from({length:12},(_,index)=>{const value=index+1,angle=value*30*Math.PI/180;return <text key={value} x={260+Math.sin(angle)*145} y={252-Math.cos(angle)*145} textAnchor="middle" dominantBaseline="central" fill="#283d57" fontSize="29" fontWeight="900" fontFamily="Arial Rounded MT Bold, Arial, sans-serif">{value}</text>;})}
        <g transform={`rotate(${hourAngle} 260 252)`} filter="url(#gameHandGlow)" onPointerDown={(event)=>start("hour",event)}>
          <path d="M244 266 L250 145 Q260 126 270 145 L276 266 Z" fill="url(#gameHourHand)" stroke="#2d116c" strokeWidth="3"/><path d="M250 145 L260 115 L270 145 Z" fill="#8b63ff" stroke="#2d116c" strokeWidth="3"/><path d="M247 270 L253 300 Q260 312 267 300 L273 270 Z" fill="#391383"/><path d="M230 318 L230 110 L290 110 L290 318 Z" fill="transparent"/>
        </g>
        <g transform={`rotate(${minuteAngle} 260 252)`} filter="url(#gameHandGlow)" onPointerDown={(event)=>start("minute",event)}>
          <path d="M252 265 L255 100 Q260 84 265 100 L268 265 Z" fill="url(#gameMinuteHand)" stroke="#a72b10" strokeWidth="2"/><path d="M254 101 L260 71 L266 101 Z" fill="#ff9278" stroke="#a72b10" strokeWidth="2"/><path d="M255 270 L257 310 Q260 319 263 310 L265 270 Z" fill="#b52c0e"/><path d="M238 325 L238 65 L282 65 L282 325 Z" fill="transparent"/>
        </g>
        <circle cx="260" cy="252" r="23" fill="#d9f8ff" stroke="#195c86" strokeWidth="5"/><circle cx="260" cy="252" r="11" fill="#13bdeb" stroke="white" strokeWidth="4"/><path d="M135 100 Q220 45 315 72" fill="none" stroke="white" strokeOpacity=".38" strokeWidth="16" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function TimeButton({ tone, amount, unit, onClick }: { tone: "hour" | "minute"; amount: number; unit: string; onClick: () => void }) {
  const positive = amount > 0;
  return <motion.button type="button" onClick={onClick} whileHover={{ y: -3, scale: 1.025 }} whileTap={{ y: 3, scale: .96 }} transition={{ type: "spring", stiffness: 500, damping: 24 }} className={`group relative min-h-20 overflow-hidden rounded-2xl border p-3 text-left shadow-[0_5px_0_rgba(15,23,42,.45)] transition-colors ${tone === "hour" ? "border-cyan-300/25 bg-cyan-400/10 hover:bg-cyan-400/20" : "border-violet-300/25 bg-violet-400/10 hover:bg-violet-400/20"}`}><span className={`grid h-8 w-8 place-items-center rounded-xl transition-transform group-hover:rotate-6 ${tone === "hour" ? "bg-cyan-400/20 text-cyan-200" : "bg-violet-400/20 text-violet-200"}`}>{positive ? <Plus className="h-5 w-5" strokeWidth={3} /> : <Minus className="h-5 w-5" strokeWidth={3} />}</span><span className="mt-2 block text-sm font-black">{positive ? "+" : "−"}{Math.abs(amount)} {unit}</span><span className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-white/5 transition-transform group-hover:scale-150" /></motion.button>;
}

function KidControls({ lang, reduceMotion, onHourDown, onHourUp, onMinuteDown, onMinuteUp, onHint, onCheck }: { lang: "vi" | "en"; reduceMotion: boolean | null; onHourDown: () => void; onHourUp: () => void; onMinuteDown: () => void; onMinuteUp: () => void; onHint: () => void; onCheck: () => void }) {
  return <motion.aside initial={reduceMotion?false:{opacity:0,x:24}} animate={{opacity:1,x:0}} className="rounded-[30px] border border-white/15 bg-slate-950/75 p-5 shadow-2xl backdrop-blur-xl"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/25 to-violet-500/25 text-cyan-200"><Clock3 className="h-5 w-5"/></span><div><p className="text-sm font-black">{lang==="vi"?"Chỉnh đồng hồ":"Set the clock"}</p><p className="mt-0.5 text-[10px] font-bold text-slate-400">{lang==="vi"?"Chạm nút hoặc kéo hai kim":"Tap a button or drag the hands"}</p></div></div><div className="mt-4"><p className="mb-2 text-[10px] font-black uppercase tracking-[.16em] text-cyan-300">🕐 {lang==="vi"?"Chỉnh giờ":"Change hour"}</p><div className="grid grid-cols-2 gap-2"><TimeButton tone="hour" amount={-1} unit={lang==="vi"?"giờ":"hour"} onClick={onHourDown}/><TimeButton tone="hour" amount={1} unit={lang==="vi"?"giờ":"hour"} onClick={onHourUp}/></div></div><div className="mt-4"><p className="mb-2 text-[10px] font-black uppercase tracking-[.16em] text-violet-300">⏱️ {lang==="vi"?"Chỉnh phút":"Change minutes"}</p><div className="grid grid-cols-2 gap-2"><TimeButton tone="minute" amount={-5} unit={lang==="vi"?"phút":"min"} onClick={onMinuteDown}/><TimeButton tone="minute" amount={5} unit={lang==="vi"?"phút":"min"} onClick={onMinuteUp}/></div></div><motion.button type="button" onClick={onHint} whileHover={{scale:1.02,y:-2}} whileTap={{scale:.97,y:2}} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-400/10 text-xs font-black text-amber-200 shadow-[0_4px_0_rgba(120,53,15,.35)] transition hover:bg-amber-400/20"><motion.span animate={reduceMotion?undefined:{rotate:[0,-8,8,0]}} transition={{duration:2,repeat:Infinity,repeatDelay:1}}><Lightbulb className="h-4 w-4"/></motion.span>{lang==="vi"?"Tí Tách gợi ý cho bé":"Get a hint from Ti Tach"}</motion.button><motion.button type="button" onClick={onCheck} whileHover={{scale:1.025,y:-3}} whileTap={{scale:.96,y:4}} className="group relative mt-4 flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 text-lg font-black shadow-[0_7px_0_#3730a3,0_14px_30px_rgba(59,130,246,.3)]"><span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"/><CheckCircle2 className="relative h-6 w-6"/><span className="relative">{lang==="vi"?"Xong rồi, kiểm tra!":"Done, check it!"}</span><WandSparkles className="relative h-5 w-5 text-amber-200"/></motion.button></motion.aside>;
}

export function Math2B29TimeLab() {
  const rawNavigate=useNavigate(), {lang}=useLang(), {activeChild}=useActiveChild(), reduceMotion=useReducedMotion();
  const [index,setIndex]=useState(0), [hour,setHour]=useState(12), [minute,setMinute]=useState(0), [attempts,setAttempts]=useState(0), [feedback,setFeedback]=useState<"idle"|"wrong"|"correct"|"done">("idle"), [score,setScore]=useState(0), [hint,setHint]=useState("");
  const navigate=(destination:string)=>rawNavigate(destination==="/student"&&feedback==="done"?"/student/quiz/math2-b29":destination);
  const mission=MISSIONS[index], message=mission[lang];
  const adaptiveHint=useMemo(()=>minute!==mission.minute?(lang==="vi"?`Kim dài chỉ phút. Mỗi số cách nhau 5 phút; bé hãy tìm ${mission.minute} phút.`:`The long hand shows minutes. Find ${mission.minute} minutes.`):(lang==="vi"?`Kim dài đúng rồi! Bé đưa kim ngắn về số ${mission.hour}.`:`The long hand is correct. Move the short hand to ${mission.hour}.`),[minute,mission,lang]);
  useEffect(()=>{const id=setTimeout(()=>speak(message,lang),500);return()=>{clearTimeout(id);stopSpeaking()}},[message,lang]);
  const change=(h:number,m:number)=>{if(feedback==="correct"||feedback==="done")return;setHour(h);setMinute(m);setFeedback("idle");setHint("")};
  const requestHint=()=>{setAttempts(a=>a+1);setFeedback("idle");setHint(adaptiveHint);speak(adaptiveHint,lang)};
  const save=async()=>{if(!activeChild)return;try{const map=await lessonService.getStudentMap(activeChild.id);const lesson=map.topics.flatMap(t=>t.lessons).find(l=>l.lessonNumber===29);if(lesson)await lessonService.markCompleted(activeChild.id,lesson.id);window.dispatchEvent(new Event("math2-progress-updated"))}catch(e){console.error(e)}};
  const check=()=>{if(normalizeHour(hour)===normalizeHour(mission.hour)&&minute===mission.minute){setScore(s=>s+Math.max(1,3-attempts));speak(lang==="vi"?"Chính xác! Bạn làm tốt lắm!":"Correct! Great job!",lang);if(index===MISSIONS.length-1){setFeedback("done");void save()}else setFeedback("correct")}else{const errorMessage=lang==="vi"?`Chưa đúng rồi. Đồng hồ của bạn đang chỉ ${hour} giờ ${minute} phút. ${adaptiveHint}`:`Not quite. Your clock shows ${hour}:${String(minute).padStart(2,"0")}. ${adaptiveHint}`;setAttempts(a=>a+1);setFeedback("wrong");setHint(errorMessage);speak(errorMessage,lang)}};
  const next=()=>{setIndex(i=>i+1);setHour(12);setMinute(0);setAttempts(0);setFeedback("idle");setHint("")};
  return <main className="relative min-h-screen overflow-hidden bg-[#071127] text-white"><img src="/assets/lessons/math2-b29/time-lab-background.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60"/><div className={`absolute inset-0 transition-colors duration-1000 ${mission.scene==="night"?"bg-indigo-950/60":mission.scene==="evening"?"bg-orange-950/25":"bg-sky-950/15"}`}/><div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 py-4 sm:px-6"><header className="flex items-center justify-between"><button onClick={()=>navigate("/student")} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/50 px-4 text-xs font-black backdrop-blur-xl"><ArrowLeft className="h-4 w-4"/>{lang==="vi"?"Bản đồ":"Map"}</button><div className="rounded-2xl border border-white/15 bg-slate-950/50 px-4 py-2 text-center backdrop-blur-xl"><p className="text-[9px] font-black uppercase tracking-[.18em] text-cyan-300">{lang==="vi"?"Bài 29 · Phòng thí nghiệm thời gian":"Lesson 29 · Time Laboratory"}</p><p className="text-sm font-black">{index+1}/{MISSIONS.length}</p></div><div className="rounded-2xl border border-white/15 bg-slate-950/50 px-4 py-2 text-xs font-black text-amber-300 backdrop-blur-xl">⭐ {score}</div></header><div className="mt-4 grid flex-1 items-center gap-5 lg:grid-cols-[360px_minmax(400px,1fr)_330px]"><motion.section initial={reduceMotion?false:{opacity:0,x:-24}} animate={feedback==="wrong"?{opacity:1,x:[0,-7,7,-4,4,0]}:{opacity:1,x:0}} style={{backgroundImage:"linear-gradient(180deg,rgba(5,13,32,.42),rgba(5,13,32,.96)),url('/assets/lessons/math2-b29/ti-tach-hologram-hint.png')",backgroundSize:"cover",backgroundPosition:"35% center"}} className={`relative overflow-hidden rounded-[32px] border p-6 shadow-[0_24px_70px_rgba(0,0,0,.38)] backdrop-blur-xl transition-colors ${feedback==="wrong"?"border-rose-400/60":"border-cyan-300/20"}`}><div className="flex items-center gap-3"><motion.img animate={reduceMotion?undefined:{y:[0,-5,0]}} transition={{duration:2.6,repeat:Infinity}} src="/robot-head.png" className="h-14 w-14 rounded-2xl bg-cyan-400/15 p-1 ring-1 ring-cyan-300/30"/><div><p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-cyan-300"><Bot className="h-3.5 w-3.5"/>{lang==="vi"?"Nhiệm vụ của Tí Tách":"Ti Tach mission"}</p><p className="text-sm font-black">{activeChild?.name||"Bạn nhỏ"}</p></div></div><div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/65 p-4"><p className="text-lg font-black leading-relaxed">{message}</p><button onClick={()=>speak(message,lang)} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold transition hover:-translate-y-0.5 hover:bg-white/15"><Volume2 className="h-4 w-4"/>{lang==="vi"?"Nghe nhiệm vụ":"Listen"}</button></div><AnimatePresence>{hint&&<motion.div initial={{opacity:0,y:10,scale:.97}} animate={{opacity:1,y:0,scale:1}} className={`mt-4 rounded-2xl border p-4 text-sm font-bold shadow-lg ${feedback==="wrong"?"border-rose-300/45 bg-rose-500/20 text-rose-50":"border-amber-300/35 bg-amber-400/15 text-amber-50"}`}><p className={`mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${feedback==="wrong"?"text-rose-200":"text-amber-300"}`}><Sparkles className="h-3.5 w-3.5"/>{feedback==="wrong"?(lang==="vi"?"Chưa đúng · Tí Tách giúp bạn":"Not quite · Ti Tach helps"):(lang==="vi"?"AI gợi ý":"AI hint")}</p>{hint}</motion.div>}</AnimatePresence></motion.section><section className="flex flex-col items-center"><div className="h-[430px] w-full max-w-[430px]"><InteractiveAnalogClock hour={hour} minute={minute} onChange={change} disabled={feedback==="correct"||feedback==="done"} showControls={false}/></div><div className="rounded-2xl border border-white/15 bg-slate-950/70 px-6 py-3 text-center backdrop-blur-xl"><p className="text-[9px] uppercase tracking-widest text-slate-400">{lang==="vi"?"Đồng hồ của bé":"Your clock"}</p><p className="text-2xl font-black tabular-nums text-cyan-300">{String(hour).padStart(2,"0")}:{String(minute).padStart(2,"0")}</p></div></section><KidControls lang={lang} reduceMotion={reduceMotion} onHourDown={()=>change(normalizeHour(hour-1),minute)} onHourUp={()=>change(normalizeHour(hour+1),minute)} onMinuteDown={()=>change(hour,(minute+55)%60)} onMinuteUp={()=>change(hour,(minute+5)%60)} onHint={requestHint} onCheck={check}/></div></div><AnimatePresence>{(feedback==="correct"||feedback==="done")&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-md"><motion.div initial={{scale:.8,y:20}} animate={{scale:1,y:0}} className="w-full max-w-md rounded-[30px] bg-gradient-to-br from-indigo-600 to-violet-700 p-7 text-center shadow-2xl"><div className="text-6xl">{feedback==="done"?"🏆":"🌟"}</div><h2 className="mt-4 text-3xl font-black">{feedback==="done"?(lang==="vi"?"Hoàn thành xuất sắc!":"Excellent work!"):(lang==="vi"?"Chính xác!":"Correct!")}</h2><p className="mt-2 text-indigo-100">{feedback==="done"?(lang==="vi"?"Bé đã khởi động lại Trái tim Thời gian.":"You restarted the Heart of Time."):`${String(mission.hour).padStart(2,"0")}:${String(mission.minute).padStart(2,"0")}`}</p><button onClick={feedback==="done"?()=>navigate("/student"):next} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white font-black text-indigo-600">{feedback==="done"?(lang==="vi"?"Về bản đồ":"Back to map"):(lang==="vi"?"Nhiệm vụ tiếp theo":"Next mission")}<ChevronRight className="h-4 w-4"/></button></motion.div></motion.div>}</AnimatePresence></main>;
}
