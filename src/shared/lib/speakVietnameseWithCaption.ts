import { configureKidVietnameseUtterance, waitForVoices, findBestVietnameseVoice, playGoogleTTSFallback } from "./useVoiceManager";

/**
 * Đọc TTS tiếng Việt và báo tiến độ để hiện phụ đề "nói đến đâu hiện đến đó".
 * Chrome/Edge: dùng sự kiện `boundary` (từng từ). Trình khác: fallback tuyến tính theo thời gian.
 */
export function speakVietnameseWithCaptionProgress(
  text: string,
  onReveal: (endExclusive: number) => void,
  onComplete?: () => void,
): () => void {
  if (!text) {
    onReveal(0);
    onComplete?.();
    return () => {};
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  let disposed = false;
  let maxEnd = 0;
  let boundarySeen = false;
  let finished = false;
  let fallbackId: ReturnType<typeof setInterval> | null = null;
  let fallbackArmTimer: ReturnType<typeof setTimeout> | null = null;

  const bump = (endExclusive: number) => {
    if (disposed) return;
    const next = Math.min(text.length, Math.max(maxEnd, Math.ceil(endExclusive)));
    if (next > maxEnd) {
      maxEnd = next;
      onReveal(next);
    }
  };

  const clearFallback = () => {
    if (fallbackId !== null) {
      clearInterval(fallbackId);
      fallbackId = null;
    }
    if (fallbackArmTimer !== null) {
      clearTimeout(fallbackArmTimer);
      fallbackArmTimer = null;
    }
  };

  const completeOnce = () => {
    if (finished || disposed) return;
    finished = true;
    clearFallback();
    bump(text.length);
    onComplete?.();
  };

  const startFakeTimer = (delay: number = 480) => {
    fallbackArmTimer = window.setTimeout(() => {
      fallbackArmTimer = null;
      if (disposed || boundarySeen || finished) return;
      const durationMs = Math.max(3200, text.length * 72);
      const t0 = performance.now();
      fallbackId = window.setInterval(() => {
        if (disposed || finished) return;
        const p = Math.min(1, (performance.now() - t0) / durationMs);
        bump(p * text.length);
        if (p >= 1 && fallbackId !== null) {
          clearInterval(fallbackId);
          fallbackId = null;
        }
      }, 45);
    }, delay);
  };

  // Chờ voices load xong rồi mới tạo utterance (fix timing bug trên Vercel)
  waitForVoices(3000).then(() => {
    if (disposed) return;

    const bestVoice = typeof window !== "undefined" && "speechSynthesis" in window 
      ? findBestVietnameseVoice() 
      : null;

    if (!bestVoice || typeof window === "undefined" || !("speechSynthesis" in window)) {
      // Dùng Google TTS + bộ đếm thời gian fake để hiện phụ đề
      playGoogleTTSFallback(text, completeOnce);
      startFakeTimer(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    configureKidVietnameseUtterance(utterance);

    utterance.onstart = () => {
      bump(1);
    };

    utterance.onboundary = (ev: SpeechSynthesisEvent) => {
      boundarySeen = true;
      clearFallback();
      const idx = ev.charIndex;
      const len = ev.charLength;
      const end =
        typeof len === "number" && len > 0 ? idx + len : Math.min(text.length, idx + 1);
      bump(end);
    };

    utterance.onend = () => {
      completeOnce();
    };

    utterance.onerror = () => {
      completeOnce();
    };

    startFakeTimer(480);
    window.speechSynthesis.speak(utterance);
  });

  return () => {
    disposed = true;
    clearFallback();
    window.speechSynthesis.cancel();
  };
}

