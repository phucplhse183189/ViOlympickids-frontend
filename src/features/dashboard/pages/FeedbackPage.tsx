import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CheckCircle2, Gauge, Headphones, MessageCircle, Palette, Puzzle, Send, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/shared/lib/i18n";
import { getFeedbacks, submitFeedback } from "@/features/feedback/api/feedbackService";
import type { FeedbackCategory } from "@/features/feedback/types";
import { StarRating } from "@/features/feedback/components/StarRating";
import { DashboardCard, PageHeader } from "../components/DashboardPrimitives";
import { pageMotion } from "../components/dashboardMotion";

const feedbackQueryKey = ["feedback", "public"] as const;
const categories = [
  { value: "interface", vi: "Giao diện", en: "Interface", icon: Palette },
  { value: "feature", vi: "Tính năng", en: "Features", icon: Puzzle },
  { value: "content", vi: "Nội dung", en: "Content", icon: BookOpen },
  { value: "performance", vi: "Hiệu năng", en: "Performance", icon: Gauge },
  { value: "support", vi: "Hỗ trợ", en: "Support", icon: Headphones },
  { value: "general", vi: "Khác", en: "Other", icon: MessageCircle },
] as const;

export function FeedbackPage() {
  const { lang } = useLang();
  const queryClient = useQueryClient();
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const feedbackQuery = useQuery({ queryKey: feedbackQueryKey, queryFn: getFeedbacks, staleTime: 2 * 60_000, gcTime: 30 * 60_000, refetchOnWindowFocus: false });
  const mutation = useMutation({
    mutationFn: () => submitFeedback(rating, category, content.trim()),
    onSuccess: (created) => {
      queryClient.setQueryData(feedbackQueryKey, (old: Awaited<ReturnType<typeof getFeedbacks>> | undefined) => [created, ...(old ?? [])]);
      setRating(0); setContent(""); setCategory("general"); setSuccess(true); setTimeout(() => setSuccess(false), 3500);
    },
    onError: (cause: Error) => setError(cause.message || text("Không thể gửi góp ý. Vui lòng thử lại.", "Could not send feedback. Please try again.")),
  });
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError("");
    if (!rating) return setError(text("Vui lòng chọn số sao.", "Please choose a rating."));
    if (content.trim().length < 8) return setError(text("Nội dung cần ít nhất 8 ký tự.", "Feedback must be at least 8 characters."));
    mutation.mutate();
  };

  return (
    <motion.div {...pageMotion} className="space-y-6">
      <PageHeader eyebrow={text("Lắng nghe để tốt hơn", "Listening to improve")} title={text("Đánh giá & góp ý", "Ratings & feedback")} description={text("Chia sẻ trải nghiệm của bạn. Góp ý sẽ được gửi trực tiếp đến đội ngũ ViOlympicKids.", "Share your experience. Your feedback goes directly to the ViOlympicKids team.")} />
      <div className="grid items-stretch gap-5 xl:grid-cols-2">
        <DashboardCard className="relative h-full overflow-hidden">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-pink-100/60 blur-3xl dark:bg-pink-500/10" />
          <form onSubmit={submit} className="relative">
            <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/20"><Sparkles className="h-5 w-5" /></span><div><h2 className="text-xl font-black text-slate-900 dark:text-white">{text("Trải nghiệm của bạn thế nào?", "How was your experience?")}</h2><p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{text("Chọn số sao và nhóm góp ý phù hợp.", "Choose a rating and feedback category.")}</p></div></div>
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60"><p className="mb-3 text-sm font-black text-slate-700 dark:text-slate-200">{text("Mức độ hài lòng", "Overall satisfaction")}</p><StarRating rating={rating} onRatingChange={setRating} size={38} /><p className="mt-2 h-5 text-xs font-bold text-amber-500">{rating ? ["", text("Cần cải thiện", "Needs work"), text("Tạm ổn", "Fair"), text("Khá tốt", "Good"), text("Rất tốt", "Very good"), text("Tuyệt vời", "Excellent")][rating] : text("Chạm vào một ngôi sao", "Tap a star")}</p></div>
            <div className="mt-6"><p className="mb-3 text-sm font-black text-slate-700 dark:text-slate-200">{text("Nhóm góp ý", "Feedback category")}</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{categories.map((item) => <button key={item.value} type="button" onClick={() => setCategory(item.value)} className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-extrabold transition active:scale-[.98] ${category === item.value ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/15" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"}`}><item.icon className="h-4 w-4" />{item[lang]}</button>)}</div></div>
            <label className="mt-6 block"><span className="mb-3 block text-sm font-black text-slate-700 dark:text-slate-200">{text("Nội dung góp ý", "Your feedback")}</span><textarea value={content} onChange={(event) => { setContent(event.target.value); setError(""); }} maxLength={800} placeholder={text("Điều gì đang tốt? Điều gì cần cải thiện?...", "What works well? What could be improved?...")} className="h-40 w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white" /><span className="mt-1 block text-right text-[11px] font-bold text-slate-400">{content.length}/800</span></label>
            <AnimatePresence>{error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mb-3 text-sm font-bold text-rose-500">{error}</motion.p>}</AnimatePresence>
            <button disabled={mutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"><Send className="h-4 w-4" />{mutation.isPending ? text("Đang gửi...", "Sending...") : text("Gửi đánh giá", "Send feedback")}</button>
          </form>
        </DashboardCard>

        <div className="grid h-full gap-5 xl:grid-rows-[auto_1fr]">
          <section className="overflow-hidden rounded-[26px] bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white"><MessageCircle className="h-7 w-7 text-pink-200" /><h2 className="mt-5 text-2xl font-black">{text("Mỗi góp ý đều được đọc", "Every message is read")}</h2><p className="mt-2 text-sm font-medium leading-6 text-indigo-100">{text("Đội ngũ sử dụng phản hồi để ưu tiên sửa lỗi, cải thiện bài học và trải nghiệm cho phụ huynh.", "Our team uses feedback to prioritize fixes, lessons and the parent experience.")}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-3"><p className="text-2xl font-black">{feedbackQuery.data?.length ?? "—"}</p><p className="text-xs font-bold text-indigo-100">{text("góp ý cộng đồng", "community posts")}</p></div><div className="rounded-2xl bg-white/10 p-3"><p className="text-2xl font-black">24h</p><p className="text-xs font-bold text-indigo-100">{text("thời gian tiếp nhận", "review window")}</p></div></div></section>
          <DashboardCard><h2 className="text-lg font-black text-slate-900 dark:text-white">{text("Góp ý mới từ cộng đồng", "Recent community feedback")}</h2><div className="mt-4 space-y-3">{feedbackQuery.isPending ? [0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />) : feedbackQuery.data?.slice(0, 3).map((post) => <div key={post.id} className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/70"><div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-black text-slate-700 dark:text-slate-200">{post.authorName}</span><span className="text-xs font-black text-amber-500">★ {post.rating}/5</span></div><p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">{post.content}</p></div>)}{!feedbackQuery.isPending && !feedbackQuery.data?.length && <p className="py-6 text-center text-sm text-slate-400">{text("Hãy là người đầu tiên chia sẻ.", "Be the first to share.")}</p>}</div></DashboardCard>
        </div>
      </div>
      <AnimatePresence>{success && <motion.div initial={{ opacity: 0, y: 20, scale: .95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white shadow-2xl shadow-emerald-500/25"><CheckCircle2 className="h-5 w-5" />{text("Cảm ơn bạn! Góp ý đã được gửi.", "Thank you! Your feedback was sent.")}</motion.div>}</AnimatePresence>
    </motion.div>
  );
}
