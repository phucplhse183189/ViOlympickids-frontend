import { useState } from "react";
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
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/dashboard/progress", label: "Tiến độ của con", icon: TrendingUp },
  { to: "/dashboard/history", label: "Lịch sử học tập", icon: History },
  {
    to: "/dashboard/subscription",
    label: "Quản lý Gói cước",
    icon: CreditCard,
  },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  return (
    <aside className="flex flex-col h-full w-[250px] bg-white shadow-md animate-slide-in-left">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <span
          className="text-xl font-extrabold"
          style={{ color: "var(--brand-primary)" }}
        >
          ViOlympicKids
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }, i) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            style={{ animationDelay: `${i * 60 + 80}ms` }}
            className={({ isActive }) =>
              `animate-fade-in-up flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

export function ParentDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="animate-fade-in-down flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <h1 className="text-base font-semibold text-gray-700 hidden sm:block">
              Bảng điều khiển Phụ huynh
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Bell */}
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <Bell size={20} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-notification-pulse" />
            </button>
            {/* Avatar */}
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                PH
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Phụ huynh
              </span>
            </div>
          </div>
        </header>

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
