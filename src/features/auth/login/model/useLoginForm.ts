import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/lib/auth";

// Mock accounts for testing
const MOCK_ACCOUNT = {
  email: "demo@violympickids.com",
  password: "demo123",
  nickname: "DemoKid",
  avatarId: "fox",
};

const PARENT_ACCOUNT = {
  email: "parent@violympickids.com",
  password: "parent123",
  nickname: "Phụ Huynh",
  avatarId: "panda",
  role: "parent",
};

const STUDENT_ACCOUNT = {
  email: "student@violympickids.com",
  password: "student123",
  nickname: "Bé Cún",
  avatarId: "fox",
  role: "student",
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
        navigate("/");
      } else if (
        email === PARENT_ACCOUNT.email &&
        password === PARENT_ACCOUNT.password
      ) {
        login({
          nickname: PARENT_ACCOUNT.nickname,
          email: PARENT_ACCOUNT.email,
          avatarId: PARENT_ACCOUNT.avatarId,
        });
        navigate("/dashboard");
      } else if (
        email === STUDENT_ACCOUNT.email &&
        password === STUDENT_ACCOUNT.password
      ) {
        login({
          nickname: STUDENT_ACCOUNT.nickname,
          email: STUDENT_ACCOUNT.email,
          avatarId: STUDENT_ACCOUNT.avatarId,
        });
        navigate("/student");
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
