// ─── Voice Audio Manager ─────────────────────────────────────────────────────
// Module quản lý âm thanh giọng nói tiếng Việt dễ thương cho game
// Hỗ trợ phát file .mp3 với fallback SpeechSynthesis (TTS)
//
// Cách dùng sau này: chỉ cần thay đường dẫn audioUrl trong config
// bằng file .mp3 thực tế là giọng nói tự động chạy mượt mà.

import { useCallback, useRef, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VoiceLine {
  /** Nội dung text (dùng cho TTS fallback & hiển thị UI) */
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
// Thay audioUrl bằng file .mp3 thực tế khi có sẵn

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
    {
      text: "Đúng phóc rồi! Con giỏi quá!",
      audioUrl: "/audio/voice/correct_02.mp3",
    },
  ],
  wrong: [
    {
      text: "Ôi, sai một xíu thôi. Tính lại nhé!",
      audioUrl: "/audio/voice/wrong_01.mp3",
    },
    {
      text: "Chưa đúng mất rồi. Thử lại tẹo nha!",
      audioUrl: "/audio/voice/wrong_02.mp3",
    },
  ],
  victory: [
    {
      text: "Tuyệt vờiii! Con đã hoàn thành xuất sắc! Cùng sang bài mới nhé!",
      audioUrl: "/audio/voice/victory_01.mp3",
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

/**
 * Phát file .mp3 nếu có, fallback sang TTS nếu file lỗi hoặc chưa có.
 * @returns Promise resolve khi bắt đầu phát thành công
 */
function playVoiceLine(
  line: VoiceLine,
  options: { volume?: number; ttsFallback?: (text: string) => void },
): void {
  const { volume = 0.85, ttsFallback } = options;

  // Nếu không có audioUrl → dùng TTS ngay
  if (!line.audioUrl) {
    ttsFallback?.(line.text);
    return;
  }

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
      // File chưa có hoặc lỗi → fallback TTS
      ttsFallback?.(line.text);
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

// ─── TTS Fallback (giọng cute tiếng Việt) ────────────────────────────────────

let cachedVoice: SpeechSynthesisVoice | null = null;
let voiceSearched = false;

function findVietnameseVoice(): SpeechSynthesisVoice | null {
  if (voiceSearched) return cachedVoice;
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  const viVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("vi"));

  const pickByKeywords = (list: SpeechSynthesisVoice[], keywords: string[]) =>
    list.find((v) => {
      const name = v.name.toLowerCase();
      return keywords.some((k) => name.includes(k));
    });

  cachedVoice =
    pickByKeywords(viVoices, ["google", "microsoft", "natural", "xuan", "linh", "thuy", "yen"]) ??
    pickByKeywords(viVoices, ["female", "woman", "girl", "nu", "nữ"]) ??
    viVoices[0] ??
    null;

  voiceSearched = true;
  return cachedVoice;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    voiceSearched = false;
    findVietnameseVoice();
  };
}

function speakCuteFallback(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const cleanText = text
    .replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1FFFF}]/gu,
      "",
    )
    .trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voice = findVietnameseVoice();
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "vi-VN";
  }

  // Giọng trẻ nhỏ thân thiện: pitch cao vừa + tốc độ hơi nhanh
  utterance.pitch = 1.35;
  utterance.rate = 1.02;
  utterance.volume = 0.9;

  window.speechSynthesis.speak(utterance);
}

function stopTTS(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
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
  speakText: (text: string) => void;
  /** Dừng tất cả giọng nói */
  stopVoice: () => void;
  /** Bật/tắt voice — trả về trạng thái mới */
  toggleVoice: () => boolean;
  /** Trạng thái bật/tắt hiện tại */
  isEnabled: () => boolean;
}

export function useVoiceManager(config: VoiceConfig = defaultVoiceConfig): VoiceManagerAPI {
  const enabledRef = useRef(true);
  const configRef = useRef(config);
  configRef.current = config;

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
        playVoiceLine(line, {
          ttsFallback: speakCuteFallback,
        });
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

  const speakText = useCallback((text: string) => {
    if (enabledRef.current) {
      stopAllAudio();
      stopTTS();
      speakCuteFallback(text);
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
