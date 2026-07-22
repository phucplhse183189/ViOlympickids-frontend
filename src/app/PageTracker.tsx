import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/shared/api/analytics";

/**
 * Ghi nhận lượt xem trang mỗi khi đổi route (SPA).
 * Bỏ qua khu vực /admin để không tự đếm lượt truy cập của quản trị viên.
 */
export function PageTracker() {
  const location = useLocation();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    const path = location.pathname;
    const hostname = window.location.hostname.toLocaleLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return;
    if (path === lastTracked.current) return; // tránh đếm trùng (StrictMode)
    if (path.startsWith("/admin")) return;
    lastTracked.current = path;
    trackPageView(path);
  }, [location.pathname]);

  return null;
}
