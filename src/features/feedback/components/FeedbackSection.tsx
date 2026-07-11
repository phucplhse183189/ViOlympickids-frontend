import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/hooks/useInView";
import { getFeedbacks } from "../api/feedbackService";
import type { FeedbackPost } from "../types";
import { FeedbackCard } from "./FeedbackCard";
import { Sparkles, ArrowRight } from "lucide-react";

export function FeedbackSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeedbacks = async () => {
    try {
      const data = await getFeedbacks();
      // Show only top 3 most recent feedbacks on homepage
      setPosts(data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  return (
    <section id="reviews" ref={ref} className="py-24 relative overflow-hidden font-sans bg-slate-50">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-pink-400/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className={`reveal ${inView ? "visible" : ""} text-center mb-16 flex flex-col items-center`}>
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm mb-6">
            <Sparkles size={16} /> Phụ huynh nói gì về chúng tôi
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-slate-800 leading-tight">
            Hàng ngàn gia đình <br className="hidden md:block" />
            đã tin tưởng <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500">ViOlympicKids</span>
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            {t.feedback.contentPlaceholder || "Những chia sẻ chân thực nhất từ trải nghiệm học tập của các bé trên hệ thống."}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {posts.map((post, index) => (
                <div 
                  key={post.id} 
                  className={`reveal slide-up ${inView ? "visible" : ""} h-full`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="h-full bg-white/70 backdrop-blur-md border border-white shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 rounded-[24px]">
                    <FeedbackCard post={post} onRefresh={loadFeedbacks} />
                  </div>
                </div>
              ))}
              
              {posts.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400 font-medium text-lg">
                  Chưa có đánh giá nào được hiển thị.
                </div>
              )}
            </div>

            <div className={`reveal scale-up ${inView ? "visible" : ""} flex justify-center`}>
              <Link
                to="/community"
                className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:border-indigo-500 hover:text-indigo-600 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(79,70,229,0.3)]"
              >
                Xem tất cả đánh giá
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
