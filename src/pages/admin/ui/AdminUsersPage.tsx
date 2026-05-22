import { useEffect, useMemo, useState } from "react";
import * as adminService from "@/shared/api/services/adminService";

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
    parentId: string,
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
        (p.nickname || "").toLowerCase().includes(q) ||
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
        .map((c) => ({ ...c, parentName: p.nickname, parentId: p.id })),
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
                    {getInitials(parent.nickname)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-slate-900 font-semibold text-sm">
                        {parent.nickname}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSelectedParent(null)}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
            <button
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              onClick={() => setSelectedParent(null)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                {getInitials(selectedParent.nickname)}
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-lg">
                  {selectedParent.nickname}
                </h3>
                <p className="text-slate-500 text-sm">{selectedParent.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-slate-500 text-xs">Điện thoại</p>
                <p className="text-slate-900 text-sm font-semibold mt-0.5">
                  {selectedParent.phone}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-slate-500 text-xs">Ngày đăng ký</p>
                <p className="text-slate-900 text-sm font-semibold mt-0.5">
                  {selectedParent.createdAt}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-slate-500 text-xs">Trạng thái</p>
                <p
                  className={`text-sm font-semibold mt-0.5 ${STATUS_LABELS[selectedParent.status || "active"].color}`}
                >
                  {STATUS_LABELS[selectedParent.status || "active"].label}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <p className="text-slate-500 text-xs">Số con</p>
                <p className="text-slate-900 text-sm font-semibold mt-0.5">
                  {selectedParent.children.length}
                </p>
              </div>
            </div>

            <h4 className="text-slate-900 font-semibold text-sm mb-3">
              Danh sách học sinh
            </h4>
            <div className="space-y-2">
              {selectedParent.children.map((child) => {
                const plan = PLAN_BADGES[child.plan as PlanType];
                const cStatus = STATUS_LABELS[child.status || "active"];

                return (
                  <div
                    key={child.id}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3"
                  >
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-lg">
                      {child.avatarEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 text-sm font-semibold">
                          {child.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${plan.bg} ${plan.color}`}
                        >
                          {child.plan}
                        </span>
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {child.grade} · {child.gender === "boy" ? "Nam" : "Nữ"}{" "}
                        · TB {child.avgScore || 0}đ · {child.totalLessons || 0} bài
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cStatus.bg} ${cStatus.color}`}
                    >
                      {cStatus.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
