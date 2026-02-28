import { useLoginForm } from "../model/useLoginForm";
import { useLang } from "@/shared/lib/i18n";

export function LoginForm() {
  const { t } = useLang();
  const {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    touched,
    handleBlur,
    isLoading,
    handleSubmit,
  } = useLoginForm();

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
      {/* Email */}
      <div>
        <label className="block text-gray-500 font-semibold mb-2 ml-1">
          {t.loginForm.emailLabel}
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur("email")}
          placeholder={t.loginForm.emailPlaceholder}
          className={`${inputBase} ${
            touched.email && errors.email
              ? errorRing
              : "border-2 border-blue-100 bg-blue-50 placeholder-blue-300 focus:border-blue-300 focus:shadow-[0_0_0_4px_rgba(174,203,235,0.4)]"
          }`}
        />
        {touched.email && errors.email && (
          <p className="mt-1.5 ml-1 text-xs text-red-500 font-semibold flex items-center gap-1">
            <span>⚠️</span> {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-gray-500 font-semibold mb-2 ml-1">
          {t.loginForm.passwordLabel}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur("password")}
          placeholder={t.loginForm.passwordPlaceholder}
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

      {/* Forgot password */}
      <div className="flex justify-end items-center text-sm px-1">
        <a
          href="#"
          className="text-blue-400 hover:text-blue-600 font-bold transition-colors"
        >
          {t.loginForm.forgotPassword}
        </a>
      </div>

      {/* Demo account hint */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs space-y-2">
        <p className="font-bold text-blue-500 mb-1">
          🧪 Tài khoản demo — click để tự điền:
        </p>
        <button
          type="button"
          onClick={() => {
            setEmail("demo@violympickids.com");
            setPassword("demo123");
          }}
          className="w-full text-left px-3 py-2 rounded-xl bg-white border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          <span className="font-semibold text-gray-600">🧒 Học sinh: </span>
          <span className="text-blue-600 font-mono">
            demo@violympickids.com
          </span>
          <span className="text-gray-400"> / </span>
          <span className="text-blue-600 font-mono">demo123</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setEmail("parent@violympickids.com");
            setPassword("parent123");
          }}
          className="w-full text-left px-3 py-2 rounded-xl bg-white border border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition-all"
        >
          <span className="font-semibold text-gray-600">👨‍👩‍👧 Phụ huynh: </span>
          <span className="text-orange-600 font-mono">
            parent@violympickids.com
          </span>
          <span className="text-gray-400"> / </span>
          <span className="text-orange-600 font-mono">parent123</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setEmail("student@violympickids.com");
            setPassword("student123");
          }}
          className="w-full text-left px-3 py-2 rounded-xl bg-white border border-green-100 hover:border-green-300 hover:bg-green-50 transition-all"
        >
          <span className="font-semibold text-gray-600">
            🧒 Học sinh (portal):{" "}
          </span>
          <span className="text-green-600 font-mono">
            student@violympickids.com
          </span>
          <span className="text-gray-400"> / </span>
          <span className="text-green-600 font-mono">student123</span>
        </button>
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
