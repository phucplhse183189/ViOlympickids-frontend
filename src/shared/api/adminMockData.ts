/**
 * ============================================================
 *  MOCK DATA – Admin Dashboard
 *  Parent ↔ Student grouping for admin management.
 * ============================================================
 */

// ── Types ────────────────────────────────────────────────────

export type AccountStatus = "active" | "inactive" | "suspended";

export interface AdminStudent {
  id: string;
  name: string;
  gender: "boy" | "girl";
  grade: string;
  avatarEmoji: string;
  plan: "FREE" | "PRO" | "VIP";
  totalLessons: number;
  avgScore: number;
  lastActive: string;
  status: AccountStatus;
  createdAt: string;
}

export interface AdminParent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  status: AccountStatus;
  createdAt: string;
  children: AdminStudent[];
}

export interface AdminAccount {
  username: string;
  password: string;
  displayName: string;
  role: "admin";
}

export interface AdminStats {
  totalParents: number;
  totalStudents: number;
  activeToday: number;
  premiumUsers: number;
  newThisWeek: number;
  revenue: number;
}

// ── Admin credentials ────────────────────────────────────────

export const ADMIN_ACCOUNT: AdminAccount = {
  username: "0901234567",
  password: "admin123",
  displayName: "Admin ViOlympicKids",
  role: "admin",
};

// ── Mock Parents & Students ──────────────────────────────────

export const MOCK_PARENTS: AdminParent[] = [
  {
    id: "parent-1",
    name: "Nguyễn Văn An",
    email: "an.nguyen@gmail.com",
    phone: "0912 345 678",
    avatarInitials: "NA",
    status: "active",
    createdAt: "15/01/2026",
    children: [
      {
        id: "student-1",
        name: "Nguyễn Bé Na",
        gender: "girl",
        grade: "Lớp 2",
        avatarEmoji: "👧",
        plan: "PRO",
        totalLessons: 48,
        avgScore: 82,
        lastActive: "27/03/2026",
        status: "active",
        createdAt: "15/01/2026",
      },
      {
        id: "student-2",
        name: "Nguyễn Bé Bin",
        gender: "boy",
        grade: "Lớp 2",
        avatarEmoji: "🧒",
        plan: "VIP",
        totalLessons: 95,
        avgScore: 95,
        lastActive: "27/03/2026",
        status: "active",
        createdAt: "20/01/2026",
      },
    ],
  },
  {
    id: "parent-2",
    name: "Trần Thị Bình",
    email: "binh.tran@yahoo.com",
    phone: "0987 654 321",
    avatarInitials: "TB",
    status: "active",
    createdAt: "02/02/2026",
    children: [
      {
        id: "student-3",
        name: "Trần Minh Khôi",
        gender: "boy",
        grade: "Lớp 2",
        avatarEmoji: "🦊",
        plan: "PRO",
        totalLessons: 35,
        avgScore: 78,
        lastActive: "26/03/2026",
        status: "active",
        createdAt: "02/02/2026",
      },
    ],
  },
  {
    id: "parent-3",
    name: "Lê Hoàng Dũng",
    email: "dung.le@hotmail.com",
    phone: "0909 111 222",
    avatarInitials: "LD",
    status: "active",
    createdAt: "10/02/2026",
    children: [
      {
        id: "student-4",
        name: "Lê Bảo Ngọc",
        gender: "girl",
        grade: "Lớp 2",
        avatarEmoji: "🦋",
        plan: "VIP",
        totalLessons: 120,
        avgScore: 91,
        lastActive: "27/03/2026",
        status: "active",
        createdAt: "10/02/2026",
      },
      {
        id: "student-5",
        name: "Lê Gia Huy",
        gender: "boy",
        grade: "Lớp 2",
        avatarEmoji: "🐯",
        plan: "VIP",
        totalLessons: 88,
        avgScore: 87,
        lastActive: "25/03/2026",
        status: "active",
        createdAt: "15/02/2026",
      },
      {
        id: "student-6",
        name: "Lê Minh Anh",
        gender: "girl",
        grade: "Lớp 2",
        avatarEmoji: "🐬",
        plan: "FREE",
        totalLessons: 10,
        avgScore: 55,
        lastActive: "20/03/2026",
        status: "inactive",
        createdAt: "20/02/2026",
      },
    ],
  },
  {
    id: "parent-4",
    name: "Phạm Thanh Hà",
    email: "ha.pham@gmail.com",
    phone: "0933 444 555",
    avatarInitials: "PH",
    status: "active",
    createdAt: "25/02/2026",
    children: [
      {
        id: "student-7",
        name: "Phạm Đức Anh",
        gender: "boy",
        grade: "Lớp 2",
        avatarEmoji: "🐼",
        plan: "FREE",
        totalLessons: 5,
        avgScore: 60,
        lastActive: "22/03/2026",
        status: "active",
        createdAt: "25/02/2026",
      },
    ],
  },
  {
    id: "parent-5",
    name: "Võ Minh Tuấn",
    email: "tuan.vo@outlook.com",
    phone: "0977 888 999",
    avatarInitials: "VT",
    status: "suspended",
    createdAt: "05/01/2026",
    children: [
      {
        id: "student-8",
        name: "Võ Khánh Linh",
        gender: "girl",
        grade: "Lớp 2",
        avatarEmoji: "🦄",
        plan: "PRO",
        totalLessons: 22,
        avgScore: 70,
        lastActive: "10/03/2026",
        status: "suspended",
        createdAt: "05/01/2026",
      },
    ],
  },
  {
    id: "parent-6",
    name: "Đặng Thùy Linh",
    email: "linh.dang@gmail.com",
    phone: "0866 222 333",
    avatarInitials: "DL",
    status: "active",
    createdAt: "12/03/2026",
    children: [
      {
        id: "student-9",
        name: "Đặng Quốc Bảo",
        gender: "boy",
        grade: "Lớp 2",
        avatarEmoji: "🐸",
        plan: "FREE",
        totalLessons: 8,
        avgScore: 65,
        lastActive: "26/03/2026",
        status: "active",
        createdAt: "12/03/2026",
      },
      {
        id: "student-10",
        name: "Đặng Mai Phương",
        gender: "girl",
        grade: "Lớp 2",
        avatarEmoji: "🐰",
        plan: "PRO",
        totalLessons: 15,
        avgScore: 73,
        lastActive: "27/03/2026",
        status: "active",
        createdAt: "15/03/2026",
      },
    ],
  },
];

// ── Computed stats ───────────────────────────────────────────

export function getAdminStats(): AdminStats {
  const parents = loadAdminParents();
  const allStudents = parents.flatMap((p) => p.children);
  const activeParents = parents.filter((p) => p.status === "active");
  const premiumStudents = allStudents.filter(
    (s) => s.plan === "PRO" || s.plan === "VIP",
  );

  return {
    totalParents: parents.length,
    totalStudents: allStudents.length,
    activeToday: Math.min(
      activeParents.length,
      allStudents.filter((s) => s.status === "active").length,
    ),
    premiumUsers: premiumStudents.length,
    newThisWeek: 2,
    revenue: premiumStudents.reduce(
      (sum, s) => sum + (s.plan === "VIP" ? 89000 : 55000),
      0,
    ),
  };
}

// ── localStorage persistence ─────────────────────────────────

const ADMIN_PARENTS_KEY = "vio_admin_parents";

export function loadAdminParents(): AdminParent[] {
  try {
    const raw = localStorage.getItem(ADMIN_PARENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AdminParent[];
      if (parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return MOCK_PARENTS;
}

export function saveAdminParents(parents: AdminParent[]): void {
  localStorage.setItem(ADMIN_PARENTS_KEY, JSON.stringify(parents));
}

export function updateParentStatus(
  parentId: string,
  status: AccountStatus,
): void {
  const parents = loadAdminParents();
  const updated = parents.map((p) =>
    p.id === parentId
      ? {
          ...p,
          status,
          children: p.children.map((c) => ({ ...c, status })),
        }
      : p,
  );
  saveAdminParents(updated);
}

export function updateStudentStatus(
  parentId: string,
  studentId: string,
  status: AccountStatus,
): void {
  const parents = loadAdminParents();
  const updated = parents.map((p) =>
    p.id === parentId
      ? {
          ...p,
          children: p.children.map((c) =>
            c.id === studentId ? { ...c, status } : c,
          ),
        }
      : p,
  );
  saveAdminParents(updated);
}
