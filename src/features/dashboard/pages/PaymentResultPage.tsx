import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import * as transactionService from "@/features/dashboard/api/transactionService";

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderCodeStr = searchParams.get("orderCode");
  const orderCode = orderCodeStr ? parseInt(orderCodeStr, 10) : null;

  const [loading, setLoading] = useState(!!orderCode);
  const [status, setStatus] = useState<"PENDING" | "PAID" | "CANCELLED" | "ERROR">(
    orderCode ? "PENDING" : "ERROR"
  );
  const [orderInfo, setOrderInfo] = useState<transactionService.CheckOrderResult | null>(null);
  const [errorMsg, setErrorMsg] = useState(
    orderCode ? "" : "Không tìm thấy thông tin mã thanh toán."
  );

  const pollCount = useRef(0);
  const maxPolls = 15; // Poll for 30 seconds max (15 * 2s)

  useEffect(() => {
    if (!orderCode) {
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await transactionService.checkOrder(orderCode);
        setOrderInfo(res);

        if (res.status === "PAID") {
          setStatus("PAID");
          setLoading(false);
        } else if (res.status === "CANCELLED") {
          setStatus("CANCELLED");
          setLoading(false);
        } else {
          // PENDING - keep polling if we haven't reached max
          pollCount.current += 1;
          if (pollCount.current >= maxPolls) {
            setStatus("PENDING");
            setLoading(false);
          } else {
            setTimeout(checkStatus, 2000);
          }
        }
      } catch (err) {
        console.error("Error checking order status:", err);
        pollCount.current += 1;
        if (pollCount.current >= maxPolls) {
          setStatus("ERROR");
          setErrorMsg("Không thể kiểm tra trạng thái đơn hàng. Vui lòng liên hệ hỗ trợ.");
          setLoading(false);
        } else {
          setTimeout(checkStatus, 2000);
        }
      }
    };

    checkStatus();
  }, [orderCode]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white/80 backdrop-blur-md border border-neutral-100 rounded-3xl p-10 max-w-md w-full shadow-xl flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">Đang xác nhận thanh toán</h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Hệ thống đang kiểm tra phản hồi từ cổng thanh toán PayOS. Quá trình này có thể mất vài giây. Vui lòng không đóng trình duyệt...
          </p>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full animate-[shimmer_1.5s_infinite]" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "PAID" && orderInfo) {
    const isVip = orderInfo.plan === "VIP";

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 animate-fade-in">
        <div className="bg-white border border-green-100 rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
          {/* Confetti decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6 border-4 border-green-100/50 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-3">
              <Sparkles size={12} className="fill-amber-400 text-amber-500 animate-pulse" />
              <span>Kích hoạt thành công</span>
            </div>

            <h2 className="text-3xl font-extrabold text-neutral-800 mb-3 leading-snug">
              Thanh Toán Thành Công!
            </h2>

            <p className="text-neutral-600 text-sm mb-6 leading-relaxed max-w-sm">
              Chúc mừng bé <strong className="text-neutral-800 font-bold">{orderInfo.childName}</strong> đã được nâng cấp lên tài khoản <strong className="text-emerald-600">{isVip ? "VIP" : "PRO"}</strong> thành công!
            </p>

            {/* Order details card */}
            <div className="w-full bg-neutral-50 rounded-2xl p-5 border border-neutral-100 text-left space-y-3 mb-8">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium">Mã đơn hàng</span>
                <span className="font-bold text-neutral-700">#{orderCode}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium">Gói đăng ký</span>
                <span className="font-semibold text-neutral-800">
                  {isVip ? "👑 VIP" : "⚡ PRO"} ({orderInfo.cycle === "year" ? "12 Tháng" : "1 Tháng"})
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 font-medium">Tổng tiền thanh toán</span>
                <span className="font-extrabold text-neutral-800 text-sm">
                  {orderInfo.amount.toLocaleString()} đ
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-dashed border-neutral-200 pt-3">
                <span className="text-neutral-400 font-medium">Tài khoản bé áp dụng</span>
                <span className="font-bold text-neutral-700 flex items-center gap-1">
                  <span>{orderInfo.childEmoji}</span>
                  <span>{orderInfo.childName}</span>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-sm font-bold transition-all"
              >
                Về Trang Chủ
              </button>
              <button
                onClick={() => navigate("/profile-picker")}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                Bắt Đầu Học Ngay
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PENDING but timed out
  if (status === "PENDING") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 animate-fade-in">
        <div className="bg-white border border-amber-100 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6 border border-amber-100">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>

          <h2 className="text-2xl font-bold text-neutral-800 mb-3">Đơn Hàng Đang Chờ Xử Lý</h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Hệ thống ngân hàng chưa phản hồi hoặc giao dịch đang được xử lý. Bạn có thể kiểm tra lại trong phần Lịch sử giao dịch sau vài phút.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-all shadow-md"
            >
              Về Trang Chủ
            </button>
            <button
              onClick={() => navigate("/dashboard/history")}
              className="w-full py-3 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-semibold hover:bg-neutral-50 transition-all"
            >
              Xem Lịch Sử Giao Dịch
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CANCELLED or ERROR
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 animate-fade-in">
      <div className="bg-white border border-red-100 rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-neutral-800 mb-3">
          {status === "CANCELLED" ? "Giao Dịch Đã Hủy" : "Thanh Toán Thất Bại"}
        </h2>
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          {errorMsg || "Bạn đã hủy quá trình thanh toán hoặc giao dịch không thành công. Tiền chưa được trừ từ tài khoản của bạn."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/dashboard/payment")}
            className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
          >
            Thử Thanh Toán Lại
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-semibold hover:bg-neutral-50 transition-all"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  );
}
