import { useRegisterForm } from "../model/useRegisterForm";
import { useLang } from "@/shared/lib/i18n";

export function RegisterForm() {
  const { t } = useLang();
  const {
    nickname,
    setNickname,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    agreed,
    setAgreed,
    errors,
    touched,
    handleBlur,
    isLoading,
    handleSubmit,
  } = useRegisterForm();

  const inputBase =
    "w-full rounded-2xl px-5 py-3.5 font-medium transition-all focus:outline-none";
  const errorRing =
    "border-2 border-red-300 bg-red-50 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(252,165,165,0.3)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full">
      {/* Nickname */}
      <div>
        <label className="block text-gray-500 font-semibold mb-2 ml-1 text-sm">
          {t.registerForm.nicknameLabel}
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onBlur={() => handleBlur("nickname")}
          placeholder={t.registerForm.nicknamePlaceholder}
          className={`${inputBase} ${
            touched.nickname && errors.nickname
              ? errorRing
              : "border-2 border-blue-100 bg-blue-50 placeholder-blue-300 focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(174,203,235,0.4)]"
          }`}
        />
        {touched.nickname && errors.nickname && (
          <p className="mt-1.5 ml-1 text-xs text-red-500 font-semibold flex items-center gap-1">
            <span>⚠️</span> {errors.nickname}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-gray-500 font-semibold mb-2 ml-1 text-sm">
          {t.registerForm.emailLabel}
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur("email")}
          placeholder={t.registerForm.emailPlaceholder}
          className={`${inputBase} ${
            touched.email && errors.email
              ? errorRing
              : "border-2 border-yellow-100 bg-yellow-50 placeholder-yellow-300 focus:border-yellow-300 focus:shadow-[0_0_0_4px_rgba(253,253,150,0.4)]"
          }`}
        />
        {touched.email && errors.email && (
          <p className="mt-1.5 ml-1 text-xs text-red-500 font-semibold flex items-center gap-1">
            <span>⚠️</span> {errors.email}
          </p>
        )}
      </div>

      {/* Password + Confirm */}
      <div className="flex gap-3">
        <div className="w-1/2">
          <label className="block text-gray-500 font-semibold mb-2 ml-1 text-sm">
            {t.registerForm.passwordLabel}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur("password")}
            placeholder={t.registerForm.passwordPlaceholder}
            className={`${inputBase} ${
              touched.password && errors.password
                ? errorRing
                : "border-2 border-pink-100 bg-pink-50 placeholder-pink-300 focus:border-pink-300 focus:shadow-[0_0_0_4px_rgba(244,194,194,0.4)]"
            }`}
          />
          {touched.password && errors.password && (
            <p className="mt-1.5 ml-1 text-xs text-red-500 font-semibold flex items-center gap-1">
              <span>⚠️</span> {errors.password}
            </p>
          )}
        </div>
        <div className="w-1/2">
          <label className="block text-gray-500 font-semibold mb-2 ml-1 text-sm">
            {t.registerForm.confirmPasswordLabel}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            placeholder={t.registerForm.confirmPasswordPlaceholder}
            className={`${inputBase} ${
              touched.confirmPassword && errors.confirmPassword
                ? errorRing
                : "border-2 border-pink-100 bg-pink-50 placeholder-pink-300 focus:border-pink-300 focus:shadow-[0_0_0_4px_rgba(244,194,194,0.4)]"
            }`}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="mt-1.5 ml-1 text-xs text-red-500 font-semibold flex items-center gap-1">
              <span>⚠️</span> {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-center gap-2 ml-1 pt-1">
        <input
          type="checkbox"
          id="terms"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 accent-blue-500 rounded"
        />
        <label htmlFor="terms" className="text-gray-400 text-xs font-semibold">
          {t.registerForm.agreeText}{" "}
          <a href="#" className="text-blue-500 underline hover:text-blue-600">
            {t.registerForm.termsText}
          </a>{" "}
          {t.registerForm.andText}{" "}
          <a href="#" className="text-blue-500 underline hover:text-blue-600">
            {t.registerForm.privacyText}
          </a>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !agreed}
        className="
          w-full bg-gradient-to-r from-green-400 to-teal-500
          text-white font-bold text-xl py-4 rounded-2xl mt-1
          flex items-center justify-center gap-2
          transition-all duration-100
          shadow-[0px_5px_0px_0px_#059669]
          active:translate-y-[5px] active:shadow-none
          hover:brightness-110
          disabled:opacity-70 disabled:cursor-not-allowed
        "
      >
        {isLoading ? (
          <>
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            {t.registerForm.submitting}
          </>
        ) : (
          <>{t.registerForm.submit}</>
        )}
      </button>
    </form>
  );
}
