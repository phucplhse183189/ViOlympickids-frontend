import { useCallback, useEffect, useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { KidsTopbar } from "@/widgets/kids-topbar";
import { ParentGate } from "@/shared/ui/ParentGate";

function isProtectedStudentRoute(pathname: string) {
  return (
    pathname.startsWith("/student/game/") ||
    pathname.startsWith("/student/quiz/")
  );
}

export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showExitGate, setShowExitGate] = useState(false);
  const [allowExitToMap, setAllowExitToMap] = useState(false);
  const [pendingReenterFullscreen, setPendingReenterFullscreen] =
    useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Chào con! Con muốn hỏi gì về toán lớp 2 nè?",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const protectedRoute = useMemo(
    () => isProtectedStudentRoute(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    setAllowExitToMap(false);
    setPendingReenterFullscreen(false);
  }, [location.pathname]);

  const ensureFullscreen = useCallback(async () => {
    if (!protectedRoute || allowExitToMap) return;

    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setPendingReenterFullscreen(false);
      } catch {
        setPendingReenterFullscreen(true);
      }
    } else {
      setPendingReenterFullscreen(false);
    }
  }, [protectedRoute, allowExitToMap]);

  useEffect(() => {
    if (!protectedRoute) {
      setShowExitGate(false);
      return;
    }

    void ensureFullscreen();

    const handleFullscreenChange = () => {
      const inProtectedPath = isProtectedStudentRoute(window.location.pathname);
      if (!inProtectedPath) return;

      if (!document.fullscreenElement && !allowExitToMap) {
        setShowExitGate(true);
        setPendingReenterFullscreen(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [protectedRoute, allowExitToMap, ensureFullscreen]);

  const handleExitSuccess = async () => {
    setAllowExitToMap(true);
    setShowExitGate(false);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore fullscreen exit errors
    }

    navigate("/student", { replace: true });
  };

  const handleExitCancel = async () => {
    setShowExitGate(false);
    await ensureFullscreen();
  };

  const sendChat = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    setChatInput("");
    setChatLoading(true);
    setChatMessages((prev) => [...prev, { role: "user", text: trimmed }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "AI error");
      }

      const data = await res.json();
      const answer = data?.answer ?? "";

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            answer ||
            "Robot chưa nghe rõ. Con hỏi lại được không?",
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Robot đang bận một chút, con thử lại nhé!",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading]);

  useEffect(() => {
    if (
      !showExitGate ||
      !pendingReenterFullscreen ||
      !protectedRoute ||
      allowExitToMap
    ) {
      return;
    }

    const onUserGesture = () => {
      void ensureFullscreen();
    };

    window.addEventListener("pointerdown", onUserGesture, { passive: true });
    window.addEventListener("keydown", onUserGesture);
    window.addEventListener("touchstart", onUserGesture, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onUserGesture);
      window.removeEventListener("keydown", onUserGesture);
      window.removeEventListener("touchstart", onUserGesture);
    };
  }, [
    showExitGate,
    pendingReenterFullscreen,
    protectedRoute,
    allowExitToMap,
    ensureFullscreen,
  ]);

  return (
    <div className="min-h-screen bg-sky-100 font-kids overflow-x-hidden">
      {!protectedRoute && <KidsTopbar />}

      <div className={protectedRoute ? "" : "pt-20"}>
        <Outlet />
      </div>

      <button
        type="button"
        onClick={() => setChatOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 text-white font-black shadow-xl flex items-center justify-center text-xl"
        aria-label="Mở trợ lý học toán"
      >
        🤖
      </button>

      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-sky-400 to-emerald-400 text-white px-4 py-3 font-extrabold">
            Trợ lý học toán
          </div>
          <div className="flex-1 max-h-[320px] overflow-y-auto p-3 space-y-2 bg-sky-50">
            {chatMessages.map((m, i) => (
              <div
                key={`m-${i}`}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-sm font-bold max-w-[85%] shadow-sm ${
                    m.role === "user"
                      ? "bg-emerald-500 text-white rounded-br-sm"
                      : "bg-white text-gray-700 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="text-xs text-gray-500 font-bold">Robot đang nghĩ...</div>
            )}
          </div>
          <div className="p-3 bg-white border-t border-sky-100">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void sendChat();
                  }
                }}
                className="flex-1 rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sky-300"
                placeholder="Nhập câu hỏi..."
              />
              <button
                type="button"
                onClick={() => void sendChat()}
                className="px-3 py-2 rounded-xl bg-sky-500 text-white text-sm font-extrabold"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitGate && protectedRoute && (
        <ParentGate
          onSuccess={handleExitSuccess}
          onClose={handleExitCancel}
          onInteract={() => {
            void ensureFullscreen();
          }}
        />
      )}
    </div>
  );
}
