import { useState, useRef, useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";
import { PARENT_PIN_KEY, DEFAULT_PARENT_PIN } from "@/shared/lib/auth";

interface ParentGateProps {
  onSuccess: () => void;
  onClose: () => void;
  onInteract?: () => void;
}

function getPin(): string {
  return localStorage.getItem(PARENT_PIN_KEY) || DEFAULT_PARENT_PIN;
}

export function ParentGate({ onSuccess, onClose, onInteract }: ParentGateProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleChange(index: number, value: string) {
    onInteract?.();
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(false);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (newDigits.every((d) => d !== "")) {
      const pin = newDigits.join("");
      if (pin === getPin()) {
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setDigits(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    onInteract?.();
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Escape") onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className={`bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative ${
          shake ? "animate-shake" : ""
        }`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <ShieldCheck size={32} className="text-blue-500" />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-gray-800 text-center mb-1">
          Góc Phụ Huynh 🔒
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Nhập mã PIN 4 số để tiếp tục
        </p>

        {/* PIN inputs */}
        <div className="flex gap-3 justify-center mb-4">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-14 text-center text-2xl font-extrabold rounded-2xl border-2 outline-none transition-all ${
                error
                  ? "border-red-300 bg-red-50 text-red-500"
                  : digit
                    ? "border-blue-400 bg-blue-50 text-blue-600"
                    : "border-gray-200 bg-gray-50 text-gray-800 focus:border-blue-400 focus:bg-blue-50"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-red-500 font-semibold mb-2">
            ⚠️ Mã PIN không đúng
          </p>
        )}

        <p className="text-center text-xs text-gray-300 mt-4">
          Mã PIN mặc định:{" "}
          <span className="font-mono font-bold text-gray-400">1234</span>
        </p>
      </div>
    </div>
  );
}
