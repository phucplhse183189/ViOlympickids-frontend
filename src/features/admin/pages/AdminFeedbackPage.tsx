import { useState, useEffect } from "react";
import { MessageSquare, Check, Eye, EyeOff, Clock } from "lucide-react";
import * as adminFeedbackService from "@/features/admin/api/adminFeedbackService";

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

export function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<adminFeedbackService.AdminFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await adminFeedbackService.getFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: adminFeedbackService.FeedbackStatus) => {
    try {
      await adminFeedbackService.updateFeedbackStatus(id, status);
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status } : f))
      );
    } catch (error) {
      console.error(error);
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
          <p className="font-medium">Đang tải dữ liệu góp ý...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản lý Góp ý</h1>
          <p className="text-slate-500 font-medium">Xem và phân loại các góp ý từ phụ huynh</p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          Chưa có góp ý nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center rounded-full shrink-0">
                    {fb.avatarInitials || "P"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{fb.userName}</h3>
                    <p className="text-xs text-slate-500">{fb.userPhone} • {formatDate(fb.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg whitespace-nowrap ${
                    fb.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    fb.status === 'public' ? 'bg-emerald-100 text-emerald-700' :
                    fb.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {fb.status === 'pending' ? 'Chờ duyệt' :
                     fb.status === 'public' ? 'Công khai' :
                     fb.status === 'resolved' ? 'Đã xử lý' : 'Đã ẩn'}
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl text-slate-700 text-sm mb-6 flex-1">
                {fb.content}
              </div>

              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleUpdateStatus(fb.id, 'public')}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${fb.status === 'public' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'}`}
                >
                  <Eye className="w-4 h-4" />
                  Công khai
                </button>
                <button
                  onClick={() => handleUpdateStatus(fb.id, 'resolved')}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${fb.status === 'resolved' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <Check className="w-4 h-4" />
                  Đã xử lý
                </button>
                <button
                  onClick={() => handleUpdateStatus(fb.id, 'hidden')}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${fb.status === 'hidden' ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'}`}
                >
                  <EyeOff className="w-4 h-4" />
                  Ẩn đi
                </button>
                <button
                  onClick={() => handleUpdateStatus(fb.id, 'pending')}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors ${fb.status === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600'}`}
                >
                  <Clock className="w-4 h-4" />
                  Chờ duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
