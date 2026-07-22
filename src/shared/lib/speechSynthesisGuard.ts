type GuardedSpeechSynthesis = SpeechSynthesis & {
  __viOlympicSpeechGuardInstalled?: boolean;
};

/**
 * Chromium may drop the first audio frames when cancel() is immediately
 * followed by speak(). Install one application-wide guard so every existing
 * Web Speech caller gets the same warm-up behavior without changing captions,
 * boundary offsets, or the original utterance text.
 */
export function installSpeechSynthesisGuard(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synthesis = window.speechSynthesis as GuardedSpeechSynthesis;
  if (synthesis.__viOlympicSpeechGuardInstalled) return;
  synthesis.__viOlympicSpeechGuardInstalled = true;

  const nativeSpeak = synthesis.speak.bind(synthesis);
  const nativeCancel = synthesis.cancel.bind(synthesis);
  let generation = 0;
  let warmupTimer: number | undefined;
  let fallbackTimer: number | undefined;

  const clearPending = () => {
    generation += 1;
    if (warmupTimer !== undefined) window.clearTimeout(warmupTimer);
    if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
    warmupTimer = undefined;
    fallbackTimer = undefined;
  };

  synthesis.cancel = () => {
    clearPending();
    nativeCancel();
  };

  synthesis.speak = (utterance: SpeechSynthesisUtterance) => {
    clearPending();
    nativeCancel();
    const requestGeneration = generation;
    let actualStarted = false;

    const startActual = () => {
      if (actualStarted || requestGeneration !== generation) return;
      actualStarted = true;
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(() => {
        if (requestGeneration !== generation) return;
        nativeSpeak(utterance);
      }, 180);
    };

    // Some Windows/Chrome voices completely skip silent punctuation. Use a
    // short audible branded cue as the sacrificial utterance: any clipped
    // frames affect only the cue, while the educational sentence remains
    // untouched and keeps its original boundary indices.
    const isVietnamese = (utterance.lang || "vi-VN").toLowerCase().startsWith("vi");
    const warmup = new SpeechSynthesisUtterance(isVietnamese ? "Tí Tách." : "Listen.");
    warmup.lang = utterance.lang || "vi-VN";
    warmup.voice = utterance.voice;
    warmup.rate = 1.05;
    warmup.pitch = utterance.pitch || 1;
    warmup.volume = 0.72;
    warmup.onend = startActual;
    warmup.onerror = startActual;
    warmupTimer = window.setTimeout(() => {
      if (requestGeneration !== generation) return;
      nativeSpeak(warmup);
      // Defensive fallback for platform voices that fail to emit onend.
      fallbackTimer = window.setTimeout(startActual, 1200);
    }, 140);
  };
}
