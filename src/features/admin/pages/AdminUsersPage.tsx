import { useEffect, useMemo, useState } from "react";
import * as adminService from "@/features/admin/api/adminService";

type AccountStatus = "active" | "inactive" | "suspended";
type ViewMode = "grouped" | "all-students";
type PlanType = "FREE" | "PRO" | "VIP";

const STATUS_LABELS: Record<
  AccountStatus,
  { label: string; color: string; bg: string }
> = {
  active: {
    label: "Hoạt động",
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  inactive: {
    label: "Không HĐ",
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  suspended: {
    label: "Bị khoá",
    color: "text-rose-700",
    bg: "bg-rose-100",
  },
};

const PLAN_BADGES: Record<PlanType, { color: string; bg: string }> = {
  FREE: { color: "text-slate-700", bg: "bg-slate-100" },
  PRO: { color: "text-indigo-700", bg: "bg-indigo-100" },
  VIP: { color: "text-orange-700", bg: "bg-orange-100" },
};

function getInitials(name: string) {
  if (!name) return "P";
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

function formatDate(dateString?: string) {
  if (!dateString) return "Chưa cập nhật";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function AdminUsersPage() {
  const [parents, setParents] = useState<adminService.ParentWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AccountStatus>(
    "all",
  );
  const [planFilter, setPlanFilter] = useState<"all" | PlanType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(),
  );
  const [selectedParent, setSelectedParent] = useState<adminService.ParentWithChildren | null>(
    null,
  );

  useEffect(() => {
    if (selectedParent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedParent]);

  const reload = async () => {
    try {
      const data = await adminService.getParents();
      setParents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const toggleExpand = (parentId: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedParents(new Set(parents.map((p) => p.id)));
  };

  const collapseAll = () => {
    setExpandedParents(new Set());
  };

  const handleParentStatusChange = async (
    parentId: string,
    status: AccountStatus,
  ) => {
    try {
      await adminService.updateParentStatus(parentId, status);
      await reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentStatusChange = async (
    _parentId: string,
    studentId: string,
    status: AccountStatus,
  ) => {
    try {
      await adminService.updateStudentStatus(studentId, status);
      await reload();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredParents = useMemo(() => {
    const q = search.toLowerCase().trim();

    return parents.filter((p) => {
      const matchSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.phone || "").includes(q) ||
        p.children.some((c) => (c.name || "").toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "all" ||
        p.status === statusFilter ||
        p.children.some((c) => c.status === statusFilter);

      const matchPlan =
        planFilter === "all" || p.children.some((c) => c.plan === planFilter);

      return matchSearch && matchStatus && matchPlan;
    });
  }, [parents, search, statusFilter, planFilter]);

  const allStudents = useMemo(() => {
    return filteredParents.flatMap((p) =>
      p.children
        .filter((c) => {
          if (planFilter !== "all" && c.plan !== planFilter) return false;
          if (statusFilter !== "all" && c.status !== statusFilter) return false;
          return true;
        })
        .map((c) => ({ ...c, parentName: p.name, parentId: p.id })),
    );
  }, [filteredParents, planFilter, statusFilter]);

  const totalStudents = parents.flatMap((p) => p.children).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Đang tải dữ liệu người dùng...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Quản lý người dùng
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {parents.length} phụ huynh · {totalStudents} học sinh
            </p>
          </div>

          <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === "grouped"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Theo gia đình
            </button>
            <button
              onClick={() => setViewMode("all-students")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === "all-students"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Tất cả học sinh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              id="admin-search"
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | AccountStatus)
            }
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không HĐ</option>
            <option value="suspended">Bị khoá</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as "all" | PlanType)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="all">Tất cả gói</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="VIP">VIP</option>
          </select>

          {viewMode === "grouped" && (
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 bg-slate-100 border border-slate-200 rounded-xl"
              >
                Mở tất cả
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 bg-slate-100 border border-slate-200 rounded-xl"
              >
                Thu gọn
              </button>
            </div>
          )}
        </div>
      </div>

      {viewMode === "grouped" ? (
        <div className="space-y-4">
          {filteredParents.map((parent) => {
            const isExpanded = expandedParents.has(parent.id);
            const pStatus = STATUS_LABELS[parent.status || "active"];

            return (
              <div
                key={parent.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <div
                  className="flex items-center gap-4 p-4 lg:p-5 cursor-pointer select-none"
                  onClick={() => toggleExpand(parent.id)}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 transition-transform duration-300 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  >
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>

                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {getInitials(parent.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-slate-900 font-semibold text-sm">
                        {parent.name}
                      </h4>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pStatus.bg} ${pStatus.color}`}
                      >
                        {pStatus.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-slate-500 text-xs">
                      <span>{parent.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                      <span className="text-indigo-700 text-xs font-semibold">
                        {parent.children.length} học sinh
                      </span>
                    </div>

                    <div className="hidden lg:flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedParent(parent);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        title="Chi tiết"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </button>

                      {parent.status === "active" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleParentStatusChange(parent.id, "suspended");
                          }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Khoá tài khoản"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleParentStatusChange(parent.id, "active");
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Mở khoá tài khoản"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/70">
                    {parent.children.map((child, idx) => {
                      const cStatus = STATUS_LABELS[child.status || "active"];
                      const plan = PLAN_BADGES[child.plan as PlanType];

                      return (
                        <div
                          key={child.id}
                          className={`flex items-center gap-4 px-4 lg:px-5 py-3.5 ml-7 lg:ml-10 ${
                            idx < parent.children.length - 1
                              ? "border-b border-slate-200"
                              : ""
                          }`}
                        >
                          <div className="w-4 flex items-center justify-center -ml-4">
                            <div className="w-3 border-t border-dashed border-slate-300" />
                          </div>

                          <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-lg shrink-0">
                            {child.avatarEmoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-slate-900 text-sm font-medium">
                                {child.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${plan.bg} ${plan.color}`}
                              >
                                {child.plan}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${cStatus.bg} ${cStatus.color}`}
                              >
                                {cStatus.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-xs mt-0.5">
                              <span>{child.grade}</span>
                              <span>·</span>
                              <span>
                                {child.gender === "boy" ? "Nam" : "Nữ"}
                              </span>
                              <span className="hidden sm:inline">·</span>
                              <span className="hidden sm:inline">
                                {child.totalLessons || 0} bài
                              </span>
                              <span className="hidden sm:inline">·</span>
                              <span className="hidden sm:inline">
                                TB {child.avgScore || 0}đ
                              </span>
                            </div>
                          </div>

                          <div className="hidden md:block text-right">
                            <p className="text-slate-500 text-xs">Lần cuối</p>
                            <p className="text-slate-700 text-xs font-semibold">
                              {child.lastActive || "Chưa truy cập"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            {child.status === "active" ? (
                              <button
                                onClick={() =>
                                  handleStudentStatusChange(
                                    parent.id,
                                    child.id,
                                    "suspended",
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Khoá"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                  />
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  handleStudentStatusChange(
                                    parent.id,
                                    child.id,
                                    "active",
                                  )
                                }
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Mở khoá"
                              >
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {filteredParents.length === 0 && (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <p className="text-slate-600 font-medium">
                Không tìm thấy kết quả
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5">
                    Học sinh
                  </th>
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5">
                    Phụ huynh
                  </th>
                  <th className="text-center text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5">
                    Gói
                  </th>
                  <th className="text-center text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5 hidden md:table-cell">
                    Bài học
                  </th>
                  <th className="text-center text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5 hidden md:table-cell">
                    Điểm TB
                  </th>
                  <th className="text-center text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5">
                    Trạng thái
                  </th>
                  <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5 hidden lg:table-cell">
                    Lần cuối
                  </th>
                </tr>
              </thead>
              <tbody>
                {allStudents.map((student) => {
                  const cStatus = STATUS_LABELS[student.status || "active"];
                  const plan = PLAN_BADGES[student.plan as PlanType];

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-lg shrink-0">
                            {student.avatarEmoji}
                          </div>
                          <div>
                            <p className="text-slate-900 text-sm font-semibold">
                              {student.name}
                            </p>
                            <p className="text-slate-500 text-xs">
                              {student.grade} ·{" "}
                              {student.gender === "boy" ? "Nam" : "Nữ"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-sm">
                        {student.parentName}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-md ${plan.bg} ${plan.color}`}
                        >
                          {student.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center text-slate-700 text-sm hidden md:table-cell">
                        {student.totalLessons || 0}
                      </td>
                      <td className="px-5 py-3.5 text-center hidden md:table-cell">
                        <span
                          className={`text-sm font-semibold ${
                            (student.avgScore || 0) >= 80
                              ? "text-emerald-600"
                              : (student.avgScore || 0) >= 60
                                ? "text-amber-600"
                                : "text-rose-600"
                          }`}
                        >
                          {student.avgScore || 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${cStatus.bg} ${cStatus.color}`}
                        >
                          {cStatus.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">
                        {student.lastActive || "Chưa truy cập"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {allStudents.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-600 font-medium">
                Không tìm thấy học sinh nào
              </p>
            </div>
          )}
        </div>
      )}

      {selectedParent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedParent(null)}
          />
          <div className="relative bg-white rounded-[2rem] w-full max-w-5xl p-6 sm:p-8 shadow-2xl ring-1 ring-slate-900/5 transition-all overflow-hidden flex flex-col max-h-[90vh]">
            <button
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10"
              onClick={() => setSelectedParent(null)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-y-auto lg:overflow-hidden">
              
              {/* Left Column: Parent Info */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="text-center mt-4">
                  <div className="w-28 h-28 mx-auto bg-gradient-to-br from-indigo-500 via-blue-500 to-blue-600 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-inner ring-8 ring-indigo-50 mb-5">
                    {getInitials(selectedParent.name)}
                  </div>
                  <h3 className="text-slate-900 font-extrabold text-2xl tracking-tight">
                    {selectedParent.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 mt-3 bg-slate-50 border border-slate-100 py-1.5 px-3.5 rounded-xl">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.432-4.132-7.028-7.028l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                    <span className="text-slate-600 font-bold text-sm">{selectedParent.phone}</span>
                  </div>
                </div>

                <div className="space-y-3 mt-2">
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">Ngày đăng ký</p>
                      <p className="text-slate-900 text-sm font-bold">
                        {formatDate(selectedParent.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${STATUS_LABELS[selectedParent.status || "active"].bg} ${STATUS_LABELS[selectedParent.status || "active"].color}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">Trạng thái</p>
                      <span className={`inline-block mt-0.5 text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_LABELS[selectedParent.status || "active"].bg} ${STATUS_LABELS[selectedParent.status || "active"].color}`}>
                        {STATUS_LABELS[selectedParent.status || "active"].label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Students List */}
              <div className="lg:col-span-8 flex flex-col min-h-0 bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h4 className="text-slate-900 font-extrabold text-xl">
                    Hồ sơ học sinh
                  </h4>
                  <span className="text-sm font-bold px-3 py-1 bg-white shadow-sm text-indigo-600 rounded-xl border border-slate-200">
                    Tổng số: {selectedParent.children.length} bé
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto overflow-x-hidden pr-2 pb-2">
                  {selectedParent.children.map((child) => {
                    const plan = PLAN_BADGES[child.plan as PlanType];
                    const cStatus = STATUS_LABELS[child.status || "active"];

                    return (
                      <div
                        key={child.id}
                        className="group flex flex-col gap-4 bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 rounded-2xl p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                             <div className="relative shrink-0">
                               <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                                 {child.avatarEmoji}
                               </div>
                               <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white ${cStatus.bg.replace('bg-', 'bg-').replace('100', '500')}`} title={cStatus.label} />
                             </div>
                             <div className="min-w-0 flex-1">
                               <div className="flex flex-col gap-1.5 mb-1">
                                 <span className="text-slate-900 text-base font-bold truncate group-hover:text-indigo-600 transition-colors">
                                   {child.name}
                                 </span>
                                 <div className="flex">
                                   <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${plan.bg} ${plan.color}`}>
                                     {child.plan}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           </div>
                           <span className={`shrink-0 text-[11px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${cStatus.bg} ${cStatus.color}`}>
                             {cStatus.label}
                           </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-2 text-slate-500 text-xs font-medium">
                            <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-bold">{child.grade}</span>
                            <span className="flex items-center gap-1 font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                              {child.totalLessons || 0} bài
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md font-black text-xs border border-amber-100/50 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                            {child.avgScore || 0} đ
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
