import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/lib/auth";

// Single parent account – all roles handled via profile picker
const MOCK_ACCOUNT = {
  email: "demo@violympickids.com",
  password: "demo123",
  nickname: "Phụ Huynh",
  avatarId: "panda",
};

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (fields = { email, password }): LoginErrors => {
    const e: LoginErrors = {};
    if (!fields.email.trim()) {
      e.email = "Vui lòng nhập email.";
    } else if (!validateEmail(fields.email)) {
      e.email = "Email không đúng định dạng.";
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
    setTouched({ email: true, password: true });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsLoading(true);
    setTimeout(() => {
      if (email === MOCK_ACCOUNT.email && password === MOCK_ACCOUNT.password) {
        login({
          nickname: MOCK_ACCOUNT.nickname,
          email: MOCK_ACCOUNT.email,
          avatarId: MOCK_ACCOUNT.avatarId,
        });
        // Single account → profile picker ("Ai đang sử dụng?")
        navigate("/profile-picker");
      } else {
        setErrors({ general: "Email hoặc mật khẩu không đúng." });
        setIsLoading(false);
      }
    }, 1000);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    touched,
    handleBlur,
    isLoading,
    handleSubmit,
  };
}
