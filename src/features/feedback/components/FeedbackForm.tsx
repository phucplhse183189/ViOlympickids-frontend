import { useState } from "react";
import { useLang } from "@/shared/lib/i18n";
import { StarRating } from "./StarRating";
import { submitFeedback } from "../api/feedbackService";

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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 max-w-2xl mx-auto reveal scale-up">
      <h3 className="text-xl font-bold mb-4 text-gray-800">{t.feedback.writeReview}</h3>
      
      <div className="mb-4">
        <StarRating rating={rating} onRatingChange={setRating} size={28} />
      </div>

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t.feedback.contentPlaceholder}
          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all resize-none h-32"
          disabled={isSubmitting}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-full font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {t.feedback.hideReplies}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-full font-bold hover:shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? t.feedback.submitting : t.feedback.submit}
        </button>
      </div>
    </form>
  );
}
