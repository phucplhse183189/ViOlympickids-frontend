import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  type ChildProfile,
  type ChildDashboardData,
  type PlanType,
  loadChildProfiles,
  getActiveChildId,
  getChildDashboard,
  updateChildPlan as persistChildPlan,
  ACTIVE_CHILD_ID_KEY,
} from "@/shared/api/dashboardMockData";

interface ActiveChildContextValue {
  profiles: ChildProfile[];
  activeChild: ChildProfile;
  dashboardData: ChildDashboardData;
  switchChild: (childId: string) => void;
  refreshProfiles: () => void;
  updateChildPlan: (childId: string, plan: PlanType, daysLeft?: number) => void;
}

const ActiveChildContext = createContext<ActiveChildContextValue | null>(null);

export function ActiveChildProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<ChildProfile[]>(() =>
    loadChildProfiles(),
  );
  const [activeId, setActiveId] = useState<string>(() => getActiveChildId());

  const activeChild = profiles.find((p) => p.id === activeId) ?? profiles[0];
  const dashboardData = getChildDashboard(activeChild.id);

  function switchChild(childId: string) {
    setActiveId(childId);
    localStorage.setItem(ACTIVE_CHILD_ID_KEY, childId);
  }

  function refreshProfiles() {
    setProfiles(loadChildProfiles());
    setActiveId(getActiveChildId());
  }

  function updateChildPlan(childId: string, plan: PlanType, daysLeft?: number) {
    persistChildPlan(childId, plan, daysLeft);
    setProfiles(loadChildProfiles());
  }

  // Refresh profiles on window focus (after returning from /add-child)
  useEffect(() => {
    const onFocus = () => refreshProfiles();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <ActiveChildContext.Provider
      value={{
        profiles,
        activeChild,
        dashboardData,
        switchChild,
        refreshProfiles,
        updateChildPlan,
      }}
    >
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild() {
  const ctx = useContext(ActiveChildContext);
  if (!ctx)
    throw new Error("useActiveChild must be used inside ActiveChildProvider");
  return ctx;
}
