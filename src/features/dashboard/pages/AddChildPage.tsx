import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Gift, Sparkles } from "lucide-react";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { useLang } from "@/shared/lib/i18n";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { AppHeader } from "@/shared/ui/AppHeader";
import * as childrenService from "@/features/dashboard/api/childrenService";

const AVATAR_OPTIONS = [
  { emoji: "🐻", bg: "#8b5cf6", vi: "Gấu tím", en: "Purple bear" },
  { emoji: "🐶", bg: "#10b981", vi: "Cún xanh", en: "Green puppy" },
  { emoji: "🐸", bg: "#f59e0b", vi: "Ếch vàng", en: "Golden frog" },
  { emoji: "🦊", bg: "#f97316", vi: "Cáo cam", en: "Orange fox" },
  { emoji: "🐱", bg: "#3b82f6", vi: "Mèo xanh", en: "Blue cat" },
  { emoji: "🐼", bg: "#64748b", vi: "Gấu trúc", en: "Panda" },
];

export function AddChildPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const { refreshProfiles } = useActiveChild();
  const { lang, setLang } = useLang();
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const chosen = AVATAR_OPTIONS[selectedAvatar];
  const canSave = name.trim().length > 0 && !saving && !done;
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;

  async function handleSave() {
    if (!canSave) return;
    const parentId = sessionStorage.getItem("vio_parent_id");
    if (!parentId) {
      setError(text("Không tìm thấy phiên đăng nhập của phụ huynh.", "Your parent session could not be found."));
      return;
    }

    setSaving(true);
    setError("");
    try {
      await childrenService.addChild(parentId, {
        name: name.trim(),
        grade: "Lớp 2",
        avatarEmoji: chosen.emoji,
        avatarBg: chosen.bg,
      });
      await refreshProfiles();
      setDone(true);
      window.setTimeout(() => navigate("/profile-picker", { replace: true }), reduceMotion ? 0 : 900);
    } catch (caught) {
      console.error("Failed to add child", caught);
      setError(text("Chưa thể tạo hồ sơ. Vui lòng thử lại.", "Could not create the profile. Please try again."));
      setSaving(false);
    }
  }

  const enter = reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } };

  return (
    <main className="add-child-page relative h-dvh overflow-y-auto bg-[#f6f8ff] text-slate-800 dark:bg-[#07101f] dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-300/25 blur-3xl dark:bg-blue-600/10" />
        <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/20 blur-3xl dark:bg-fuchsia-600/10" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-orange-200/25 blur-3xl dark:bg-orange-500/5" />
        <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]" style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        {[{ icon: "＋", x: "8%", y: "24%" }, { icon: "×", x: "88%", y: "18%" }, { icon: "7", x: "91%", y: "73%" }, { icon: "★", x: "5%", y: "78%" }].map((item, index) => (
          <motion.span key={item.icon} className="absolute text-3xl font-black text-blue-500/10 dark:text-blue-300/10" style={{ left: item.x, top: item.y }} animate={reduceMotion ? undefined : { y: [0, index % 2 ? 10 : -10, 0], rotate: [0, index % 2 ? 7 : -7, 0] }} transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}>{item.icon}</motion.span>
        ))}
      </div>

      <AppHeader
        backLabel={text("Quay lại", "Back")}
        onBack={() => navigate("/profile-picker")}
        actions={
          <>
            <button onClick={() => setLang(lang === "vi" ? "en" : "vi")} className="grid h-10 min-w-10 place-items-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-500 shadow-sm transition hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" aria-label={text("Đổi sang tiếng Anh", "Switch to Vietnamese")}>{lang === "vi" ? "EN" : "VI"}</button>
            <ThemeToggle />
          </>
        }
      />

      <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-5rem)] max-w-7xl items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(500px,1.1fr)] lg:items-stretch lg:gap-14 lg:py-10">
        <motion.section {...enter} transition={{ duration: 0.45 }} className="relative hidden min-h-[600px] overflow-hidden rounded-[2rem] border border-blue-200/60 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-10 text-white shadow-2xl shadow-blue-500/20 lg:flex lg:h-full lg:flex-col">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-cyan-300/10" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider backdrop-blur"><Sparkles size={15} />{text("Một hành trình mới", "A new journey")}</span>
            <h1 className="mt-6 max-w-md text-4xl font-black leading-[1.12] tracking-tight xl:text-5xl">{text("Tạo không gian học tập riêng cho bé", "Create a learning space just for your child")}</h1>
            <p className="mt-4 max-w-md text-sm font-medium leading-7 text-blue-100 xl:text-base">{text("Mỗi hồ sơ lưu riêng tiến độ, thành tích và phần thưởng để bé luôn hào hứng quay lại học.", "Each profile keeps progress, achievements and rewards separate so every child stays excited to learn.")}</p>
          </div>

          <div className="relative flex min-h-[270px] flex-1 items-center justify-center pt-4">
            <motion.div animate={reduceMotion ? undefined : { y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative z-10">
              <img src="/robot.png" alt="ViOlympicKids robot" className="h-72 w-72 object-contain drop-shadow-[0_24px_24px_rgba(15,23,42,0.28)]" />
              <motion.div key={selectedAvatar} initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute -right-3 top-5 grid h-20 w-20 place-items-center rounded-[1.6rem] border-4 border-white/80 text-4xl shadow-xl" style={{ backgroundColor: chosen.bg }}>{chosen.emoji}</motion.div>
            </motion.div>
          </div>

        </motion.section>

        <motion.section {...enter} transition={{ duration: 0.45, delay: 0.08 }} className="mx-auto w-full max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/85 dark:shadow-black/30 sm:p-7 lg:h-full lg:p-8">
          <div className="mb-6 flex items-center gap-4">
            <motion.div key={chosen.emoji} initial={reduceMotion ? false : { scale: 0.75, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl shadow-md ring-4 ring-slate-50 dark:ring-slate-700" style={{ backgroundColor: chosen.bg }}>{chosen.emoji}</motion.div>
            <div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-500 dark:text-blue-300">{text("Hồ sơ học tập mới", "New learning profile")}</p><h2 className="mt-1 truncate text-2xl font-black text-slate-900 dark:text-white">{name.trim() || text("Tên của bé", "Child's name")}</h2></div>
          </div>

          <div>
            <label htmlFor="child-name" className="mb-2 block text-sm font-extrabold text-slate-700 dark:text-slate-200">{text("Bé tên là gì?", "What's your child's name?")}</label>
            <input id="child-name" ref={inputRef} autoFocus type="text" maxLength={40} placeholder={text("Ví dụ: Bé Na, Bé Bin...", "For example: Mia, Alex...")} value={name} onChange={(event) => { setName(event.target.value); setError(""); }} onKeyDown={(event) => event.key === "Enter" && handleSave()} className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-800/70 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-800" />
          </div>

          <div className="my-4 flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/80 p-2.5 dark:border-blue-500/20 dark:bg-blue-500/10">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-base shadow-sm dark:bg-slate-800">📚</span>
            <div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-slate-400">{text("Chương trình học", "Learning program")}</p><p className="truncate text-sm font-black text-slate-800 dark:text-slate-100">{text("Toán học tương tác · Lớp 2", "Interactive Math · Grade 2")}</p></div>
            <span className="rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-black text-white">{text("Lớp 2", "Grade 2")}</span>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-extrabold text-slate-700 dark:text-slate-200">{text("Chọn một người bạn đồng hành", "Choose a learning buddy")}</legend>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {AVATAR_OPTIONS.map((avatar, index) => {
                const selected = selectedAvatar === index;
                return <motion.button whileTap={reduceMotion ? undefined : { scale: 0.96 }} type="button" key={avatar.en} onClick={() => setSelectedAvatar(index)} aria-pressed={selected} className={`relative flex min-w-0 flex-col items-center gap-2 rounded-2xl border-2 px-2 py-3 transition ${selected ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10 dark:border-blue-400 dark:bg-blue-500/10" : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800"}`}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl shadow-sm" style={{ backgroundColor: avatar.bg }}>{avatar.emoji}</span>
                  <span className={`w-full truncate text-[10px] font-extrabold sm:text-xs ${selected ? "text-blue-600 dark:text-blue-300" : "text-slate-500 dark:text-slate-400"}`}>{lang === "vi" ? avatar.vi : avatar.en}</span>
                  {selected && <motion.span initial={reduceMotion ? false : { scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-blue-500 text-white shadow ring-2 ring-white dark:ring-slate-900"><Check size={13} strokeWidth={3} /></motion.span>}
                </motion.button>;
              })}
            </div>
          </fieldset>

          {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-center text-xs font-bold text-rose-500 dark:bg-rose-500/10 dark:text-rose-300">{error}</motion.p>}

          <button onClick={handleSave} disabled={!canSave} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:from-slate-200 disabled:via-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:from-slate-700 dark:disabled:via-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-400">
            {done ? <><Check size={18} />{text("Tạo hồ sơ thành công!", "Profile created!")}</> : saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{text("Đang tạo hồ sơ...", "Creating profile...")}</> : <>{text("Tạo hồ sơ cho bé", "Create profile")}<ArrowRight size={18} /></>}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-slate-400"><Gift size={13} />{text("Bé sẽ nhận phần thưởng chào mừng sau khi tạo hồ sơ", "A welcome reward awaits after profile creation")}</p>
        </motion.section>
      </div>
    </main>
  );
}
