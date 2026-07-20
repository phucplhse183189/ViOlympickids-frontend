import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, Phone, Sparkles, User } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useAuth } from "@/features/auth/context/auth";
import * as authService from "@/features/auth/api/authService";
import * as childrenService from "@/features/dashboard/api/childrenService";
import { useThemeStore } from "@/shared/stores/themeStore";

const AVATARS = [
  { emoji: "🚀", bg: "#6366f1", label: "Phi hành gia" },
  { emoji: "🤖", bg: "#3b82f6", label: "Rô-bốt AI" },
  { emoji: "🦊", bg: "#f97316", label: "Cáo thông minh" },
  { emoji: "🐼", bg: "#64748b", label: "Gấu trúc" },
  { emoji: "🦁", bg: "#eab308", label: "Sư tử" },
  { emoji: "🐸", bg: "#22c55e", label: "Ếch xanh" },
  { emoji: "🦄", bg: "#d946ef", label: "Kỳ lân" },
  { emoji: "🐲", bg: "#ef4444", label: "Rồng lửa" },
];

const SURVEYS = [
  { id: "focus", emoji: "🧠", label: "Bé hay mất tập trung khi học" },
  { id: "time", emoji: "⏰", label: "Ba mẹ không có nhiều thời gian kèm con" },
  { id: "progress", emoji: "📊", label: "Khó đánh giá sự tiến bộ của con" },
  { id: "boring", emoji: "📚", label: "Con thấy cách học hiện tại nhàm chán" },
];

type Errors = Record<string, string>;

export function RegisterPage() {
  const navigate = useNavigate();
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

  const strength = useMemo(() => {
    let value = 0;
    if (password.length >= 6) value++;
    if (password.length >= 8) value++;
    if (/[A-Z0-9]/.test(password)) value++;
    if (/[^A-Za-z0-9]/.test(password)) value++;
    return value;
  }, [password]);

  function validateAccount() {
    const next: Errors = {};
    if (!parentName.trim()) next.parentName = "Vui lòng nhập họ và tên";
    if (!phone.trim()) next.phone = "Vui lòng nhập số điện thoại";
    else if (!/^(0[35789])[0-9]{8}$/.test(phone)) next.phone = "Số điện thoại không đúng định dạng";
    if (password.length < 6) next.password = "Mật khẩu cần ít nhất 6 ký tự";
    if (confirmPassword !== password) next.confirmPassword = "Mật khẩu xác nhận không khớp";
    if (!agreed) next.agreed = "Vui lòng đồng ý điều khoản";
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
      .catch((error: any) => setErrors({ phone: error?.message || "Đăng ký thất bại. Vui lòng thử lại." }))
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
      .catch(() => alert("Đăng nhập Google thất bại. Vui lòng thử lại."))
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
    }).catch(() => alert("Tạo hồ sơ bé thất bại. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  }

  const fieldClass = "w-full rounded-2xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100/70 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-orange-900/30";

  return (
    <AuthLayout className="h-dvh overflow-hidden" contentClassName="h-dvh min-h-0 overflow-hidden pb-4 pt-20">
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="auth-surface mx-3 flex h-[calc(100dvh-6rem)] min-h-0 w-full max-w-6xl overflow-hidden rounded-[36px] border-4 border-white bg-white/90 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
        <aside className="relative hidden w-[39%] shrink-0 flex-col items-center justify-center overflow-hidden border-r border-slate-200 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-8 text-center dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 md:flex">
          <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-blue-300/25 blur-3xl" />
          <div className="absolute bottom-10 right-4 h-32 w-32 rounded-full bg-orange-300/25 blur-3xl" />
          <motion.div animate={reduceMotion ? undefined : { y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }} className="relative">
            <img src="/logo.png" alt="ViOlympicKids" className="h-64 w-64 object-contain drop-shadow-xl lg:h-72 lg:w-72" />
            <span className="absolute -right-7 top-3 rotate-6 rounded-2xl border-2 border-blue-200 bg-white px-4 py-2 text-sm font-extrabold text-blue-500 shadow-lg dark:border-blue-800 dark:bg-slate-800">Sẵn sàng học vui! 🚀</span>
          </motion.div>
          <h1 className="gradient-text text-4xl font-black">ViOlympicKids</h1>
          <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">Một tài khoản phụ huynh, cả hành trình học tập đầy cảm hứng cho con.</p>
          <div className="mt-7 flex items-center gap-3">
            {[1, 2, 3].map((item) => <span key={item} className={`h-2.5 rounded-full transition-all ${step === item ? "w-9 bg-orange-500" : "w-2.5 bg-slate-300 dark:bg-slate-600"}`} />)}
          </div>
        </aside>

        <section className="register-form-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-5 py-7 sm:px-9 lg:px-12">
            <div className="mb-6 flex items-center justify-center gap-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${item < step ? "bg-emerald-500 text-white" : item === step ? "bg-orange-500 text-white shadow-lg shadow-orange-200/60" : "bg-slate-100 text-slate-400 dark:bg-slate-800"}`}>{item < step ? <Check size={14} /> : item}</span>
                  {item < 3 && <span className={`h-0.5 w-8 rounded-full sm:w-12 ${item < step ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <motion.div key="account" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-center text-2xl font-black text-slate-800 dark:text-white">Tạo tài khoản phụ huynh</h2>
                <p className="mb-5 mt-1 text-center text-sm text-slate-400">Chỉ vài bước để bắt đầu hành trình cùng con ✨</p>
                <div className="space-y-3">
                  <Field icon={<User size={17} />} error={errors.parentName}><input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Họ và tên phụ huynh" className={fieldClass} /></Field>
                  <Field icon={<Phone size={17} />} error={errors.phone}><input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} maxLength={10} inputMode="numeric" placeholder="Số điện thoại" className={fieldClass} /></Field>
                  <Field icon={<Lock size={17} />} error={errors.password}><input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Mật khẩu (ít nhất 6 ký tự)" className={`${fieldClass} pr-12`} /><EyeButton shown={showPassword} onClick={() => setShowPassword(!showPassword)} /></Field>
                  {password && <div className="flex gap-1.5 px-1">{[1, 2, 3, 4].map((item) => <span key={item} className={`h-1 flex-1 rounded-full ${item <= strength ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700"}`} />)}</div>}
                  <Field icon={<Lock size={17} />} error={errors.confirmPassword}><input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirm ? "text" : "password"} placeholder="Xác nhận mật khẩu" className={`${fieldClass} pr-12`} /><EyeButton shown={showConfirm} onClick={() => setShowConfirm(!showConfirm)} /></Field>
                </div>
                <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-500"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-orange-500" /><span>Tôi đồng ý với <b className="text-blue-600">Điều khoản dịch vụ</b> và <b className="text-blue-600">Chính sách bảo mật</b>.</span></label>
                {errors.agreed && <p className="mt-1 text-xs font-semibold text-red-500">{errors.agreed}</p>}
                <button onClick={createAccount} disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3.5 font-extrabold text-white shadow-lg shadow-orange-200/50 transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? "Đang xử lý..." : "Tạo tài khoản"}<ArrowRight size={18} /></button>
                <div className="my-4 flex items-center gap-3 text-xs font-semibold text-slate-400"><span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />Hoặc tiếp tục với<span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" /></div>
                <div className="google-auth-shell google-auth-icon mx-auto leading-none">
                  <GoogleLogin onSuccess={(response) => response.credential && googleLogin(response.credential)} onError={() => alert("Đăng nhập Google thất bại.")} type="standard" theme={darkGoogleButton ? "filled_black" : "outline"} shape="pill" size="large" width="220" />
                  <GoogleLabel />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="child" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Back onClick={() => setStep(1)} />
                <h2 className="text-center text-2xl font-black text-slate-800 dark:text-white">Tạo góc học tập cho bé</h2>
                <p className="mb-6 mt-1 text-center text-sm text-slate-400">Chọn tên và nhân vật bé yêu thích</p>
                <div className="mb-5 flex items-center gap-4 rounded-3xl bg-orange-50 p-4 dark:bg-orange-950/20"><span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border-4 border-white text-4xl shadow-md" style={{ backgroundColor: AVATARS[avatarIndex].bg }}>{AVATARS[avatarIndex].emoji}</span><div><b className="text-lg text-slate-800 dark:text-white">{childName || "Tên của bé"}</b><p className="mt-1 text-sm font-semibold text-orange-500">Lớp 2</p></div></div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Tên hoặc biệt danh của bé</label>
                <input autoFocus value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Ví dụ: Tí, Na, Cà Chua..." className="mb-5 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-950" />
                <p className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">Chọn avatar</p>
                <div className="grid grid-cols-4 gap-3">{AVATARS.map((avatar, index) => <button key={avatar.label} onClick={() => setAvatarIndex(index)} className={`relative rounded-2xl border-2 p-2 transition ${avatarIndex === index ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" : "border-slate-100 dark:border-slate-700"}`}><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl text-2xl" style={{ backgroundColor: avatar.bg }}>{avatar.emoji}</span><small className="mt-1 block truncate text-[10px] font-bold text-slate-500">{avatar.label}</small></button>)}</div>
                <button onClick={() => childName.trim() && setStep(3)} disabled={!childName.trim()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3.5 font-extrabold text-white disabled:opacity-40">Tiếp tục<ArrowRight size={18} /></button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="survey" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Back onClick={() => setStep(2)} />
                <div className="text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-3xl">💬</span><h2 className="mt-4 text-2xl font-black text-slate-800 dark:text-white">Một câu hỏi nhỏ thôi!</h2><p className="mb-6 mt-1 text-sm text-slate-400">Ba mẹ đang gặp khó khăn gì khi kèm con học Toán?</p></div>
                <div className="space-y-3">{SURVEYS.map((item) => { const active = survey.includes(item.id); return <button key={item.id} onClick={() => setSurvey((old) => active ? old.filter((id) => id !== item.id) : [...old, item.id])} className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition ${active ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" : "border-slate-200 dark:border-slate-700"}`}><span className="text-2xl">{item.emoji}</span><b className="flex-1 text-sm text-slate-700 dark:text-slate-200">{item.label}</b><span className={`grid h-6 w-6 place-items-center rounded-lg border-2 ${active ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300"}`}>{active && <Check size={14} />}</span></button>; })}</div>
                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-xs leading-5 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"><Sparkles size={17} className="mt-0.5 shrink-0" />Thông tin này giúp hệ thống gợi ý lộ trình phù hợp hơn cho bé.</div>
                <div className="mt-6 flex gap-3"><button onClick={finish} disabled={loading} className="flex-1 rounded-2xl border-2 border-slate-200 py-3.5 text-sm font-bold text-slate-500 dark:border-slate-700">Bỏ qua</button><button onClick={finish} disabled={loading} className="flex-[2] rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">{loading ? "Đang xử lý..." : "Bắt đầu học ngay! 🚀"}</button></div>
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

function Back({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-orange-500"><ArrowLeft size={16} /> Quay lại</button>;
}

function GoogleLabel() {
  return <span className="google-auth-visible-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59A14.2 14.2 0 0 1 9.77 24c0-1.6.27-3.14.76-4.59l-7.98-6.19A24 24 0 0 0 0 24c0 3.88.92 7.54 2.56 10.78z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg><span>Đăng nhập với Google</span></span>;
}
