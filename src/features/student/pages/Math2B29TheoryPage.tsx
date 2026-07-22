import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Group } from "three";
import { InteractiveAnalogClock } from "@/features/student/components/InteractiveAnalogClock";

const LESSON_IMAGE = "/assets/lessons/math2-b29/tutorial-seven-oclock.png";
const DAILY_IMAGE = "/assets/lessons/math2-b29/daily-activities-grid.png";
const LAB_IMAGE = "/assets/lessons/math2-b29/time-lab-background.png";

type Slide = {
  eyebrow: string;
  title: string;
  text: string;
  prompt: string;
  kind: "story" | "clock" | "minutes" | "day" | "ready";
};

const SLIDES: Slide[] = [
  {
    eyebrow: "CHẶNG 1 · CÂU CHUYỆN BUỔI SÁNG",
    title: "7 giờ — một ngày mới bắt đầu!",
    text: "Bạn An thức dậy lúc 7 giờ. Trên đồng hồ, kim ngắn chỉ số 7 và kim dài chỉ số 12.",
    prompt: "Hãy nhìn hai chiếc kim và nghe Tí Tách kể nhé!",
    kind: "story",
  },
  {
    eyebrow: "CHẶNG 2 · LÀM QUEN VỚI KIM GIỜ",
    title: "Kim ngắn cho biết giờ",
    text: "Kim màu tím ngắn hơn. Khi kim ngắn chỉ số 7, đồng hồ đang ở giờ thứ 7.",
    prompt: "Chạm vào kim tím, giữ và kéo đến một số giờ khác.",
    kind: "clock",
  },
  {
    eyebrow: "CHẶNG 3 · KHÁM PHÁ KIM PHÚT",
    title: "Kim dài cho biết phút",
    text: "Kim màu cam dài hơn. Mỗi số kim đi qua là 5 phút. Chỉ số 12 nghĩa là tròn giờ, tức 00 phút.",
    prompt: "Chạm vào kim cam, giữ và kéo qua từng vạch phút nhé!",
    kind: "minutes",
  },
  {
    eyebrow: "CHẶNG 4 · THỜI GIAN QUANH MÌNH",
    title: "Mỗi hoạt động có một thời điểm",
    text: "Buổi sáng đi học, buổi trưa ăn cơm, buổi chiều vận động và buổi tối đi ngủ. Đồng hồ giúp bạn sắp xếp một ngày thật khoa học.",
    prompt: "Bạn nhận ra hoạt động nào diễn ra vào buổi tối?",
    kind: "day",
  },
  {
    eyebrow: "HOÀN THÀNH HƯỚNG DẪN",
    title: "Bạn đã sẵn sàng sửa đồng hồ!",
    text: "Nhớ nhé: kim ngắn chỉ giờ, kim dài chỉ phút và mỗi nấc là 5 phút. Tí Tách sẽ đồng hành cùng bạn trong 5 nhiệm vụ.",
    prompt: "Vào phòng thí nghiệm và chinh phục ngôi sao đầu tiên nào!",
    kind: "ready",
  },
];

type ClockHand = "hour" | "minute";

function FloatingClock3D({
  hour,
  minute,
  selected,
  onSelect,
  onDrag,
}: {
  hour: number;
  minute: number;
  selected: ClockHand | null;
  onSelect: (hand: ClockHand) => void;
  onDrag: (hand: ClockHand, x: number, y: number) => void;
}) {
  const group = useRef<Group>(null);
  const activeHand = useRef<ClockHand | null>(null);

  const beginDrag = (hand: ClockHand, event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    activeHand.current = hand;
    onSelect(hand);
    (event.target as Element).setPointerCapture?.(event.pointerId);
  };

  const finishDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!activeHand.current) return;
    activeHand.current = null;
    (event.target as Element).releasePointerCapture?.(event.pointerId);
  };
  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.12;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.08;
  });
  const hourAngle = ((hour % 12) * 30 + minute * 0.5) * Math.PI / 180;
  const minuteAngle = minute * 6 * Math.PI / 180;
  const hourLength = 0.92;
  const minuteLength = 1.25;
  return (
    <group
      ref={group}
      onPointerDown={(event) => {
        if (selected) beginDrag(selected, event);
      }}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        const hand = activeHand.current;
        if (!hand) return;
        event.stopPropagation();
        onDrag(hand, event.point.x, event.point.y - (group.current?.position.y ?? 0));
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.65, 1.65, 0.26, 64]} />
        <meshPhysicalMaterial color="#eaf8ff" metalness={0.12} roughness={0.2} clearcoat={0.7} clearcoatRoughness={0.16} />
      </mesh>
      <mesh position={[0, 0, 0.16]}>
        <circleGeometry args={[1.48, 64]} />
        <meshPhysicalMaterial color="#f7fcff" roughness={0.28} clearcoat={0.9} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.14]}>
        <torusGeometry args={[1.58, 0.13, 20, 64]} />
        <meshPhysicalMaterial color="#e99b06" metalness={0.72} roughness={0.16} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0, 0.22]}>
        <torusGeometry args={[1.43, 0.018, 10, 64]} />
        <meshStandardMaterial color="#9ab2c4" metalness={0.4} />
      </mesh>
      {Array.from({ length: 60 }, (_, index) => {
        const major = index % 5 === 0;
        const angle = index * Math.PI / 30;
        return (
          <mesh key={`minute-mark-${index}`} position={[Math.sin(angle) * 1.34, Math.cos(angle) * 1.34, 0.25]} rotation={[0, 0, -angle]}>
            <boxGeometry args={[major ? 0.035 : 0.014, major ? 0.14 : 0.07, 0.025]} />
            <meshStandardMaterial color={major ? "#183d65" : "#8ba5b9"} metalness={0.28} />
          </mesh>
        );
      })}
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index + 1) * Math.PI / 6;
        return (
          <mesh key={index} position={[Math.sin(angle) * 1.12, Math.cos(angle) * 1.12, 0.27]}>
            <sphereGeometry args={[index % 3 === 2 ? 0.065 : 0.045, 20, 20]} />
            <meshStandardMaterial color={index % 3 === 2 ? "#103b6c" : "#718da3"} metalness={0.42} roughness={0.22} />
          </mesh>
        );
      })}
      <group rotation={[0, 0, -hourAngle]} position={[0, 0, 0.34]}>
        <mesh position={[0, hourLength * 0.39, 0]} onPointerDown={(event) => beginDrag("hour", event)}>
          <boxGeometry args={[0.16, hourLength * 0.78, 0.1]} />
          <meshStandardMaterial color="#6946ff" emissive={selected === "hour" ? "#8a6cff" : "#25108d"} emissiveIntensity={selected === "hour" ? 1.2 : 0.35} metalness={0.3} roughness={0.22} />
        </mesh>
        <mesh position={[0, hourLength * 0.85, 0]} onPointerDown={(event) => beginDrag("hour", event)}>
          <coneGeometry args={[0.15, hourLength * 0.28, 4]} />
          <meshStandardMaterial color="#7b52ff" emissive={selected === "hour" ? "#8a6cff" : "#25108d"} emissiveIntensity={selected === "hour" ? 1.2 : 0.35} metalness={0.3} roughness={0.2} />
        </mesh>
        <mesh position={[0, hourLength * 0.48, 0.03]} onPointerDown={(event) => beginDrag("hour", event)}>
          <boxGeometry args={[0.34, hourLength * 1.15, 0.12]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </group>
      <group rotation={[0, 0, -minuteAngle]} position={[0, 0, 0.43]}>
        <mesh position={[0, minuteLength * 0.42, 0]} onPointerDown={(event) => beginDrag("minute", event)}>
          <boxGeometry args={[0.085, minuteLength * 0.84, 0.09]} />
          <meshStandardMaterial color="#ff735c" emissive={selected === "minute" ? "#ff8d70" : "#b52222"} emissiveIntensity={selected === "minute" ? 1.1 : 0.25} metalness={0.24} roughness={0.2} />
        </mesh>
        <mesh position={[0, minuteLength * 0.91, 0]} onPointerDown={(event) => beginDrag("minute", event)}>
          <coneGeometry args={[0.09, minuteLength * 0.25, 4]} />
          <meshStandardMaterial color="#ff8168" emissive={selected === "minute" ? "#ff9c87" : "#b52222"} emissiveIntensity={selected === "minute" ? 1.1 : 0.25} metalness={0.24} roughness={0.18} />
        </mesh>
        <mesh position={[0, minuteLength * 0.5, 0.03]} onPointerDown={(event) => beginDrag("minute", event)}>
          <boxGeometry args={[0.27, minuteLength * 1.16, 0.12]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </group>
      <mesh position={[0, 0, 0.48]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial color="#4fdcff" metalness={0.45} roughness={0.18} />
      </mesh>
    </group>
  );
}

export function FinalInteractiveClock() {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [selected, setSelected] = useState<ClockHand | null>(null);

  const handleDrag = (hand: ClockHand, x: number, y: number) => {
    const degrees = (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
    if (hand === "minute") {
      setMinute(Math.round(degrees / 6) % 60);
    } else {
      const nextHour = Math.round(degrees / 30) % 12;
      setHour(nextHour === 0 ? 12 : nextHour);
    }
  };

  return (
    <div className={`flex h-full min-h-0 select-none flex-col ${selected ? "cursor-grabbing" : "cursor-grab"}`}>
      <div className="min-h-0 flex-1">
        <Canvas camera={{ position: [0, 0, 5.9], fov: 45 }}>
          <ambientLight intensity={1.7} />
          <directionalLight position={[3, 4, 5]} intensity={3.2} />
          <pointLight position={[-3, 1, 3]} color="#65e8ff" intensity={12} />
          <Suspense fallback={null}>
            <FloatingClock3D hour={hour} minute={minute} selected={selected} onSelect={setSelected} onDrag={handleDrag} />
          </Suspense>
        </Canvas>
      </div>
      <div className="pointer-events-none z-10 flex shrink-0 flex-col items-center gap-2 px-3 pb-4 pt-1">
        <p className="rounded-full border border-white/15 bg-slate-950/75 px-4 py-2 text-sm font-bold text-slate-200 backdrop-blur-xl">Chạm vào một chiếc kim, giữ và kéo để chỉnh giờ</p>
        <div className="pointer-events-auto flex gap-2 rounded-2xl border border-white/15 bg-slate-950/85 p-2 backdrop-blur-xl">
          <button type="button" onClick={() => setSelected("hour")} className={`rounded-xl px-4 py-2 font-black transition hover:-translate-y-1 active:translate-y-0 ${selected === "hour" ? "bg-violet-500 ring-2 ring-white" : "bg-violet-950 text-violet-200"}`}>Kim giờ</button>
          <button type="button" onClick={() => setSelected("minute")} className={`rounded-xl px-4 py-2 font-black transition hover:-translate-y-1 active:translate-y-0 ${selected === "minute" ? "bg-orange-500 ring-2 ring-white" : "bg-orange-950 text-orange-200"}`}>Kim phút</button>
          <strong className="grid min-w-24 place-items-center rounded-xl bg-white/10 text-xl text-cyan-300">{String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}</strong>
        </div>
      </div>
    </div>
  );
}

export function InteractiveClock({ minuteMode }: { minuteMode: boolean }) {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const hourAngle = hour * 30 + minute * 0.5;
  const minuteAngle = minute * 6;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <motion.div
        initial={{ scale: 0.7, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        className="relative aspect-square w-[min(56vw,360px)] rounded-full bg-gradient-to-br from-[#fff4b8] via-[#ffb300] to-[#b95700] p-[13px] shadow-[0_18px_0_#8e3f00,0_30px_65px_rgba(0,0,0,.5),inset_0_3px_3px_rgba(255,255,255,.9)]"
      >
        <div className="absolute inset-[7px] rounded-full border border-white/70 shadow-[inset_0_0_12px_rgba(92,42,0,.65)]" />
        <div className="relative h-full w-full overflow-hidden rounded-full border-[5px] border-[#8b4a13] bg-[radial-gradient(circle_at_42%_35%,#ffffff_0%,#effaff_52%,#c9e1ef_100%)] shadow-[inset_0_8px_18px_rgba(255,255,255,.9),inset_0_-12px_24px_rgba(45,89,122,.25)]">
          {/* Minute scale: the longer quarter marks make the face readable at a glance. */}
          {Array.from({ length: 60 }, (_, index) => {
            const major = index % 5 === 0;
            return (
              <i key={`tick-${index}`} className="pointer-events-none absolute inset-[5%]" style={{ transform: `rotate(${index * 6}deg)` }}>
                <span className={`absolute left-1/2 top-0 block -translate-x-1/2 rounded-full ${major ? "h-[6%] w-[3px] bg-slate-700" : "h-[3.5%] w-[1.5px] bg-slate-400"}`} />
              </i>
            );
          })}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i + 1) * 30;
          const radius = 38;
          const x = 50 + Math.sin((angle * Math.PI) / 180) * radius;
          const y = 50 - Math.cos((angle * Math.PI) / 180) * radius;
          return <span key={i} className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-black text-slate-700 drop-shadow-[0_1px_0_white] md:text-xl" style={{ left: `${x}%`, top: `${y}%` }}>{i + 1}</span>;
        })}
          <div className="absolute left-1/2 top-[67%] -translate-x-1/2 rounded-full border border-slate-300/70 bg-white/65 px-3 py-1 text-[9px] font-black tracking-[.18em] text-slate-500 shadow-sm">TÍ TÁCH LAB</div>

          {/* Hour hand with a metallic edge and a rear counterweight. */}
          <motion.div animate={{ rotate: hourAngle }} transition={{ type: "spring", stiffness: 130, damping: 17 }} className="absolute bottom-1/2 left-1/2 z-20 h-[29%] w-[16px] origin-bottom -translate-x-1/2">
            <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-[#331483] via-[#804cff] to-[#32117b] shadow-[2px_3px_5px_rgba(28,10,80,.45),inset_1px_0_1px_rgba(255,255,255,.65)] [clip-path:polygon(50%_0,100%_24%,78%_100%,22%_100%,0_24%)]" />
            <div className="absolute left-1/2 top-full h-[27%] w-2 -translate-x-1/2 rounded-b-full bg-violet-900" />
          </motion.div>

          {/* Minute hand stays long and orange so young learners can distinguish it. */}
          <motion.div animate={{ rotate: minuteAngle }} transition={{ type: "spring", stiffness: 130, damping: 17 }} className="absolute bottom-1/2 left-1/2 z-30 h-[40%] w-[9px] origin-bottom -translate-x-1/2">
            <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-[#b82d0c] via-[#ff6a2b] to-[#a92508] shadow-[2px_3px_5px_rgba(92,23,4,.45),inset_1px_0_1px_rgba(255,255,255,.7)] [clip-path:polygon(50%_0,100%_18%,72%_100%,28%_100%,0_18%)]" />
            <div className="absolute left-1/2 top-full h-[20%] w-1.5 -translate-x-1/2 rounded-b-full bg-orange-900" />
          </motion.div>

          <div className="absolute left-1/2 top-1/2 z-40 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-[#e8f7ff] bg-gradient-to-br from-cyan-300 to-blue-700 shadow-[0_3px_7px_rgba(0,0,0,.45),inset_0_2px_2px_white]">
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>

          {/* Curved glass highlight gives the clock a physical, toy-like finish. */}
          <div className="pointer-events-none absolute left-[12%] top-[7%] h-[43%] w-[63%] -rotate-[18deg] rounded-[50%] bg-gradient-to-b from-white/55 via-white/15 to-transparent blur-[1px]" />
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/80" />
        </div>
      </motion.div>
      <div className="flex items-center gap-3 rounded-2xl bg-slate-950/75 p-2 text-white backdrop-blur-xl">
        <button type="button" onClick={() => minuteMode ? setMinute((v) => (v + 5) % 60) : setHour((v) => v % 12 + 1)} className="group flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 font-black shadow-[0_5px_0_#312e81] transition hover:-translate-y-1 hover:brightness-110 active:translate-y-1 active:shadow-none">
          <Clock3 size={20} className="transition group-hover:rotate-12" /> {minuteMode ? "+ 5 phút" : "+ 1 giờ"}
        </button>
        <strong className="min-w-20 text-center text-xl text-cyan-300">{String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}</strong>
      </div>
    </div>
  );
}

/** One clock face for every lesson stage: familiar, readable and pointer-capture driven. */
export function LegacyUnifiedLearningClock({ focus = null }: { focus?: ClockHand | null }) {
  const [hourRotation, setHourRotation] = useState(210);
  const [minuteRotation, setMinuteRotation] = useState(0);
  const [selected, setSelected] = useState<ClockHand | null>(focus);
  const activeHand = useRef<ClockHand | null>(null);
  const lastPointerAngle = useRef(0);
  const hourRotationRef = useRef(210);
  const minuteRotationRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => setSelected(focus), [focus]);

  const getPointerAngle = (event: React.PointerEvent<SVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    return (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
  };

  const updateFromPointer = (event: React.PointerEvent<SVGElement>) => {
    const hand = activeHand.current;
    if (!hand) return;
    const pointerAngle = getPointerAngle(event);
    // Normalize only the delta, never the accumulated rotation. This keeps
    // 359° -> 360° -> 361° continuous in either direction and across many laps.
    const delta = ((pointerAngle - lastPointerAngle.current + 540) % 360) - 180;
    lastPointerAngle.current = pointerAngle;

    if (hand === "minute") {
      minuteRotationRef.current += delta;
      hourRotationRef.current += delta / 12;
      setMinuteRotation(minuteRotationRef.current);
      setHourRotation(hourRotationRef.current);
    } else {
      hourRotationRef.current += delta;
      setHourRotation(hourRotationRef.current);
    }
  };

  const startDrag = (hand: ClockHand, event: React.PointerEvent<SVGElement>) => {
    event.preventDefault();
    activeHand.current = hand;
    lastPointerAngle.current = getPointerAngle(event);
    setSelected(hand);
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const stopDrag = (event: React.PointerEvent<SVGElement>) => {
    activeHand.current = null;
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
  };

  const normalizedMinute = ((minuteRotation % 360) + 360) % 360;
  const normalizedHour = ((hourRotation % 360) + 360) % 360;
  const minute = Math.round(normalizedMinute / 6) % 60;
  const hourIndex = Math.floor((normalizedHour + 0.001) / 30) % 12;
  const hour = hourIndex === 0 ? 12 : hourIndex;

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 px-4 py-3">
      <div className="min-h-0 w-full flex-1">
        <svg
          ref={svgRef}
          viewBox="0 0 520 520"
          role="application"
          aria-label="Đồng hồ tương tác. Giữ và kéo kim để chỉnh giờ."
          className={`mx-auto block h-full max-h-[490px] w-full touch-none select-none drop-shadow-[0_22px_22px_rgba(0,0,0,.42)] ${activeHand.current ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={(event) => selected && startDrag(selected, event)}
          onPointerMove={updateFromPointer}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          <defs>
            <radialGradient id="clockFace" cx="38%" cy="28%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.7" stopColor="#edf8ff" />
              <stop offset="1" stopColor="#c9dfed" />
            </radialGradient>
            <linearGradient id="goldFrame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff1a3" />
              <stop offset="0.2" stopColor="#ffbd16" />
              <stop offset="0.55" stopColor="#c66a00" />
              <stop offset="0.78" stopColor="#ffb800" />
              <stop offset="1" stopColor="#7b3400" />
            </linearGradient>
            <linearGradient id="hourHand" x1="0" x2="1"><stop stopColor="#35117f" /><stop offset=".5" stopColor="#8051ff" /><stop offset="1" stopColor="#321070" /></linearGradient>
            <linearGradient id="minuteHand" x1="0" x2="1"><stop stopColor="#b42d10" /><stop offset=".5" stopColor="#ff7557" /><stop offset="1" stopColor="#a8260d" /></linearGradient>
            <filter id="handGlow"><feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity=".35" /></filter>
          </defs>

          <circle cx="260" cy="270" r="226" fill="#7d3500" opacity=".9" />
          <circle cx="260" cy="252" r="226" fill="url(#goldFrame)" stroke="#ffe797" strokeWidth="4" />
          <circle cx="260" cy="252" r="204" fill="url(#clockFace)" stroke="#75400e" strokeWidth="5" />
          <circle cx="260" cy="252" r="196" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="3" />

          {Array.from({ length: 60 }, (_, index) => {
            const angle = index * 6 * Math.PI / 180;
            const major = index % 5 === 0;
            const outer = 187;
            const inner = major ? 171 : 179;
            return <line key={index} x1={260 + Math.sin(angle) * inner} y1={252 - Math.cos(angle) * inner} x2={260 + Math.sin(angle) * outer} y2={252 - Math.cos(angle) * outer} stroke={major ? "#173e67" : "#91abc0"} strokeWidth={major ? 5 : 2} strokeLinecap="round" />;
          })}

          {Array.from({ length: 12 }, (_, index) => {
            const value = index + 1;
            const angle = value * 30 * Math.PI / 180;
            return <text key={value} x={260 + Math.sin(angle) * 145} y={252 - Math.cos(angle) * 145} textAnchor="middle" dominantBaseline="central" fill="#283d57" fontSize="29" fontWeight="900" fontFamily="Arial Rounded MT Bold, Arial, sans-serif">{value}</text>;
          })}

          <g transform={`rotate(${hourRotation} 260 252)`} filter="url(#handGlow)" onPointerDown={(event) => { event.stopPropagation(); startDrag("hour", event); }}>
            <path d="M244 266 L250 145 Q260 126 270 145 L276 266 Z" fill="url(#hourHand)" stroke="#2d116c" strokeWidth="3" />
            <path d="M250 145 L260 115 L270 145 Z" fill="#8b63ff" stroke="#2d116c" strokeWidth="3" />
            <path d="M247 270 L253 300 Q260 312 267 300 L273 270 Z" fill="#391383" />
            <path d="M230 318 L230 110 L290 110 L290 318 Z" fill="transparent" stroke="transparent" strokeWidth="1" />
          </g>

          <g transform={`rotate(${minuteRotation} 260 252)`} filter="url(#handGlow)" onPointerDown={(event) => { event.stopPropagation(); startDrag("minute", event); }}>
            <path d="M252 265 L255 100 Q260 84 265 100 L268 265 Z" fill="url(#minuteHand)" stroke="#a72b10" strokeWidth="2" />
            <path d="M254 101 L260 71 L266 101 Z" fill="#ff9278" stroke="#a72b10" strokeWidth="2" />
            <path d="M255 270 L257 310 Q260 319 263 310 L265 270 Z" fill="#b52c0e" />
            <path d="M238 325 L238 65 L282 65 L282 325 Z" fill="transparent" stroke="transparent" />
          </g>

          <circle cx="260" cy="252" r="23" fill="#d9f8ff" stroke="#195c86" strokeWidth="5" />
          <circle cx="260" cy="252" r="11" fill="#13bdeb" stroke="white" strokeWidth="4" />
          <path d="M135 100 Q220 45 315 72" fill="none" stroke="white" strokeOpacity=".38" strokeWidth="16" strokeLinecap="round" />
        </svg>
      </div>

      <div className="z-10 flex shrink-0 flex-col items-center gap-2 pb-1">
        <p className="rounded-full border border-white/15 bg-slate-950/75 px-4 py-1.5 text-sm font-bold text-slate-200">Chọn một kim, giữ và kéo như đồng hồ thật</p>
        <div className="flex gap-2 rounded-2xl border border-white/15 bg-slate-950/85 p-2 shadow-xl backdrop-blur-xl">
          <button type="button" onClick={() => setSelected("hour")} className={`rounded-xl px-4 py-2 font-black transition hover:-translate-y-1 ${selected === "hour" ? "bg-violet-500 ring-2 ring-white" : "bg-violet-950 text-violet-200"}`}>Kim giờ</button>
          <button type="button" onClick={() => setSelected("minute")} className={`rounded-xl px-4 py-2 font-black transition hover:-translate-y-1 ${selected === "minute" ? "bg-orange-500 ring-2 ring-white" : "bg-orange-950 text-orange-200"}`}>Kim phút</button>
          <strong className="grid min-w-24 place-items-center rounded-xl bg-white/10 text-xl text-cyan-300">{String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}</strong>
        </div>
      </div>
    </div>
  );
}

export function Math2B29TheoryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pickedNight, setPickedNight] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  const progressRef = useRef(0);
  const slide = SLIDES[step];

  const speak = useCallback((text: string) => {
    if (muted || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [muted]);

  useEffect(() => {
    setProgress(0);
    progressRef.current = 0;
    setPickedNight(false);
    setSelectedActivity(null);
  }, [slide]);

  useEffect(() => {
    if (!playing) {
      window.speechSynthesis?.cancel();
      return;
    }
    speak(`${slide.title}. ${slide.text}`);
    return () => window.speechSynthesis?.cancel();
  }, [playing, slide, speak]);

  useEffect(() => {
    if (!playing || step === SLIDES.length - 1) return;
    const duration = 8500;
    const startedAt = performance.now() - (progressRef.current / 100) * duration;
    let frame = 0;
    let finished = false;

    const tick = (now: number) => {
      const nextProgress = Math.min(100, ((now - startedAt) / duration) * 100);
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        if (!finished) {
          finished = true;
          setStep((current) => current === step ? Math.min(step + 1, SLIDES.length - 1) : current);
        }
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing, step]);

  const particles = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 92}%`, delay: i * 0.17 })), []);
  const goNext = () => step === SLIDES.length - 1 ? navigate("/student/game/math2-b29-time-lab") : setStep((v) => v + 1);
  const chooseActivity = (index: number) => {
    setSelectedActivity(index);
    if (index === 3) {
      setPickedNight(true);
      speak("Chính xác! Đi ngủ thường diễn ra vào buổi tối.");
    } else {
      setPickedNight(false);
      speak("Chưa đúng rồi. Bạn hãy nhìn bầu trời và thử chọn lại nhé.");
    }
  };
  const toggleAutoPlay = () => {
    if (playing) {
      window.speechSynthesis?.pause();
      setPlaying(false);
      return;
    }
    window.speechSynthesis?.resume();
    setPlaying(true);
  };

  return (
    <main className="scrollbar-hide relative h-[calc(100dvh-72px)] overflow-x-hidden overflow-y-auto bg-[#071329] text-white">
      <img src={LAB_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(27,101,174,.15),rgba(4,8,25,.88)_75%)]" />
      {particles.map((p, i) => <motion.i key={i} className="absolute h-2 w-2 rounded-full bg-cyan-300/60" style={{ left: p.left, top: p.top }} animate={{ y: [0, -18, 0], opacity: [.2, .9, .2] }} transition={{ duration: 3, repeat: Infinity, delay: p.delay }} />)}

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-72px)] max-w-[1500px] flex-col px-4 py-3 md:px-8">
        <header className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => navigate("/student")} className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/55 px-4 font-bold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 active:scale-95"><ArrowLeft size={20} /> Bản đồ</button>
          <div className="text-center"><p className="text-xs font-black tracking-[.2em] text-cyan-300">BÀI 29 · TRƯỚC KHI CHƠI</p><h1 className="text-lg font-black md:text-2xl">Học nhanh cùng Tí Tách</h1></div>
          <button type="button" aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"} onClick={() => { setMuted((v) => !v); window.speechSynthesis?.cancel(); }} className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-slate-950/55 transition hover:bg-white/15 active:scale-90">{muted ? <VolumeX /> : <Volume2 />}</button>
        </header>

        <div className="mt-4 flex items-center gap-2">
          {SLIDES.map((_, index) => <button type="button" aria-label={`Chặng ${index + 1}`} onClick={() => setStep(index)} key={index} className="h-2 flex-1 overflow-hidden rounded-full bg-white/15"><motion.span className="block h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" animate={{ width: index < step ? "100%" : index === step ? `${Math.max(progress, 8)}%` : "0%" }} /></button>)}
        </div>

        <section className="my-3 grid min-h-[420px] flex-1 items-stretch gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 40, scale: .98 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -40, scale: .98 }} transition={{ type: "spring", damping: 23 }} className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/55 shadow-2xl backdrop-blur-xl">
              {slide.kind === "story" && (
                <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#101b35]">
                  <img src={LESSON_IMAGE} alt="" aria-hidden="true" className="absolute -inset-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)] scale-110 object-cover opacity-35 blur-2xl" />
                  <div className="absolute inset-0 bg-slate-950/15" />
                  <img src={LESSON_IMAGE} alt="Bạn nhỏ thức dậy lúc 7 giờ" className="relative z-10 h-full w-full object-contain object-center drop-shadow-[0_18px_35px_rgba(0,0,0,.35)]" />
                </div>
              )}
              {(slide.kind === "clock" || slide.kind === "minutes") && <InteractiveAnalogClock focus={slide.kind === "minutes" ? "minute" : "hour"} />}
              {slide.kind === "day" && (
                <div className="relative h-full min-h-[420px]">
                  <img src={DAILY_IMAGE} alt="Bốn hoạt động trong một ngày" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    {["Đi học", "Ăn trưa", "Đá bóng", "Đi ngủ"].map((label, index) => {
                      const correct = pickedNight && index === 3;
                      const wrong = selectedActivity === index && index !== 3;
                      return (
                        <motion.button
                          key={label}
                          type="button"
                          onClick={() => chooseActivity(index)}
                          animate={wrong ? { x: [0, -9, 9, -6, 6, 0] } : correct ? { scale: [1, 1.04, 1] } : { x: 0, scale: 1 }}
                          className={`m-2 rounded-3xl border-4 transition hover:scale-[1.02] active:scale-95 ${correct ? "border-emerald-400 bg-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,.45)]" : wrong ? "border-rose-400 bg-rose-500/20" : "border-transparent hover:border-white/80"}`}
                        >
                          <span className={`rounded-full px-4 py-2 font-black shadow-lg ${correct ? "bg-emerald-500" : wrong ? "bg-rose-500" : "bg-slate-950/75"}`}>{label}{correct ? " ✓" : wrong ? " — thử lại" : ""}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
              {slide.kind === "ready" && <InteractiveAnalogClock />}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/80 to-transparent" />
            </motion.div>
          </AnimatePresence>

          <motion.aside key={`copy-${step}`} initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-center rounded-[2rem] border border-white/15 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="mb-5 flex items-center gap-4"><motion.div animate={{ y: [0, -7, 0], rotate: [-2, 2, -2] }} transition={{ duration: 2.2, repeat: Infinity }} className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-700 text-5xl shadow-[0_10px_30px_rgba(34,211,238,.35)]">🤖</motion.div><div><p className="text-xs font-black tracking-[.16em] text-cyan-300">TÍ TÁCH ĐANG HƯỚNG DẪN</p><p className="mt-1 text-sm text-slate-300">Chặng {step + 1}/{SLIDES.length}</p></div></div>
            <p className="text-xs font-black tracking-[.16em] text-violet-300">{slide.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">{slide.title}</h2>
            <p className="mt-5 text-lg font-semibold leading-relaxed text-slate-200">{slide.text}</p>
            <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 font-bold text-amber-100"><Sparkles className="mr-2 inline text-amber-300" />{slide.prompt}</div>
            {slide.kind === "day" && selectedActivity !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`mt-3 rounded-2xl border p-4 font-black ${pickedNight ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-rose-400/40 bg-rose-400/10 text-rose-200"}`}>
                {pickedNight ? "🎉 Chính xác! Đi ngủ thường diễn ra vào buổi tối." : "💡 Chưa đúng. Hãy tìm bức tranh có trăng và bầu trời tối nhé!"}
              </motion.div>
            )}
            <button type="button" onClick={() => speak(`${slide.title}. ${slide.text}`)} className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 font-bold transition hover:-translate-y-1 hover:bg-white/10 active:translate-y-0"><RotateCcw size={18} /> Nghe Tí Tách nói lại</button>
          </motion.aside>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/15 bg-slate-950/65 p-3 backdrop-blur-xl">
          <button type="button" disabled={step === 0} onClick={() => setStep((v) => Math.max(0, v - 1))} className="flex min-h-12 items-center gap-2 rounded-2xl px-5 font-black transition hover:bg-white/10 active:scale-95 disabled:opacity-30"><ArrowLeft /> Quay lại</button>
          <button type="button" onClick={toggleAutoPlay} className={`flex min-h-12 items-center gap-2 rounded-2xl border px-5 font-black transition hover:-translate-y-1 active:translate-y-0 ${playing ? "border-amber-300/40 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20" : "border-cyan-300/40 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"}`}>{playing ? <Pause /> : <Play />} {playing ? "Dừng tự động" : "Tiếp tục tự động"}</button>
          <button type="button" onClick={goNext} className="group flex min-h-14 items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600 px-7 text-lg font-black shadow-[0_7px_0_#312e81,0_12px_28px_rgba(59,130,246,.35)] transition hover:-translate-y-1 hover:brightness-110 active:translate-y-1 active:shadow-none">{step === SLIDES.length - 1 ? "Chơi game ngay" : "Tiếp tục"}<ArrowRight className="transition group-hover:translate-x-1" /></button>
        </footer>
      </div>
    </main>
  );
}
