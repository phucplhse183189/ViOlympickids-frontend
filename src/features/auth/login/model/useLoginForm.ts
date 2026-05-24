import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/lib/auth";
import { useActiveChild } from "@/shared/lib/activeChild";
import * as authService from "@/shared/api/services/authService";

const ADMIN_SESSION_KEY = "vio_admin_session";

interface LoginErrors {
  phone?: string;
  password?: string;
  general?: string;
}

function validatePhone(phone: string): boolean {
  return /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { refreshProfiles } = useActiveChild();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (fields = { phone, password }): LoginErrors => {
    const e: LoginErrors = {};
    if (!fields.phone.trim()) {
      e.phone = "Vui lòng nhập số điện thoại.";
    } else if (!validatePhone(fields.phone)) {
      e.phone = "Số điện thoại không đúng định dạng.";
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
    setTouched({ phone: true, password: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const normalizedPhone = normalizePhone(phone);
    setIsLoading(true);

    authService
      .login(normalizedPhone, password)
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
            email: user.phone,
            avatarId: user.avatarInitials || "panda",
            tier: "free",
          });
          // Lưu parentId để dùng sau (trong API Client hoặc các context khác)
          sessionStorage.setItem("vio_parent_id", user.id);
          
          if (refreshProfiles) {
            refreshProfiles().then(() => navigate("/profile-picker"));
          } else {
            navigate("/profile-picker");
          }
        }
      })
      .catch((_: any) => {
        setErrors({ general: "Số điện thoại hoặc mật khẩu không đúng." });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return {
    phone,
    setPhone,
    password,
    setPassword,
    errors,
    touched,
    handleBlur,
    isLoading,
    handleSubmit,
  };
}
