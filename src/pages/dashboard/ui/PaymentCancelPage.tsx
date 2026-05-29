import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCode = searchParams.get("orderCode");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 animate-fade-in">
      <div className="bg-white border border-neutral-100 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6 border border-amber-100">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-800 mb-3">Đã Hủy Thanh Toán</h2>
        
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          Giao dịch thanh toán của bạn {orderCode ? `(#${orderCode})` : ""} đã bị hủy theo yêu cầu. Tài khoản của bé chưa được cập nhật gói VIP/PRO.
        </p>

        <div className="bg-neutral-50 rounded-xl p-4 mb-8 text-left text-xs text-neutral-500 space-y-2 border border-neutral-100">
          <p className="font-semibold text-neutral-700">Lưu ý:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Bạn không bị trừ bất kỳ khoản phí nào cho giao dịch này.</li>
            <li>Gói VIP/PRO giúp mở khóa 200+ bài học 3D sinh động cho bé.</li>
            <li>Nếu có lỗi xảy ra từ phía ngân hàng, vui lòng liên hệ bộ phận hỗ trợ.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/dashboard/payment")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold hover:shadow-lg transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={16} />
            Thử Thanh Toán Lại
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-bold hover:bg-neutral-50 transition-all flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={16} />
            Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
}
