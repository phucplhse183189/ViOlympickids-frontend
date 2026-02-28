import { useState, useMemo } from "react";
import { Search, Download, Filter, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  MOCK_ACTIVITIES,
  SUBJECT_FILTER_OPTIONS,
  type ActivityStatus,
} from "@/shared/api/dashboardMockData";

const statusStyle: Record<ActivityStatus, string> = {
  "Hoàn thành": "bg-green-100 text-green-700",
  "Đang dở": "bg-yellow-100 text-yellow-700",
  "Chưa làm": "bg-gray-100 text-gray-500",
};

const statusIcon: Record<ActivityStatus, React.ReactNode> = {
  "Hoàn thành": <CheckCircle2 size={12} className="shrink-0" />,
  "Đang dở": <Clock size={12} className="shrink-0" />,
  "Chưa làm": <XCircle size={12} className="shrink-0" />,
};

const PAGE_SIZE = 7;

export function HistoryPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | ActivityStatus>("Tất cả");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return MOCK_ACTIVITIES.filter((a) => {
      const matchSearch = a.lesson.toLowerCase().includes(search.toLowerCase());
      const matchSubject = subjectFilter === "Tất cả" || a.subject === subjectFilter;
      const matchStatus = statusFilter === "Tất cả" || a.status === statusFilter;
      return matchSearch && matchSubject && matchStatus;
    });
  }, [search, subjectFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to first page when filters change
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleSubject = (v: string) => { setSubjectFilter(v); setPage(1); };
  const handleStatus = (v: string) => { setStatusFilter(v as "Tất cả" | ActivityStatus); setPage(1); };

  // Stats summary
  const total = MOCK_ACTIVITIES.length;
  const done = MOCK_ACTIVITIES.filter((a) => a.status === "Hoàn thành").length;
  const inProgress = MOCK_ACTIVITIES.filter((a) => a.status === "Đang dở").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Lịch sử học tập</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {total} hoạt động được ghi nhận
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all self-start sm:self-auto shadow-sm shadow-blue-200">
          <Download size={15} />
          Xuất báo cáo
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
          <span className="text-sm font-bold text-gray-700">{total}</span>
          <span className="text-sm text-gray-400">Tổng hoạt động</span>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block" />
          <span className="text-sm font-bold text-green-700">{done}</span>
          <span className="text-sm text-green-600">Hoàn thành</span>
        </div>
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
          <span className="text-sm font-bold text-yellow-700">{inProgress}</span>
          <span className="text-sm text-yellow-600">Đang dở</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm bài học..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
          />
        </div>
        {/* Subject */}
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <select
            value={subjectFilter}
            onChange={(e) => handleSubject(e.target.value)}
            className="pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white transition appearance-none cursor-pointer"
          >
            {SUBJECT_FILTER_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => handleStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white transition appearance-none cursor-pointer"
        >
          {["Tất cả", "Hoàn thành", "Đang dở"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Search size={36} className="text-gray-200" />
            <p className="text-gray-400 text-sm font-medium">
              Không tìm thấy kết quả phù hợp.
            </p>
            <button
              onClick={() => { setSearch(""); setSubjectFilter("Tất cả"); setStatusFilter("Tất cả"); }}
              className="text-sm text-blue-600 font-semibold hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Ngày / Giờ</th>
                  <th className="px-6 py-3.5 font-semibold">Tên bài học</th>
                  <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Chủ đề</th>
                  <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Thời gian</th>
                  <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Điểm số</th>
                  <th className="px-6 py-3.5 font-semibold whitespace-nowrap">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((a, i) => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50/70 transition-colors animate-row-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="px-6 py-3.5 text-gray-400 whitespace-nowrap font-medium">
                      {a.datetime}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-gray-700 max-w-[200px]">
                      {a.lesson}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {a.subject}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">
                      {a.duration}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-gray-700 whitespace-nowrap">
                      {a.score ?? "—"}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[a.status]}`}
                      >
                        {statusIcon[a.status]}
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Hiển thị {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} kết quả
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                    p === page
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Tiếp →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
