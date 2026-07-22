import { useCallback, useEffect, useMemo, useState } from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { KidsTopbar } from "@/features/student/components/KidsTopbar";
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

  // After refresh, requestFullscreen() in ensureFullscreen usually fails (no user
  // gesture). Retry on the first tap/key so the game can enter fullscreen without
  // requiring the ParentGate flow (that only runs after an explicit fullscreen exit).
  useEffect(() => {
    if (
      !pendingReenterFullscreen ||
      !protectedRoute ||
      allowExitToMap
    ) {
      return;
    }

    const onUserGesture = () => {
      void ensureFullscreen();
    };

    window.addEventListener("pointerdown", onUserGesture, {
      passive: true,
      capture: true,
    });
    window.addEventListener("keydown", onUserGesture, { capture: true });
    window.addEventListener("touchstart", onUserGesture, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("pointerdown", onUserGesture, true);
      window.removeEventListener("keydown", onUserGesture, true);
      window.removeEventListener("touchstart", onUserGesture, true);
    };
  }, [pendingReenterFullscreen, protectedRoute, allowExitToMap, ensureFullscreen]);

  return (
    <div className="min-h-screen bg-sky-100 font-kids overflow-x-hidden">
      {!protectedRoute && <KidsTopbar />}

      <div className={protectedRoute ? "" : "pt-[72px]"}>
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
