import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/shared/lib/auth";
import {
  CHILD_PROFILES_STORAGE_KEY,
  ACTIVE_CHILD_ID_KEY,
} from "@/shared/api/dashboardMockData";

// ── Avatar options (kid-friendly) ──────────────────────────────
const AVATAR_OPTIONS = [
  { emoji: "🚀", bg: "#6366f1", label: "Phi hành gia" },
  { emoji: "🤖", bg: "#3b82f6", label: "Rô bốt AI" },
  { emoji: "🦊", bg: "#f97316", label: "Cáo thông minh" },
  { emoji: "🐼", bg: "#6b7280", label: "Gấu trúc" },
  { emoji: "🦁", bg: "#eab308", label: "Sư tử dũng cảm" },
  { emoji: "🐸", bg: "#22c55e", label: "Ếch xanh" },
  { emoji: "🦄", bg: "#d946ef", label: "Kỳ lân" },
  { emoji: "🐲", bg: "#ef4444", label: "Rồng lửa" },
  { emoji: "🐬", bg: "#06b6d4", label: "Cá heo" },
  { emoji: "🦋", bg: "#ec4899", label: "Bướm xinh" },
  { emoji: "🐻", bg: "#a78bfa", label: "Gấu tím" },
  { emoji: "🐧", bg: "#0ea5e9", label: "Chim cánh cụt" },
];

const GRADE_OPTIONS = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"];

const SURVEY_OPTIONS = [
  { id: "focus", label: "Bé hay mất tập trung khi học", emoji: "😵‍💫" },
  { id: "time", label: "Ba mẹ không có thời gian kèm con", emoji: "⏰" },
  { id: "progress", label: "Khó đánh giá sự tiến bộ của con", emoji: "📊" },
  { id: "boring", label: "Con thấy sách giáo khoa nhàm chán", emoji: "📖" },
];

// ── Main page ──────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Step 2 state
  const [childName, setChildName] = useState("");
  const [grade, setGrade] = useState("Lớp 2");
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  // Step 3 state
  const [selectedSurvey, setSelectedSurvey] = useState<string[]>([]);

  // ── Step 1 validation ───────────────────────────
  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Email không đúng định dạng";
    if (!password) errs.password = "Vui lòng nhập mật khẩu";
    else if (password.length < 6) errs.password = "Mật khẩu ít nhất 6 ký tự";
    if (!confirmPassword) errs.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (confirmPassword !== password) errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    if (!agreed) errs.agreed = "Vui lòng đồng ý điều khoản";
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleStep1Submit() {
    if (!validateStep1()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 800);
  }

  function handleSocialLogin(_provider: string) {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  }

  // ── Step 2 ──────────────────────────────────────
  function handleStep2Submit() {
    if (!childName.trim()) return;
    setStep(3);
  }

  // ── Step 3 (final) ─────────────────────────────
  function handleFinish() {
    const avatar = AVATAR_OPTIONS[selectedAvatar];
    const identifier = email;

    login({
      nickname: childName.trim() || "Phụ huynh",
      email: identifier,
      avatarId: "fox",
    });

    const childProfile = {
      id: `child-${Date.now()}`,
      name: childName.trim(),
      grade,
      avatarEmoji: avatar.emoji,
      avatarBg: avatar.bg,
      plan: "FREE" as const,
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem(CHILD_PROFILES_STORAGE_KEY) ?? "[]",
      );
      localStorage.setItem(
        CHILD_PROFILES_STORAGE_KEY,
        JSON.stringify([...existing, childProfile]),
      );
      localStorage.setItem(ACTIVE_CHILD_ID_KEY, childProfile.id);
    } catch {
      /* ignore */
    }

    if (selectedSurvey.length > 0) {
      localStorage.setItem("vio_parent_survey", JSON.stringify(selectedSurvey));
    }

    navigate("/profile-picker");
  }

  function toggleSurvey(id: string) {
    setSelectedSurvey((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto relative flex items-center justify-center py-6 px-4">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-gradient-x"
        style={{
          background:
            "linear-gradient(135deg, #dbeafe 0%, #fef9c3 25%, #d1fae5 50%, #fce7f3 75%, #e0e7ff 100%)",
          backgroundSize: "400% 400%",
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-12 left-[8%] w-20 h-20 rounded-full bg-yellow-300/25 animate-float-slow blur-sm" />
      <div
        className="absolute top-1/3 right-[5%] w-14 h-14 rounded-full bg-pink-300/25 animate-float-slow blur-sm"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute bottom-16 left-[12%] w-12 h-12 rounded-full bg-blue-300/25 animate-float-slow blur-sm"
        style={{ animationDelay: "0.8s" }}
      />
      <div className="absolute top-[10%] left-[20%] text-4xl opacity-10 animate-pulse select-none">
        ✨
      </div>
      <div
        className="absolute bottom-[15%] right-[10%] text-3xl opacity-10 animate-pulse select-none"
        style={{ animationDelay: "1s" }}
      >
        ⭐
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-5xl">
        {/* Logo header */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center">
            <img
              src="/robot-head.png"
              alt="ViOlympicKids"
              className="w-7 h-7 object-contain"
            />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-blue-500">ViOlympic</span>
            <span style={{ color: "var(--brand-primary)" }}>Kids</span>
          </span>
        </div>

        {/* ══════════════════════════════════════════
            Step 1: Tạo tài khoản phụ huynh
           ══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl border-2 border-white/80 overflow-hidden max-w-lg mx-auto">
              <div className="p-8 md:p-10">
                <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">
                  Tạo tài khoản phụ huynh
                </h2>

                {/* Input fields */}
                <div className="space-y-3">
                  {/* Email */}
                  <div>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setStep1Errors((p) => ({ ...p, email: "" }));
                        }}
                        placeholder="Nhập email của bạn"
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 text-sm font-medium outline-none transition-all ${
                          step1Errors.email
                            ? "border-red-300 bg-red-50 focus:border-red-400"
                            : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        }`}
                      />
                    </div>
                    {step1Errors.email && (
                      <p className="mt-1.5 ml-1 text-xs text-red-500 font-medium">
                        ⚠️ {step1Errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
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
                          setStep1Errors((p) => ({ ...p, password: "" }));
                        }}
                        placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                        className={`w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 text-sm font-medium outline-none transition-all ${
                          step1Errors.password
                            ? "border-red-300 bg-red-50 focus:border-red-400"
                            : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {step1Errors.password && (
                      <p className="mt-1.5 ml-1 text-xs text-red-500 font-medium">
                        ⚠️ {step1Errors.password}
                      </p>
                    )}
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
                          setStep1Errors((p) => ({ ...p, confirmPassword: "" }));
                        }}
                        placeholder="Xác nhận mật khẩu"
                        className={`w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 text-sm font-medium outline-none transition-all ${
                          step1Errors.confirmPassword
                            ? "border-red-300 bg-red-50 focus:border-red-400"
                            : "border-gray-200 bg-gray-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {step1Errors.confirmPassword && (
                      <p className="mt-1.5 ml-1 text-xs text-red-500 font-medium">
                        ⚠️ {step1Errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2.5 mt-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      setStep1Errors((p) => ({ ...p, agreed: "" }));
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-orange-500"
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Tôi đồng ý với{" "}
                    <span className="text-blue-600 hover:underline font-medium cursor-pointer">
                      Điều khoản dịch vụ
                    </span>{" "}
                    và{" "}
                    <span className="text-blue-600 hover:underline font-medium cursor-pointer">
                      Chính sách bảo mật
                    </span>{" "}
                    của ViOlympic Kids
                  </span>
                </label>
                {step1Errors.agreed && (
                  <p className="mt-1 ml-6 text-xs text-red-500 font-medium">
                    ⚠️ {step1Errors.agreed}
                  </p>
                )}

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={handleStep1Submit}
                  disabled={isLoading}
                  className="w-full mt-5 py-4 rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--brand-primary) 0%, #f97316 100%)",
                    boxShadow: "0 4px 15px rgba(249,115,22,0.35)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Tạo tài khoản phụ huynh
                      <ArrowRight size={18} strokeWidth={2.5} />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-400 text-xs font-medium">
                    hoặc tiếp tục với
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Google Login */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Tiếp tục với Google
                </button>

                {/* Login link */}
                <p className="mt-5 text-center text-sm text-gray-400">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="text-orange-500 hover:text-orange-600 font-bold transition-colors"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            Step 2: Thiết lập hồ sơ cho bé
           ══════════════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl border-2 border-white/80 p-8 md:p-10 max-w-2xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-4"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl mx-auto mb-4">
                🎉
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                Chào mừng ba mẹ!
              </h2>
              <p className="text-sm text-gray-400">
                Hãy tạo góc học tập cho con nhé
              </p>
            </div>

            {/* Avatar preview */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-lg transition-all duration-300 border-4 border-white"
                style={{
                  backgroundColor: AVATAR_OPTIONS[selectedAvatar].bg,
                }}
              >
                {AVATAR_OPTIONS[selectedAvatar].emoji}
              </div>
              <p className="text-sm font-semibold text-gray-500 mt-2">
                {childName.trim() || "Tên của bé"}
              </p>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full mt-1"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "white",
                }}
              >
                {grade}
              </span>
            </div>

            {/* Child name */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên / Biệt danh của bé 👋
              </label>
              <input
                autoFocus
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="VD: Tí, Na, Cà Chua..."
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:font-normal placeholder:text-gray-300"
              />
            </div>

            {/* Grade selector */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Khối lớp 📚
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 hover:border-orange-300 transition"
                >
                  <span>{grade}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${showGradeDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showGradeDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {GRADE_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setGrade(g);
                          setShowGradeDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-orange-50 transition ${
                          g === grade
                            ? "bg-orange-50 text-orange-600 font-bold"
                            : "text-gray-700"
                        }`}
                      >
                        {g}
                        {g === "Lớp 2" && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                            Đề xuất
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Avatar picker */}
            <div className="mb-7">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Chọn avatar cho bé 🎨
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((av, i) => (
                  <button
                    key={av.label}
                    type="button"
                    onClick={() => setSelectedAvatar(i)}
                    className={`relative flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all duration-200 ${
                      selectedAvatar === i
                        ? "border-orange-400 bg-orange-50 shadow-md scale-105"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: av.bg }}
                    >
                      {av.emoji}
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500 leading-tight text-center">
                      {av.label}
                    </span>
                    {selectedAvatar === i && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow">
                        <Check
                          size={11}
                          className="text-white"
                          strokeWidth={3}
                        />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStep2Submit}
              disabled={!childName.trim()}
              className="w-full py-4 rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              style={{
                background: childName.trim()
                  ? "linear-gradient(135deg, var(--brand-primary) 0%, #f97316 100%)"
                  : "#d1d5db",
                boxShadow: childName.trim()
                  ? "0 4px 15px rgba(249,115,22,0.35)"
                  : "none",
              }}
            >
              Tiếp tục
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            Step 3: Khảo sát ngắn
           ══════════════════════════════════════════ */}
        {step === 3 && (
          <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl border-2 border-white/80 p-8 md:p-10 max-w-2xl mx-auto">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-4"
            >
              <ArrowLeft size={16} /> Quay lại
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl mx-auto mb-4">
                💬
              </div>
              <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
                Một câu hỏi nhỏ thôi!
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
                Ba mẹ đang gặp khó khăn gì khi kèm con học Toán?
                <br />
                <span className="text-gray-300">
                  (Chọn tất cả phù hợp)
                </span>
              </p>
            </div>

            {/* Survey options */}
            <div className="space-y-3 mb-8">
              {SURVEY_OPTIONS.map((opt) => {
                const active = selectedSurvey.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSurvey(opt.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      active
                        ? "border-orange-400 bg-orange-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span
                      className={`text-sm font-semibold flex-1 ${
                        active ? "text-orange-700" : "text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        active
                          ? "bg-orange-500 border-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {active && (
                        <Check
                          size={14}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <Sparkles
                size={18}
                className="text-blue-500 shrink-0 mt-0.5"
              />
              <p className="text-xs text-blue-700 leading-relaxed">
                Dữ liệu này giúp AI đưa ra lời khuyên và lộ trình học phù hợp
                nhất cho <strong>{childName || "bé"}</strong>. Bạn có thể bỏ
                qua bước này.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
              >
                Bỏ qua
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-[2] py-3.5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-primary) 0%, #f97316 100%)",
                  boxShadow: "0 4px 15px rgba(249,115,22,0.35)",
                }}
              >
                Bắt đầu học ngay! 🚀
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-gray-400 text-xs">
          <span className="mx-2 cursor-pointer hover:text-gray-600 transition-colors">
            Chính sách bảo mật
          </span>
          {" • "}
          <span className="mx-2 cursor-pointer hover:text-gray-600 transition-colors">
            Điều khoản sử dụng
          </span>
        </div>
      </div>
    </div>
  );
}
