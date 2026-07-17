import { useState, useEffect } from "react";
import * as adminService from "@/features/admin/api/adminService";

export function AdminLeaderboardPage() {
  const [attempts, setAttempts] = useState<adminService.AdminQuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getLeaderboardAttempts();
      setAttempts(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách bảng xếp hạng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá lượt chơi này? Hệ thống sẽ tự cập nhật lại bảng xếp hạng.")) {
      return;
    }
    
    try {
      setDeletingId(id);
      await adminService.deleteLeaderboardAttempt(id);
      setAttempts(attempts.filter(a => a.id !== id));
    } catch (err: any) {
      alert("Lỗi khi xoá: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Đang tải dữ liệu Bảng Xếp Hạng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
        <p className="text-rose-600 font-semibold mb-3">{error}</p>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors font-medium text-sm"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            🏆 Quản lý Bảng Xếp Hạng
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Xem lịch sử làm bài và xoá các lượt chơi không hợp lệ. Bảng xếp hạng sẽ tự động đồng bộ sau khi bạn thao tác.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-semibold text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Thời gian nộp</th>
                <th className="px-6 py-4">Học sinh</th>
                <th className="px-6 py-4">Bài học</th>
                <th className="px-6 py-4 text-center">Lượt thi</th>
                <th className="px-6 py-4 text-center">Kết quả</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Chưa có lượt thi nào trên hệ thống.
                  </td>
                </tr>
              ) : (
                attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(attempt.completedAt).toLocaleString("vi-VN", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{attempt.childName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700 max-w-[200px] truncate" title={attempt.lessonTitle}>
                        {attempt.lessonTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {attempt.attemptNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-base font-extrabold text-indigo-600">
                          {attempt.score} <span className="text-xs text-slate-400 font-medium">/ {attempt.totalQuestions}</span>
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${(attempt.score / attempt.totalQuestions) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(attempt.id)}
                        disabled={deletingId === attempt.id}
                        className="text-rose-500 hover:text-rose-700 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                      >
                        {deletingId === attempt.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
