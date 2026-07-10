import { useState, useEffect } from "react";
import { useLang } from "@/shared/lib/i18n";
import { useAuth } from "@/features/auth/context/auth";
import { useInView } from "@/shared/hooks/useInView";
import { getFeedbacks } from "../api/feedbackService";
import type { FeedbackPost } from "../types";
import { FeedbackCard } from "./FeedbackCard";
import { FeedbackForm } from "./FeedbackForm";
import { MessageSquarePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FeedbackSection() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ref, inView } = useInView<HTMLElement>();

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
  }, []);

  const handleWriteReview = () => {
    if (!user) {
      navigate("/login");
    } else {
      setShowForm(true);
    }
  };

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className={`reveal ${inView ? "visible" : ""} text-center mb-16`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            {t.feedback.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t.feedback.contentPlaceholder}
          </p>
        </div>

        {showForm ? (
          <FeedbackForm 
            onSuccess={() => {
              setShowForm(false);
              loadFeedbacks();
            }} 
            onCancel={() => setShowForm(false)} 
          />
        ) : (
          <div className="flex justify-center mb-12">
            <button
              onClick={handleWriteReview}
              className={`reveal scale-up ${inView ? "visible" : ""} flex items-center gap-2 px-8 py-3 bg-white border-2 border-brand-primary text-brand-primary rounded-full font-bold hover:bg-brand-primary hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-xl`}
            >
              <MessageSquarePlus size={20} />
              {user ? t.feedback.writeReview : t.feedback.loginToReview}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className={`reveal slide-up ${inView ? "visible" : ""}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <FeedbackCard post={post} onRefresh={loadFeedbacks} />
              </div>
            ))}
            
            {posts.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-gray-500">
                Chưa có đánh giá nào. Hãy là người đầu tiên!
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
