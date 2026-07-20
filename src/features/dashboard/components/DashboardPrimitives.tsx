import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function PageHeader({
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function DashboardCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <section className={`rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(15,23,42,.35)] dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none sm:p-6 ${className}`}>{children}</section>;
}

export function MetricCard({ icon: Icon, label, value, note, tone = "blue", delay = 0 }: { icon: LucideIcon; label: string; value: string | number; note: string; tone?: "blue" | "emerald" | "amber" | "violet"; delay?: number }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/12 dark:text-blue-300",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-300",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/12 dark:text-violet-300",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }} whileHover={{ y: -3 }} className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_36px_-28px_rgba(15,23,42,.55)] dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">{note}</span>
      </div>
      <p className="mt-5 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return (
    <DashboardCard className="grid min-h-[300px] place-items-center text-center">
      <div className="max-w-md">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-blue-500 dark:bg-blue-500/12 dark:text-blue-300"><Icon className="h-7 w-7" /></div>
        <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </DashboardCard>
  );
}

export function DashboardSkeleton() {
  return <div className="space-y-5 animate-pulse"><div className="h-20 rounded-3xl bg-slate-200/70 dark:bg-slate-800" /><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-40 rounded-3xl bg-slate-200/70 dark:bg-slate-800" />)}</div><div className="h-80 rounded-3xl bg-slate-200/70 dark:bg-slate-800" /></div>;
}
