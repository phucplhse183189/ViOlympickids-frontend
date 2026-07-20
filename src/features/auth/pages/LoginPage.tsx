import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useLang } from "@/shared/lib/i18n";
import { useAuth } from "@/features/auth/context/auth";
import { useActiveChild } from "@/features/dashboard/context/activeChild";
import * as authService from "@/features/auth/api/authService";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useThemeStore } from "@/shared/stores/themeStore";

export function LoginPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { refreshProfiles } = useActiveChild();
  const [googleLoading, setGoogleLoading] = useState(false);
  const reduceMotion = useReducedMotion();
  const theme = useThemeStore((state) => state.theme);
  const darkGoogleButton = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <AuthLayout className="h-dvh overflow-hidden" contentClassName="h-dvh min-h-0 overflow-hidden pb-4 pt-20">
      {/* Card */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 64, scale: 0.985 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        className="
        auth-surface bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-4 border-white dark:border-slate-700
        rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)]
        max-h-[calc(100dvh-6rem)] p-6 md:p-8 w-full max-w-6xl
        flex flex-col md:flex-row items-center gap-10
        relative z-10 mx-4
        transition-shadow duration-300 hover:shadow-[0_30px_60px_rgba(0,0,0,0.15)]
      "
      >
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
            <motion.div animate={reduceMotion ? undefined : { y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -right-6 -top-3 z-10 rotate-6 rounded-2xl border-2 border-blue-200 bg-white px-4 py-2 shadow-lg dark:border-blue-800 dark:bg-slate-800">
              <p className="text-blue-500 font-bold text-sm whitespace-nowrap">
                {t.loginPage.speechBubble}
              </p>
              {/* Bubble tail */}
              <div className="absolute -bottom-2 left-4 h-3 w-3 rotate-45 border-b-2 border-r-2 border-blue-200 bg-white dark:border-blue-800 dark:bg-slate-800" />
            </motion.div>

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
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-700 dark:text-slate-100">
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
          <div className="google-auth-shell google-auth-icon mx-auto leading-none">
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
              type="standard"
              theme={darkGoogleButton ? "filled_black" : "outline"}
              shape="pill"
              size="large"
              width="220"
            />
            <span className="google-auth-visible-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" focusable="false">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59A14.2 14.2 0 0 1 9.77 24c0-1.6.27-3.14.76-4.59l-7.98-6.19A24 24 0 0 0 0 24c0 3.88.92 7.54 2.56 10.78z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Đăng nhập với Google</span>
            </span>
          </div>
          {googleLoading && (
            <div className="flex justify-center mt-2">
              <span className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

        </div>
      </motion.div>

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
    </AuthLayout>
  );
}
