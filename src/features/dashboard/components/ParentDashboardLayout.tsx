import { useState, useRef, useEffect } from "react";
import { apiGet } from "@/shared/api/client";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  History,
  CreditCard,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/auth";
import { ProfileSelector } from "./ProfileSelector";
import { ChildAvatarBar } from "./ChildAvatarBar";

// ─── Nav items ────────────────────────────────────────────────
const navItems = [
  {
    to: "/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/dashboard/progress", label: "Tiến độ của con", icon: TrendingUp },
  { to: "/dashboard/history", label: "Lịch sử học tập", icon: History },
  {
    to: "/dashboard/subscription",
    label: "Quản lý Gói cước",
    icon: CreditCard,
  },
];

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();

  return (
    <aside className="flex flex-col h-full w-[260px] bg-white border-r border-gray-100 shadow-sm animate-slide-in-left">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <button
          onClick={() => {
            navigate("/profile-picker");
            onClose?.();
          }}
          className="flex items-center gap-2 rounded-lg hover:bg-gray-50 px-1 py-0.5 transition"
        >
          <img
            src="/robot-head.png"
            alt="ViOlympicKids"
            className="w-8 h-8 object-contain"
          />
          <span
            className="text-lg font-extrabold tracking-tight"
            style={{ color: "var(--brand-primary)" }}
          >
            ViOlympicKids
          </span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 lg:hidden p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Profile selector – dropdown with multi-child support */}
      <ProfileSelector />

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-4 pt-2 pb-1.5">
          Menu
        </p>
        {navItems.map(({ to, label, icon: Icon, end }, i) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            style={{ animationDelay: `${i * 60 + 80}ms` }}
            className={({ isActive }) =>
              `animate-fade-in-up flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={`shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                />
                <span>{label}</span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-blue-300" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

// ─── Topbar: avatar+name button (navigates to profile) ────────
function AvatarButton() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const displayName = user?.nickname || "Phụ Huynh";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Load real avatar from API
  useEffect(() => {
    const parentId = sessionStorage.getItem("vio_parent_id");
    if (!parentId) return;

    apiGet<{ avatarId?: string | null }>(`/parent/profile?id=${parentId}`)
      .then((profile) => {
        if (profile.avatarId) {
          setAvatarUrl(profile.avatarId);
        }
      })
      .catch(() => {/* silent — fallback to initials */});
  }, []);

  return (
    <button
      onClick={() => navigate("/dashboard/profile")}
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-8 h-8 rounded-full object-cover shrink-0 border-2 border-white shadow-sm"
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          {initials}
        </div>
      )}
      <div className="hidden sm:block text-left">
        <p className="text-xs font-bold text-gray-700 leading-tight">
          {displayName}
        </p>
        <p className="text-[10px] text-gray-400 leading-tight">Phụ huynh</p>
      </div>
    </button>
  );
}

// ─── Topbar: settings gear dropdown ───────────────────────────
function SettingsMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center w-8 h-8 rounded-xl border transition ${
          open
            ? "bg-gray-100 border-gray-200 text-gray-700"
            : "border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
        }`}
        title="Cài đặt"
      >
        <Settings
          size={15}
          className={`transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-[100]">
          <div className="py-1.5">
            <button
              onClick={() => {
                setOpen(false);
                navigate("/dashboard/profile");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <UserCircle size={15} className="text-gray-400 shrink-0" />
              Hồ sơ của tôi
            </button>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/profile-picker");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Users size={15} className="text-gray-400 shrink-0" />
              Đổi hồ sơ
            </button>
          </div>
          <div className="border-t border-gray-100" />
          <div className="py-1.5">
            <button
              onClick={() => {
                sessionStorage.removeItem("vio_parent_id");
                navigate("/login");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} className="shrink-0" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page title helper ────────────────────────────────────────
function usePageTitle(pathname: string) {
  const map: Record<string, string> = {
    "/dashboard": "Tổng quan",
    "/dashboard/progress": "Tiến độ của con",
    "/dashboard/history": "Lịch sử học tập",
    "/dashboard/subscription": "Quản lý Gói cước",
    "/dashboard/profile": "Hồ sơ của tôi",
  };
  return map[pathname] ?? "Dashboard";
}

// ─── Layout ───────────────────────────────────────────────────
export function ParentDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = usePageTitle(location.pathname);

  const unreadNotifications = 0; // TODO: fetch from user profile


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="relative z-10 animate-fade-in-down flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-400 font-medium">Dashboard</span>
              <ChevronRight size={14} className="text-gray-300" />
              <span className="font-semibold text-gray-700">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <Bell size={19} className="text-gray-500" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 animate-notification-pulse flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">
                    {unreadNotifications}
                  </span>
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-100 mx-1" />

            {/* User menu dropdown */}
            <AvatarButton />
            <SettingsMenu />
          </div>
        </header>

        {/* Netflix-style child avatar bar */}
        <div className="px-6 pt-4 pb-0">
          <ChildAvatarBar />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
