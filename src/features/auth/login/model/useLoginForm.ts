import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/lib/auth";

// Single parent account – all roles handled via profile picker
const MOCK_ACCOUNT = {
  phone: "0901234567",
  password: "demo123",
  nickname: "Phụ Huynh",
  avatarId: "panda",
};

interface LoginErrors {
  phone?: string;
  password?: string;
  general?: string;
}

function validatePhone(phone: string): boolean {
  return /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
}

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    setIsLoading(true);
    setTimeout(() => {
      if (phone === MOCK_ACCOUNT.phone && password === MOCK_ACCOUNT.password) {
        login({
          nickname: MOCK_ACCOUNT.nickname,
          email: MOCK_ACCOUNT.phone,
          avatarId: MOCK_ACCOUNT.avatarId,
          tier: "free",
        });
        navigate("/profile-picker");
      } else {
        setErrors({ general: "Số điện thoại hoặc mật khẩu không đúng." });
        setIsLoading(false);
      }
    }, 1000);
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
