import { useEffect, useMemo, useState } from "react";
import * as adminService from "@/features/admin/api/adminService";

type PlanType = "FREE" | "PRO" | "VIP";
type StatusType = "published" | "draft";

const PLAN_BADGES: Record<PlanType, { color: string; bg: string }> = {
  FREE: { color: "text-slate-700", bg: "bg-slate-100" },
  PRO: { color: "text-indigo-700", bg: "bg-indigo-100" },
  VIP: { color: "text-orange-700", bg: "bg-orange-100" },
};

const STATUS_BADGES: Record<StatusType, { color: string; bg: string; label: string }> = {
  published: { color: "text-emerald-700", bg: "bg-emerald-100", label: "Đã hoàn thành" },
  draft: { color: "text-amber-700", bg: "bg-amber-100", label: "Chưa code" },
};

export function AdminLessonsPage() {
  const [lessons, setLessons] = useState<adminService.AdminLesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | PlanType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusType>("all");

  // Accordion state
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Edit state
  const [editingLesson, setEditingLesson] = useState<adminService.AdminLesson | null>(null);
  const [editForm, setEditForm] = useState<Partial<adminService.AdminLesson>>({});
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    try {
      const data = await adminService.getAdminLessons();
      setLessons(data);
      // Auto expand first topic if none expanded
      if (data.length > 0) {
        const firstTopicId = data[0].topicId;
        setExpandedTopics((prev) => {
          if (prev.size === 0) return new Set([firstTopicId]);
          return prev;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filteredLessons = useMemo(() => {
    const q = search.toLowerCase().trim();

    return lessons.filter((l) => {
      const matchSearch =
        !q ||
        (l.title || "").toLowerCase().includes(q) ||
        (l.topicName || "").toLowerCase().includes(q);

      const matchPlan = planFilter === "all" || l.requiredPlan === planFilter;
      const matchStatus = statusFilter === "all" || l.status === statusFilter;

      return matchSearch && matchPlan && matchStatus;
    });
  }, [lessons, search, planFilter, statusFilter]);

  // Group by topic
  const groupedLessons = useMemo(() => {
    const groups: Record<string, adminService.AdminLesson[]> = {};
    for (const l of filteredLessons) {
      if (!groups[l.topicId]) groups[l.topicId] = [];
      groups[l.topicId].push(l);
    }
    return groups;
  }, [filteredLessons]);

  const sortedTopics = useMemo(() => {
    return Object.entries(groupedLessons).sort(([, listA], [, listB]) => {
      return (listA[0]?.topicNumber || 0) - (listB[0]?.topicNumber || 0);
    });
  }, [groupedLessons]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const handleEditClick = (lesson: adminService.AdminLesson) => {
    setEditingLesson(lesson);
    setEditForm({
      title: lesson.title,
      description: lesson.description,
      requiredPlan: lesson.requiredPlan,
      gameType: lesson.gameType,
      emoji: lesson.emoji,
      status: lesson.status,
    });
  };

  const handleSave = async () => {
    if (!editingLesson) return;
    setSaving(true);
    try {
      await adminService.updateAdminLesson(editingLesson.id, editForm);
      await reload();
      setEditingLesson(null);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Đang tải dữ liệu bài học...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/90 border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Quản lý Bài học
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {lessons.length} bài học trong hệ thống
            </p>
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
              type="text"
              placeholder="Tìm theo tên bài học, chủ đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 text-sm"
            />
          </div>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as "all" | PlanType)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:border-indigo-400 cursor-pointer min-w-[140px]"
          >
            <option value="all">Tất cả gói</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="VIP">VIP</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | StatusType)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-sm focus:outline-none focus:border-indigo-400 cursor-pointer min-w-[140px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã hoàn thành</option>
            <option value="draft">Chưa code</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedTopics.map(([topicId, topicLessons]) => {
          const isExpanded = expandedTopics.has(topicId);
          const firstLesson = topicLessons[0];
          
          return (
            <div key={topicId} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200">
              <button
                onClick={() => toggleTopic(topicId)}
                className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'} transition-colors`}>
                    <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-slate-900 font-bold text-base">
                      {firstLesson.topicName}
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">
                      Chủ đề {firstLesson.topicNumber} · {topicLessons.length} bài học
                    </p>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-white">
                        <th className="text-left text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5">
                          Bài học
                        </th>
                        <th className="text-center text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5">
                          Gói
                        </th>
                        <th className="text-center text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5">
                          Trạng thái
                        </th>
                        <th className="text-right text-slate-500 text-xs font-semibold uppercase tracking-wide px-5 py-3.5">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topicLessons.map((lesson) => {
                        const plan = PLAN_BADGES[lesson.requiredPlan];
                        const statusBadge = STATUS_BADGES[lesson.status || "draft"];

                        return (
                          <tr
                            key={lesson.id}
                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-xl shrink-0">
                                  {lesson.emoji || "📚"}
                                </div>
                                <div>
                                  <p className="text-slate-900 text-sm font-semibold max-w-[300px] truncate">
                                    {lesson.title}
                                  </p>
                                  <p className="text-slate-500 text-xs mt-0.5">
                                    Bài {lesson.lessonNumber} · {lesson.gameType || "Chưa phân loại"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span
                                className={`text-[10px] font-bold px-2 py-1 rounded-md ${plan.bg} ${plan.color}`}
                              >
                                {lesson.requiredPlan}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${statusBadge.bg} ${statusBadge.color}`}
                              >
                                {statusBadge.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => handleEditClick(lesson)}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium text-sm inline-flex items-center"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {sortedTopics.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-slate-600 font-medium">
              Không tìm thấy bài học nào
            </p>
          </div>
        )}
      </div>

      {editingLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setEditingLesson(null)}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setEditingLesson(null)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Chỉnh sửa bài học</h3>
            <p className="text-slate-500 text-sm mb-6">
              Bài {editingLesson.lessonNumber} - Chủ đề {editingLesson.topicNumber}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tên bài học
                </label>
                <input
                  type="text"
                  value={editForm.title || ""}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Gói yêu cầu
                  </label>
                  <select
                    value={editForm.requiredPlan || "FREE"}
                    onChange={(e) => setEditForm({ ...editForm, requiredPlan: e.target.value as PlanType })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FREE">Free</option>
                    <option value="PRO">Pro</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Trạng thái (Status)
                  </label>
                  <select
                    value={editForm.status || "draft"}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as StatusType })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="draft">Chưa code</option>
                    <option value="published">Đã hoàn thành</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Game Type
                  </label>
                  <input
                    type="text"
                    value={editForm.gameType || ""}
                    onChange={(e) => setEditForm({ ...editForm, gameType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="VD: theory, quiz..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={editForm.emoji || ""}
                    onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                    placeholder="VD: 📚"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingLesson(null)}
                className="flex-1 py-3 px-4 rounded-xl text-slate-700 font-semibold bg-slate-100 hover:bg-slate-200 transition-colors"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 px-4 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
