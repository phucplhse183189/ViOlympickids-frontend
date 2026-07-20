import { Plus, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { useLang } from "@/shared/lib/i18n";

export function ChildAvatarBar() {
  const { profiles, activeChild, switchChild } = useActiveChild();
  const { lang } = useLang();
  const navigate = useNavigate();
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;

  if (!profiles.length || !activeChild) return null;

  return (
    <div className="flex items-center gap-3 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/90 p-2 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85">
      <div className="scrollbar-hide flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        {profiles.map((profile) => {
          const selected = profile.id === activeChild.id;
          return (
            <motion.button layout key={profile.id} onClick={() => switchChild(profile.id)} className={`flex shrink-0 items-center gap-2 rounded-2xl px-2.5 py-2 transition ${selected ? "bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-500/15 dark:ring-blue-500/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
              <span className="grid h-9 w-9 place-items-center rounded-xl text-lg" style={{ backgroundColor: profile.avatarBg || "#e2e8f0" }}>{profile.avatarEmoji}</span>
              {selected && <span className="pr-1 text-left"><span className="block max-w-36 truncate text-xs font-black text-slate-900 dark:text-white">{profile.name}</span><span className="text-[10px] font-bold text-slate-400">{profile.grade} · {profile.plan}</span></span>}
            </motion.button>
          );
        })}
        <button onClick={() => navigate("/add-child")} aria-label={text("Thêm hồ sơ", "Add profile")} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-dashed border-slate-300 text-slate-400 transition hover:border-blue-400 hover:text-blue-500 dark:border-slate-700"><Plus className="h-4 w-4" /></button>
      </div>
      <button onClick={() => navigate("/student")} className="flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/30 sm:text-sm"><Rocket className="h-4 w-4" /><span className="hidden sm:inline">{text("Vào học", "Start learning")}</span></button>
    </div>
  );
}
