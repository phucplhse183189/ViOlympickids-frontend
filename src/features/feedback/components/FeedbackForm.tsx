import { useState } from "react";
import { useLang } from "@/shared/lib/i18n";
import { StarRating } from "./StarRating";
import { submitFeedback } from "../api/feedbackService";
import { BookOpen, Gauge, Headphones, MessageCircle, Palette, Puzzle, Sparkles, Send } from "lucide-react";
import type { FeedbackCategory } from "../types";

const categories: { value: FeedbackCategory; label: string; icon: typeof Palette }[] = [
  { value: "interface", label: "Giao diện", icon: Palette },
  { value: "feature", label: "Tính năng", icon: Puzzle },
  { value: "content", label: "Nội dung", icon: BookOpen },
  { value: "performance", label: "Hiệu năng", icon: Gauge },
  { value: "support", label: "Hỗ trợ", icon: Headphones },
  { value: "general", label: "Khác", icon: MessageCircle },
];

interface FeedbackFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export function FeedbackForm({ onSuccess, onCancel }: FeedbackFormProps) {
  const { t } = useLang();
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>("general");
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
      await submitFeedback(rating, category, content);
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
        <p className="text-muted-foreground font-medium mt-2">
          Đánh giá của bạn sẽ giúp hệ thống ngày một tốt hơn!
        </p>
      </div>
      
      {/* Star Rating Section */}
      <div className="mb-8 p-6 bg-muted/50 border border-border rounded-3xl w-full flex flex-col items-center transition-all hover:bg-muted/70 hover:shadow-sm">
        <p className="text-foreground font-semibold mb-3">Bạn đánh giá ViOlympicKids mấy sao?</p>
        <StarRating rating={rating} onRatingChange={setRating} size={42} />
      </div>

      <div className="mb-8 w-full">
        <p className="mb-3 text-sm font-bold text-foreground">Góp ý của bạn thuộc nhóm nào?</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((item) => <button key={item.value} type="button" onClick={() => setCategory(item.value)} className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-bold transition active:scale-95 ${category === item.value ? "border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-500/15" : "border-border bg-card text-muted-foreground hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-500"}`}><item.icon className="h-4 w-4" />{item.label}</button>)}
        </div>
      </div>

      {/* Textarea Section */}
      <div className="w-full mb-8 relative group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.feedback.contentPlaceholder}
          className="w-full p-6 bg-card border-2 border-border rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all duration-300 resize-none h-40 text-foreground font-medium placeholder:text-muted-foreground shadow-sm group-hover:border-indigo-500/40"
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
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-muted-foreground bg-card border-2 border-border hover:bg-muted hover:text-foreground transition-all active:scale-95"
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
