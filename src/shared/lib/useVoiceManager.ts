// ─── Voice Audio Manager ─────────────────────────────────────────────────────
// Module quản lý âm thanh giọng nói cho game
// Chỉ phát file .mp3, không dùng SpeechSynthesis (TTS)
//
// Cách dùng sau này: chỉ cần thay đường dẫn audioUrl trong config
// bằng file .mp3 thực tế là giọng nói tự động chạy mượt mà.

import { useCallback, useRef, useEffect } from "react";

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

  const speakText = useCallback((text: string) => {
    if (enabledRef.current) {
      void text;
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
