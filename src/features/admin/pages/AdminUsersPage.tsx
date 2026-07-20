import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Crown,
  ExternalLink,
  GraduationCap,
  LockKeyhole,
  Phone,
  UnlockKeyhole,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import * as adminService from "@/features/admin/api/adminService";
import {
  adminQueryKeys,
  useAdminParentsQuery,
} from "@/features/admin/api/adminQueries";
import {
  AdminDatePicker,
  AdminFilterSelect,
  AdminPageLoading,
  AdminPagination,
  AdminSearch,
} from "@/features/admin/components/ui";

type AccountStatus = "active" | "inactive" | "suspended";
type Plan = "FREE" | "PRO" | "VIP";
const PAGE_SIZE = 8;
const statusMeta: Record<AccountStatus, { label: string; style: string }> = {
  active: { label: "Hoạt động", style: "bg-emerald-500/10 text-emerald-500" },
  inactive: {
    label: "Không hoạt động",
    style: "bg-amber-500/10 text-amber-500",
  },
  suspended: { label: "Bị khóa", style: "bg-rose-500/10 text-rose-500" },
};

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const { data: parents = [], isPending } = useAdminParentsQuery();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AccountStatus>("all");
  const [plan, setPlan] = useState<"all" | Plan>("all");
  const [registeredAfter, setRegisteredAfter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    const after = registeredAfter
      ? new Date(`${registeredAfter}T00:00:00`).getTime()
      : null;
    return parents.filter((parent) => {
      const queryMatch =
        !query ||
        [
          parent.name,
          parent.phone,
          parent.email,
          ...parent.children.map((child) => child.name),
        ].some((value) =>
          String(value || "")
            .toLocaleLowerCase("vi")
            .includes(query),
        );
      const statusMatch = status === "all" || parent.status === status;
      const planMatch =
        plan === "all" || parent.children.some((child) => child.plan === plan);
      const dateMatch =
        after == null || new Date(parent.createdAt).getTime() >= after;
      return queryMatch && statusMatch && planMatch && dateMatch;
    });
  }, [parents, search, status, plan, registeredAfter]);

  useEffect(() => setPage(1), [search, status, plan, registeredAfter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function updateParent(id: string, next: AccountStatus) {
    const previous = queryClient.getQueryData<
      adminService.ParentWithChildren[]
    >(adminQueryKeys.parents);
    queryClient.setQueryData<adminService.ParentWithChildren[]>(
      adminQueryKeys.parents,
      (current = []) =>
        current.map((parent) =>
          parent.id === id ? { ...parent, status: next } : parent,
        ),
    );
    setUpdatingId(id);
    try {
      await adminService.updateParentStatus(id, next);
    } catch (error) {
      queryClient.setQueryData(adminQueryKeys.parents, previous);
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateStudent(id: string, next: AccountStatus) {
    const previous = queryClient.getQueryData<
      adminService.ParentWithChildren[]
    >(adminQueryKeys.parents);
    queryClient.setQueryData<adminService.ParentWithChildren[]>(
      adminQueryKeys.parents,
      (current = []) =>
        current.map((parent) => ({
          ...parent,
          children: parent.children.map((student) =>
            student.id === id ? { ...student, status: next } : student,
          ),
        })),
    );
    setUpdatingId(id);
    try {
      await adminService.updateStudentStatus(id, next);
    } catch (error) {
      queryClient.setQueryData(adminQueryKeys.parents, previous);
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  }

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }
  if (isPending) return <UsersSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5 pb-8"
    >
      <section className="overflow-hidden rounded-[26px] border border-indigo-400/20 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[.16em] text-indigo-300">
              User directory
            </span>
            <h2 className="mt-2 text-3xl font-black">Phụ huynh & học sinh</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Một danh sách thống nhất. Mở phụ huynh để quản lý các hồ sơ học
              sinh trực thuộc.
            </p>
          </div>
          <div className="flex gap-3">
            <HeroCount icon={Users} value={parents.length} label="Phụ huynh" />
            <HeroCount
              icon={GraduationCap}
              value={parents.reduce(
                (sum, parent) => sum + parent.children.length,
                0,
              )}
              label="Học sinh"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-border bg-card p-3 shadow-sm">
        <div className="grid gap-2 lg:grid-cols-[minmax(280px,1fr)_180px_160px_190px]">
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder="Tên, email, số điện thoại, học sinh…"
          />
          <AdminFilterSelect
            label="Trạng thái"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "active", label: "Hoạt động" },
              { value: "inactive", label: "Không hoạt động" },
              { value: "suspended", label: "Bị khóa" },
            ]}
          />
          <AdminFilterSelect
            label="Gói"
            value={plan}
            onChange={setPlan}
            options={[
              { value: "all", label: "Tất cả gói" },
              { value: "FREE", label: "FREE" },
              { value: "PRO", label: "PRO" },
              { value: "VIP", label: "VIP" },
            ]}
          />
          <AdminDatePicker
            label="Đăng ký từ ngày"
            value={registeredAfter}
            onChange={setRegisteredAfter}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[minmax(210px,1.25fr)_165px_minmax(190px,1fr)_110px_90px_125px_150px] items-center gap-3 border-b border-border bg-muted/35 px-5 py-3 text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground md:grid">
          <span>Phụ huynh</span>
          <span>Số điện thoại</span>
          <span>Email</span>
          <span>Trạng thái</span>
          <span>Học sinh</span>
          <span>Ngày đăng ký</span>
          <span className="text-right">Thao tác</span>
        </div>
        <div className="divide-y divide-border">
          {rows.map((parent, index) => (
            <ParentRow
              key={parent.id}
              parent={parent}
              expanded={expanded.has(parent.id)}
              onToggle={() => toggle(parent.id)}
              onParentStatus={updateParent}
              onStudentStatus={updateStudent}
              updatingId={updatingId}
              index={index}
              reduceMotion={!!reduceMotion}
            />
          ))}
          {!rows.length && (
            <div className="px-5 py-16 text-center">
              <UserRoundSearch className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-bold">Không tìm thấy tài khoản</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Hãy thử thay đổi từ khóa hoặc bộ lọc.
              </p>
            </div>
          )}
        </div>
        <AdminPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
        />
      </section>
    </motion.div>
  );
}

function ParentRow({
  parent,
  expanded,
  onToggle,
  onParentStatus,
  onStudentStatus,
  updatingId,
  index,
  reduceMotion,
}: {
  parent: adminService.ParentWithChildren;
  expanded: boolean;
  onToggle: () => void;
  onParentStatus: (id: string, status: AccountStatus) => Promise<void>;
  onStudentStatus: (id: string, status: AccountStatus) => Promise<void>;
  updatingId: string | null;
  index: number;
  reduceMotion: boolean;
}) {
  const state = statusMeta[(parent.status || "active") as AccountStatus];
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      className={`transition-colors ${expanded ? "bg-indigo-500/[.045]" : "hover:bg-muted/25"}`}
    >
      <div role="button" tabIndex={0} aria-expanded={expanded} onClick={onToggle} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onToggle(); } }} className="grid cursor-pointer items-center gap-3 px-4 py-4 outline-none transition focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-indigo-500/15 md:grid-cols-[minmax(210px,1.25fr)_165px_minmax(190px,1fr)_110px_90px_125px_150px] md:px-5">
        <div
          className={`group -ml-3 flex min-w-0 items-center rounded-xl px-3 py-2 text-left outline-none transition focus-visible:ring-4 focus-visible:ring-indigo-500/15 ${expanded ? "bg-indigo-500/10 text-indigo-500" : "hover:bg-indigo-500/5"}`}
        >
          <span
            className={`mr-3 h-8 w-1 shrink-0 rounded-full transition-all ${expanded ? "bg-indigo-500" : "bg-border group-hover:bg-indigo-500/40"}`}
          />
          <span className="min-w-0">
            <strong className="block truncate text-sm">{parent.name}</strong>
            <span className="mt-1 flex items-center gap-2 md:hidden">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${state.style}`}
              >
                {state.label}
              </span>
              <small className="truncate text-muted-foreground">
                {parent.phone || "Chưa có số điện thoại"}
              </small>
            </span>
          </span>
        </div>
        <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          {parent.phone || "Chưa có "}
        </span>
        <span
          className="hidden truncate text-xs text-muted-foreground md:block"
          title={parent.email || "Chưa có email"}
        >
          {parent.email || "Chưa có email"}
        </span>
        <span
          className={`hidden w-fit rounded-full px-2.5 py-1 text-[10px] font-bold md:block ${state.style}`}
        >
          {state.label}
        </span>
        <div className="hidden text-left md:block">
          <strong className="text-sm text-foreground">
            {parent.children.length}
          </strong>
          <span className="ml-1 text-xs text-muted-foreground">hồ sơ</span>
        </div>
        <span className="hidden text-xs text-muted-foreground md:block">
          {formatDate(parent.createdAt)}
        </span>
        <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <Link
            to={`/admin/users/parents/${parent.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-500/10 px-3 text-xs font-bold text-indigo-500 transition hover:bg-indigo-500 hover:text-white active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Xem
          </Link>
          <button
            disabled={updatingId === parent.id}
            onClick={() =>
              void onParentStatus(
                parent.id,
                parent.status === "active" ? "suspended" : "active",
              )
            }
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition active:scale-95 disabled:opacity-50 ${parent.status === "active" ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"}`}
            title={
              parent.status === "active"
                ? "Khóa tài khoản"
                : "Mở khóa tài khoản"
            }
          >
            {parent.status === "active" ? (
              <LockKeyhole className="h-3.5 w-3.5" />
            ) : (
              <UnlockKeyhole className="h-3.5 w-3.5" />
            )}
            {parent.status === "active" ? "Khóa" : "Mở"}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-muted/25 px-4 py-3 md:pl-16 md:pr-5">
              <div className="space-y-2">
                {parent.children.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    updating={updatingId === student.id}
                    onStatus={onStudentStatus}
                  />
                ))}
                {!parent.children.length && (
                  <p className="py-4 text-sm text-muted-foreground">
                    Phụ huynh chưa có hồ sơ học sinh.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function StudentRow({
  student,
  updating,
  onStatus,
}: {
  student: adminService.ParentWithChildren["children"][number];
  updating: boolean;
  onStatus: (id: string, status: AccountStatus) => Promise<void>;
}) {
  const state = statusMeta[(student.status || "active") as AccountStatus];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl border border-border bg-card p-3.5 shadow-sm"
    >
      <div className="grid items-center gap-4 lg:grid-cols-[minmax(200px,1.2fr)_minmax(250px,1.5fr)_150px_150px]">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-xl">
            {student.avatarEmoji}
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-sm">{student.name}</strong>
            <small className="text-muted-foreground">
              {student.grade || "Chưa cập nhật lớp"} ·{" "}
              {student.gender || "Chưa cập nhật giới tính"}
            </small>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <StudentStat
            label="Bài đã học"
            value={String(student.totalLessons || 0)}
          />
          <StudentStat label="Điểm TB" value={`${student.avgScore || 0}/100`} />
          <StudentStat
            label="Còn lại"
            value={
              student.plan === "FREE"
                ? "—"
                : `${student.planDaysLeft || 0} ngày`
            }
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-500">
              <Crown className="h-3 w-3" />
              {student.plan}
            </span>
            <span
              className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${state.style}`}
            >
              {state.label}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Hoạt động: {formatDate(student.lastActive)}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Link
            to={`/admin/users/students/${student.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-500/10 px-3 text-xs font-bold text-indigo-500 transition hover:bg-indigo-500 hover:text-white active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Xem
          </Link>
          <button
            disabled={updating}
            onClick={() =>
              void onStatus(
                student.id,
                student.status === "active" ? "suspended" : "active",
              )
            }
            className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition active:scale-95 disabled:opacity-50 ${student.status === "active" ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"}`}
            title={
              student.status === "active"
                ? "Khóa tài khoản"
                : "Mở khóa tài khoản"
            }
          >
            {student.status === "active" ? (
              <LockKeyhole className="h-3.5 w-3.5" />
            ) : (
              <UnlockKeyhole className="h-3.5 w-3.5" />
            )}
            {student.status === "active" ? "Khóa" : "Mở"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StudentStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/55 px-2.5 py-2">
      <span className="block text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <strong className="mt-0.5 block text-xs text-foreground">{value}</strong>
    </div>
  );
}

function HeroCount({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-28 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
      <Icon className="h-4 w-4 text-indigo-300" />
      <strong className="mt-2 block text-xl">{value}</strong>
      <span className="text-[10px] uppercase tracking-wide text-slate-300">
        {label}
      </span>
    </div>
  );
}
function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("vi-VN");
}
function UsersSkeleton() {
  return <AdminPageLoading title="Đang tải danh sách người dùng" description="Đang đồng bộ tài khoản phụ huynh và hồ sơ học sinh." />;
}
