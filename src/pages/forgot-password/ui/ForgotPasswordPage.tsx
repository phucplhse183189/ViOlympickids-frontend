import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import * as authService from "@/shared/api/services/authService";

export function ForgotPasswordPage() {
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneOrEmail.trim()) {
      setError("Vui lòng nhập số điện thoại hoặc email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.forgotPassword(phoneOrEmail.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 via-pink-50 to-yellow-100 min-h-screen w-full flex items-center justify-center py-8 px-4">
      {/* Decorative */}
      <div className="absolute top-10 left-10 text-6xl text-blue-300 opacity-50 animate-[float_6s_ease-in-out_infinite] font-bold select-none">
        ?
      </div>
      <div className="absolute bottom-20 right-20 text-6xl text-pink-300 opacity-50 animate-[float_7s_ease-in-out_2s_infinite] font-bold select-none">
        🔑
      </div>

      <div className="bg-white/80 backdrop-blur-md border-4 border-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-12 w-full max-w-md relative z-10">
        {/* Back link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-6"
        >
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </Link>

        {success ? (
          /* ── Success State ── */
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
              Đã gửi email!
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Vui lòng kiểm tra hộp thư email của bạn.
              <br />
              Link đặt lại mật khẩu sẽ hết hạn sau <strong>15 phút</strong>.
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Không nhận được email? Kiểm tra thư mục Spam hoặc thử lại.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setPhoneOrEmail("");
              }}
              className="text-orange-500 hover:text-orange-600 font-bold text-sm transition-colors"
            >
              Gửi lại email
            </button>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl mx-auto mb-4">
                🔑
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                Quên mật khẩu
              </h2>
              <p className="text-sm text-gray-400">
                Nhập số điện thoại hoặc email để nhận link đặt lại mật khẩu
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={phoneOrEmail}
                    onChange={(e) => {
                      setPhoneOrEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="Số điện thoại hoặc email"
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 text-sm font-medium outline-none transition-all ${
                      error
                        ? "border-red-300 bg-red-50 focus:border-red-400"
                        : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    }`}
                  />
                </div>
                {error && (
                  <p className="mt-1.5 ml-1 text-xs text-red-500 font-medium">
                    ⚠️ {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-primary, #f97316) 0%, #f97316 100%)",
                  boxShadow: "0 4px 15px rgba(249,115,22,0.35)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi link đặt lại mật khẩu"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
