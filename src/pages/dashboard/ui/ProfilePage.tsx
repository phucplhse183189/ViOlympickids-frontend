import { useRef, useState } from "react";
import { Camera, Check, Pencil, X } from "lucide-react";
import { MOCK_PARENT_PROFILE } from "@/shared/api/dashboardMockData";
import { useAuth } from "@/shared/lib/auth";

// ── Local state shape for the profile form ────────────────────
interface ParentProfileForm {
  name: string;
  phone: string;
  email: string;
  avatarUrl: string | null; // data-URL from upload
}

const INITIAL: ParentProfileForm = {
  name: MOCK_PARENT_PROFILE.name,
  phone: "0901 234 567",
  email: "phhuynh@email.com",
  avatarUrl: null,
};

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

// ── Main page ──────────────────────────────────────────────────
export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState<ParentProfileForm>({
    ...INITIAL,
    name: user?.nickname ?? INITIAL.name,
    email: user?.email ?? INITIAL.email,
  });
  const [saved, setSaved] = useState(false);

  function update(field: keyof ParentProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave() {
    // Sync to auth context so other pages see the updated name/email
    updateUser({ nickname: form.name, email: form.email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-600 mb-4">Ảnh đại diện</h2>

        <div className="flex items-center gap-6">
          <AvatarDisplay
            avatarUrl={form.avatarUrl}
            initials={MOCK_PARENT_PROFILE.avatarInitials}
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

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-extrabold text-white transition-all duration-200 active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-primary), #fb923c)",
            boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
          }}
        >
          {saved ? (
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
