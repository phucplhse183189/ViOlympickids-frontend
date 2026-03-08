import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { KidsTopbar } from "@/widgets/kids-topbar";
import { ParentGate } from "@/shared/ui/ParentGate";

function isProtectedStudentRoute(pathname: string) {
  return pathname.startsWith("/student/game/") || pathname.startsWith("/student/quiz/");
}

export function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showExitGate, setShowExitGate] = useState(false);
  const [allowExitToMap, setAllowExitToMap] = useState(false);

  const protectedRoute = useMemo(
    () => isProtectedStudentRoute(location.pathname),
    [location.pathname],
  );

  useEffect(() => {
    setAllowExitToMap(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!protectedRoute) {
      setShowExitGate(false);
      return;
    }

    const requestFull = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch {
          // Browser may block fullscreen if not triggered by user gesture.
        }
      }
    };

    void requestFull();

    const handleFullscreenChange = () => {
      const inProtectedPath = isProtectedStudentRoute(window.location.pathname);
      if (!inProtectedPath) return;

      if (!document.fullscreenElement && !allowExitToMap) {
        setShowExitGate(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [protectedRoute, allowExitToMap]);

  const ensureFullscreen = async () => {
    if (!protectedRoute) return;
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // ignore browser denial if not from user gesture
      }
    }
  };

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

  return (
    <div className="min-h-screen bg-sky-100 font-kids overflow-x-hidden">
      {!protectedRoute && <KidsTopbar />}

      <div className={protectedRoute ? "" : "pt-20"}>
        <Outlet />
      </div>

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
