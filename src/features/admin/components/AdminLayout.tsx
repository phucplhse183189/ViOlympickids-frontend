import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";

const ADMIN_SESSION_KEY = "vio_admin_session";

const NAV_SECTIONS = [
  {
    title: "Điều hành",
    items: [
      {
        label: "Tổng quan",
        path: "/admin",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        ),
      },
      {
        label: "Hiệu suất học tập",
        path: "/admin/performance",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3v18h18M7.5 15l3-3 2.25 2.25L16.5 9"
            />
          </svg>
        ),
      },
      {
        label: "Tài chính & Owner",
        path: "/admin/finance",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-4-8h8m-11 8.25A2.25 2.25 0 015.25 16h13.5A2.25 2.25 0 0121 18.25v.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75v-.5zM5.25 3h13.5A2.25 2.25 0 0121 5.25v.5A2.25 2.25 0 0118.75 8H5.25A2.25 2.25 0 013 5.75v-.5A2.25 2.25 0 015.25 3z"
            />
          </svg>
        ),
      },
      {
        label: "Lượt truy cập",
        path: "/admin/analytics",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Quản trị dữ liệu",
    items: [
      {
        label: "Quản lý người dùng",
        path: "/admin/users",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
        ),
      },
      {
        label: "Quản lý bài học",
        path: "/admin/lessons",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
        ),
      },
      {
        label: "Quản lý Góp ý",
        path: "/admin/feedback",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        ),
      },
      {
        label: "Quản lý BXH",
        path: "/admin/leaderboard",
        icon: (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
            />
          </svg>
        ),
      },
    ],
  },
];

const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState("Admin");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(session);
      setAdminName(parsed.displayName || "Admin");
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <aside
        className={`hidden lg:flex flex-col bg-white/90 backdrop-blur border-r border-slate-200 transition-all duration-300 ${sidebarCollapsed ? "w-20" : "w-72"
          }`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-200">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h2 className="text-slate-900 font-extrabold text-sm truncate">
                ViOlympicKids
              </h2>
              <p className="text-indigo-500 text-xs">Admin Panel</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {section.title}
                </p>
              )}
              <div className="space-y-1.5">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive(item.path)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                  >
                    <div
                      className={`shrink-0 ${isActive(item.path)
                        ? "text-indigo-500"
                        : "text-slate-400 group-hover:text-slate-600"
                        }`}
                    >
                      {item.icon}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-sm font-semibold truncate">
                        {item.label}
                      </span>
                    )}
                    {isActive(item.path) && !sidebarCollapsed && (
                      <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
              />
            </svg>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          <div className="hidden lg:block">
            <h1 className="text-slate-900 font-extrabold text-lg">
              {NAV_ITEMS.find((item) => isActive(item.path))?.label || "Admin"}
            </h1>
          </div>

          <div className="flex items-center gap-3">


            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">AD</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-slate-900 text-sm font-semibold leading-none">
                  {adminName}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">Super Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                title="Đăng xuất"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-white border-r border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-3 px-2 pb-4 mb-4 border-b border-slate-200">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-slate-900 font-bold text-sm">
                    ViOlympicKids
                  </h2>
                  <p className="text-indigo-500 text-xs">Admin Panel</p>
                </div>
              </div>
              {NAV_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1.5">
                  <p className="px-3 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {section.title}
                  </p>
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive(item.path)
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                    >
                      {item.icon}
                      <span className="text-sm font-semibold">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
