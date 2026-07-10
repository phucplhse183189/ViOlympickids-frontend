import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { useLang } from "@/shared/lib/i18n";
import { useAuth } from "@/features/auth/context/auth";
import type { FeedbackPost } from "../types";
import { StarRating } from "./StarRating";
import { replyToFeedback, toggleLikeFeedback } from "../api/feedbackService";
import { useNavigate } from "react-router-dom";

interface FeedbackCardProps {
  post: FeedbackPost;
  onRefresh: () => void;
}

export function FeedbackCard({ post, onRefresh }: FeedbackCardProps) {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLiking, setIsLiking] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setIsLiking(true);
      await toggleLikeFeedback(post.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setIsReplying(true);
      await replyToFeedback(post.id, replyContent);
      setReplyContent("");
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
            {post.authorAvatar}
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{post.authorName}</h4>
            <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        <StarRating rating={post.rating} readOnly size={16} />
      </div>

      <p className="text-gray-600 mb-6 leading-relaxed">{post.content}</p>

      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors group"
        >
          <Heart
            size={18}
            className={`group-hover:scale-110 transition-transform ${
              post.likesCount > 0 ? "fill-brand-primary text-brand-primary" : ""
            }`}
          />
          <span className="font-medium text-sm">{post.likesCount}</span>
        </button>
        
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group"
        >
          <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">{post.replies.length} {t.feedback.reply}</span>
        </button>
      </div>

      {showReplies && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          {post.replies.map((reply) => (
            <div key={reply.id} className="flex gap-3 ml-4 pl-4 border-l-2 border-gray-100">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-sm shrink-0">
                {reply.authorAvatar}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-gray-800 text-sm">{reply.authorName}</span>
                  <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{reply.content}</p>
              </div>
            </div>
          ))}

          {user && (
            <form onSubmit={handleReply} className="flex gap-2 ml-4 mt-2">
              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-sm shrink-0">
                {user.nickname?.[0] || "U"}
              </div>
              <div className="flex-1 flex bg-gray-50 rounded-full border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={t.feedback.replyPlaceholder}
                  className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
                  disabled={isReplying}
                />
                <button
                  type="submit"
                  disabled={!replyContent.trim() || isReplying}
                  className="px-4 text-brand-primary font-semibold text-sm hover:bg-brand-primary/10 disabled:opacity-50 transition-colors"
                >
                  {t.feedback.reply}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
