import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Clock, Eye, EyeOff, MessageSquare, MessagesSquare, Star } from "lucide-react";
import * as service from "@/features/admin/api/adminFeedbackService";
import { adminQueryKeys, useAdminFeedbackQuery } from "@/features/admin/api/adminQueries";
import { AdminDatePicker, AdminFilterSelect, AdminPageHero, AdminPageLoading, AdminPagination, AdminSearch } from "@/features/admin/components/ui";

const PAGE_SIZE = 6;
const statusMeta: Record<service.FeedbackStatus, { label: string; style: string; icon: typeof Eye }> = {
  pending: { label: "Chờ duyệt", style: "bg-amber-500/10 text-amber-500", icon: Clock },
  public: { label: "Công khai", style: "bg-emerald-500/10 text-emerald-500", icon: Eye },
  resolved: { label: "Đã xử lý", style: "bg-blue-500/10 text-blue-500", icon: Check },
  hidden: { label: "Đã ẩn", style: "bg-slate-500/10 text-slate-500", icon: EyeOff },
};
const categoryMeta: Record<service.FeedbackCategory, string> = { interface: "Giao diện", feature: "Tính năng", content: "Nội dung", performance: "Hiệu năng", support: "Hỗ trợ", general: "Khác" };
type FeedbackView = service.AdminFeedback & { duplicateCount: number };

export function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const { data: feedbacks = [], isPending } = useAdminFeedbackQuery();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | service.FeedbackStatus>("all");
  const [category, setCategory] = useState<"all" | service.FeedbackCategory>("all");
  const [rating, setRating] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);
  const mutation = useMutation({ mutationFn: ({ id, status }: { id: string; status: service.FeedbackStatus }) => service.updateFeedbackStatus(id, status), onMutate: async ({ id, status }) => { await queryClient.cancelQueries({ queryKey: adminQueryKeys.feedback }); const previous = queryClient.getQueryData<service.AdminFeedback[]>(adminQueryKeys.feedback); queryClient.setQueryData<service.AdminFeedback[]>(adminQueryKeys.feedback, (current = []) => current.map((item) => item.id === id ? { ...item, status } : item)); return { previous }; }, onError: (_error, _vars, context) => queryClient.setQueryData(adminQueryKeys.feedback, context?.previous) });

  const deduped = useMemo(() => { const groups = new Map<string, FeedbackView>(); for (const item of feedbacks) { const key = `${item.userId}:${item.category || "general"}:${item.content.trim().toLocaleLowerCase("vi")}`; const current = groups.get(key); if (current) current.duplicateCount += 1; else groups.set(key, { ...item, category: item.category || "general", duplicateCount: 1 }); } return Array.from(groups.values()); }, [feedbacks]);
  const filtered = useMemo(() => { const q = search.trim().toLocaleLowerCase("vi"); const after = date ? new Date(`${date}T00:00:00`).getTime() : null; return deduped.filter((item) => (!q || [item.userName, item.userPhone, item.content].some((value) => String(value || "").toLocaleLowerCase("vi").includes(q))) && (status === "all" || item.status === status) && (category === "all" || item.category === category) && (rating === "all" || item.rating === Number(rating)) && (after == null || new Date(item.createdAt).getTime() >= after)); }, [deduped, search, status, category, rating, date]);
  useEffect(() => setPage(1), [search, status, category, rating, date]);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  if (isPending) return <AdminPageLoading title="Đang tải góp ý" description="Đang đồng bộ phản hồi và trạng thái kiểm duyệt mới nhất." metricCount={3} />;

  return <div className="space-y-5 pb-8"><AdminPageHero eyebrow="Feedback operations" title="Lắng nghe để cải thiện" description="Tìm kiếm, phân loại và xử lý phản hồi của phụ huynh trong một quy trình thống nhất." icon={MessageSquare} metrics={[{ label: "Tổng góp ý", value: feedbacks.length, icon: MessagesSquare }, { label: "Chờ duyệt", value: feedbacks.filter((item) => item.status === "pending").length, icon: Clock }]} />
    <section className="rounded-[22px] border border-border bg-card p-3 shadow-sm"><div className="grid gap-2 xl:grid-cols-[minmax(260px,1fr)_170px_160px_140px_180px]"><AdminSearch value={search} onChange={setSearch} placeholder="Tên, số điện thoại hoặc nội dung…" /><AdminFilterSelect label="Trạng thái" value={status} onChange={setStatus} options={[{ value: "all", label: "Tất cả trạng thái" }, ...Object.entries(statusMeta).map(([value, meta]) => ({ value: value as service.FeedbackStatus, label: meta.label }))]} /><AdminFilterSelect label="Thể loại" value={category} onChange={setCategory} options={[{ value: "all", label: "Tất cả thể loại" }, ...Object.entries(categoryMeta).map(([value, label]) => ({ value: value as service.FeedbackCategory, label }))]} /><AdminFilterSelect label="Số sao" value={rating} onChange={setRating} options={[{ value: "all", label: "Tất cả sao" }, { value: "5", label: "5 sao" }, { value: "4", label: "4 sao" }, { value: "3", label: "3 sao" }, { value: "2", label: "2 sao" }, { value: "1", label: "1 sao" }]} /><AdminDatePicker label="Gửi từ ngày" value={date} onChange={setDate} /></div></section>
    <section className="overflow-hidden rounded-[24px] border border-border bg-card shadow-sm"><div className="grid gap-4 p-4 lg:grid-cols-2">{rows.map((item, index) => <FeedbackCard key={item.id} item={item} index={index} busy={mutation.isPending && mutation.variables?.id === item.id} onStatus={(next) => mutation.mutate({ id: item.id, status: next })} />)}{!rows.length && <div className="col-span-full py-16 text-center text-sm text-muted-foreground">Không tìm thấy góp ý phù hợp.</div>}</div><AdminPagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} /></section>
  </div>;
}

function FeedbackCard({ item, index, busy, onStatus }: { item: FeedbackView; index: number; busy: boolean; onStatus: (status: service.FeedbackStatus) => void }) { const meta = statusMeta[item.status]; const options = Object.entries(statusMeta) as [service.FeedbackStatus, typeof meta][]; return <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }} whileHover={{ y: -3 }} className="flex flex-col rounded-[22px] border border-border bg-background/40 p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-extrabold">{item.userName}</h3><p className="mt-1 text-xs text-muted-foreground">{item.userPhone || "Chưa có SĐT"} · {formatDate(item.createdAt)}</p></div><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${meta.style}`}><meta.icon className="h-3.5 w-3.5" />{meta.label}</span></div><div className="mt-4 flex flex-wrap items-center gap-2"><span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-500">{categoryMeta[item.category]}</span>{item.duplicateCount > 1 && <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-500">Trùng ×{item.duplicateCount}</span>}<span className="ml-auto flex gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < item.rating ? "fill-current" : "opacity-20"}`} />)}</span></div><div className="my-4 flex-1 rounded-2xl bg-muted/50 p-4 text-sm leading-6 text-foreground">{item.content}</div><div className="grid grid-cols-2 gap-2 border-t border-border pt-4 sm:grid-cols-4">{options.map(([value, option]) => <button key={value} disabled={busy} onClick={() => onStatus(value)} className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold transition active:scale-95 disabled:opacity-50 ${item.status === value ? option.style + " ring-1 ring-current/20" : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"}`}><option.icon className="h-3.5 w-3.5" />{option.label}</button>)}</div></motion.article>; }
function formatDate(value: string) { return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }); }
