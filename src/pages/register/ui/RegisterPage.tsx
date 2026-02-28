import { Link } from "react-router-dom";
import { RegisterForm } from "@/features/auth/register";
import { useLang } from "@/shared/lib/i18n";

export function RegisterPage() {
  const { t } = useLang();
  return (
    <div className="bg-gradient-to-br from-blue-100 via-pink-50 to-yellow-100 min-h-screen w-full overflow-hidden relative flex items-center justify-center">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 text-6xl text-green-300 opacity-50 animate-[float_6s_ease-in-out_infinite] font-bold select-none">
        ?
      </div>
      <div className="absolute bottom-20 right-20 text-6xl text-teal-300 opacity-50 animate-[float_7s_ease-in-out_2s_infinite] font-bold select-none">
        ×
      </div>
      <div className="absolute top-16 right-1/3 text-5xl text-yellow-300 opacity-40 animate-[float_8s_ease-in-out_1s_infinite] font-bold select-none">
        +
      </div>
      <div className="absolute bottom-1/3 left-12 text-5xl text-pink-300 opacity-40 animate-[float_6.5s_ease-in-out_3s_infinite] font-bold select-none">
        ÷
      </div>
      <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-yellow-200 rounded-full blur-xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-pink-200 rounded-full blur-xl opacity-60 pointer-events-none" />

      {/* Card */}
      <div
        className="
        bg-white/80 backdrop-blur-md border-4 border-white
        rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)]
        p-8 md:p-12 w-full max-w-4xl
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

        {/* Left — Register Form */}
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
            {t.registerPage.createAccount}
          </h2>

          <RegisterForm />

          <div className="mt-6 text-center">
            <span className="text-gray-400 text-sm font-semibold">
              {t.registerPage.hasAccount}{" "}
            </span>
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-600 font-bold text-sm transition-colors border-b-2 border-transparent hover:border-blue-400"
            >
              {t.registerPage.loginNow}
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-80 bg-gray-100 order-2" />

        {/* Right — Logo + Branding */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center gap-5 order-1 md:order-3">
          {/* Logo area */}
          <div className="relative">
            <img
              src="/logo.png"
              alt="ViOlympicKids Logo"
              className="w-64 h-64 object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105"
            />

            {/* Speech bubble */}
            <div className="absolute -top-3 -right-6 bg-white px-4 py-2 rounded-2xl shadow-lg border-2 border-green-200 rotate-6 animate-bounce z-10">
              <p className="text-green-500 font-bold text-sm whitespace-nowrap">
                {t.registerPage.speechBubble}
              </p>
              <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-r-2 border-b-2 border-green-200 rotate-45" />
            </div>

            {/* Floating badges */}
            <div className="absolute -bottom-2 -left-5 bg-teal-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-[float_5s_ease-in-out_infinite] flex items-center gap-1 cursor-pointer hover:bg-teal-500 hover:scale-110 transition-all duration-200">
              🌟 New
            </div>
            <div className="absolute top-6 -left-8 bg-green-400 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-md animate-[float_6s_ease-in-out_1s_infinite] cursor-pointer hover:bg-green-500 hover:scale-110 transition-all duration-200">
              🎮 Free
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-4xl font-bold mb-1 gradient-text drop-shadow-sm">
              ViOlympicKids
            </h1>
            <p className="text-gray-400 text-base">{t.registerPage.tagline}</p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {t.registerPage.pills.map(({ icon, label }) => (
              <span
                key={label}
                className="bg-white border border-green-100 shadow-sm text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-all duration-200 hover:bg-green-50 hover:border-green-300 hover:text-green-600 hover:shadow-md hover:scale-105"
              >
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 w-full text-center text-gray-400 text-xs">
        <span className="mx-2 cursor-pointer hover:text-gray-600 transition-colors">
          {t.registerPage.privacyPolicy}
        </span>
        {" • "}
        <span className="mx-2 cursor-pointer hover:text-gray-600 transition-colors">
          {t.registerPage.termsOfUse}
        </span>
      </div>
    </div>
  );
}
