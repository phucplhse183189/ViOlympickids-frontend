import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, ChevronRight, Crown, Loader2, LockKeyhole, QrCode, Rocket, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import { useLang } from "@/shared/lib/i18n";
import * as transactionService from "@/features/dashboard/api/transactionService";
import { DashboardCard, DashboardSkeleton, EmptyState, PageHeader } from "../components/DashboardPrimitives";
import { pageMotion } from "../components/dashboardMotion";

type PlanKey = "PRO" | "VIP";
type Cycle = "month" | "year";

const PLANS = {
  PRO: {
    name: "Pro",
    monthly: 55_000,
    yearly: 550_000,
    icon: Zap,
    accent: "blue",
    features: {
      vi: ["Hơn 200 bài học tương tác 3D", "Báo cáo tiến độ mỗi ngày", "Luyện tập không giới hạn", "Tối đa 3 hồ sơ học sinh"],
      en: ["200+ interactive 3D lessons", "Daily progress reports", "Unlimited practice", "Up to 3 student profiles"],
    },
  },
  VIP: {
    name: "VIP",
    monthly: 89_000,
    yearly: 890_000,
    icon: Crown,
    accent: "violet",
    features: {
      vi: ["Toàn bộ quyền lợi của Pro", "AI hướng dẫn bằng giọng nói", "Phân tích năng lực chuyên sâu", "Hỗ trợ ưu tiên 24/7"],
      en: ["Everything included in Pro", "Voice-guided AI tutor", "Advanced skill insights", "24/7 priority support"],
    },
  },
} as const;

export function PaymentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { activeChild, isLoading, profiles } = useActiveChild();
  const { lang } = useLang();
  const requestedPlan = params.get("plan")?.toUpperCase() === "VIP" ? "VIP" : "PRO";
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(requestedPlan);
  const [cycle, setCycle] = useState<Cycle>("month");
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;
  const currency = (amount: number) => new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

  if (isLoading) return <DashboardSkeleton />;
  if (!profiles.length) return <EmptyState icon={Rocket} title={text("Chưa có hồ sơ học sinh", "No student profile yet")} description={text("Hãy tạo hồ sơ trước khi nâng cấp gói học tập.", "Create a profile before upgrading a learning plan.")} action={<button onClick={() => navigate("/add-child")} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white">{text("Thêm hồ sơ", "Add profile")}</button>} />;
  if (!activeChild) return <DashboardSkeleton />;

  const plan = PLANS[selectedPlan];
  const PlanIcon = plan.icon;
  const total = cycle === "month" ? plan.monthly : plan.yearly;
  const monthlyEquivalent = cycle === "year" ? Math.round(plan.yearly / 12) : plan.monthly;

  async function handlePay() {
    if (!agree || processing) return;
    const parentId = sessionStorage.getItem("vio_parent_id");
    if (!parentId) {
      setPaymentError(text("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "Your session expired. Please sign in again."));
      return;
    }
    setProcessing(true);
    setPaymentError("");
    try {
      const result = await transactionService.createPayment({ childId: activeChild!.id, parentId, plan: selectedPlan, cycle, amount: total });
      window.location.assign(result.checkoutUrl);
    } catch (cause) {
      console.error(cause);
      setPaymentError(text("Không thể tạo đơn thanh toán. Vui lòng thử lại sau.", "Could not create the payment. Please try again."));
      setProcessing(false);
    }
  }

  return (
    <motion.div {...pageMotion} className="mx-auto max-w-[1320px] space-y-6">
      <button onClick={() => navigate("/dashboard/subscription")} className="group inline-flex items-center gap-2 rounded-xl px-1 py-1 text-sm font-bold text-slate-500 transition hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{text("Quay lại gói học tập", "Back to subscription")}</button>
      <PageHeader eyebrow={text("Thanh toán an toàn qua PayOS", "Secure checkout with PayOS")} title={text("Nâng cấp hành trình học tập", "Upgrade the learning journey")} description={text(`Chọn quyền lợi phù hợp cho ${activeChild.name}. Bạn có thể thay đổi hoặc hủy gói bất cứ lúc nào.`, `Choose the right benefits for ${activeChild.name}. You can change or cancel anytime.`)} />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <div>
          <DashboardCard>
            <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{text("Chọn quyền lợi", "Choose benefits")}</p><h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">{text("Gói phù hợp với bé", "A plan that fits your child")}</h2></div><div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-2 pr-3 dark:bg-slate-800/70"><span className="grid h-9 w-9 place-items-center rounded-xl text-lg" style={{ backgroundColor: activeChild.avatarBg || "#e2e8f0" }}>{activeChild.avatarEmoji}</span><span><span className="block max-w-40 truncate text-xs font-black text-slate-800 dark:text-white">{activeChild.name}</span><span className="text-[10px] font-bold text-slate-400">{activeChild.grade}</span></span></div></div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">{(Object.keys(PLANS) as PlanKey[]).map((key) => { const item = PLANS[key]; const Icon = item.icon; const selected = selectedPlan === key; return <motion.button key={key} type="button" onClick={() => { setSelectedPlan(key); setPaymentError(""); }} whileTap={{ scale: .985 }} className={`relative overflow-hidden rounded-[24px] border-2 p-5 text-left transition-colors ${selected ? key === "VIP" ? "border-violet-500 bg-violet-50/70 dark:bg-violet-500/10" : "border-blue-500 bg-blue-50/70 dark:bg-blue-500/10" : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"}`}>
              <AnimatePresence>{selected && <motion.span initial={{ scale: 0, rotate: -60 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className={`absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full text-white ${key === "VIP" ? "bg-violet-500" : "bg-blue-500"}`}><Check className="h-4 w-4" /></motion.span>}</AnimatePresence>
              <span className={`grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg ${key === "VIP" ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-violet-500/20" : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20"}`}><Icon className="h-5 w-5" /></span>
              <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{text("Gói", "Plan")} {item.name}</h3><p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{currency(item.monthly)}<span className="text-xs font-bold text-slate-400">/{text("tháng", "month")}</span></p>
              <ul className="mt-5 space-y-2.5">{item.features[lang].map((feature) => <li key={feature} className="flex items-start gap-2.5 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-300"><span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${key === "VIP" ? "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" : "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"}`}><Check className="h-2.5 w-2.5" /></span>{feature}</li>)}</ul>
            </motion.button>; })}</div>
          </DashboardCard>
          </div>

          <DashboardCard>
            <div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">{text("Chu kỳ thanh toán", "Billing cycle")}</p><h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">{text("Thanh toán linh hoạt", "Flexible billing")}</h2></div>
            <div className="relative mt-5 grid rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800" style={{ gridTemplateColumns: "1fr 1fr" }}>{(["month", "year"] as Cycle[]).map((value) => <button key={value} type="button" onClick={() => setCycle(value)} className={`relative z-10 rounded-xl px-3 py-3 text-sm font-black transition-colors ${cycle === value ? "text-slate-950 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>{cycle === value && <motion.span layoutId="billing-cycle" className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm dark:bg-slate-700" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}<span>{value === "month" ? text("Hàng tháng", "Monthly") : text("Hàng năm", "Yearly")}</span>{value === "year" && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{text("Tiết kiệm 2 tháng", "Save 2 months")}</span>}</button>)}</div>
            <AnimatePresence mode="wait"><motion.p key={`${selectedPlan}-${cycle}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-3 text-center text-xs font-semibold text-slate-400">{cycle === "year" ? text(`Tương đương ${currency(monthlyEquivalent)}/tháng, thanh toán một lần.`, `Equivalent to ${currency(monthlyEquivalent)}/month, billed once.`) : text("Gia hạn mỗi tháng, hủy bất cứ lúc nào.", "Renews monthly, cancel anytime.")}</motion.p></AnimatePresence>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><QrCode className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-black text-slate-900 dark:text-white">PayOS</h2><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">{text("ĐỀ XUẤT", "RECOMMENDED")}</span></div><p className="mt-1 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{text("Quét mã QR hoặc thanh toán bằng ứng dụng ngân hàng. Xác nhận tự động ngay sau khi giao dịch thành công.", "Scan a QR code or pay in your banking app. Access activates automatically after payment.")}</p></div><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-[6px] border-blue-500 bg-white dark:bg-slate-900" /></div>
          </DashboardCard>
        </div>

        <div className="self-start lg:sticky lg:top-0">
          <DashboardCard className="overflow-hidden p-0">
            <div className={`relative overflow-hidden p-6 text-white ${selectedPlan === "VIP" ? "bg-gradient-to-br from-violet-600 to-fuchsia-600" : "bg-gradient-to-br from-blue-600 to-indigo-600"}`}><div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" /><div className="relative flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur"><PlanIcon className="h-5 w-5" /></span><div><p className="text-xs font-bold text-white/70">{text("Đơn hàng của bạn", "Your order")}</p><h2 className="text-xl font-black">{text("Gói", "Plan")} {plan.name}</h2></div></div></div>
            <div className="p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800"><span className="grid h-11 w-11 place-items-center rounded-2xl text-xl" style={{ backgroundColor: activeChild.avatarBg || "#e2e8f0" }}>{activeChild.avatarEmoji}</span><div className="min-w-0"><p className="truncate text-sm font-black text-slate-800 dark:text-white">{activeChild.name}</p><p className="text-xs font-semibold text-slate-400">{activeChild.grade} · {cycle === "month" ? text("1 tháng", "1 month") : text("12 tháng", "12 months")}</p></div></div>
              <div className="space-y-3 border-b border-slate-100 py-5 text-sm dark:border-slate-800"><div className="flex justify-between gap-4"><span className="font-semibold text-slate-500 dark:text-slate-400">{text("Gói học tập", "Learning plan")}</span><span className="font-black text-slate-800 dark:text-white">{plan.name}</span></div><div className="flex justify-between gap-4"><span className="font-semibold text-slate-500 dark:text-slate-400">{text("Chu kỳ", "Billing")}</span><span className="font-black text-slate-800 dark:text-white">{cycle === "month" ? text("Hàng tháng", "Monthly") : text("Hàng năm", "Yearly")}</span></div><div className="flex justify-between gap-4"><span className="font-semibold text-slate-500 dark:text-slate-400">{text("Phương thức", "Method")}</span><span className="font-black text-slate-800 dark:text-white">PayOS</span></div></div>
              <div className="flex items-end justify-between gap-4 py-5"><div><p className="text-sm font-black text-slate-700 dark:text-slate-200">{text("Tổng thanh toán", "Total")}</p><p className="mt-1 text-[11px] font-semibold text-slate-400">{text("Đã bao gồm mọi chi phí", "All fees included")}</p></div><AnimatePresence mode="wait"><motion.p key={total} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400">{currency(total)}</motion.p></AnimatePresence></div>
              <label className="flex cursor-pointer select-none items-start gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/70"><input type="checkbox" checked={agree} onChange={(event) => setAgree(event.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-600" /><span className="text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">{text("Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của ViOlympicKids.", "I agree to the ViOlympicKids Terms of Service and Privacy Policy.")}</span></label>
              <button onClick={handlePay} disabled={!agree || processing} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:hover:translate-y-0 dark:disabled:from-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-400">{processing ? <><Loader2 className="h-4 w-4 animate-spin" />{text("Đang chuyển đến PayOS...", "Opening PayOS...")}</> : <><LockKeyhole className="h-4 w-4" />{text("Thanh toán an toàn", "Pay securely")}<ChevronRight className="h-4 w-4" /></>}</button>
              <AnimatePresence>{paymentError && <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold leading-5 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{paymentError}</motion.div>}</AnimatePresence>
              <div className="mt-5 flex items-center justify-center gap-5 border-t border-slate-100 pt-5 text-[11px] font-bold text-slate-400 dark:border-slate-800"><span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" />SSL</span><span className="flex items-center gap-1.5"><LockKeyhole className="h-4 w-4 text-emerald-500" />256-bit</span><span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-amber-500" />PayOS</span></div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </motion.div>
  );
}
