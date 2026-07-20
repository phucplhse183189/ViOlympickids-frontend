import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/auth";
import { useLang } from "@/shared/lib/i18n";
import type { FeedbackCategory, FeedbackPost } from "../types";
import { StarRating } from "./StarRating";
import { replyToFeedback, toggleLikeFeedback } from "../api/feedbackService";

export function FeedbackCard({ post, onRefresh }: { post: FeedbackPost; onRefresh: () => void }) {
  const { user } = useAuth(); const navigate = useNavigate();
  const { t } = useLang();
  const categoryLabels: Record<FeedbackCategory, string> = t.feedback.categories;
  const [liking, setLiking] = useState(false); const [showReplies, setShowReplies] = useState(false); const [reply, setReply] = useState(""); const [replying, setReplying] = useState(false);
  async function like() { if (!user) return navigate("/login"); setLiking(true); try { await toggleLikeFeedback(post.id); await onRefresh(); } catch (error) { console.error(error); } finally { setLiking(false); } }
  async function submit(event: React.FormEvent) { event.preventDefault(); if (!reply.trim()) return; setReplying(true); try { await replyToFeedback(post.id, reply); setReply(""); await onRefresh(); } catch (error) { console.error(error); } finally { setReplying(false); } }
  return <motion.article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-card-foreground shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-black text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">{post.authorAvatar}</span><span className="min-w-0"><strong className="block truncate text-sm font-extrabold text-slate-800 dark:text-slate-100 sm:text-base">{post.authorName}</strong><small className="text-xs font-medium text-slate-400">{formatDate(post.createdAt)}</small></span></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><StarRating rating={post.rating} readOnly size={17} /><span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-600 ring-1 ring-inset ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-800">{categoryLabels[post.category || "general"]}</span></div>
    <p className="my-5 flex-1 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">{post.content}</p>
    <div className="flex items-center gap-2 border-t border-border pt-4"><button onClick={() => void like()} disabled={liking} className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold text-muted-foreground transition hover:bg-rose-500/10 hover:text-rose-500"><Heart className={`h-4 w-4 ${post.likesCount > 0 ? "fill-current text-rose-500" : ""}`} />{post.likesCount}</button><button onClick={() => setShowReplies((value) => !value)} className="inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold text-muted-foreground transition hover:bg-blue-500/10 hover:text-blue-500"><MessageCircle className="h-4 w-4" />{post.replies.length} {t.feedback.replies}</button></div>
    <AnimatePresence initial={false}>{showReplies && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-4 space-y-3 border-t border-border pt-4">{post.replies.map((item) => <div key={item.id} className="rounded-2xl bg-muted/50 p-3"><div className="flex items-center justify-between"><strong className="text-xs">{item.authorName}</strong><small className="text-[10px] text-muted-foreground">{formatDate(item.createdAt)}</small></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.content}</p></div>)}{user && <form onSubmit={submit} className="flex gap-2"><input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Viết phản hồi…" className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-indigo-500" /><button disabled={replying || !reply.trim()} className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 text-white disabled:opacity-50"><Send className="h-4 w-4" /></button></form>}</div></motion.div>}</AnimatePresence>
  </motion.article>;
}
function formatDate(value: string) { return new Date(value).toLocaleDateString("vi-VN"); }
