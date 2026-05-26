import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import * as authService from "@/shared/api/services/authService";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token!, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  // No token — invalid link
  if (!token) {
    return (
      <div className="bg-gradient-to-br from-blue-100 via-pink-50 to-yellow-100 min-h-screen w-full flex items-center justify-center py-8 px-4">
        <div className="bg-white/80 backdrop-blur-md border-4 border-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-12 w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
            Link không hợp lệ
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-bold text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Yêu cầu link mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-100 via-pink-50 to-yellow-100 min-h-screen w-full flex items-center justify-center py-8 px-4">
      <div className="bg-white/80 backdrop-blur-md border-4 border-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-12 w-full max-w-md relative z-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-6"
        >
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </Link>

        {success ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
              Đặt lại thành công!
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Mật khẩu của bạn đã được đặt lại thành công.
              <br />
              Hãy đăng nhập bằng mật khẩu mới.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-extrabold text-white transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, var(--brand-primary, #f97316) 0%, #f97316 100%)",
                boxShadow: "0 4px 15px rgba(249,115,22,0.35)",
              }}
            >
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl mx-auto mb-4">
                🔐
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                Tạo mật khẩu mới
              </h2>
              <p className="text-sm text-gray-400">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-gray-200 bg-gray-50 text-sm font-medium outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-gray-200 bg-gray-50 text-sm font-medium outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="ml-1 text-xs text-red-500 font-medium">
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                style={{
                  background: "linear-gradient(135deg, var(--brand-primary, #f97316) 0%, #f97316 100%)",
                  boxShadow: "0 4px 15px rgba(249,115,22,0.35)",
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
