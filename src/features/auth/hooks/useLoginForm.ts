import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/auth";
import * as authService from "@/features/auth/api/authService";

const ADMIN_SESSION_KEY = "vio_admin_session";

interface LoginErrors {
  identifier?: string;
  password?: string;
  general?: string;
}

function validatePhone(phone: string): boolean {
  return /^(0[35789])[0-9]{8}$/.test(phone);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeIdentifier(value: string): string {
  const trimmed = value.trim();
  return trimmed.includes("@") ? trimmed.toLocaleLowerCase() : trimmed.replace(/\D/g, "");
}

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (fields = { identifier, password }): LoginErrors => {
    const e: LoginErrors = {};
    const value = fields.identifier.trim();
    if (!value) {
      e.identifier = "Vui lòng nhập email hoặc số điện thoại.";
    } else if (value.includes("@") ? !validateEmail(value) : !validatePhone(value.replace(/\D/g, ""))) {
      e.identifier = value.includes("@") ? "Email không đúng định dạng." : "Số điện thoại không đúng định dạng.";
    }
    if (!fields.password) {
      e.password = "Vui lòng nhập mật khẩu.";
    } else if (fields.password.length < 6) {
      e.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ identifier: true, password: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const normalizedIdentifier = normalizeIdentifier(identifier);
    setIsLoading(true);

    authService
      .login(normalizedIdentifier, password)
      .then((user: any) => {
        if (user.role === "admin") {
          sessionStorage.setItem(
            ADMIN_SESSION_KEY,
            JSON.stringify({
              username: user.phone,
              displayName: user.name,
              role: user.role,
              loggedInAt: new Date().toISOString(),
            }),
          );
          navigate("/admin");
        } else {
          login({
            nickname: user.name,
            email: user.email || user.phone,
            avatarId: user.avatarInitials || "panda",
            tier: "free",
          });
          // Lưu parentId để dùng sau (trong API Client hoặc các context khác)
          sessionStorage.setItem("vio_parent_id", user.id);
          
          // Điều hướng ngay; ActiveChildProvider sẽ tải hồ sơ ở trang đích.
          navigate("/profile-picker");
        }
      })
      .catch((_: any) => {
        setErrors({ general: "Email, số điện thoại hoặc mật khẩu không đúng." });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    errors,
    touched,
    handleBlur,
    isLoading,
    handleSubmit,
  };
}
