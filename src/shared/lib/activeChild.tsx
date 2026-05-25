import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import * as childrenService from "@/shared/api/services/childrenService";
import type { ChildProfile, DashboardData } from "@/shared/api/services/childrenService";

const ACTIVE_CHILD_ID_KEY = "vio_active_child_id";

interface ActiveChildContextValue {
  profiles: ChildProfile[];
  activeChild: ChildProfile | null;
  dashboardData: DashboardData | null;
  isLoading: boolean;
  switchChild: (childId: string) => void;
  refreshProfiles: () => Promise<void>;
  updateChildPlan: (childId: string, plan: "FREE" | "PRO" | "VIP", daysLeft?: number) => Promise<void>;
}

const ActiveChildContext = createContext<ActiveChildContextValue | null>(null);

export function ActiveChildProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy parentId từ sessionStorage (đã lưu khi login)
  const parentId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("vio_parent_id") : null;

  async function loadData() {
    const currentParentId = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("vio_parent_id") : null;
    
    if (!currentParentId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await childrenService.getProfiles(currentParentId);
      setProfiles(data);
      
      if (data.length > 0) {
        // Lấy childId đã chọn từ localStorage hoặc chọn bé đầu tiên
        const savedId = localStorage.getItem(ACTIVE_CHILD_ID_KEY);
        const selected = data.find((p: ChildProfile) => p.id === savedId) || data[0];
        setActiveChild(selected);
        
        // Fetch dashboard data cho bé này
        const dashData = await childrenService.getDashboard(selected.id);
        setDashboardData(dashData);
      }
    } catch (error) {
      console.error("Failed to load children profiles", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [parentId]);

  async function switchChild(childId: string) {
    const selected = profiles.find(p => p.id === childId);
    if (!selected) return;
    
    localStorage.setItem(ACTIVE_CHILD_ID_KEY, childId);
    setActiveChild(selected);
    setDashboardData(null); // Reset while loading
    
    try {
      const dashData = await childrenService.getDashboard(childId);
      setDashboardData(dashData);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  }

  async function refreshProfiles() {
    await loadData();
  }

  async function updateChildPlan(childId: string, plan: "FREE" | "PRO" | "VIP", daysLeft?: number) {
    try {
      await childrenService.updatePlan(childId, plan, daysLeft);
      await loadData();
    } catch (error) {
      console.error("Failed to update plan", error);
    }
  }

  // Refresh profiles on window focus (after returning from /add-child)
  useEffect(() => {
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [parentId]);

  return (
    <ActiveChildContext.Provider
      value={{
        profiles,
        activeChild,
        dashboardData,
        isLoading,
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
