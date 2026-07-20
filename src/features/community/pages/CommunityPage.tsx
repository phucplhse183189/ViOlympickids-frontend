import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Heart, MessageSquarePlus, SearchX, Sparkles, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getFeedbacks } from "@/features/feedback/api/feedbackService";
import type { FeedbackCategory, FeedbackPost } from "@/features/feedback/types";
import { FeedbackCard } from "@/features/feedback/components/FeedbackCard";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";
import { useAuth } from "@/features/auth/context/auth";
import { ThemeToggle } from "@/shared/ui/ThemeToggle";
import { CustomSelect } from "@/shared/ui/CustomSelect";

const PAGE_SIZE = 9;
const categories: { value: "all" | FeedbackCategory; label: string }[] = [{ value: "all", label: "Tất cả" }, { value: "interface", label: "Giao diện" }, { value: "feature", label: "Tính năng" }, { value: "content", label: "Nội dung" }, { value: "performance", label: "Hiệu năng" }, { value: "support", label: "Hỗ trợ" }, { value: "general", label: "Khác" }];

export function CommunityPage() {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<"all" | FeedbackCategory>("all");
  const [rating, setRating] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all");
  const [page, setPage] = useState(1);
  async function load() { setError(false); try { setPosts(await getFeedbacks()); } catch (err) { console.error(err); setError(true); } finally { setLoading(false); } }
  useEffect(() => { void load(); window.scrollTo(0, 0); }, []);
  useEffect(() => setPage(1), [category, rating]);
  const filtered = useMemo(() => posts.filter((post) => (category === "all" || (post.category || "general") === category) && (rating === "all" || post.rating === Number(rating))), [posts, category, rating]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const average = posts.length ? (posts.reduce((sum, post) => sum + post.rating, 0) / posts.length).toFixed(1) : "0";

  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6"><Link to="/" aria-label="ViOlympicKids - Trang chủ" className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/15"><img src="/robot-head.png" alt="" className="h-9 w-9 object-contain drop-shadow-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" /><span className="text-lg font-black tracking-tight sm:text-xl"><span className="text-blue-500">ViOlympic</span><span className="text-rose-400">Kids</span></span></Link><div className="hidden items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 text-sm font-extrabold text-foreground md:flex"><Sparkles className="h-4 w-4 text-indigo-500" />Cộng đồng</div><div className="flex items-center gap-1.5"><ThemeToggle /><Link to="/" className="inline-flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground sm:px-3"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Trang chủ</span></Link></div></div></header>

    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <motion.section initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative isolate overflow-hidden rounded-[30px] border border-indigo-400/20 bg-slate-950 p-6 text-white shadow-2xl shadow-indigo-950/10 sm:p-10 lg:p-12"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,.38),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,.25),transparent_35%)]" /><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-indigo-100"><Heart className="h-3.5 w-3.5 fill-pink-400 text-pink-400" />Lắng nghe từ cộng đồng</span><h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Mỗi chia sẻ,<br /><span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">một bước tiến tốt hơn.</span></h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Đánh giá trải nghiệm, đề xuất tính năng và cùng chúng tôi xây dựng môi trường học tập tốt hơn cho các bé.</p><button onClick={() => setShowForm(true)} className="mt-7 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-50 active:scale-95"><MessageSquarePlus className="h-5 w-5" />Gửi góp ý</button></div><div className="grid grid-cols-2 gap-3"><HeroStat icon={Users} value={posts.length} label="Chia sẻ" /><HeroStat icon={Star} value={average} label="Điểm đánh giá" /></div></div></motion.section>

      <AnimatePresence>{showForm && <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="mx-auto max-w-3xl rounded-[28px] border border-border bg-card p-2 shadow-xl">{user ? <FeedbackForm onSuccess={() => { setShowForm(false); void load(); }} onCancel={() => setShowForm(false)} /> : <LoginPrompt close={() => setShowForm(false)} />}</div></motion.section>}</AnimatePresence>

      <section aria-label="Bộ lọc chia sẻ" className="rounded-[22px] border border-border bg-card p-3 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Khám phá chia sẻ</p><p className="mt-1 px-1 text-sm text-muted-foreground">{filtered.length} bài viết phù hợp với bộ lọc</p></div><div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2"><div className="w-full sm:w-48"><CustomSelect value={category} onValueChange={setCategory} ariaLabel="Lọc theo chủ đề" options={categories} /></div><div className="w-full sm:w-44"><CustomSelect value={rating} onValueChange={setRating} ariaLabel="Lọc theo số sao" options={[{ value: "all", label: "Tất cả số sao" }, ...([5, 4, 3, 2, 1] as const).map((value) => ({ value: String(value) as "5" | "4" | "3" | "2" | "1", label: `${value} sao` }))]} /></div></div></div></section>

      {loading ? <CommunitySkeleton /> : error ? <ErrorState retry={() => void load()} /> : <><motion.section layout className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((post, index) => <motion.div layout key={post.id} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .045 }}><FeedbackCard post={post} onRefresh={load} /></motion.div>)}</motion.section>{!visible.length && <div className="rounded-[24px] border border-dashed border-border bg-card py-16 text-center"><SearchX className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-bold">Không có chia sẻ phù hợp</p><p className="mt-1 text-sm text-muted-foreground">Hãy thử thay đổi bộ lọc.</p></div>}<Pagination page={page} pages={pages} onChange={setPage} /></>}
    </main>
  </div>;
}

function HeroStat({ icon: Icon, value, label }: { icon: typeof Users; value: string | number; label: string }) { return <div className="min-w-32 rounded-2xl border border-white/10 bg-white/[.08] p-4 backdrop-blur"><Icon className="h-4 w-4 text-indigo-300" /><strong className="mt-2 block text-2xl">{value}</strong><span className="text-[10px] uppercase tracking-wide text-slate-300">{label}</span></div>; }
function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) { if (pages <= 1) return null; return <nav className="flex justify-center gap-1 py-3">{Array.from({ length: pages }, (_, i) => i + 1).map((value) => <button key={value} onClick={() => { onChange(value); window.scrollTo({ top: 620, behavior: "smooth" }); }} className={`h-9 min-w-9 rounded-xl px-2 text-xs font-bold ${value === page ? "bg-indigo-500 text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}>{value}</button>)}</nav>; }
function LoginPrompt({ close }: { close: () => void }) { return <div className="p-10 text-center"><h3 className="text-xl font-extrabold">Đăng nhập để gửi góp ý</h3><p className="mt-2 text-sm text-muted-foreground">Tài khoản giúp chúng tôi phản hồi và ngăn nội dung gửi trùng.</p><div className="mt-6 flex justify-center gap-2"><button onClick={close} className="rounded-xl bg-muted px-4 py-2 text-sm font-bold">Đóng</button><Link to="/login" className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white">Đăng nhập</Link></div></div>; }
function CommunitySkeleton() { return <div className="grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 rounded-[24px] border border-border bg-card p-5"><div className="h-10 w-2/3 rounded-xl bg-muted" /><div className="mt-6 h-28 rounded-2xl bg-muted" /><div className="mt-5 h-4 w-1/2 rounded bg-muted" /></div>)}</div>; }
function ErrorState({ retry }: { retry: () => void }) { return <div role="alert" className="rounded-[24px] border border-rose-500/20 bg-card py-16 text-center"><p className="font-extrabold">Chưa thể tải chia sẻ cộng đồng</p><button onClick={retry} className="mt-4 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white">Thử lại</button></div>; }
