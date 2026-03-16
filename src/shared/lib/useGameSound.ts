// ─── Game Sound & Cute Voice ─────────────────────────────────────────────────
// Sử dụng Web Audio API cho hiệu ứng âm thanh
// Sử dụng Voice Manager cho giọng nói tiếng Việt cute (mp3 + TTS fallback)

import { useCallback, useRef } from "react";
import {
  useVoiceManager,
  type VoiceConfig,
} from "./useVoiceManager";

// ─── Web Audio: tạo tiếng beep/ding/buzz bằng oscillator ────────────────────

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
  detune = 0,
) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  osc.detune.value = detune;

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// ─── Sound effects ───────────────────────────────────────────────────────────

/** Đúng rồi! ✓ — 2 nốt vui vẻ leo lên */
function playCorrectSound() {
  playTone(523, 0.15, "sine", 0.25); // C5
  setTimeout(() => playTone(659, 0.15, "sine", 0.25), 100); // E5
  setTimeout(() => playTone(784, 0.25, "sine", 0.3), 200); // G5
}

/** Sai rồi ~ — 1 nốt trầm ngắn */
function playWrongSound() {
  playTone(220, 0.3, "square", 0.15); // A3 square
  setTimeout(() => playTone(196, 0.3, "square", 0.12), 150); // G3
}

/** Kéo thả — tiếng nhẹ khi nhấc lên */
function playPickupSound() {
  playTone(880, 0.08, "sine", 0.15); // A5
}

/** Thả xuống — tiếng nhẹ khi đặt */
function playDropSound() {
  playTone(660, 0.1, "sine", 0.15); // E5
}

/** Hoàn thành map! — fanfare nhỏ */
function playVictorySound() {
  const notes = [523, 587, 659, 784, 1047]; // C D E G C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, "sine", 0.25), i * 120);
  });
  // Final chord
  setTimeout(() => {
    playTone(784, 0.5, "sine", 0.2);
    playTone(988, 0.5, "sine", 0.15);
    playTone(1175, 0.5, "sine", 0.15);
  }, notes.length * 120);
}

/** Nhấn nút — click nhẹ */
function playClickSound() {
  playTone(1200, 0.05, "sine", 0.1);
}

/** Gợi ý — nhỏ nhẹ */
function playHintSound() {
  playTone(440, 0.15, "triangle", 0.15);
  setTimeout(() => playTone(554, 0.2, "triangle", 0.15), 120);
}

// ─── React Hook ──────────────────────────────────────────────────────────────

export function useGameSound(voiceConfig?: VoiceConfig) {
  const enabledRef = useRef(true);
  const voice = useVoiceManager(voiceConfig);

  const correct = useCallback(() => {
    if (enabledRef.current) playCorrectSound();
  }, []);

  const wrong = useCallback(() => {
    if (enabledRef.current) playWrongSound();
  }, []);

  const pickup = useCallback(() => {
    if (enabledRef.current) playPickupSound();
  }, []);

  const drop = useCallback(() => {
    if (enabledRef.current) playDropSound();
  }, []);

  const victory = useCallback(() => {
    if (enabledRef.current) playVictorySound();
  }, []);

  const click = useCallback(() => {
    if (enabledRef.current) playClickSound();
  }, []);

  const hint = useCallback(() => {
    if (enabledRef.current) playHintSound();
  }, []);

  /** Phát câu intro + hiệu ứng beep. Trả về text để hiển thị UI */
  const introVoice = useCallback(() => {
    if (enabledRef.current) playClickSound();
    return voice.playIntroVoice();
  }, [voice]);

  /** Phát câu khen đúng (random) + hiệu ứng beep. Trả về text */
  const correctVoice = useCallback(() => {
    if (enabledRef.current) playCorrectSound();
    return voice.playCorrectVoice();
  }, [voice]);

  /** Phát câu khích lệ sai (random) + hiệu ứng beep. Trả về text */
  const wrongVoice = useCallback(() => {
    if (enabledRef.current) playWrongSound();
    return voice.playWrongVoice();
  }, [voice]);

  /** Phát câu chúc mừng hoàn thành + fanfare. Trả về text */
  const victoryVoice = useCallback(() => {
    if (enabledRef.current) playVictorySound();
    return voice.playVictoryVoice();
  }, [voice]);

  /** Nói text tùy ý bằng TTS (giọng cute tiếng Việt) */
  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      voice.speakText(text, onEnd);
    },
    [voice],
  );

  /** Phát giọng nói cho event tùy ý */
  const playVoice = useCallback(
    (event: "intro" | "correct" | "wrong" | "victory") => {
      return voice.playVoice(event);
    },
    [voice],
  );

  const stopVoice = useCallback(() => {
    voice.stopVoice();
  }, [voice]);

  const toggleSound = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    return enabledRef.current;
  }, []);

  const toggleVoice = useCallback(() => {
    const newState = voice.toggleVoice();
    if (!newState) voice.stopVoice();
    return newState;
  }, [voice]);

  return {
    // Sound effects (beep/ding)
    correct,
    wrong,
    pickup,
    drop,
    victory,
    click,
    hint,
    // Voice lines (mp3 + TTS fallback)
    introVoice,
    correctVoice,
    wrongVoice,
    victoryVoice,
    playVoice,
    speak,
    stopVoice,
    // Toggles
    toggleSound,
    toggleVoice,
    // Voice manager API (for advanced usage)
    voice,
  };
}
