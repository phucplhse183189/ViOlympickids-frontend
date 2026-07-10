import { useState } from "react";

interface RegisterErrors {
  nickname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function useRegisterForm() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (
    fields = { nickname, email, password, confirmPassword },
  ): RegisterErrors => {
    const e: RegisterErrors = {};

    if (!fields.nickname.trim()) {
      e.nickname = "Vui lòng nhập biệt danh.";
    } else if (fields.nickname.trim().length < 3) {
      e.nickname = "Biệt danh phải có ít nhất 3 ký tự.";
    } else if (fields.nickname.trim().length > 20) {
      e.nickname = "Biệt danh không được quá 20 ký tự.";
    } else if (!/^[a-zA-Z0-9_\-À-ỹ ]+$/.test(fields.nickname)) {
      e.nickname = "Biệt danh không được chứa ký tự đặc biệt.";
    }

    if (!fields.email.trim()) {
      e.email = "Vui lòng nhập email.";
    } else if (!validateEmail(fields.email)) {
      e.email = "Email không đúng định dạng.";
    }

    if (!fields.password) {
      e.password = "Vui lòng nhập mật khẩu.";
    } else if (fields.password.length < 8) {
      e.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    } else if (!/[A-Z]/.test(fields.password)) {
      e.password = "Mật khẩu phải có ít nhất 1 chữ hoa.";
    } else if (!/[a-z]/.test(fields.password)) {
      e.password = "Mật khẩu phải có ít nhất 1 chữ thường.";
    } else if (!/[0-9]/.test(fields.password)) {
      e.password = "Mật khẩu phải có ít nhất 1 chữ số.";
    }

    if (!fields.confirmPassword) {
      e.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (fields.confirmPassword !== fields.password) {
      e.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    return e;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      nickname: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !agreed) return;
    setIsLoading(true);
    // TODO: implement register API call
    setTimeout(() => setIsLoading(false), 1500);
  };

  return {
    nickname,
    setNickname,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    agreed,
    setAgreed,
    errors,
    touched,
    handleBlur,
    isLoading,
    handleSubmit,
  };
}
