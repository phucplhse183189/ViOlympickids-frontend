import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Smartphone,
  Building2,
  QrCode,
  Shield,
  Check,
  ArrowLeft,
  Tag,
  Zap,
  Crown,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useActiveChild } from "@/shared/lib/activeChild";
import * as transactionService from "@/shared/api/services/transactionService";

// ── types ──────────────────────────────────────────
type PaymentMethod = "payos" | "momo" | "bank" | "card";
type PlanKey = "PRO" | "VIP";

interface PlanOption {
  key: PlanKey;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    key: "PRO",
    name: "Pro",
    monthlyPrice: 55_000,
    yearlyPrice: 550_000,
    icon: <Zap size={20} className="text-white" />,
    gradient: "linear-gradient(135deg, var(--brand-primary) 0%, #f97316 100%)",
    features: [
      "200+ bài 3D tương tác",
      "Báo cáo hàng ngày",
      "Luyện tập không giới hạn",
      "Hỗ trợ email",
    ],
  },
  {
    key: "VIP",
    name: "VIP",
    monthlyPrice: 89_000,
    yearlyPrice: 890_000,
    icon: <Crown size={20} className="text-white" />,
    gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #eab308 100%)",
    features: [
      "Tất cả tính năng Pro",
      "AI hướng dẫn bằng giọng nói",
      "Phân tích chi tiết",
      "Hỗ trợ 24/7",
      "Lộ trình cá nhân hóa",
    ],
  },
];

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}[] = [
  {
    id: "payos",
    label: "PayOS",
    desc: "Thanh toán QR / Chuyển khoản / Thẻ qua PayOS",
    icon: <QrCode size={20} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "momo",
    label: "MoMo",
    desc: "Thanh toán qua ví MoMo",
    icon: <Smartphone size={20} />,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    desc: "Chuyển khoản nội địa 24/7",
    icon: <Building2 size={20} />,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    id: "card",
    label: "Thẻ quốc tế",
    desc: "Visa / Mastercard / JCB",
    icon: <CreditCard size={20} />,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

// ── helpers ────────────────────────────────────────
function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

// ── component ──────────────────────────────────────
export function PaymentPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { activeChild, isLoading, profiles } = useActiveChild();

  // which plan was requested via ?plan=PRO|VIP, default PRO
  const requestedPlan = (params.get("plan")?.toUpperCase() ?? "PRO") as PlanKey;
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(
    requestedPlan === "VIP" ? "VIP" : "PRO",
  );
  const [cycle, setCycle] = useState<"month" | "year">("month");
  const [method, setMethod] = useState<PaymentMethod>("payos");
  const [promo, setPromo] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Đang tải thông tin...
      </div>
    );
  }

  if (!isLoading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-5xl mb-4">💰</span>
        <h3 className="text-lg font-bold text-gray-700 mb-1">Chưa có hồ sơ học sinh</h3>
        <p className="text-sm text-gray-400 mb-6">Hãy thêm hồ sơ cho bé để sử dụng tính năng này</p>
        <button
          onClick={() => navigate("/add-child")}
          className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--brand-primary), #f97316)" }}
        >
          + Thêm hồ sơ học sinh
        </button>
      </div>
    );
  }

  if (!activeChild) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Đang tải thông tin...
      </div>
    );
  }

  const plan = PLANS.find((p) => p.key === selectedPlan)!;
  const basePrice = cycle === "month" ? plan.monthlyPrice : plan.yearlyPrice;
  const discount = promoApplied ? Math.round(basePrice * 0.1) : 0;
  const total = basePrice - discount;

  function handleApplyPromo() {
    if (promo.trim().length > 0) {
      setPromoApplied(true);
    }
  }

  async function handlePay() {
    if (!agree) return;
    setProcessing(true);
    setPaymentError("");
    
    try {
      const parentId = sessionStorage.getItem("vio_parent_id");
      if (!parentId) {
        setPaymentError("Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.");
        setProcessing(false);
        return;
      }

      // Gọi API tạo payment link PayOS
      const result = await transactionService.createPayment({
        childId: activeChild!.id,
        parentId,
        plan: selectedPlan,
        cycle,
        amount: total,
      });

      // Redirect user đến trang thanh toán PayOS
      window.location.href = result.checkoutUrl;
    } catch (err) {
      console.error(err);
      setPaymentError("Không thể tạo đơn thanh toán. Vui lòng thử lại.");
      setProcessing(false);
    }
  }


  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-3"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          Thanh toán nâng cấp gói
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Nâng cấp gói cho {activeChild.avatarEmoji} {activeChild.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Plan + Method ────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Choose plan */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">
                1
              </span>
              Chọn gói cước
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {PLANS.map((p) => {
                const active = p.key === selectedPlan;
                return (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPlan(p.key)}
                    className={`relative rounded-2xl p-5 text-left transition-all border-2 ${
                      active
                        ? p.key === "VIP"
                          ? "border-amber-400 bg-amber-50/40 shadow-lg"
                          : "border-orange-400 bg-orange-50/40 shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {active && (
                      <span className="absolute top-3 right-3">
                        <Check
                          size={18}
                          className={
                            p.key === "VIP"
                              ? "text-amber-500"
                              : "text-orange-500"
                          }
                        />
                      </span>
                    )}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: p.gradient }}
                    >
                      {p.icon}
                    </div>
                    <p className="font-bold text-gray-800 text-base">
                      Gói {p.name}
                    </p>
                    <p
                      className="text-lg font-extrabold mt-1"
                      style={{
                        color:
                          p.key === "VIP" ? "#d97706" : "var(--brand-primary)",
                      }}
                    >
                      {formatVnd(p.monthlyPrice)}
                      <span className="text-sm font-medium text-gray-400">
                        {" "}
                        /tháng
                      </span>
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {p.features.slice(0, 3).map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <Check
                            size={12}
                            className="text-green-500 shrink-0"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Cycle toggle */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-600 font-medium">
                Chu kỳ thanh toán:
              </span>
              <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setCycle("month")}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    cycle === "month"
                      ? "bg-orange-500 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Hàng tháng
                </button>
                <button
                  onClick={() => setCycle("year")}
                  className={`px-4 py-2 text-sm font-semibold transition ${
                    cycle === "year"
                      ? "bg-orange-500 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  Hàng năm
                  <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                    -17%
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Step 2: Payment method */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                2
              </span>
              Chọn phương thức thanh toán
            </h3>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => {
                const active = m.id === method;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-all text-left ${
                      active
                        ? "border-blue-400 bg-blue-50/40 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center shrink-0 ${m.color}`}
                    >
                      {m.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">
                        {m.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        active ? "border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {active && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 3: Promo code */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-bold flex items-center justify-center">
                3
              </span>
              Mã giảm giá
            </h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Tag
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value);
                    setPromoApplied(false);
                  }}
                  placeholder="Nhập mã giảm giá (nếu có)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition"
                  maxLength={20}
                />
              </div>
              <button
                onClick={handleApplyPromo}
                disabled={promo.trim().length === 0}
                className="px-5 py-3 rounded-xl bg-gray-800 text-white text-sm font-semibold hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Áp dụng
              </button>
            </div>
            {promoApplied && (
              <div className="flex items-center gap-2 mt-3 text-green-600 text-sm font-medium">
                <CheckCircle2 size={16} />
                Mã giảm giá đã được áp dụng — Giảm 10%
              </div>
            )}
          </section>
        </div>

        {/* ── RIGHT: Order summary ──────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="text-sm font-bold text-gray-700 mb-5">
              Tóm tắt đơn hàng
            </h3>

            {/* Plan card mini */}
            <div
              className="rounded-xl p-4 text-white mb-5"
              style={{ background: plan.gradient }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {plan.icon}
                </div>
                <div>
                  <p className="text-xs text-white/70 font-semibold">
                    Gói nâng cấp
                  </p>
                  <p className="font-bold text-lg leading-tight">{plan.name}</p>
                </div>
              </div>
            </div>

            {/* Child */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                style={{ background: activeChild.avatarBg || undefined }}
              >
                {activeChild.avatarEmoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {activeChild.name}
                </p>
                <p className="text-xs text-gray-400">{activeChild.grade}</p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 text-sm mb-5 pb-5 border-b border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Gói {plan.name} ({cycle === "month" ? "1 tháng" : "12 tháng"})
                </span>
                <span className="font-semibold text-gray-700">
                  {formatVnd(basePrice)}
                </span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Mã giảm giá (-10%)</span>
                  <span className="font-semibold">-{formatVnd(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Phương thức</span>
                <span className="font-semibold text-gray-700">
                  {PAYMENT_METHODS.find((m) => m.id === method)?.label}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-end mb-6">
              <span className="text-sm font-bold text-gray-700">
                Tổng thanh toán
              </span>
              <span
                className="text-2xl font-extrabold"
                style={{
                  color:
                    selectedPlan === "VIP" ? "#d97706" : "var(--brand-primary)",
                }}
              >
                {formatVnd(total)}
              </span>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 accent-orange-500"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                Tôi đồng ý với{" "}
                <span className="text-blue-600 hover:underline font-medium cursor-pointer">
                  Điều khoản dịch vụ
                </span>{" "}
                và{" "}
                <span className="text-blue-600 hover:underline font-medium cursor-pointer">
                  Chính sách bảo mật
                </span>{" "}
                của ViOlympic Kids
              </span>
            </label>

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={!agree || processing}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              style={{
                background: agree ? plan.gradient : "#d1d5db",
              }}
            >
              {processing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang tạo đơn thanh toán...
                </>
              ) : (
                <>
                  <Lock size={15} />
                  Thanh toán {formatVnd(total)}
                </>
              )}
            </button>

            {/* Error message */}
            {paymentError && (
              <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-medium">{paymentError}</p>
              </div>
            )}

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Shield size={13} className="text-green-500" />
                Bảo mật SSL
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Lock size={13} className="text-green-500" />
                Mã hóa 256-bit
              </div>
            </div>

            {/* Refund notice */}
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle
                size={15}
                className="text-amber-500 shrink-0 mt-0.5"
              />
              <p className="text-xs text-amber-700 leading-relaxed">
                Bạn có thể hủy gói bất kỳ lúc nào. Hoàn tiền trong 7 ngày đầu
                nếu không hài lòng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
