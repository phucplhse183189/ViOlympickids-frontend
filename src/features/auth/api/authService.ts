import { apiPost } from "@/shared/api/client";

/** Thông tin user trả về từ API (không chứa passwordHash) */
export interface UserInfo {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  avatarInitials: string | null;
  avatarId: string | null;
  role: "parent" | "admin";
  status: "active" | "inactive" | "suspended";
  unreadNotifications: number | null;
  createdAt: string;
}

/**
 * Đăng nhập bằng SĐT + mật khẩu
 */
export async function login(phone: string, password: string): Promise<UserInfo> {
  return apiPost<UserInfo>("/auth/login", { phone, password });
}

/**
 * Đăng ký tài khoản phụ huynh mới
 */
export async function register(data: {
  phone: string;
  password: string;
  name: string;
  email?: string;
}): Promise<UserInfo> {
  return apiPost<UserInfo>("/auth/register", data);
}

/**
 * Đăng nhập/đăng ký bằng Google
 */
export async function googleLogin(credential: string): Promise<UserInfo> {
  return apiPost<UserInfo>("/auth/google", { credential });
}

/**
 * Gửi yêu cầu quên mật khẩu
 */
export async function forgotPassword(phoneOrEmail: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/forgot-password", { phoneOrEmail });
}

/**
 * Đặt lại mật khẩu bằng token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/auth/reset-password", { token, newPassword });
}
