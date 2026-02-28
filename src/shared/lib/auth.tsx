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
}

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (u: User) => setUser(u);
  const logout = () => setUser(null);
  const updateUser = (patch: Partial<User>) =>
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
