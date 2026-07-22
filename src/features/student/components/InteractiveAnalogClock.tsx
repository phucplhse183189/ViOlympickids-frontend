import { useEffect, useRef, useState } from "react";

export type ClockHand = "hour" | "minute";

type InteractiveAnalogClockProps = {
  hour?: number;
  minute?: number;
  defaultHour?: number;
  defaultMinute?: number;
  focus?: ClockHand | null;
  disabled?: boolean;
  showControls?: boolean;
  onChange?: (hour: number, minute: number) => void;
};

const normalize = (value: number) => ((value % 360) + 360) % 360;

export function InteractiveAnalogClock({
  hour: controlledHour,
  minute: controlledMinute,
  defaultHour = 7,
  defaultMinute = 0,
  focus = null,
  disabled = false,
  showControls = true,
  onChange,
}: InteractiveAnalogClockProps) {
  const initialHour = controlledHour ?? defaultHour;
  const initialMinute = controlledMinute ?? defaultMinute;
  const [hourRotation, setHourRotation] = useState(initialHour * 30 + initialMinute / 2);
  const [minuteRotation, setMinuteRotation] = useState(initialMinute * 6);
  const [selected, setSelected] = useState<ClockHand | null>(focus);
  const activeHand = useRef<ClockHand | null>(null);
  const lastPointerAngle = useRef(0);
  const hourRotationRef = useRef(hourRotation);
  const minuteRotationRef = useRef(minuteRotation);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => setSelected(focus), [focus]);

  useEffect(() => {
    if (activeHand.current || controlledHour === undefined || controlledMinute === undefined) return;
    const nextHourRotation = controlledHour * 30 + controlledMinute / 2;
    const nextMinuteRotation = controlledMinute * 6;
    hourRotationRef.current = nextHourRotation;
    minuteRotationRef.current = nextMinuteRotation;
    setHourRotation(nextHourRotation);
    setMinuteRotation(nextMinuteRotation);
  }, [controlledHour, controlledMinute]);

  const getPointerAngle = (event: React.PointerEvent<SVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    return (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360;
  };

  const getTime = (nextHourRotation: number, nextMinuteRotation: number) => {
    const minuteValue = Math.round(normalize(nextMinuteRotation) / 6) % 60;
    const hourIndex = Math.floor((normalize(nextHourRotation) + 0.001) / 30) % 12;
    return { hour: hourIndex === 0 ? 12 : hourIndex, minute: minuteValue };
  };

  const updateFromPointer = (event: React.PointerEvent<SVGElement>) => {
    const hand = activeHand.current;
    if (!hand || disabled) return;
    const pointerAngle = getPointerAngle(event);
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
    const time = getTime(hourRotationRef.current, minuteRotationRef.current);
    onChange?.(time.hour, time.minute);
  };

  const startDrag = (hand: ClockHand, event: React.PointerEvent<SVGElement>) => {
    if (disabled) return;
    event.preventDefault();
    event.stopPropagation();
    activeHand.current = hand;
    lastPointerAngle.current = getPointerAngle(event);
    setSelected(hand);
    svgRef.current?.setPointerCapture(event.pointerId);
  };

  const stopDrag = (event: React.PointerEvent<SVGElement>) => {
    activeHand.current = null;
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
  };

  const displayed = getTime(hourRotation, minuteRotation);

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 px-4 py-3">
      <div className="min-h-0 w-full flex-1">
        <svg
          ref={svgRef}
          viewBox="0 0 520 520"
          role="application"
          aria-label="Đồng hồ tương tác. Giữ và kéo kim để chỉnh giờ."
          className="mx-auto block h-full max-h-[490px] w-full touch-none select-none drop-shadow-[0_22px_22px_rgba(0,0,0,.42)]"
          onPointerDown={(event) => selected && startDrag(selected, event)}
          onPointerMove={updateFromPointer}
          onPointerUp={stopDrag}
          onPointerCancel={stopDrag}
        >
          <defs>
            <radialGradient id="sharedClockFace" cx="38%" cy="28%"><stop offset="0" stopColor="#fff"/><stop offset=".7" stopColor="#edf8ff"/><stop offset="1" stopColor="#c9dfed"/></radialGradient>
            <linearGradient id="sharedGoldFrame" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff1a3"/><stop offset=".2" stopColor="#ffbd16"/><stop offset=".55" stopColor="#c66a00"/><stop offset=".78" stopColor="#ffb800"/><stop offset="1" stopColor="#7b3400"/></linearGradient>
            <linearGradient id="sharedHourHand"><stop stopColor="#35117f"/><stop offset=".5" stopColor="#8051ff"/><stop offset="1" stopColor="#321070"/></linearGradient>
            <linearGradient id="sharedMinuteHand"><stop stopColor="#b42d10"/><stop offset=".5" stopColor="#ff7557"/><stop offset="1" stopColor="#a8260d"/></linearGradient>
            <filter id="sharedHandGlow"><feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity=".35"/></filter>
          </defs>
          <circle cx="260" cy="270" r="226" fill="#7d3500" opacity=".9"/>
          <circle cx="260" cy="252" r="226" fill="url(#sharedGoldFrame)" stroke="#ffe797" strokeWidth="4"/>
          <circle cx="260" cy="252" r="204" fill="url(#sharedClockFace)" stroke="#75400e" strokeWidth="5"/>
          <circle cx="260" cy="252" r="196" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="3"/>
          {Array.from({ length: 60 }, (_, index) => { const angle=index*6*Math.PI/180, major=index%5===0, outer=187, inner=major?171:179; return <line key={index} x1={260+Math.sin(angle)*inner} y1={252-Math.cos(angle)*inner} x2={260+Math.sin(angle)*outer} y2={252-Math.cos(angle)*outer} stroke={major?"#173e67":"#91abc0"} strokeWidth={major?5:2} strokeLinecap="round"/>; })}
          {Array.from({ length: 12 }, (_, index) => { const value=index+1, angle=value*30*Math.PI/180; return <text key={value} x={260+Math.sin(angle)*145} y={252-Math.cos(angle)*145} textAnchor="middle" dominantBaseline="central" fill="#283d57" fontSize="29" fontWeight="900" fontFamily="Arial Rounded MT Bold, Arial, sans-serif">{value}</text>; })}
          <g transform={`rotate(${hourRotation} 260 252)`} filter="url(#sharedHandGlow)" onPointerDown={(event) => startDrag("hour", event)}>
            <rect x="246" y="132" width="28" height="136" rx="14" fill="url(#sharedHourHand)" stroke="#2d116c" strokeWidth="3"/>
            <circle cx="260" cy="137" r="13" fill="#8964ff" stroke="#2d116c" strokeWidth="3"/>
            <path d="M253 151 Q257 139 264 137" fill="none" stroke="white" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round"/>
            <rect x="251" y="266" width="18" height="42" rx="9" fill="#391383" stroke="#2d116c" strokeWidth="2"/>
            <circle cx="260" cy="302" r="7" fill="#6842db"/>
            <path d="M230 318 L230 110 L290 110 L290 318 Z" fill="transparent"/>
          </g>
          <g transform={`rotate(${minuteRotation} 260 252)`} filter="url(#sharedHandGlow)" onPointerDown={(event) => startDrag("minute", event)}>
            <rect x="252" y="82" width="16" height="186" rx="8" fill="url(#sharedMinuteHand)" stroke="#a72b10" strokeWidth="2.5"/>
            <circle cx="260" cy="87" r="7.5" fill="#ff9278" stroke="#a72b10" strokeWidth="2.5"/>
            <path d="M257 101 L257 226" fill="none" stroke="white" strokeOpacity=".48" strokeWidth="3" strokeLinecap="round"/>
            <rect x="255" y="266" width="10" height="48" rx="5" fill="#b52c0e" stroke="#8e210c" strokeWidth="2"/>
            <circle cx="260" cy="309" r="4" fill="#ff7557"/>
            <path d="M238 325 L238 65 L282 65 L282 325 Z" fill="transparent"/>
          </g>
          <circle cx="260" cy="252" r="23" fill="#d9f8ff" stroke="#195c86" strokeWidth="5"/><circle cx="260" cy="252" r="11" fill="#13bdeb" stroke="white" strokeWidth="4"/><path d="M135 100 Q220 45 315 72" fill="none" stroke="white" strokeOpacity=".38" strokeWidth="16" strokeLinecap="round"/>
        </svg>
      </div>
      {showControls && (
        <div className="z-10 flex shrink-0 flex-col items-center gap-2 pb-1">
          <p className="rounded-full border border-white/15 bg-slate-950/75 px-4 py-1.5 text-sm font-bold text-slate-200">Chọn một kim, giữ và kéo như đồng hồ thật</p>
          <div className="flex gap-2 rounded-2xl border border-white/15 bg-slate-950/85 p-2 shadow-xl backdrop-blur-xl">
            <button type="button" onClick={() => setSelected("hour")} className={`rounded-xl px-4 py-2 font-black transition hover:-translate-y-1 ${selected === "hour" ? "bg-violet-500 ring-2 ring-white" : "bg-violet-950 text-violet-200"}`}>Kim giờ</button>
            <button type="button" onClick={() => setSelected("minute")} className={`rounded-xl px-4 py-2 font-black transition hover:-translate-y-1 ${selected === "minute" ? "bg-orange-500 ring-2 ring-white" : "bg-orange-950 text-orange-200"}`}>Kim phút</button>
            <strong className="grid min-w-24 place-items-center rounded-xl bg-white/10 text-xl text-cyan-300">{String(displayed.hour).padStart(2,"0")}:{String(displayed.minute).padStart(2,"0")}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
