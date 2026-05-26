import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { LoginForm } from "@/features/auth/login";
import { useLang } from "@/shared/lib/i18n";
import { useAuth } from "@/shared/lib/auth";
import { useActiveChild } from "@/shared/lib/activeChild";
import * as authService from "@/shared/api/services/authService";

export function LoginPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { refreshProfiles } = useActiveChild();
  const [googleLoading, setGoogleLoading] = useState(false);
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
          onClick={() => navigate("/")}
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
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (!credentialResponse.credential) return;
                setGoogleLoading(true);
                authService
                  .googleLogin(credentialResponse.credential)
                  .then((user: any) => {
                    login({
                      nickname: user.name,
                      email: user.email || user.phone,
                      avatarId: user.avatarInitials || "panda",
                      tier: "free",
                    });
                    sessionStorage.setItem("vio_parent_id", user.id);
                    if (refreshProfiles) {
                      refreshProfiles().then(() => navigate("/profile-picker"));
                    } else {
                      navigate("/profile-picker");
                    }
                  })
                  .catch(() => {
                    alert("Đăng nhập Google thất bại. Vui lòng thử lại.");
                  })
                  .finally(() => setGoogleLoading(false));
              }}
              onError={() => {
                alert("Đăng nhập Google thất bại.");
              }}
              text="continue_with"
              shape="pill"
              size="large"
              width="320"
            />
          </div>
          {googleLoading && (
            <div className="flex justify-center mt-2">
              <span className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

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
