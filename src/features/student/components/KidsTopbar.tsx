import { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { type PlanType } from "@/features/dashboard/types/dashboard";
import { useAuth } from "@/features/auth/context/auth";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { useLang } from "@/shared/lib/i18n";
import { ParentGate } from "@/shared/ui/ParentGate";
import { BrandMark } from "@/shared/ui/BrandMark";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";

const PLAN_CONFIG: Record<PlanType, { vi: string; en: string; icon: string; gradient: string }> = {
  FREE: { vi: "Cơ bản", en: "Basic", icon: "🌱", gradient: "from-emerald-400 to-teal-500" },
  PRO: { vi: "Nâng cao", en: "Advanced", icon: "🚀", gradient: "from-blue-400 to-indigo-500" },
  VIP: { vi: "VIP", en: "VIP", icon: "👑", gradient: "from-amber-400 to-orange-500" },
};

export function KidsTopbar({ backTo = "/student" }: { backTo?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveRole } = useAuth();
  const { activeChild } = useActiveChild();
  const { lang, setLang } = useLang();
  const [showPinGate, setShowPinGate] = useState(false);
  const isOnMap = location.pathname === "/student";
  const profile = { emoji: activeChild?.avatarEmoji || "🦊", name: activeChild?.name || (lang === "vi" ? "Bé yêu" : "Student") };
  const planInfo = PLAN_CONFIG[activeChild?.plan || "FREE"];

  return <>
    <header className="fixed inset-x-0 top-0 z-50 flex h-[72px] items-center border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
      <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {!isOnMap && <button onClick={() => navigate(backTo)} aria-label={lang === "vi" ? "Quay lại bản đồ học tập" : "Back to learning map"} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"><ArrowLeft className="h-5 w-5" /></button>}
          <div className="hidden sm:block"><BrandMark to="/student" /></div>
          <button onClick={() => navigate("/student")} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white sm:hidden dark:border-slate-700 dark:bg-slate-800"><img src="/robot-head.png" alt="ViOlympicKids" className="h-7 w-7 object-contain" /></button>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className={`hidden items-center gap-1.5 rounded-xl bg-gradient-to-r px-2.5 py-2 text-white shadow-sm sm:flex ${planInfo.gradient}`}><span className="text-xs">{planInfo.icon}</span><span className="text-[10px] font-black uppercase tracking-wide">{planInfo[lang]}</span></div>
          <button onClick={() => setLang(lang === "vi" ? "en" : "vi")} aria-label={lang === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt"} className="grid h-10 min-w-10 place-items-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{lang === "vi" ? "EN" : "VI"}</button>
          <ThemeToggle />
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 dark:border-slate-700"><div className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-lg shadow-sm dark:border-slate-700" style={{ background: activeChild?.avatarBg || "#fed7aa" }}>{profile.emoji}<span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" /></div><div className="hidden max-w-28 sm:block"><p className="truncate text-xs font-black text-slate-800 dark:text-white">{profile.name}</p><p className="text-[10px] font-semibold text-slate-400">{lang === "vi" ? "Học sinh" : "Student"}</p></div></div>
          <button onClick={() => setShowPinGate(true)} title={lang === "vi" ? "Góc Phụ huynh" : "Parent area"} aria-label={lang === "vi" ? "Mở Góc Phụ huynh" : "Open parent area"} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-indigo-500 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-indigo-500/10"><ShieldCheck className="h-[18px] w-[18px]" /></button>
        </div>
      </div>
    </header>
    {showPinGate && <ParentGate onSuccess={() => { setShowPinGate(false); setActiveRole("parent"); navigate("/dashboard"); }} onClose={() => setShowPinGate(false)} />}
  </>;
}
