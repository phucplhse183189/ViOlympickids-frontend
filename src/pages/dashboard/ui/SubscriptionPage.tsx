import {
  Check,
  Zap,
  Shield,
  RefreshCw,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Gift,
} from "lucide-react";
import {
  MOCK_BILLING,
  FREE_PLAN_FEATURES,
  PRO_PLAN_FEATURES,
} from "@/shared/api/dashboardMockData";

// ── helpers ────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

// ── Renewal countdown (mock) ───────────────────────
const DAYS_UNTIL_RENEWAL = 31;

export function SubscriptionPage() {
  const billing = MOCK_BILLING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Quản lý Gói cước</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Xem và nâng cấp gói của bạn
        </p>
      </div>

      {/* Current plan hero banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--brand-primary) 0%, #f97316 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-16 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-0.5">
                Gói đang dùng
              </p>
              <p className="text-2xl font-extrabold leading-tight">
                {billing.planName}
              </p>
              <p className="text-sm text-white/70 mt-0.5">
                Gia hạn ngày {billing.renewalDate} · còn {DAYS_UNTIL_RENEWAL}{" "}
                ngày
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-3xl font-extrabold">
              {formatCurrency(billing.pricePerMonth)}
            </p>
            <p className="text-sm text-white/70">/ tháng</p>
            <span className="inline-flex items-center gap-1 mt-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Đang hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* Renewal warning */}
      {DAYS_UNTIL_RENEWAL <= 7 && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <AlertCircle size={18} className="text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700 font-medium">
            Gói của bạn sắp hết hạn trong{" "}
            <strong>{DAYS_UNTIL_RENEWAL} ngày</strong>. Vui lòng gia hạn để
            không gián đoạn việc học.
          </p>
          <button className="ml-auto shrink-0 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition">
            Gia hạn ngay
          </button>
        </div>
      )}

      {/* Billing info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <Shield size={18} className="text-green-500" />,
            bg: "bg-green-50",
            border: "border-green-100",
            label: "Phương thức thanh toán",
            val: billing.paymentMethod,
            action: "Thay đổi",
          },
          {
            icon: <RefreshCw size={18} className="text-blue-500" />,
            bg: "bg-blue-50",
            border: "border-blue-100",
            label: "Chu kỳ gia hạn",
            val: billing.cycle,
            action: "Đổi sang năm",
          },
          {
            icon: <CreditCard size={18} className="text-purple-500" />,
            bg: "bg-purple-50",
            border: "border-purple-100",
            label: "Lần thanh toán tiếp",
            val: `${formatCurrency(billing.pricePerMonth)} · ${billing.renewalDate}`,
            action: "Xem hóa đơn",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`bg-white rounded-2xl shadow-sm border ${item.border} p-5`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-semibold leading-tight">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-gray-700 mt-0.5 truncate">
                  {item.val}
                </p>
              </div>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              {item.action} <ArrowRight size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Referral banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Gift size={18} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">
            Giới thiệu bạn bè – Nhận 1 tháng miễn phí!
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Mỗi phụ huynh bạn giới thiệu đăng ký Pro, bạn được tặng 1 tháng dùng
            thử.
          </p>
        </div>
        <button className="shrink-0 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-200 whitespace-nowrap">
          Lấy mã giới thiệu
        </button>
      </div>

      {/* Plan comparison */}
      <div>
        <p className="text-sm font-bold text-gray-700 mb-4">So sánh gói cước</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Free plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-base font-bold text-gray-500">Gói Miễn phí</p>
            </div>
            <p className="text-2xl font-extrabold text-gray-400 mb-6">
              0đ
              <span className="text-sm font-medium text-gray-400">/tháng</span>
            </p>
            <ul className="space-y-3 mb-6">
              {FREE_PLAN_FEATURES.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2.5 text-sm text-gray-500"
                >
                  <Check size={15} className="text-gray-300 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-xs text-gray-400 font-medium text-center border border-dashed border-gray-200">
              Gói hiện tại của con
            </div>
          </div>

          {/* Pro plan – highlighted */}
          <div className="bg-white rounded-2xl border-2 border-orange-400 shadow-xl relative p-6">
            <span className="absolute -top-3.5 left-6 text-xs font-bold bg-orange-400 text-white px-3 py-1 rounded-full flex items-center gap-1">
              <Zap size={11} />
              Gói hiện tại của bạn
            </span>
            <div className="flex items-center justify-between mb-1 mt-2">
              <p className="text-base font-bold text-gray-800">
                ViOlympicKids Pro
              </p>
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Đang dùng
              </span>
            </div>
            <p
              className="text-2xl font-extrabold mb-6"
              style={{ color: "var(--brand-primary)" }}
            >
              {formatCurrency(billing.pricePerMonth)}
              <span className="text-sm font-medium text-gray-400">/tháng</span>
            </p>
            <ul className="space-y-3 mb-6">
              {PRO_PLAN_FEATURES.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2.5 text-sm text-gray-700 font-medium"
                >
                  <Check size={15} className="text-green-500 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-primary), #f97316)",
                  color: "white",
                }}
              >
                Nâng cấp gói năm (tiết kiệm 2 tháng)
              </button>
            </div>
            <button className="mt-3 w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all">
              Hủy đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
