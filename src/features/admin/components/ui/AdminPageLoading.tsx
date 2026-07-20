import { useEffect, useState } from "react";
import { Cloud, LoaderCircle, ShieldCheck, Wifi } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  title?: string;
  description?: string;
  metricCount?: number;
}

export function AdminPageLoading({ title = "Đang tải dữ liệu", description = "Hệ thống đang đồng bộ dữ liệu mới nhất từ máy chủ.", metricCount = 4 }: Props) {
  const [isSlow, setIsSlow] = useState(false);
  const reduceMotion = useReducedMotion();
  useEffect(() => { const timer = window.setTimeout(() => setIsSlow(true), 3500); return () => window.clearTimeout(timer); }, []);

  return <div role="status" aria-live="polite" aria-busy="true" className="space-y-5 pb-8">
    <section className="relative isolate overflow-hidden rounded-[28px] border border-indigo-400/15 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-6 py-8 text-white shadow-xl shadow-indigo-950/10 sm:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,.28),transparent_34%),radial-gradient(circle_at_90%_85%,rgba(16,185,129,.16),transparent_30%)]" />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10"><Cloud className="h-5 w-5 text-indigo-200" /><motion.span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-indigo-500 ring-4 ring-slate-950" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}><LoaderCircle className="h-3 w-3" /></motion.span></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-300">Đang kết nối máy chủ</p><h2 className="mt-2 text-2xl font-extrabold">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{isSlow ? "Kết nối đang mất nhiều thời gian hơn bình thường. Bạn vẫn có thể chờ, trang sẽ tự cập nhật khi dữ liệu sẵn sàng." : description}</p></div></div><div className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[.07] px-4 py-3 text-xs text-slate-300"><Wifi className={`h-4 w-4 ${isSlow ? "text-amber-300" : "text-emerald-300"}`} /><span>{isSlow ? "Kết nối chậm" : "Kết nối an toàn"}</span><ShieldCheck className="h-4 w-4 text-indigo-300" /></div></div>
      <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-300" animate={reduceMotion ? undefined : { x: ["-110%", "330%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} /></div>
    </section>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: metricCount }).map((_, index) => <SkeletonMetric key={index} delay={index * .08} />)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]"><SkeletonPanel bars={6} /><SkeletonPanel bars={4} /></div>
    <span className="sr-only">{isSlow ? "Máy chủ phản hồi chậm, hệ thống vẫn đang thử kết nối." : "Đang tải dữ liệu, vui lòng chờ."}</span>
  </div>;
}

function SkeletonMetric({ delay }: { delay: number }) { return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><div className="w-2/3 space-y-3"><Shimmer className="h-3 w-24" /><Shimmer className="h-8 w-32" /></div><Shimmer className="h-11 w-11 rounded-2xl" /></div><Shimmer className="mt-5 h-3 w-3/4" /></motion.div>; }
function SkeletonPanel({ bars }: { bars: number }) { return <div className="rounded-[24px] border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div className="space-y-2"><Shimmer className="h-4 w-40" /><Shimmer className="h-3 w-56 max-w-full" /></div><Shimmer className="h-9 w-9 rounded-xl" /></div><div className="mt-8 flex h-56 items-end gap-3">{Array.from({ length: bars }).map((_, index) => <Shimmer key={index} className="flex-1 rounded-t-xl" style={{ height: `${28 + ((index * 23) % 62)}%` }} />)}</div></div>; }
function Shimmer({ className, style }: { className: string; style?: React.CSSProperties }) { return <span style={style} className={`relative block overflow-hidden bg-muted ${className} before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.7s_infinite] before:bg-gradient-to-r before:from-transparent before:via-foreground/[.07] before:to-transparent`} />; }
