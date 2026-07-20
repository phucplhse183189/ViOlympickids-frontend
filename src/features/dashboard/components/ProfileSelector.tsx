import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { useLang } from "@/shared/lib/i18n";

export function ProfileSelector({ collapsed = false }: { collapsed?: boolean }) {
  const { profiles, activeChild, switchChild } = useActiveChild();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;

  useEffect(() => {
    const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!activeChild) {
    return <button title={text("Thêm hồ sơ bé", "Add child profile")} onClick={() => navigate("/add-child")} className={`flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 text-sm font-bold text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 ${collapsed ? "mx-auto h-12 w-12" : "mx-4 px-4 py-4"}`}><Plus className="h-4 w-4" />{!collapsed && text("Thêm hồ sơ bé", "Add child profile")}</button>;
  }

  return (
    <div ref={ref} className={`relative ${collapsed ? "mx-auto w-12" : "mx-4"}`}>
      <button title={activeChild.name} onClick={() => setOpen((value) => !value)} className={`flex items-center rounded-2xl border border-slate-200 bg-slate-50 text-left transition hover:border-blue-300 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 ${collapsed ? "h-12 w-12 justify-center p-1" : "w-full gap-3 p-3"}`} aria-expanded={open}>
        <span className={`grid shrink-0 place-items-center rounded-xl text-xl shadow-inner ${collapsed ? "h-10 w-10" : "h-11 w-11"}`} style={{ backgroundColor: activeChild.avatarBg || "#e2e8f0" }}>{activeChild.avatarEmoji}</span>
        {!collapsed && <><span className="min-w-0 flex-1"><span className="block truncate text-sm font-black text-slate-900 dark:text-white">{activeChild.name}</span><span className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400"><span>{activeChild.grade}</span><span>•</span><span className="text-blue-600 dark:text-blue-400">{activeChild.plan}{activeChild.planDaysLeft ? ` · ${activeChild.planDaysLeft}d` : ""}</span></span></span><ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} /></>}
      </button>

      <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .98 }} transition={{ duration: .16 }} className={`absolute z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 ${collapsed ? "left-full top-0 ml-3 w-64" : "inset-x-0 top-full mt-2"}`}>
        <p className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-[.16em] text-slate-400">{text("Chọn học sinh", "Choose student")}</p>
        {profiles.map((profile) => <button key={profile.id} onClick={() => { switchChild(profile.id); setOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${profile.id === activeChild.id ? "bg-blue-50 dark:bg-blue-500/12" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}><span className="grid h-9 w-9 place-items-center rounded-xl text-lg" style={{ backgroundColor: profile.avatarBg || "#e2e8f0" }}>{profile.avatarEmoji}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-extrabold text-slate-800 dark:text-slate-100">{profile.name}</span><span className="text-[10px] font-semibold text-slate-400">{profile.grade} · {profile.plan}</span></span>{profile.id === activeChild.id && <Check className="h-4 w-4 text-blue-500" />}</button>)}
        <button onClick={() => navigate("/add-child")} className="mt-1 flex w-full items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-3 text-xs font-extrabold text-blue-600 hover:bg-blue-50 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-blue-500/10"><Plus className="h-4 w-4" />{text("Thêm hồ sơ mới", "Add another profile")}</button>
      </motion.div>}</AnimatePresence>
    </div>
  );
}
