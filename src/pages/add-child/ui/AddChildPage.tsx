import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { childrenService } from "@/shared/api/services/childrenService";

// ── Avatar options ─────────────────────────────────────────────
const AVATAR_OPTIONS = [
  { emoji: "🐻", bg: "#a78bfa", label: "Gấu tím" },
  { emoji: "🐶", bg: "#34d399", label: "Cún xanh" },
  { emoji: "🐸", bg: "#f59e0b", label: "Ếch vàng" },
  { emoji: "🦊", bg: "#f97316", label: "Cáo cam" },
  { emoji: "🐱", bg: "#3b82f6", label: "Mèo xanh" },
  { emoji: "🐼", bg: "#6b7280", label: "Gấu trúc" },
];

export function AddChildPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const chosen = AVATAR_OPTIONS[selectedAvatar];
  const canSave = name.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;
    
    const parentId = sessionStorage.getItem("vio_parent_id");
    if (!parentId) {
      alert("Lỗi: Không tìm thấy ID phụ huynh!");
      return;
    }
    
    setSaving(true);
    try {
      await childrenService.addChild(parentId, {
        name: name.trim(),
        grade: "Lớp 2",
        avatarEmoji: chosen.emoji,
        avatarBg: chosen.bg,
        plan: "FREE",
      });
      
      setDone(true);
      setTimeout(() => navigate("/profile-picker"), 1200);
    } catch (error) {
      console.error("Failed to add child", error);
      alert("Đã xảy ra lỗi khi tạo hồ sơ. Vui lòng thử lại.");
      setSaving(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #fff7ed 0%, #fef3c7 50%, #ecfdf5 100%)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/profile-picker")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/robot-head.png"
            alt="ViOlympicKids"
            className="w-7 h-7 object-contain"
          />
          <span className="text-sm font-extrabold">
            <span className="text-blue-500">ViOlympic</span>
            <span style={{ color: "var(--brand-primary)" }}>Kids</span>
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          {/* ── Left: Hero ── */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {/* Big avatar preview */}
            <div
              className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mb-6 shadow-lg transition-all duration-300"
              style={{ backgroundColor: chosen.bg }}
            >
              {chosen.emoji}
            </div>

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "white",
              }}
            >
              <span>📚</span>
              Toán Học · Lớp 2
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight mb-3">
              Tạo hồ sơ
              <br />
              <span style={{ color: "var(--brand-primary)" }}>
                cho bé yêu
              </span>{" "}
              🎉
            </h1>

            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Chỉ mất <strong>30 giây</strong> để thiết lập! Bé sẽ có ngay hành
              trình học Toán Lớp 2 thú vị, với bài học 3D và phần thưởng đang
              chờ phía trước.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-5 justify-center md:justify-start">
              {[
                "🧩 200+ bài học 3D",
                "🤖 AI hướng dẫn",
                "🏆 Hệ thống phần thưởng",
                "📊 Báo cáo chi tiết",
              ].map((f) => (
                <span
                  key={f}
                  className="text-xs bg-white/80 border border-white shadow-sm px-3 py-1 rounded-full text-gray-600 font-medium"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: Form card ── */}
          <div className="bg-white rounded-3xl shadow-xl p-7 border border-white/60">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                1
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Thông tin cơ bản
              </span>
            </div>

            {/* Name input */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên của bé là gì? 👋
              </label>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                placeholder="VD: Bé Na, Bé Bin, Tom..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 text-sm text-gray-800 font-semibold outline-none focus:ring-0 focus:border-orange-400 transition-colors placeholder:font-normal placeholder:text-gray-300"
              />
            </div>

            {/* Grade locked badge */}
            <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-orange-50 rounded-2xl border border-orange-100">
              <span className="text-xl">📚</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Chương trình học
                </p>
                <p className="text-sm font-extrabold text-gray-800">
                  Toán Học Lớp 2 — ViOlympicKids
                </p>
              </div>
              <span
                className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "white",
                }}
              >
                Lớp 2
              </span>
            </div>

            {/* Avatar picker */}
            <div className="mb-7">
              <p className="text-sm font-bold text-gray-700 mb-3">
                Chọn avatar cho bé 🎨
              </p>
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_OPTIONS.map((av, i) => (
                  <button
                    key={av.label}
                    onClick={() => setSelectedAvatar(i)}
                    className={`relative flex flex-col items-center gap-2 py-3.5 rounded-2xl border-2 transition-all duration-200 ${
                      selectedAvatar === i
                        ? "border-orange-400 bg-orange-50 shadow-md scale-[1.04]"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm"
                      style={{ backgroundColor: av.bg }}
                    >
                      {av.emoji}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500">
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

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="w-full py-4 rounded-2xl text-sm font-extrabold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: canSave
                  ? "linear-gradient(135deg, var(--brand-primary), #fb923c)"
                  : "#e5e7eb",
                color: canSave ? "white" : "#9ca3af",
                boxShadow: canSave
                  ? "0 6px 20px rgba(249,115,22,0.35)"
                  : "none",
              }}
            >
              {done ? (
                <>
                  <Check size={16} strokeWidth={3} />
                  Đã tạo hồ sơ thành công!
                </>
              ) : saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  🚀 Bắt đầu hành trình học tập
                  {name.trim() ? ` cho ${name.trim()}!` : ""}
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-400 mt-3">
              Bạn có thể thêm nhiều hồ sơ bé sau này trong phần cài đặt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
