import { Check, Zap, Shield, RefreshCw } from "lucide-react";

const freePros = [
  "Truy cập 10 bài học miễn phí",
  "1 tài khoản học sinh",
  "Tiến độ cơ bản",
];

const proPros = [
  "Toàn bộ 200+ bài học 3D",
  "AI Hướng dẫn giọng nói",
  "Báo cáo chi tiết hàng ngày",
  "Không giới hạn bài tập",
  "Ưu tiên hỗ trợ 24/7",
  "Cập nhật nội dung mới mỗi tuần",
];

export function SubscriptionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Quản lý Gói cước</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Xem và nâng cấp gói của bạn
        </p>
      </div>

      {/* Current plan banner */}
      <div
        className="rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, var(--brand-primary), #f97316)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">
              Gói hiện tại
            </p>
            <p className="text-xl font-extrabold">ViOlympicKids Pro</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold">59.000đ</p>
          <p className="text-xs text-white/70">/ tháng · Gia hạn 01/04/2026</p>
        </div>
      </div>

      {/* Billing info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <Shield size={18} className="text-green-500" />,
            bg: "bg-green-50",
            label: "Thanh toán bảo mật",
            val: "Visa ••••4321",
          },
          {
            icon: <RefreshCw size={18} className="text-blue-500" />,
            bg: "bg-blue-50",
            label: "Chu kỳ gia hạn",
            val: "Hàng tháng",
          },
          {
            icon: <Zap size={18} className="text-orange-500" />,
            bg: "bg-orange-50",
            label: "Trạng thái",
            val: "Đang hoạt động ✓",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
              <p className="text-sm font-bold text-gray-700">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Free */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 opacity-80">
          <p className="text-base font-bold text-gray-500 mb-1">Gói Miễn phí</p>
          <p className="text-2xl font-extrabold text-gray-400 mb-5">
            0đ<span className="text-sm font-medium">/tháng</span>
          </p>
          <ul className="space-y-2.5">
            {freePros.map((p) => (
              <li
                key={p}
                className="flex items-center gap-2.5 text-sm text-gray-500"
              >
                <Check size={15} className="text-gray-400 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro – highlighted */}
        <div className="bg-white rounded-2xl p-6 border-2 border-orange-400 shadow-xl relative">
          <span className="absolute -top-3.5 left-6 text-xs font-bold bg-orange-400 text-white px-3 py-1 rounded-full">
            Gói hiện tại của bạn
          </span>
          <p className="text-base font-bold text-gray-800 mb-1 mt-1">
            ViOlympicKids Pro
          </p>
          <p
            className="text-2xl font-extrabold mb-5"
            style={{ color: "var(--brand-primary)" }}
          >
            59.000đ
            <span className="text-sm font-medium text-gray-400">/tháng</span>
          </p>
          <ul className="space-y-2.5">
            {proPros.map((p) => (
              <li
                key={p}
                className="flex items-center gap-2.5 text-sm text-gray-700 font-medium"
              >
                <Check size={15} className="text-green-500 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full py-3 rounded-xl border-2 border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-all">
            Hủy đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}
