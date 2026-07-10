import { useRef, useState, useEffect } from "react";
import { Camera, Check, Pencil, X, Loader2, Lock } from "lucide-react";
import { useAuth, PARENT_PIN_KEY, DEFAULT_PARENT_PIN } from "@/features/auth/context/auth";
import { apiGet, apiPut } from "@/shared/api/client";
import type { UserInfo } from "@/features/auth/api/authService";

// ── Local state shape for the profile form ────────────────────
interface ParentProfileForm {
  name: string;
  phone: string;
  email: string;
  avatarUrl: string | null; // data-URL from upload or existing URL
}

// ── Avatar display ─────────────────────────────────────────────
function AvatarDisplay({
  avatarUrl,
  initials,
  onUpload,
}: {
  avatarUrl: string | null;
  initials: string;
  onUpload: (dataUrl: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") onUpload(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative group w-24 h-24 shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
        />
      ) : (
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white shadow-lg"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          {initials}
        </div>
      )}

      {/* Upload overlay on hover */}
      <button
        onClick={() => fileRef.current?.click()}
        className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        title="Thay ảnh đại diện"
      >
        <Camera size={20} className="text-white" />
        <span className="text-white text-[10px] font-bold mt-0.5">Đổi ảnh</span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Camera badge */}
      <div
        className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow"
        style={{ backgroundColor: "var(--brand-primary)" }}
      >
        <Camera size={13} className="text-white" />
      </div>
    </div>
  );
}

// ── Editable field ─────────────────────────────────────────────
function EditableField({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function confirm() {
    onChange(draft.trim() || value);
    setEditing(false);
  }
  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type={type}
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirm();
              if (e.key === "Escape") cancel();
            }}
            className="flex-1 px-3 py-2 rounded-xl border-2 border-orange-300 focus:border-orange-400 outline-none text-sm font-semibold text-gray-800 bg-orange-50 transition"
          />
          <button
            onClick={confirm}
            className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition shrink-0"
          >
            <Check size={14} strokeWidth={3} />
          </button>
          <button
            onClick={cancel}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 group">
          <span className="text-sm font-semibold text-gray-700 truncate">
            {value || (
              <span className="text-gray-300 font-normal">{placeholder}</span>
            )}
          </span>
          <button
            onClick={() => {
              setDraft(value);
              setEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 shrink-0"
          >
            <Pencil size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Change PIN ─────────────────────────────────────────────
function ChangePinCard() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChangePin() {
    setError(null);
    setSuccess(false);

    const savedPin = localStorage.getItem(PARENT_PIN_KEY) || DEFAULT_PARENT_PIN;

    if (currentPin !== savedPin) {
      setError("⚠️ Mã PIN hiện tại không đúng.");
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setError("⚠️ Mã PIN mới phải gồm 4 chữ số.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("⚠️ Mã PIN xác nhận không khớp.");
      return;
    }

    localStorage.setItem(PARENT_PIN_KEY, newPin);
    setSuccess(true);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
          <Lock size={16} className="text-orange-500" />
        </div>
        <h2 className="text-sm font-bold text-gray-600">Bảo mật Góc Phụ Huynh</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mã PIN hiện tại</label>
          <input
            type="password"
            maxLength={4}
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-semibold text-gray-800 transition bg-gray-50 focus:bg-white"
            placeholder="Nhập mã PIN 4 số hiện tại..."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mã PIN mới</label>
          <input
            type="password"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-semibold text-gray-800 transition bg-gray-50 focus:bg-white"
            placeholder="Nhập mã PIN 4 số mới..."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Xác nhận mã PIN mới</label>
          <input
            type="password"
            maxLength={4}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 outline-none text-sm font-semibold text-gray-800 transition bg-gray-50 focus:bg-white"
            placeholder="Nhập lại mã PIN mới..."
          />
        </div>

        {error && <p className="text-sm text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>}
        {success && <p className="text-sm text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1"><Check size={16} /> Đổi mã PIN thành công!</p>}

        <div className="pt-2">
          <button
            onClick={handleChangePin}
            disabled={!currentPin || !newPin || !confirmPin}
            className="px-5 py-2.5 bg-gray-100 text-gray-600 font-extrabold text-sm rounded-xl hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cập nhật mã PIN
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────
export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<ParentProfileForm>({
    name: user?.nickname ?? "Phụ Huynh",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    avatarUrl: null,
  });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load profile from API on mount
  useEffect(() => {
    const parentId = sessionStorage.getItem("vio_parent_id");
    if (!parentId) {
      setIsLoadingProfile(false);
      return;
    }

    apiGet<UserInfo>(`/parent/profile?id=${parentId}`)
      .then((profile) => {
        setForm({
          name: profile.name || user?.nickname || "Phụ Huynh",
          phone: profile.phone?.startsWith("g_") ? "" : (profile.phone || user?.phone || ""),
          email: profile.email || user?.email || "",
          avatarUrl: profile.avatarId || null,
        });
        setLoadError(null);
      })
      .catch((err) => {
        console.error("Load profile failed:", err);
        setLoadError("Không thể tải thông tin hồ sơ. Đang dùng dữ liệu cục bộ.");
      })
      .finally(() => setIsLoadingProfile(false));
  }, []);

  function update(field: keyof ParentProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setSaveError(null);
  }

  function handleSave() {
    const parentId = sessionStorage.getItem("vio_parent_id");
    if (!parentId) {
      // Fallback: chỉ cập nhật local context
      updateUser({ nickname: form.name, email: form.email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    // Prepare payload
    const payload: Record<string, string> = { id: parentId };
    if (form.name) payload.name = form.name.trim();
    if (form.phone) payload.phone = form.phone.trim();
    if (form.email !== undefined) payload.email = form.email.trim();
    if (form.avatarUrl && form.avatarUrl.startsWith("data:")) {
      // Gửi avatar data URL — backend sẽ lưu vào avatarId
      payload.avatarId = form.avatarUrl;
    }

    apiPut<UserInfo>("/parent/profile", payload)
      .then((updatedProfile) => {
        // Sync to auth context so other pages see the updated info
        updateUser({
          nickname: updatedProfile.name,
          email: updatedProfile.email || "",
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      })
      .catch((err) => {
        console.error("Save profile failed:", err);
        setSaveError(
          err?.message || "Lưu thất bại. Vui lòng thử lại."
        );
      })
      .finally(() => setIsSaving(false));
  }

  const initials = form.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  if (isLoadingProfile) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm font-medium">Đang tải hồ sơ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-extrabold text-gray-800">Hồ sơ của tôi</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Quản lý thông tin cá nhân và ảnh đại diện
        </p>
      </div>

      {/* Load error notice */}
      {loadError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2">
          <span>⚠️</span> {loadError}
        </div>
      )}

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-600 mb-4">Ảnh đại diện</h2>

        <div className="flex items-center gap-6">
          <AvatarDisplay
            avatarUrl={form.avatarUrl}
            initials={initials}
            onUpload={(url) => update("avatarUrl", url)}
          />

          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Tải ảnh lên
            </p>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Hỗ trợ JPG, PNG, WEBP. Tối đa 5 MB.
              <br />
              Ảnh sẽ được hiển thị trên toàn bộ hệ thống.
            </p>
            <button
              onClick={() =>
                document
                  .querySelector<HTMLInputElement>('input[type="file"]')
                  ?.click()
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-orange-300 text-orange-500 text-sm font-bold hover:bg-orange-50 transition"
            >
              <Camera size={15} />
              Chọn ảnh từ thiết bị
            </button>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-600">Thông tin cá nhân</h2>

        <EditableField
          label="Họ và tên"
          value={form.name}
          placeholder="Nhập họ và tên..."
          onChange={(v) => update("name", v)}
        />
        <EditableField
          label="Số điện thoại"
          value={form.phone}
          placeholder="VD: 0901 234 567"
          type="tel"
          onChange={(v) => update("phone", v)}
        />
        <EditableField
          label="Email"
          value={form.email}
          placeholder="VD: email@example.com"
          type="email"
          onChange={(v) => update("email", v)}
        />

        {/* Role badge – read only */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Vai trò
          </label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold text-white"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              Phụ huynh
            </span>
            <span className="text-xs text-gray-400">
              Tài khoản quản lý học sinh
            </span>
          </div>
        </div>
      </div>

      {/* Security (Change PIN) card */}
      <ChangePinCard />

      {/* Save error */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2">
          <span>❌</span> {saveError}
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-extrabold text-white transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-primary), #fb923c)",
            boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
          }}
        >
          {isSaving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Đang lưu...
            </>
          ) : saved ? (
            <>
              <Check size={15} strokeWidth={3} />
              Đã lưu!
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </button>
      </div>
    </div>
  );
}
