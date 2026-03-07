import { useState } from "react";
import { useLoginForm } from "../model/useLoginForm";
import { useLang } from "@/shared/lib/i18n";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const { t } = useLang();
  const {
    phone,
    setPhone,
    password,
    setPassword,
    errors,
    touched,
    handleBlur,
    isLoading,
    handleSubmit,
  } = useLoginForm();

  const [showPassword, setShowPassword] = useState(false);

  const inputBase =
    "w-full rounded-2xl px-5 py-4 font-medium transition-all focus:outline-none";
  const errorRing =
    "border-2 border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(252,165,165,0.3)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* General error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-500 text-sm font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
          <span>⚠️</span> {errors.general}
        </div>
      )}
      {/* Số điện thoại */}
      <div>
        <label className="block text-gray-500 font-semibold mb-2 ml-1">
          {t.loginForm.phoneLabel}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={() => handleBlur("phone")}
          placeholder={t.loginForm.phonePlaceholder}
          maxLength={10}
          className={`${inputBase} ${
            touched.phone && errors.phone
              ? errorRing
              : "border-2 border-blue-100 bg-blue-50 placeholder-blue-300 focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(174,203,235,0.4)]"
          }`}
        />
        {touched.phone && errors.phone && (
          <p className="mt-1.5 ml-1 text-xs text-red-500 font-semibold flex items-center gap-1">
            <span>⚠️</span> {errors.phone}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-gray-500 font-semibold mb-2 ml-1">
          {t.loginForm.passwordLabel}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur("password")}
            placeholder={t.loginForm.passwordPlaceholder}
            className={`${inputBase} pr-12 ${
              touched.password && errors.password
                ? errorRing
                : "border-2 border-pink-100 bg-pink-50 placeholder-pink-300 focus:border-pink-300 focus:shadow-[0_0_0_4px_rgba(244,194,194,0.4)]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {touched.password && errors.password && (
          <p className="mt-1.5 ml-1 text-xs text-red-500 font-semibold flex items-center gap-1">
            <span>⚠️</span> {errors.password}
          </p>
        )}
      </div>

      {/* Forgot password */}
      <div className="flex justify-end items-center text-sm px-1">
        <a
          href="#"
          className="text-blue-400 hover:text-blue-600 font-bold transition-colors"
        >
          {t.loginForm.forgotPassword}
        </a>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="
          w-full bg-gradient-to-r from-orange-400 to-pink-500
          text-white font-bold text-xl py-4 rounded-2xl mt-2
          flex items-center justify-center gap-2
          transition-all duration-100
          shadow-[0px_5px_0px_0px_#d65a4e]
          active:translate-y-[5px] active:shadow-none
          hover:brightness-110
          disabled:opacity-70 disabled:cursor-not-allowed
        "
      >
        {isLoading ? (
          <>
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            {t.loginForm.submitting}
          </>
        ) : (
          <>{t.loginForm.submit}</>
        )}
      </button>
    </form>
  );
}
