import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronLeft, ChevronRight, CreditCard, History, LayoutDashboard, LogOut, Menu, MessageSquareHeart, TrendingUp, UserCircle, X } from "lucide-react";
import { apiGet } from "@/shared/api/client";
import { BrandMark } from "@/shared/ui/BrandMark";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { useLang } from "@/shared/lib/i18n";
import { useAuth } from "@/features/auth/context/auth";
import { ProfileSelector } from "./ProfileSelector";

type Copy = { vi: string; en: string };
type NavItem = { to: string; label: Copy; icon: typeof LayoutDashboard; end?: boolean };
const navGroups: Array<{ label: Copy; items: NavItem[] }> = [
  { label: { vi: "Học tập", en: "Learning" }, items: [
    { to: "/dashboard", label: { vi: "Tổng quan", en: "Overview" }, icon: LayoutDashboard, end: true },
    { to: "/dashboard/progress", label: { vi: "Tiến độ của con", en: "Child progress" }, icon: TrendingUp },
    { to: "/dashboard/history", label: { vi: "Lịch sử học tập", en: "Learning history" }, icon: History },
  ] },
  { label: { vi: "Tài khoản", en: "Account" }, items: [
    { to: "/dashboard/subscription", label: { vi: "Gói học tập", en: "Subscription" }, icon: CreditCard },
    { to: "/dashboard/profile", label: { vi: "Hồ sơ của tôi", en: "My profile" }, icon: UserCircle },
    { to: "/dashboard/feedback", label: { vi: "Đánh giá & góp ý", en: "Feedback" }, icon: MessageSquareHeart },
  ] },
];

function Sidebar({ collapsed = false, onToggle, onClose }: { collapsed?: boolean; onToggle?: () => void; onClose?: () => void }) {
  const { lang } = useLang();
  const text = (copy: Copy) => copy[lang];
  return (
    <motion.aside animate={{ width: collapsed ? 88 : 286 }} transition={{ type: "spring", stiffness: 380, damping: 38 }} className="relative flex h-full shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className={`flex h-[82px] items-center ${collapsed ? "justify-center px-3" : "justify-between px-5"}`}>
        {collapsed ? <NavLink to="/profile-picker" title="ViOlympicKids" className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"><img src="/robot-head.png" alt="" className="h-8 w-8 object-contain" /></NavLink> : <BrandMark to="/profile-picker" />}
        {onClose && <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>}
      </div>
      <ProfileSelector collapsed={collapsed} />
      <nav className="scrollbar-hide mt-5 flex-1 overflow-y-auto px-3">
        {navGroups.map((group, groupIndex) => <div key={group.label.en} className={groupIndex ? "mt-5" : ""}>
          {!collapsed && <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[.2em] text-slate-400">{text(group.label)}</p>}
          <div className="space-y-1">{group.items.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={onClose} title={collapsed ? text(label) : undefined} className={({ isActive }) => `group flex h-12 items-center rounded-2xl text-sm font-extrabold transition-all ${collapsed ? "justify-center px-0" : "gap-3 px-3.5"} ${isActive ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"}`}>{({ isActive }) => <><Icon className="h-[18px] w-[18px] shrink-0" />{!collapsed && <><span className="flex-1">{text(label)}</span>{isActive && <ChevronRight className="h-4 w-4 text-blue-200" />}</>}</>}</NavLink>)}</div>
        </div>)}
      </nav>
      {onToggle && <div className="flex justify-center border-t border-slate-200 p-3 dark:border-slate-800"><button onClick={onToggle} title={collapsed ? text({ vi: "Mở rộng sidebar", en: "Expand sidebar" }) : text({ vi: "Thu gọn sidebar", en: "Collapse sidebar" })} aria-label={collapsed ? text({ vi: "Mở rộng sidebar", en: "Expand sidebar" }) : text({ vi: "Thu gọn sidebar", en: "Collapse sidebar" })} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10">{collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</button></div>}
    </motion.aside>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parentId = sessionStorage.getItem("vio_parent_id");
  const profileQuery = useQuery({ queryKey: ["parent", "profile", parentId ?? "anonymous"], queryFn: () => apiGet<{ avatarId?: string | null }>(`/parent/profile?id=${parentId}`), enabled: Boolean(parentId), staleTime: 5 * 60_000, gcTime: 30 * 60_000, refetchOnWindowFocus: false });
  const name = user?.nickname || (lang === "vi" ? "Phụ huynh" : "Parent");
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  useEffect(() => { const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  return <div ref={ref} className="relative"><button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-2xl p-1.5 pr-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">{profileQuery.data?.avatarId ? <img src={profileQuery.data.avatarId} alt="" className="h-9 w-9 rounded-xl object-cover" /> : <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-xs font-black text-white">{initials}</span>}<span className="hidden max-w-32 text-left sm:block"><span className="block truncate text-xs font-black text-slate-800 dark:text-white">{name}</span><span className="text-[10px] font-semibold text-slate-400">{lang === "vi" ? "Phụ huynh" : "Parent"}</span></span></button><AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><button onClick={() => { setOpen(false); navigate("/dashboard/profile"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><UserCircle className="h-4 w-4" />{lang === "vi" ? "Hồ sơ của tôi" : "My profile"}</button><div className="my-1 border-t border-slate-100 dark:border-slate-800" /><button onClick={() => { logout(); navigate("/", { replace: true }); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><LogOut className="h-4 w-4" />{lang === "vi" ? "Đăng xuất" : "Log out"}</button></motion.div>}</AnimatePresence></div>;
}

export function ParentDashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("vio_dashboard_sidebar") === "collapsed");
  const location = useLocation();
  const { lang, setLang } = useLang();
  const toggleSidebar = () => setCollapsed((value) => { const next = !value; localStorage.setItem("vio_dashboard_sidebar", next ? "collapsed" : "expanded"); return next; });
  return <div className="parent-shell flex h-dvh overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#070d1b] dark:text-slate-100"><div className="hidden lg:block"><Sidebar collapsed={collapsed} onToggle={toggleSidebar} /></div><AnimatePresence>{mobileOpen && <motion.div className="fixed inset-0 z-50 flex lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button aria-label="Close navigation" className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} /><motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 340, damping: 34 }} className="relative"><Sidebar onClose={() => setMobileOpen(false)} /></motion.div></motion.div>}</AnimatePresence><div className="flex min-w-0 flex-1 flex-col"><header className="z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85 sm:px-6"><button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden dark:border-slate-700 dark:text-slate-300"><Menu className="h-5 w-5" /></button><div className="hidden lg:block" /><div className="flex items-center gap-1.5 sm:gap-2"><button onClick={() => setLang(lang === "vi" ? "en" : "vi")} className="grid h-10 min-w-10 place-items-center rounded-xl border border-slate-200 bg-white px-2 text-xs font-black text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">{lang === "vi" ? "EN" : "VI"}</button><ThemeToggle /><button className="relative hidden h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-100 sm:grid dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"><Bell className="h-[18px] w-[18px]" /></button><UserMenu /></div></header><main className="dashboard-scroll flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6 lg:px-8"><AnimatePresence mode="wait"><motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .22, ease: "easeOut" }} className="mx-auto w-full max-w-[1500px]"><Outlet /></motion.div></AnimatePresence></main></div></div>;
}
