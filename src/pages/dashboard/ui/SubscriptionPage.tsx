import { useState } from "react";
import {
  Check,
  Zap,
  Shield,
  RefreshCw,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Gift,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const FREE_PLAN_FEATURES = [
  "Truy cập 10 bài học miễn phí",
  "Thống kê cơ bản",
  "1 tài khoản học sinh",
];

const PRO_PLAN_FEATURES = [
  "Truy cập toàn bộ bài học",
  "Báo cáo chi tiết",
  "Tối đa 3 tài khoản học sinh",
  "Không có quảng cáo",
];

const VIP_PLAN_FEATURES = [
  "Mọi tính năng của Pro",
  "Học gia sư 1 kèm 1 (4 buổi/tháng)",
  "Lộ trình học cá nhân hóa",
  "Hỗ trợ ưu tiên 24/7",
];
import { useActiveChild } from "@/shared/lib/activeChild";

// ── helpers ────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function SubscriptionPage() {
  const { activeChild, dashboardData, updateChildPlan, isLoading } = useActiveChild();
  const navigate = useNavigate();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);

  if (isLoading || !activeChild || !dashboardData) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Đang tải thông tin gói cước...
      </div>
    );
  }

  const billing = dashboardData?.billing;
  const plan = activeChild?.plan || "FREE";
  const daysLeft = activeChild?.planDaysLeft ?? 0;

  if (!billing || !activeChild) return null;

  function handleCancel() {
    updateChildPlan(activeChild?.id || "", "FREE");
    setShowCancelConfirm(false);
    setCancelDone(true);
    setTimeout(() => setCancelDone(false), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Gói cước của {activeChild.avatarEmoji} {activeChild.name}
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Xem và nâng cấp gói học tập
        </p>
      </div>

      {/* Current plan hero banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background:
            plan === "VIP"
              ? "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #eab308 100%)"
              : plan === "PRO"
                ? "linear-gradient(135deg, var(--brand-primary) 0%, #f97316 100%)"
                : "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-16 w-24 h-24 rounded-full bg-white/5" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              {plan === "VIP" ? (
                <Crown size={24} className="text-white" />
              ) : (
                <Zap size={24} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-0.5">
                Gói đang dùng — {activeChild.name}
              </p>
              <p className="text-2xl font-extrabold leading-tight">
                {billing.planName}
              </p>
              {plan !== "FREE" && (
                <p className="text-sm text-white/70 mt-0.5">
                  Gia hạn ngày {billing.renewalDate} · còn {daysLeft} ngày
                </p>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <p className="text-3xl font-extrabold">
              {plan === "FREE" ? "0đ" : formatCurrency((billing?.pricePerMonth || 0))}
            </p>
            {plan !== "FREE" && (
              <p className="text-sm text-white/70">/ tháng</p>
            )}
            <span
              className={`inline-flex items-center gap-1 mt-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full`}
            >
              <span
                className={`w-2 h-2 rounded-full ${plan === "FREE" ? "bg-gray-300" : "bg-green-400"} inline-block`}
              />
              {plan === "FREE" ? "Gói cơ bản" : "Đang hoạt động"}
            </span>
          </div>
        </div>
      </div>

      {/* Renewal warning */}
      {plan !== "FREE" && daysLeft <= 7 && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <AlertCircle size={18} className="text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700 font-medium">
            Gói của {activeChild.name} sắp hết hạn trong{" "}
            <strong>{daysLeft} ngày</strong>. Vui lòng gia hạn để không gián
            đoạn việc học.
          </p>
          <button
            onClick={() => navigate(`/dashboard/payment?plan=${plan}`)}
            className="ml-auto shrink-0 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition"
          >
            Gia hạn ngay
          </button>
        </div>
      )}

      {/* Billing info cards – only for paid plans */}
      {plan !== "FREE" && (
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
              val: `${formatCurrency((billing?.pricePerMonth || 0))} · ${billing.renewalDate}`,
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
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* FREE plan */}
          {(() => {
            const isCurrent = plan === "FREE";
            return (
              <div
                className={`bg-white rounded-2xl p-6 relative ${isCurrent ? "border-2 border-gray-400 shadow-lg" : "border border-gray-200"}`}
              >
                {isCurrent && (
                  <span className="absolute -top-3.5 left-6 text-xs font-bold bg-gray-500 text-white px-3 py-1 rounded-full">
                    Gói hiện tại
                  </span>
                )}
                <div
                  className={`flex items-center justify-between mb-1 ${isCurrent ? "mt-2" : ""}`}
                >
                  <p className="text-base font-bold text-gray-500">Miễn phí</p>
                </div>
                <p className="text-2xl font-extrabold text-gray-400 mb-6">
                  0đ
                  <span className="text-sm font-medium text-gray-400">
                    {" "}
                    /tháng
                  </span>
                </p>
                <ul className="space-y-3 mb-6">
                  {FREE_PLAN_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-gray-500"
                    >
                      <Check size={15} className="text-gray-300 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-xs text-gray-400 font-medium text-center border border-dashed border-gray-200">
                    Đang dùng
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-xs text-gray-400 font-medium text-center">
                    Gói cơ bản
                  </div>
                )}
              </div>
            );
          })()}

          {/* PRO plan */}
          {(() => {
            const isCurrent = plan === "PRO";
            return (
              <div
                className={`bg-white rounded-2xl p-6 relative ${isCurrent ? "border-2 border-orange-400 shadow-xl" : "border border-gray-200"}`}
              >
                {isCurrent && (
                  <span className="absolute -top-3.5 left-6 text-xs font-bold bg-orange-400 text-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap size={11} /> Gói hiện tại
                  </span>
                )}
                <div
                  className={`flex items-center justify-between mb-1 ${isCurrent ? "mt-2" : ""}`}
                >
                  <p className="text-base font-bold text-gray-800">Pro</p>
                  {isCurrent && (
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Đang dùng
                    </span>
                  )}
                </div>
                <p
                  className="text-2xl font-extrabold mb-6"
                  style={{ color: "var(--brand-primary)" }}
                >
                  55.000đ
                  <span className="text-sm font-medium text-gray-400">
                    {" "}
                    /tháng
                  </span>
                </p>
                <ul className="space-y-3 mb-6">
                  {PRO_PLAN_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-gray-700 font-medium"
                    >
                      <Check size={15} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <>
                    <button
                      onClick={() => navigate("/dashboard/payment?plan=PRO")}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--brand-primary), #f97316)",
                        color: "white",
                      }}
                    >
                      Nâng cấp gói năm (tiết kiệm 2 tháng)
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="mt-3 w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all"
                    >
                      Hủy đăng ký
                    </button>
                  </>
                ) : plan === "FREE" ? (
                  <button
                    onClick={() => navigate("/dashboard/payment?plan=PRO")}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--brand-primary), #f97316)",
                      color: "white",
                    }}
                  >
                    Nâng cấp lên Pro
                  </button>
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-2.5 text-xs text-gray-400 font-medium text-center border border-dashed border-gray-200">
                    Gói thấp hơn
                  </div>
                )}
              </div>
            );
          })()}

          {/* VIP plan */}
          {(() => {
            const isCurrent = plan === "VIP";
            return (
              <div
                className={`rounded-2xl p-6 relative ${isCurrent ? "border-2 border-amber-400 shadow-xl bg-amber-50/30" : "bg-white border border-gray-200"}`}
              >
                {isCurrent && (
                  <span className="absolute -top-3.5 left-6 text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Crown size={11} /> Gói hiện tại
                  </span>
                )}
                {!isCurrent && (
                  <span className="absolute -top-3.5 right-6 text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-3 py-1 rounded-full">
                    Phổ biến nhất
                  </span>
                )}
                <div
                  className={`flex items-center justify-between mb-1 ${isCurrent || !isCurrent ? "mt-2" : ""}`}
                >
                  <p className="text-base font-bold text-amber-700 flex items-center gap-1.5">
                    <Crown size={16} className="text-amber-500" /> VIP
                  </p>
                  {isCurrent && (
                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Đang dùng
                    </span>
                  )}
                </div>
                <p className="text-2xl font-extrabold text-amber-600 mb-6">
                  89.000đ
                  <span className="text-sm font-medium text-gray-400">
                    {" "}
                    /tháng
                  </span>
                </p>
                <ul className="space-y-3 mb-6">
                  {VIP_PLAN_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-sm text-gray-700 font-medium"
                    >
                      <Check size={15} className="text-amber-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <>
                    <button
                      onClick={() => navigate("/dashboard/payment?plan=VIP")}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-amber-500 to-yellow-400 text-white"
                    >
                      Nâng cấp gói năm (tiết kiệm 2 tháng)
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="mt-3 w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all"
                    >
                      Hủy đăng ký
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/dashboard/payment?plan=VIP")}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-amber-500 to-yellow-400 text-white hover:shadow-lg hover:shadow-amber-200"
                  >
                    Nâng cấp lên VIP
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-fade-in-up">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-800 mb-2">
                Hủy đăng ký?
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {activeChild.name} sẽ mất quyền truy cập các tính năng{" "}
                <strong>{plan}</strong> và chuyển về gói Miễn phí. Bạn có chắc chắn?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Giữ gói
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel success toast */}
      {cancelDone && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-green-200 shadow-lg rounded-2xl px-5 py-4 flex items-center gap-3 animate-fade-in-up">
          <Check size={18} className="text-green-500" />
          <p className="text-sm font-semibold text-gray-700">
            Đã hủy gói thành công. {activeChild.name} đang dùng gói Miễn phí.
          </p>
        </div>
      )}
    </div>
  );
}
