import { apiPost } from "@/shared/api/client";

/* ── Tracking phía client ────────────────────────────────────────────────── */

const VISITOR_KEY = "vio_visitor_id";
const SESSION_KEY = "vio_session_id";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** ID khách lâu dài (localStorage) — đếm khách duy nhất */
function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** ID phiên (sessionStorage) — đếm số phiên truy cập */
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = randomId();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function detectDevice(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

/**
 * Gửi một lượt xem trang lên server. Lỗi mạng được nuốt êm để không
 * ảnh hưởng trải nghiệm người dùng.
 */
export async function trackPageView(path: string): Promise<void> {
  try {
    await apiPost("/analytics/track", {
      path,
      referrer: document.referrer || null,
      device: detectDevice(),
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
    });
  } catch {
    /* bỏ qua lỗi tracking */
  }
}


