import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, Phone, User } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useAuth } from "@/features/auth/context/auth";
import * as authService from "@/features/auth/api/authService";
import * as childrenService from "@/features/dashboard/api/childrenService";
import { useThemeStore } from "@/shared/stores/themeStore";
import { useLang } from "@/shared/lib/i18n";

const AVATARS = [
  { emoji: "🚀", bg: "#6366f1", vi: "Phi hành gia", en: "Astronaut" },
  { emoji: "🤖", bg: "#3b82f6", vi: "Rô-bốt AI", en: "AI Robot" },
  { emoji: "🦊", bg: "#f97316", vi: "Cáo thông minh", en: "Clever Fox" },
  { emoji: "🐼", bg: "#64748b", vi: "Gấu trúc", en: "Panda" },
  { emoji: "🦁", bg: "#eab308", vi: "Sư tử", en: "Lion" },
  { emoji: "🐸", bg: "#22c55e", vi: "Ếch xanh", en: "Green Frog" },
  { emoji: "🦄", bg: "#d946ef", vi: "Kỳ lân", en: "Unicorn" },
  { emoji: "🐲", bg: "#ef4444", vi: "Rồng lửa", en: "Fire Dragon" },
];

const SURVEYS = [
  { id: "focus", emoji: "🧠", vi: "Bé hay mất tập trung khi học", en: "My child often loses focus while learning" },
  { id: "time", emoji: "⏰", vi: "Ba mẹ không có nhiều thời gian kèm con", en: "I don't have much time to tutor my child" },
  { id: "progress", emoji: "📊", vi: "Khó đánh giá sự tiến bộ của con", en: "It is hard to assess my child's progress" },
  { id: "boring", emoji: "📚", vi: "Con thấy cách học hiện tại nhàm chán", en: "My child finds current learning methods boring" },
];

type Errors = Record<string, string>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const text = (vi: string, en: string) => lang === "vi" ? vi : en;
  const { login } = useAuth();
  const reduceMotion = useReducedMotion();
  const theme = useThemeStore((state) => state.theme);
  const darkGoogleButton = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [step, setStep] = useState(1);
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<authService.UserInfo | null>(null);
  const [childName, setChildName] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [survey, setSurvey] = useState<string[]>([]);

  function validateAccount() {
    const next: Errors = {};
    if (!parentName.trim()) next.parentName = text("Vui lòng nhập họ và tên", "Please enter your full name");
    if (!phone.trim()) next.phone = text("Vui lòng nhập số điện thoại", "Please enter your phone number");
    else if (!/^(0[35789])[0-9]{8}$/.test(phone)) next.phone = text("Số điện thoại không đúng định dạng", "Please enter a valid Vietnamese phone number");
    if (password.length < 6) next.password = text("Mật khẩu cần ít nhất 6 ký tự", "Password must be at least 6 characters");
    if (confirmPassword !== password) next.confirmPassword = text("Mật khẩu xác nhận không khớp", "Passwords do not match");
    if (!agreed) next.agreed = text("Vui lòng đồng ý điều khoản", "Please agree to the terms");
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function createAccount() {
    if (!validateAccount() || loading) return;
    setLoading(true);
    authService.register({ name: parentName.trim(), phone, password })
      .then((user) => {
        setRegisteredUser(user);
        sessionStorage.setItem("vio_parent_id", user.id);
        setStep(2);
      })
      .catch((error: any) => setErrors({ phone: error?.message || text("Đăng ký thất bại. Vui lòng thử lại.", "Registration failed. Please try again.") }))
      .finally(() => setLoading(false));
  }

  function googleLogin(credential: string) {
    setLoading(true);
    authService.googleLogin(credential)
      .then((user: any) => {
        login({ nickname: user.name, phone: user.phone, email: user.email || "", avatarId: user.avatarInitials || "fox" });
        sessionStorage.setItem("vio_parent_id", user.id);
        navigate("/profile-picker");
      })
      .catch(() => alert(text("Đăng nhập Google thất bại. Vui lòng thử lại.", "Google sign-in failed. Please try again.")))
      .finally(() => setLoading(false));
  }

  function finish() {
    if (!registeredUser || loading) return;
    const avatar = AVATARS[avatarIndex];
    setLoading(true);
    childrenService.addChild(registeredUser.id, {
      name: childName.trim(), grade: "Lớp 2", avatarEmoji: avatar.emoji,
      avatarBg: avatar.bg, plan: "FREE", gender: "boy",
    }).then(() => {
      login({ nickname: registeredUser.name || parentName, phone: registeredUser.phone, email: registeredUser.email || "", avatarId: registeredUser.avatarInitials || "fox" });
      if (survey.length) localStorage.setItem("vio_parent_survey", JSON.stringify(survey));
      navigate("/profile-picker");
    }).catch(() => alert(text("Tạo hồ sơ bé thất bại. Vui lòng thử lại.", "Could not create the child's profile. Please try again.")))
      .finally(() => setLoading(false));
  }

  const fieldClass = "w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100/70 dark:border-slate-600 dark:bg-slate-800/55 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-orange-400 dark:focus:ring-orange-500/15";

  return (
    <AuthLayout className="h-dvh overflow-hidden" contentClassName="h-dvh min-h-0 overflow-hidden pb-4 pt-20">
      <motion.div initial={false} className="auth-surface register-auth-surface mx-3 flex min-h-0 w-full max-w-6xl overflow-hidden rounded-[36px] border-4 border-white bg-white/80 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90">
        <aside className="relative hidden w-[39%] shrink-0 flex-col items-center justify-center overflow-hidden border-r border-slate-200 p-8 text-center dark:border-slate-700 md:flex">
          <motion.div animate={reduceMotion ? undefined : { y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }} className="relative">
            <img src="/logo.png" alt="ViOlympicKids" className="h-64 w-64 object-contain drop-shadow-xl lg:h-72 lg:w-72" />
            <span className="absolute -right-7 top-3 rotate-6 rounded-2xl border-2 border-blue-200 bg-white px-4 py-2 text-sm font-extrabold text-blue-500 shadow-lg dark:border-blue-800 dark:bg-slate-800">{text("Sẵn sàng học vui! 🚀", "Ready for fun learning! 🚀")}</span>
          </motion.div>
          <h1 className="gradient-text text-4xl font-black">ViOlympicKids</h1>
          <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">{text("Một tài khoản phụ huynh, cả hành trình học tập đầy cảm hứng cho con.", "One parent account for your child's inspiring learning journey.")}</p>
        </aside>

        <section className="register-form-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-5 py-7 sm:px-9 lg:px-12">
            {step === 1 && (
              <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-center text-2xl font-black text-slate-800 dark:text-white">{text("Tạo tài khoản phụ huynh", "Create a parent account")}</h2>
                <p className="mb-5 mt-1 text-center text-sm text-slate-400">{text("Chỉ vài bước để bắt đầu hành trình cùng con ✨", "Just a few steps to begin the journey with your child ✨")}</p>
                <div className="space-y-3">
                  <Field icon={<User size={17} />} error={errors.parentName}><input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder={text("Họ và tên phụ huynh", "Parent's full name")} className={fieldClass} /></Field>
                  <Field icon={<Phone size={17} />} error={errors.phone}><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} maxLength={10} inputMode="numeric" placeholder={text("Số điện thoại", "Phone number")} className={fieldClass} /></Field>
                  <Field icon={<Lock size={17} />} error={errors.password}><input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder={text("Mật khẩu (ít nhất 6 ký tự)", "Password (at least 6 characters)")} className={`${fieldClass} pr-12`} /><EyeButton shown={showPassword} onClick={() => setShowPassword(!showPassword)} /></Field>
                  <Field icon={<Lock size={17} />} error={errors.confirmPassword}><input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirm ? "text" : "password"} placeholder={text("Xác nhận mật khẩu", "Confirm password")} className={`${fieldClass} pr-12`} /><EyeButton shown={showConfirm} onClick={() => setShowConfirm(!showConfirm)} /></Field>
                </div>
                <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-500 dark:text-slate-400"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-orange-500" /><span>{text("Tôi đồng ý với ", "I agree to the ")}<b className="text-blue-600 dark:text-blue-400">{text("Điều khoản dịch vụ", "Terms of Service")}</b>{text(" và ", " and ")}<b className="text-blue-600 dark:text-blue-400">{text("Chính sách bảo mật", "Privacy Policy")}</b>.</span></label>
                {errors.agreed && <p className="mt-1 text-xs font-semibold text-red-500">{errors.agreed}</p>}
                <button onClick={createAccount} disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3.5 font-extrabold text-white shadow-lg shadow-orange-200/50 transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? text("Đang xử lý...", "Processing...") : text("Tạo tài khoản", "Create account")}<ArrowRight size={18} /></button>
                <div className="my-4 flex items-center gap-3 text-xs font-semibold text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />{text("Hoặc tiếp tục với", "Or continue with")}<span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /></div>
                <div className="google-auth-shell google-auth-icon mx-auto leading-none">
                  <GoogleLogin onSuccess={(response) => response.credential && googleLogin(response.credential)} onError={() => alert(text("Đăng nhập Google thất bại.", "Google sign-in failed."))} type="standard" theme={darkGoogleButton ? "filled_black" : "outline"} shape="pill" size="large" width="220" />
                  <GoogleLabel lang={lang} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="child" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Back onClick={() => setStep(1)} label={text("Quay lại", "Back")} />
                <h2 className="text-center text-2xl font-black text-slate-800 dark:text-white">{text("Tạo góc học tập cho bé", "Create your child's learning space")}</h2>
                <p className="mb-6 mt-1 text-center text-sm text-slate-400">{text("Chọn tên và nhân vật bé yêu thích", "Choose a name and your child's favorite character")}</p>
                <div className="mb-5 flex items-center gap-4 rounded-3xl bg-orange-50 p-4 dark:bg-slate-800/80 dark:ring-1 dark:ring-inset dark:ring-slate-700"><span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 border-white text-4xl shadow-md dark:border-slate-200" style={{ backgroundColor: AVATARS[avatarIndex].bg }}>{AVATARS[avatarIndex].emoji}</span><div><b className="text-lg text-slate-800 dark:text-slate-50">{childName || text("Tên của bé", "Child's name")}</b><p className="mt-1 text-sm font-semibold text-orange-500 dark:text-orange-400">{text("Lớp 2", "Grade 2")}</p></div></div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{text("Tên hoặc biệt danh của bé", "Child's name or nickname")}</label>
                <input autoFocus value={childName} onChange={(e) => setChildName(e.target.value)} placeholder={text("Ví dụ: Tí, Na, Cà Chua...", "For example: Alex, Mia...")} className="mb-5 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100/70 dark:border-slate-600 dark:bg-slate-800/55 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-orange-400 dark:focus:ring-orange-500/15" />
                <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">{text("Chọn avatar", "Choose an avatar")}</p>
                <div className="grid grid-cols-4 gap-3">{AVATARS.map((avatar, index) => <button key={avatar.en} onClick={() => setAvatarIndex(index)} className={`relative rounded-2xl border-2 p-2 transition ${avatarIndex === index ? "border-orange-400 bg-orange-50 dark:border-orange-400 dark:bg-orange-500/10" : "border-slate-100 dark:border-slate-600 dark:bg-slate-800/35 dark:hover:border-slate-500 dark:hover:bg-slate-800/70"}`}><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl text-2xl" style={{ backgroundColor: avatar.bg }}>{avatar.emoji}</span><small className="mt-1 block truncate text-[10px] font-bold text-slate-500 dark:text-slate-300">{lang === "vi" ? avatar.vi : avatar.en}</small></button>)}</div>
                <button onClick={() => childName.trim() && setStep(3)} disabled={!childName.trim()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3.5 font-extrabold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400">{text("Tiếp tục", "Continue")}<ArrowRight size={18} /></button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="survey" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Back onClick={() => setStep(2)} label={text("Quay lại", "Back")} />
                <div className="text-center"><h2 className="text-2xl font-black text-slate-800 dark:text-white">{text("Một câu hỏi nhỏ thôi!", "Just one quick question!")}</h2><p className="mb-6 mt-1 text-sm text-slate-400">{text("Ba mẹ đang gặp khó khăn gì khi kèm con học Toán?", "What challenges do you face when helping your child learn Math?")}</p></div>
                <div className="space-y-3">{SURVEYS.map((item) => { const active = survey.includes(item.id); return <button key={item.id} onClick={() => setSurvey((old) => active ? old.filter((id) => id !== item.id) : [...old, item.id])} className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${active ? "border-orange-400 bg-orange-50 dark:border-orange-400 dark:bg-orange-500/10" : "border-slate-200 dark:border-slate-600 dark:bg-slate-800/35 dark:hover:border-slate-500"}`}><span className="text-2xl">{item.emoji}</span><b className="flex-1 text-sm text-slate-700 dark:text-slate-100">{lang === "vi" ? item.vi : item.en}</b><span className={`grid h-6 w-6 place-items-center rounded-lg border-2 ${active ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 dark:border-slate-500"}`}>{active && <Check size={14} />}</span></button>; })}</div>
                <div className="mt-6 flex gap-3"><button onClick={finish} disabled={loading} className="flex-1 rounded-2xl border-2 border-slate-200 py-3.5 text-sm font-bold text-slate-500 dark:border-slate-700">{text("Bỏ qua", "Skip")}</button><button onClick={finish} disabled={loading} className="flex-[2] rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">{loading ? text("Đang xử lý...", "Processing...") : text("Bắt đầu học ngay! 🚀", "Start learning now! 🚀")}</button></div>
              </motion.div>
            )}
          </div>
        </section>
      </motion.div>
    </AuthLayout>
  );
}

function Field({ icon, error, children }: { icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return <div><div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">{icon}</span>{children}</div>{error && <p className="ml-1 mt-1 text-xs font-semibold text-red-500">{error}</p>}</div>;
}

function EyeButton({ shown, onClick }: { shown: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{shown ? <EyeOff size={17} /> : <Eye size={17} />}</button>;
}

function Back({ onClick, label }: { onClick: () => void; label: string }) {
  return <button onClick={onClick} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-orange-500"><ArrowLeft size={16} /> {label}</button>;
}

function GoogleLabel({ lang }: { lang: "vi" | "en" }) {
  return <span className="google-auth-visible-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59A14.2 14.2 0 0 1 9.77 24c0-1.6.27-3.14.76-4.59l-7.98-6.19A24 24 0 0 0 0 24c0 3.88.92 7.54 2.56 10.78z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg><span>{lang === "vi" ? "Đăng nhập với Google" : "Continue with Google"}</span></span>;
}
