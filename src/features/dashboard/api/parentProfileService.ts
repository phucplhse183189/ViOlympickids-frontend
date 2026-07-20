import { apiGet, apiPut } from "@/shared/api/client";
import type { UserInfo } from "@/features/auth/api/authService";

export const parentProfileKeys = {
  detail: (parentId: string) => ["parent", "profile", parentId] as const,
};

export function getParentProfile(parentId: string): Promise<UserInfo> {
  return apiGet<UserInfo>(`/parent/profile?id=${parentId}`);
}

export function updateParentProfile(data: { id: string; name: string; phone: string; email: string; avatarId?: string | null }): Promise<UserInfo> {
  return apiPut<UserInfo>("/parent/profile", data);
}
