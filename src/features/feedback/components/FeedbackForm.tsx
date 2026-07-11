import { useState } from "react";
import { useLang } from "@/shared/lib/i18n";
import { StarRating } from "./StarRating";
import { submitFeedback } from "../api/feedbackService";
import { Sparkles, Send } from "lucide-react";

interface FeedbackFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export function FeedbackForm({ onSuccess, onCancel }: FeedbackFormProps) {
  const { t } = useLang();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError(t.feedback.errors.ratingRequired);
      return;
    }
    if (!content.trim()) {
      setError(t.feedback.errors.contentRequired);
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFeedback(rating, content);
      setRating(0);
      setContent("");
      onSuccess();
    } catch (err: any) {
      setError(err.message || t.feedback.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col items-center bg-transparent p-4 sm:p-8">
      {/* Premium Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/50 text-pink-600 font-bold text-sm mb-4 border border-pink-200/50 backdrop-blur-sm">
          <Sparkles size={16} className="text-pink-500" />
          Cùng xây dựng cộng đồng
        </div>
        <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
          {t.feedback.writeReview}
        </h3>
        <p className="text-slate-500 font-medium mt-2">
          Đánh giá của bạn sẽ giúp hệ thống ngày một tốt hơn!
        </p>
      </div>
      
      {/* Star Rating Section */}
      <div className="mb-8 p-6 bg-slate-50/50 border border-slate-100 rounded-3xl w-full flex flex-col items-center transition-all hover:bg-slate-50 hover:shadow-sm">
        <p className="text-slate-600 font-semibold mb-3">Bạn đánh giá ViOlympicKids mấy sao?</p>
        <StarRating rating={rating} onRatingChange={setRating} size={42} />
      </div>

      {/* Textarea Section */}
      <div className="w-full mb-8 relative group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.feedback.contentPlaceholder}
          className="w-full p-6 bg-white border-2 border-slate-200 rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all duration-300 resize-none h-40 text-slate-700 font-medium placeholder:text-slate-400 shadow-sm group-hover:border-indigo-300"
          disabled={isSubmitting}
        />
        {error && (
          <div className="absolute -bottom-6 left-2 text-red-500 text-sm font-semibold flex items-center gap-1">
            <span>⚠️</span> {error}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-slate-500 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
          >
            {t.feedback.hideReplies || "Hủy bỏ"}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:brightness-110 hover:shadow-[0_8px_30px_-10px_rgba(79,70,229,0.5)] transition-all transform active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.feedback.submitting}
            </>
          ) : (
            <>
              <Send size={20} />
              {t.feedback.submit}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
