// ─── Voice Audio Manager ─────────────────────────────────────────────────────
// Module quản lý âm thanh giọng nói cho game
// Chỉ phát file .mp3, không dùng SpeechSynthesis (TTS)
//
// Cách dùng sau này: chỉ cần thay đường dẫn audioUrl trong config
// bằng file .mp3 thực tế là giọng nói tự động chạy mượt mà.

import { useCallback, useRef, useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VoiceLine {
  /** Nội dung text để hiển thị UI */
  text: string;
  /** Đường dẫn file .mp3 — để trống "" nếu chưa có file */
  audioUrl: string;
}

export interface VoiceConfig {
  /** Câu chào mở đầu game */
  intro: VoiceLine[];
  /** Câu khen khi trả lời ĐÚNG (random) */
  correct: VoiceLine[];
  /** Câu khích lệ khi trả lời SAI (random) */
  wrong: VoiceLine[];
  /** Câu chúc mừng khi hoàn thành bài */
  victory: VoiceLine[];
}

// ─── Default Config ──────────────────────────────────────────────────────────
// Chỉ giữ các file audio đang có sẵn

export const defaultVoiceConfig: VoiceConfig = {
  intro: [
    {
      text: "Chào mừng bé! Cùng đi tìm những con số bí ẩn nhé!",
      audioUrl: "/audio/voice/intro_01.mp3",
    },
  ],
  correct: [
    {
      text: "Wow! Chuẩn không cần chỉnh!",
      audioUrl: "/audio/voice/correct_01.mp3",
    },
  ],
  wrong: [
    {
      text: "Ôi, sai một xíu thôi. Tính lại nhé!",
      audioUrl: "/audio/voice/wrong_01.mp3",
    },
  ],
  victory: [
    {
      text: "Tuyệt vờiii! Con đã hoàn thành xuất sắc! Cùng sang bài mới nhé!",
      audioUrl: "",
    },
  ],
};

// ─── Core Audio Playback ─────────────────────────────────────────────────────

/** Cache Audio elements đã tạo để tái sử dụng */
const audioCache = new Map<string, HTMLAudioElement>();

/** Chọn ngẫu nhiên 1 phần tử từ mảng */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Phát file .mp3 nếu có. */
function playVoiceLine(line: VoiceLine, options: { volume?: number }): void {
  const { volume = 0.85 } = options;

  if (!line.audioUrl) return;

  // Thử phát mp3
  let audio = audioCache.get(line.audioUrl);
  if (!audio) {
    audio = new Audio(line.audioUrl);
    audioCache.set(line.audioUrl, audio);
  }

  audio.volume = volume;
  audio.currentTime = 0;

  const playPromise = audio.play();
  if (playPromise) {
    playPromise.catch(() => {
      // Không fallback sang AI voice.
    });
  }
}

/** Dừng tất cả audio đang phát */
function stopAllAudio(): void {
  audioCache.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function stopTTS(): void {
  // AI voice đã bị tắt hoàn toàn.
}

// ─── React Hook ──────────────────────────────────────────────────────────────

export interface VoiceManagerAPI {
  /** Phát câu intro mở đầu */
  playIntroVoice: () => string;
  /** Phát câu khen (random) khi trả lời đúng */
  playCorrectVoice: () => string;
  /** Phát câu khích lệ (random) khi trả lời sai */
  playWrongVoice: () => string;
  /** Phát câu chúc mừng hoàn thành */
  playVictoryVoice: () => string;
  /** Phát 1 voice line tùy ý */
  playVoice: (event: keyof VoiceConfig) => string;
  /** Nói text tùy ý bằng TTS (giọng cute tiếng Việt) */
  speakText: (text: string, onEnd?: () => void) => void;
  /** Dừng tất cả giọng nói */
  stopVoice: () => void;
  /** Bật/tắt voice — trả về trạng thái mới */
  toggleVoice: () => boolean;
  /** Trạng thái bật/tắt hiện tại */
  isEnabled: () => boolean;
}

// ─── Cache giọng nói VN tốt nhất ────────────────────────────────────────────
let cachedBestVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

// ─── Voice readiness promise (fix timing bug trên Vercel/Chrome) ─────────────
// Chrome/Cốc Cốc: getVoices() trả về [] lần đầu, cần chờ event voiceschanged.
// Nếu speakText() gọi trước khi voices load xong → không tìm được giọng VN → fallback English.
let _voicesReadyResolve: (() => void) | null = null;
let _voicesAreReady = false;

const _voicesReadyPromise = new Promise<void>((resolve) => {
  _voicesReadyResolve = resolve;
});

function _markVoicesReady() {
  if (!_voicesAreReady) {
    _voicesAreReady = true;
    _voicesReadyResolve?.();
  }
}

// Auto-init: kiểm tra ngay khi module load
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const _initVoices = window.speechSynthesis.getVoices();
  if (_initVoices.length > 0) {
    _markVoicesReady();
  }
  // Luôn lắng nghe event vì Chrome có thể load thêm voices sau
  window.speechSynthesis.addEventListener(
    "voiceschanged",
    () => {
      // Reset cache khi voices thay đổi
      cachedBestVoice = null;
      voicesLoaded = false;
      _markVoicesReady();
    },
    { once: false },
  );
}

/**
 * Chờ voices sẵn sàng (giải quyết timing bug trên Chrome/Cốc Cốc).
 * Trả về Promise resolve khi voices đã load, hoặc sau timeout.
 */
export function waitForVoices(timeoutMs = 3000): Promise<void> {
  if (_voicesAreReady) return Promise.resolve();
  return Promise.race([
    _voicesReadyPromise,
    new Promise<void>((r) => setTimeout(r, timeoutMs)),
  ]);
}

function findBestVietnameseVoice(): SpeechSynthesisVoice | null {
  if (voicesLoaded && cachedBestVoice) return cachedBestVoice;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  voicesLoaded = true;
  const vnVoices = voices.filter(
    (v) => v.lang === "vi-VN" || v.lang.startsWith("vi")
  );

  // Ưu tiên giọng nữ (thường trong trẻo, dễ thương hơn cho trẻ con)
  const femaleVoice = vnVoices.find(
    (v) => /female|nữ|woman|girl/i.test(v.name)
  );
  if (femaleVoice) {
    cachedBestVoice = femaleVoice;
    return cachedBestVoice;
  }

  // Fallback: giọng VN đầu tiên
  if (vnVoices.length > 0) {
    cachedBestVoice = vnVoices[0];
    return cachedBestVoice;
  }

  return null;
}

/** Cấu hình utterance giọng trẻ / tiếng Việt (dùng chung TTS roadmap + game) */
export function configureKidVietnameseUtterance(
  utterance: SpeechSynthesisUtterance,
): void {
  utterance.lang = "vi-VN";
  const bestVoice = findBestVietnameseVoice();
  if (bestVoice) utterance.voice = bestVoice;
  utterance.rate = 1.15;
  utterance.pitch = 1.6;
  utterance.volume = 1.0;
}

export function useVoiceManager(config: VoiceConfig = defaultVoiceConfig): VoiceManagerAPI {
  const enabledRef = useRef(true);
  const configRef = useRef(config);
  configRef.current = config;

  // Preload voices (chúng load bất đồng bộ trên nhiều trình duyệt)
  const [, setVoicesReady] = useState(false);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    // Thử load ngay
    findBestVietnameseVoice();

    // Lắng nghe sự kiện voiceschanged (Chrome cần event này)
    const onVoicesChanged = () => {
      cachedBestVoice = null;
      voicesLoaded = false;
      findBestVietnameseVoice();
      setVoicesReady(true);
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
    };
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
      stopTTS();
    };
  }, []);

  const playEvent = useCallback(
    (event: keyof VoiceConfig): string => {
      const lines = configRef.current[event];
      const line = pickRandom(lines);
      if (enabledRef.current) {
        // Dừng audio/TTS cũ trước
        stopAllAudio();
        stopTTS();
        playVoiceLine(line, {});
      }
      return line.text;
    },
    [],
  );

  const playIntroVoice = useCallback(() => playEvent("intro"), [playEvent]);
  const playCorrectVoice = useCallback(() => playEvent("correct"), [playEvent]);
  const playWrongVoice = useCallback(() => playEvent("wrong"), [playEvent]);
  const playVictoryVoice = useCallback(() => playEvent("victory"), [playEvent]);

  const stopVoice = useCallback(() => {
    stopAllAudio();
    stopTTS();
  }, []);

  const toggleVoice = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    if (!enabledRef.current) {
      stopAllAudio();
      stopTTS();
    }
    return enabledRef.current;
  }, []);

  // Lưu callback hiện tại để vô hiệu hoá callback cũ khi cancel()
  const currentOnEndRef = useRef<(() => void) | null>(null);

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!enabledRef.current || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Vô hiệu hoá callback cũ trước khi cancel (cancel() sẽ fire onerror bất đồng bộ)
    currentOnEndRef.current = null;

    // Stop any currently playing TTS
    window.speechSynthesis.cancel();
    // Stop MP3s so they don't overlap
    stopAllAudio();

    // Chờ voices load xong (fix timing bug trên Vercel) rồi mới nói
    const doSpeak = () => {
      // Kiểm tra lại enabled sau khi chờ (có thể bị tắt trong lúc chờ)
      if (!enabledRef.current) {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      configureKidVietnameseUtterance(utterance);

      // Lưu callback mới
      currentOnEndRef.current = onEnd || null;

      // Wrap callback: chỉ gọi nếu vẫn là callback hiện tại (chưa bị cancel)
      const wrappedOnEnd = () => {
        if (currentOnEndRef.current === onEnd && onEnd) {
          currentOnEndRef.current = null;
          onEnd();
        }
      };

      utterance.onend = wrappedOnEnd;
      utterance.onerror = wrappedOnEnd;

      window.speechSynthesis.speak(utterance);
    };

    // Nếu voices đã sẵn sàng → nói ngay, không → chờ tối đa 3 giây
    if (_voicesAreReady) {
      doSpeak();
    } else {
      waitForVoices(3000).then(doSpeak);
    }
  }, []);

  const isEnabled = useCallback(() => enabledRef.current, []);

  return {
    playIntroVoice,
    playCorrectVoice,
    playWrongVoice,
    playVictoryVoice,
    playVoice: playEvent,
    speakText,
    stopVoice,
    toggleVoice,
    isEnabled,
  };
}
