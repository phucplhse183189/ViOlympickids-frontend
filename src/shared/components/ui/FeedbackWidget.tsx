import { useState } from "react";
import { MessageSquare, X, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth";

export function FeedbackWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If not logged in, don't show the widget
  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": sessionStorage.getItem("vio_parent_id") || "",
        },
        body: JSON.stringify({ content, rating: 5 }),
      });

      if (!res.ok) throw new Error("Failed to submit feedback");
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          setIsSuccess(false);
          setContent("");
        }, 300);
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Feedback Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          title="Góp ý"
        >
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Feedback Modal */}
      {isOpen && (
        <div className="absolute bottom-0 right-0 w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right">
          <div className="bg-indigo-600 p-4 flex items-center justify-between">
            <h3 className="text-white font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Gửi góp ý
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                <p className="text-slate-800 font-bold mb-1">Cảm ơn bạn!</p>
                <p className="text-slate-500 text-sm">Góp ý của bạn đã được ghi nhận.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-sm text-slate-600 mb-1">
                  Bạn có góp ý hay tính năng nào muốn thêm vào hệ thống không?
                </p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung góp ý của bạn..."
                  className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-sm transition-all mt-1"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Đang gửi...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gửi góp ý
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
