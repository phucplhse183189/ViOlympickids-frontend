import { useState } from "react";

interface LoginErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function useLoginForm() {
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
    // TODO: implement login API call
    setTimeout(() => setIsLoading(false), 1500);
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
