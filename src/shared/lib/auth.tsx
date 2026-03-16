import { createContext, useContext, useState, type ReactNode } from "react";

export const AVATARS = [
  { id: "fox", emoji: "🦊" },
  { id: "panda", emoji: "🐼" },
  { id: "frog", emoji: "🐸" },
  { id: "tiger", emoji: "🐯" },
  { id: "lion", emoji: "🦁" },
  { id: "penguin", emoji: "🐧" },
  { id: "octopus", emoji: "🐙" },
  { id: "unicorn", emoji: "🦄" },
  { id: "dragon", emoji: "🐲" },
  { id: "rabbit", emoji: "🐰" },
  { id: "butterfly", emoji: "🦋" },
  { id: "dolphin", emoji: "🐬" },
];

export interface User {
  nickname: string;
  email: string;
  avatarId: string;
  tier?: "free" | "premium";
}

/** Currently active role: child learning or parent dashboard */
export type ActiveRole = "child" | "parent" | null;

/** PIN used by parent to access dashboard (default: 1234) */
export const PARENT_PIN_KEY = "vio_parent_pin";
export const DEFAULT_PARENT_PIN = "1234";

interface AuthContextValue {
  user: User | null;
  activeRole: ActiveRole;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  setActiveRole: (role: ActiveRole) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<ActiveRole>(null);

  const login = (u: User) => setUser(u);
  const logout = () => {
    setUser(null);
    setActiveRole(null);
  };
  const updateUser = (patch: Partial<User>) =>
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <AuthContext.Provider
      value={{ user, activeRole, login, logout, updateUser, setActiveRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
