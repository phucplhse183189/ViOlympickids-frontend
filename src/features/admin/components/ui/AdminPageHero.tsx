import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Metric { label: string; value: string | number; icon: LucideIcon }
interface Props { eyebrow: string; title: string; description: string; icon: LucideIcon; metrics?: Metric[]; tone?: "indigo" | "emerald" | "amber" }

export function AdminPageHero({ eyebrow, title, description, icon: Icon, metrics = [], tone = "indigo" }: Props) {
  const reduceMotion = useReducedMotion();
  const glow = tone === "emerald" ? "from-emerald-500/30" : tone === "amber" ? "from-amber-500/25" : "from-indigo-500/30";
  return <motion.section initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 p-6 text-white shadow-xl sm:p-8"><div className={`absolute inset-0 -z-10 bg-gradient-to-br ${glow} via-indigo-950/40 to-violet-950/70`} /><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100"><Icon className="h-3.5 w-3.5" />{eyebrow}</span><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{description}</p></div>{metrics.length > 0 && <div className="grid grid-cols-2 gap-3">{metrics.map((metric) => <div key={metric.label} className="min-w-32 rounded-2xl border border-white/10 bg-white/[.07] p-3 backdrop-blur"><metric.icon className="h-4 w-4 text-indigo-300" /><strong className="mt-2 block text-xl">{metric.value}</strong><span className="text-[10px] uppercase tracking-wide text-slate-300">{metric.label}</span></div>)}</div>}</div></motion.section>;
}
