/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/auth";
import * as childrenService from "@/features/dashboard/api/childrenService";
import type { ChildProfile, DashboardData } from "@/features/dashboard/api/childrenService";

const ACTIVE_CHILD_ID_KEY = "vio_active_child_id";

export const childrenQueryKeys = {
  all: ["children"] as const,
  profiles: (parentId: string) => ["children", "profiles", parentId] as const,
  dashboard: (childId: string) => ["children", "dashboard", childId] as const,
};

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const parentId = user ? sessionStorage.getItem("vio_parent_id") : null;
  const [activeChildId, setActiveChildId] = useState<string | null>(() => localStorage.getItem(ACTIVE_CHILD_ID_KEY));

  const profilesQuery = useQuery({
    queryKey: childrenQueryKeys.profiles(parentId ?? "anonymous"),
    queryFn: () => childrenService.getProfiles(parentId!),
    enabled: Boolean(parentId),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });
  const profiles = useMemo(() => profilesQuery.data ?? [], [profilesQuery.data]);

  const activeChild = useMemo(
    () => profiles.find((profile) => profile.id === activeChildId) ?? profiles[0] ?? null,
    [profiles, activeChildId],
  );

  const dashboardQuery = useQuery({
    queryKey: childrenQueryKeys.dashboard(activeChild?.id ?? "none"),
    queryFn: () => childrenService.getDashboard(activeChild!.id),
    enabled: Boolean(activeChild),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });

  function switchChild(childId: string) {
    if (!profiles.some((profile) => profile.id === childId)) return;
    setActiveChildId(childId);
    localStorage.setItem(ACTIVE_CHILD_ID_KEY, childId);
  }

  async function refreshProfiles() {
    if (!parentId) return;
    await queryClient.invalidateQueries({ queryKey: childrenQueryKeys.profiles(parentId) });
  }

  async function updateChildPlan(childId: string, plan: "FREE" | "PRO" | "VIP", daysLeft?: number) {
    await childrenService.updatePlan(childId, plan, daysLeft);
    await Promise.all([
      parentId ? queryClient.invalidateQueries({ queryKey: childrenQueryKeys.profiles(parentId) }) : Promise.resolve(),
      queryClient.invalidateQueries({ queryKey: childrenQueryKeys.dashboard(childId) }),
    ]);
  }

  return (
    <ActiveChildContext.Provider value={{
      profiles,
      activeChild,
      dashboardData: dashboardQuery.data ?? null,
      isLoading: Boolean(parentId) && profilesQuery.isPending,
      switchChild,
      refreshProfiles,
      updateChildPlan,
    }}>
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild() {
  const context = useContext(ActiveChildContext);
  if (!context) throw new Error("useActiveChild must be used inside ActiveChildProvider");
  return context;
}
