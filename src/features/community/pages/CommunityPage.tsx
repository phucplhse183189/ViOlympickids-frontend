import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFeedbacks } from "@/features/feedback/api/feedbackService";
import type { FeedbackPost } from "@/features/feedback/types";
import { FeedbackCard } from "@/features/feedback/components/FeedbackCard";
import { MessageSquarePlus, ChevronLeft, Sparkles, Heart } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";

export function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadFeedbacks = async () => {
    try {
      const data = await getFeedbacks();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Premium Glassmorphism Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px]" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-pink-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-emerald-300/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between max-w-6xl">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors">
            <ChevronLeft size={20} />
            Về trang chủ
          </Link>
          <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center gap-2">
            <Sparkles size={24} className="text-pink-500" />
            Cộng Đồng ViOlympicKids
          </div>
          <div className="w-24"></div> {/* Spacer to center title */}
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12 max-w-6xl min-h-[calc(100vh-80px)] flex flex-col">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-in slide-in-from-bottom-5 duration-700 fade-in">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-indigo-100 shadow-sm text-indigo-600 font-semibold text-sm mb-6 backdrop-blur-md">
            <Heart size={16} className="text-pink-500 fill-pink-500" /> Hàng ngàn phụ huynh tin tưởng
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 leading-tight tracking-tight">
            Nơi hội tụ những <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              giá trị tuyệt vời
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed font-medium">
            Mỗi góp ý, chia sẻ của bạn đều là viên gạch xây dựng nên một môi trường học tập tốt nhất cho các bé. Hãy cùng xem các phụ huynh khác nói gì nhé!
          </p>
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:scale-105 hover:bg-indigo-600 transition-all duration-300 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)]"
            >
              <MessageSquarePlus size={24} />
              Gửi chia sẻ của bạn
            </button>
          )}
        </div>

        {/* Feedback Form Modal Area */}
        {showForm && (
          <div className="mb-16 animate-in zoom-in-95 duration-300">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-2 border border-white shadow-2xl max-w-3xl mx-auto">
              {user ? (
                <FeedbackForm 
                  onSuccess={() => {
                    setShowForm(false);
                    loadFeedbacks();
                  }} 
                  onCancel={() => setShowForm(false)} 
                />
              ) : (
                <div className="p-12 text-center">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">Vui lòng đăng nhập</h3>
                  <p className="text-slate-500 mb-8 font-medium">Bạn cần đăng nhập để có thể gửi đánh giá cho hệ thống.</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">
                      Hủy bỏ
                    </button>
                    <Link to="/login" className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                      Đăng nhập ngay
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Grid Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 flex-1">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium text-lg animate-pulse">Đang tải đánh giá từ phụ huynh...</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 flex-1 pb-20">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className="break-inside-avoid animate-in slide-in-from-bottom-10 fade-in duration-700"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="bg-white/60 backdrop-blur-lg border border-white/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[24px]">
                  <FeedbackCard post={post} onRefresh={loadFeedbacks} />
                </div>
              </div>
            ))}
            
            {posts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquarePlus className="w-10 h-10 text-indigo-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có chia sẻ nào</h3>
                <p className="text-slate-500 font-medium">Hãy là người đầu tiên để lại đánh giá nhé!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
