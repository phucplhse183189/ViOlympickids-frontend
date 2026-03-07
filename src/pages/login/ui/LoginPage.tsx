import { LoginForm } from "@/features/auth/login";
import { useLang } from "@/shared/lib/i18n";

export function LoginPage() {
  const { t } = useLang();
  return (
    <div className="bg-gradient-to-br from-blue-100 via-pink-50 to-yellow-100 min-h-screen w-full overflow-y-auto relative flex items-center justify-center py-8">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 text-6xl text-blue-300 opacity-50 animate-[float_6s_ease-in-out_infinite] font-bold select-none">
        +
      </div>
      <div className="absolute bottom-20 right-20 text-6xl text-pink-300 opacity-50 animate-[float_7s_ease-in-out_2s_infinite] font-bold select-none">
        ÷
      </div>
      <div className="absolute top-16 right-1/3 text-5xl text-yellow-300 opacity-40 animate-[float_8s_ease-in-out_1s_infinite] font-bold select-none">
        ×
      </div>
      <div className="absolute bottom-1/3 left-12 text-5xl text-green-300 opacity-40 animate-[float_6.5s_ease-in-out_3s_infinite] font-bold select-none">
        −
      </div>
      <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-yellow-200 rounded-full blur-xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-green-200 rounded-full blur-xl opacity-60 pointer-events-none" />

      {/* Card */}
      <div
        className="
        bg-white/80 backdrop-blur-md border-4 border-white
        rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)]
        p-8 md:p-12 w-full max-w-6xl
        flex flex-col md:flex-row items-center gap-10
        relative z-10 mx-4
        transition-shadow duration-300 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]
      "
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-400 text-gray-400 flex items-center justify-center text-lg font-bold transition-colors"
          aria-label="Close"
        >
          ×
        </button>
        {/* Left — Logo + Branding */}
        <div className="w-full md:w-2/5 flex flex-col items-center justify-center text-center gap-5 shrink-0">
          {/* Logo area */}
          <div className="relative">
            {/* Logo */}
            <img
              src="/logo.png"
              alt="ViOlympicKids Logo"
              className="w-64 h-64 object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
            />

            {/* Speech bubble */}
            <div className="absolute -top-3 -right-6 bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-blue-200 rotate-6 animate-bounce z-10">
              <p className="text-blue-500 font-bold text-sm whitespace-nowrap">
                {t.loginPage.speechBubble}
              </p>
              {/* Bubble tail */}
              <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-r-2 border-b-2 border-blue-200 rotate-45" />
            </div>

            {/* Floating star badges */}
            <div className="absolute -bottom-2 -left-5 bg-yellow-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-[float_5s_ease-in-out_infinite] flex items-center gap-1 cursor-pointer hover:bg-yellow-500 hover:scale-110 transition-all duration-200">
              ⭐ Top 1
            </div>
            <div className="absolute top-6 -left-8 bg-green-400 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-md animate-[float_6s_ease-in-out_1s_infinite] cursor-pointer hover:bg-green-500 hover:scale-110 transition-all duration-200">
              🏆 Pro
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold mb-1 gradient-text drop-shadow-sm">
              ViOlympicKids
            </h1>
          </div>
        </div>

        {/* Divider (mobile: horizontal, desktop: vertical) */}
        <div className="hidden md:block w-px h-80 bg-gray-100" />

        {/* Right — Login Form */}
        <div className="w-full md:w-3/5">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
            {t.loginPage.welcomeBack}
          </h2>

          <LoginForm />

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-400 text-sm font-medium">
              {t.loginPage.orContinueWith}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google login */}
          <button
            type="button"
            onClick={() => {
              /* TODO: integrate real Google OAuth */
              alert(
                "Google login chưa được kết nối. Vui lòng dùng tài khoản demo.",
              );
            }}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-2xl py-3.5 font-semibold text-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t.loginPage.googleLogin}
          </button>

          <div className="mt-5 text-center">
            <span className="text-gray-400 font-semibold text-sm">
              {t.loginPage.noAccount}{" "}
            </span>
            <a
              href="/register"
              className="text-pink-400 hover:text-pink-600 font-bold text-sm transition-colors border-b-2 border-transparent hover:border-pink-400"
            >
              {t.loginPage.signupNow}
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 w-full text-center text-gray-400 text-xs">
        <span className="mx-2 cursor-pointer hover:text-gray-600 transition-colors">
          {t.loginPage.privacyPolicy}
        </span>
        {" • "}
        <span className="mx-2 cursor-pointer hover:text-gray-600 transition-colors">
          {t.loginPage.termsOfUse}
        </span>
      </div>
    </div>
  );
}
