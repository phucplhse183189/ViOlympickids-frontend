import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type ChromeSpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Chrome chưa được cấp quyền sử dụng micro.",
  "service-not-allowed": "Dịch vụ nhận dạng giọng nói đang bị Chrome chặn.",
  "audio-capture": "Không tìm thấy micro hoặc micro đang được ứng dụng khác sử dụng.",
  network: "Chrome không kết nối được dịch vụ nhận dạng giọng nói.",
  "no-speech": "Không nghe thấy giọng nói. Bạn hãy thử lại nhé.",
};

function getConstructor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const speechWindow = window as ChromeSpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

export function useChromeSpeechRecognition(
  onTranscript: (transcript: string) => void,
) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbackRef = useRef(onTranscript);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  callbackRef.current = onTranscript;

  const supported = typeof window !== "undefined" && Boolean(getConstructor());

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Recognition = getConstructor();
    if (!Recognition || recognitionRef.current) return;

    setError(null);
    const recognition = new Recognition();
    recognitionRef.current = recognition;
    recognition.lang = "vi-VN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result?.isFinal) transcript += result[0]?.transcript ?? "";
      }
      const normalized = transcript.trim();
      if (normalized) callbackRef.current(normalized);
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setError(ERROR_MESSAGES[event.error] ?? "Chrome không thể nhận dạng giọng nói.");
      }
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setError("Không thể khởi động micro. Bạn hãy tải lại trang và thử lại.");
    }
  }, []);

  const toggle = useCallback(() => {
    if (recognitionRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => () => {
    recognitionRef.current?.abort();
    recognitionRef.current = null;
  }, []);

  return { supported, listening, error, toggle, stop };
}
