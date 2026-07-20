import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/hooks/useInView";
import { getFeedbacks } from "../api/feedbackService";
import type { FeedbackPost } from "../types";
import { FeedbackCard } from "./FeedbackCard";
import { ArrowRight } from "lucide-react";

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
    <section id="reviews" ref={ref} className="relative overflow-hidden bg-slate-50 pb-20 pt-10 font-sans transition-colors duration-300 dark:bg-slate-950 sm:pb-24 sm:pt-12">
      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className={`reveal ${inView ? "visible" : ""} mx-auto mb-12 flex max-w-3xl flex-col items-center text-center sm:mb-14`}>
          <div className="mb-4 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400 sm:text-sm">
            <span className="h-px w-8 bg-blue-500" /> {t.feedback.eyebrow} <span className="h-px w-8 bg-blue-500" />
          </div>
          <h2 className="mb-5 text-3xl font-black leading-[1.15] tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl md:text-5xl">
            {t.feedback.headline} <span className="text-[#ff6f61]">ViOlympicKids</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base font-medium leading-7 text-slate-500 dark:text-slate-400 sm:text-lg">
            {t.feedback.contentPlaceholder || "Những chia sẻ chân thực nhất từ trải nghiệm học tập của các bé trên hệ thống."}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="mb-12 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {posts.map((post, index) => (
                <div 
                  key={post.id} 
                  className={`reveal slide-up ${inView ? "visible" : ""} h-full`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <FeedbackCard post={post} onRefresh={loadFeedbacks} />
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
                className="group inline-flex h-12 items-center gap-2.5 rounded-xl border border-blue-200 bg-white px-6 text-sm font-extrabold text-blue-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 sm:h-13 sm:px-7 sm:text-base"
              >
                {t.feedback.viewAll}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
