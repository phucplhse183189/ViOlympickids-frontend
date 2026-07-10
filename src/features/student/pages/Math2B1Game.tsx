import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { 
  ArrowLeft, 
  Star, 
  RotateCcw,
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff,
  MapPin,
  Trophy,
  Home
} from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Float, 
  Text, 
  Environment, 
  ContactShadows, 
  PresentationControls,
  RoundedBox,
  PerspectiveCamera
} from "@react-three/drei";
import * as THREE from "three";
import { useGameSound } from "@/features/student/hooks/useGameSound";
import { ParentGate } from "@/shared/ui/ParentGate";
import { getRandomItem } from "@/features/student/utils/robotGameLogic";
import {
  waitForVoices,
  findBestVietnameseVoice,
  playGoogleTTSFallback,
} from "@/features/student/hooks/useVoiceManager";

// ─── AI Chatbot Voice Constants ─────────────────────────────────────────────
const ROBOT_VOICE_STORAGE_KEY = "robotVoiceName";
const FPT_VOICE_OPTIONS = [
  { id: "banmai", label: "Ban Mai (nữ)" },
  { id: "lannhi", label: "Lan Nhi (nữ)" },
  { id: "leminh", label: "Lê Minh (nam)" },
  { id: "myan", label: "Mỹ An (nữ)" },
  { id: "thuminh", label: "Thu Minh (nữ)" },
  { id: "giahuy", label: "Gia Huy (nam)" },
];
let currentRobotTtsAudio: HTMLAudioElement | null = null;

function readStoredRobotVoiceName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(ROBOT_VOICE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function pickUnifiedRobotVoice(
  voices: SpeechSynthesisVoice[],
  preferredName?: string,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const preferred = preferredName ? voices.find((v) => v.name === preferredName) : undefined;
  if (preferred) return preferred;
  const mapVoice =
    voices.find((v) => /microsoft an/i.test(v.name)) ||
    voices.find((v) => /^vi\b/i.test(v.lang) && /(female|woman|girl|nữ|nu)/i.test(v.name)) ||
    voices.find((v) => /^vi\b/i.test(v.lang)) ||
    findBestVietnameseVoice();
  if (mapVoice) return mapVoice;
  return (
    voices.find((v) => /microsoft an/i.test(v.name)) ||
    voices.find((v) => /^vi\b/i.test(v.lang) && /(female|woman|girl|nữ|nu)/i.test(v.name)) ||
    voices.find((v) => /^vi\b/i.test(v.lang)) ||
    findBestVietnameseVoice() ||
    voices[0] ||
    null
  );
}

async function speakWithUnifiedRobotVoice(text: string, voiceName?: string): Promise<void> {
  if (typeof window === "undefined" || !text) return;
  const storedVoice = readStoredRobotVoiceName();
  const pickedVoice = voiceName || storedVoice || "banmai";
  const fptVoice = FPT_VOICE_OPTIONS.some((v) => v.id === pickedVoice) ? pickedVoice : "banmai";

  try {
    const ttsRes = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: fptVoice, format: "mp3" }),
    });
    if (ttsRes.ok) {
      const ttsData = (await ttsRes.json()) as { audioUrl?: string };
      if (ttsData?.audioUrl) {
        window.speechSynthesis.cancel();
        if (currentRobotTtsAudio) { currentRobotTtsAudio.pause(); currentRobotTtsAudio.currentTime = 0; }
        const audio = new Audio(ttsData.audioUrl);
        currentRobotTtsAudio = audio;
        audio.onended = () => { if (currentRobotTtsAudio === audio) currentRobotTtsAudio = null; };
        audio.onerror = () => { if (currentRobotTtsAudio === audio) currentRobotTtsAudio = null; };
        await audio.play();
        return;
      }
    }
  } catch { /* fallback */ }

  await waitForVoices(3000);
  if (!("speechSynthesis" in window)) { playGoogleTTSFallback(text); return; }
  const voices = window.speechSynthesis.getVoices();
  const finalVoice = pickUnifiedRobotVoice(voices, voiceName || readStoredRobotVoiceName());
  if (!finalVoice) { playGoogleTTSFallback(text); return; }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = finalVoice;
  utterance.lang = finalVoice.lang || "vi-VN";
  utterance.rate = 1.15;
  utterance.pitch = 1.6;
  utterance.volume = 1;
  try { window.localStorage.setItem(ROBOT_VOICE_STORAGE_KEY, finalVoice.name); } catch { /* ignore */ }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// ─── AI Chatbot Input Bar ───────────────────────────────────────────────────
function B1RobotAskBar({
  value, onChange, onSend, loading, onClose,
}: Readonly<{
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  onClose?: () => void;
}>) {
  const [listening, setListening] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  const supportsVoice = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const resolvedVoiceName = selectedVoice || (typeof window !== "undefined" && (() => { try { return localStorage.getItem(ROBOT_VOICE_STORAGE_KEY) || ""; } catch { return ""; } })()) || "banmai";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(ROBOT_VOICE_STORAGE_KEY) || "";
      const validStored = FPT_VOICE_OPTIONS.some((v) => v.id === stored) ? stored : "banmai";
      setSelectedVoice(validStored);
      localStorage.setItem(ROBOT_VOICE_STORAGE_KEY, validStored);
    } catch { setSelectedVoice("banmai"); }
  }, []);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); recognitionRef.current = null; };
  }, []);

  const handleToggleVoice = () => {
    if (!supportsVoice || loading) return;
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;
    recognition.lang = "vi-VN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript?.trim();
      if (!transcript) return;
      onChange(transcript);
      onSend();
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  return (
    <div className="bg-[#F7F3E8]/95 backdrop-blur rounded-3xl shadow-lg border-2 border-amber-200 px-3 py-2.5 sm:px-4 sm:py-3 flex flex-col gap-2.5 overflow-hidden">
      <div className="min-w-0 space-y-2">
        <div className="w-full min-w-0 rounded-2xl bg-white/70 border border-amber-100 px-3 py-2">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder="Hãy nhập câu hỏi của bạn để Tí Tách trả lời nhé"
            rows={3}
            className="w-full resize-none bg-transparent text-sm sm:text-base font-bold text-slate-600 outline-none placeholder:text-slate-400 leading-relaxed"
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={handleToggleVoice}
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow transition active:scale-95 ${listening ? "bg-rose-400 text-white" : "bg-white text-amber-500 border border-amber-200"} ${!supportsVoice || loading ? "opacity-45 cursor-not-allowed" : ""}`}
            aria-label={listening ? "Đang nghe" : "Nói câu hỏi"} disabled={!supportsVoice || loading}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button type="button" onClick={onSend}
            className="shrink-0 px-4 sm:px-5 py-2 rounded-full bg-amber-400 text-white text-sm sm:text-base font-extrabold shadow active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >Gửi</button>
          {onClose && (
            <button type="button" onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-full bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 transition active:scale-95"
              aria-label="Đóng khung chat"
            >✕</button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <label className="text-xs sm:text-sm font-bold text-slate-500 whitespace-nowrap">Giọng đọc:</label>
        <div className="relative flex-1 min-w-0">
          <select value={resolvedVoiceName}
            onChange={(e) => { const next = e.target.value; setSelectedVoice(next); try { localStorage.setItem(ROBOT_VOICE_STORAGE_KEY, next); } catch { /* ignore */ } }}
            className="w-full min-w-0 appearance-none bg-white/85 text-xs sm:text-sm font-bold text-slate-600 border border-amber-200 rounded-full pl-3 pr-8 py-1.5 outline-none focus:ring-2 focus:ring-amber-200 truncate"
          >
            {FPT_VOICE_OPTIONS.map((voice) => (<option key={voice.id} value={voice.id}>{voice.label}</option>))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">▾</span>
        </div>
      </div>
    </div>
  );
}

// ─── Floating AI Chatbot Component ──────────────────────────────────────────
type ChatMessage = { role: "user" | "robot"; text: string };

function B1FloatingTitechAssistant({
  messages, robotChatOpen, onToggle, value, onChange, onSend, loading, onClose,
}: Readonly<{
  messages: ChatMessage[];
  robotChatOpen: boolean;
  onToggle: () => void;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  onClose: () => void;
}>) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <>
      <div className="fixed left-3 bottom-3 sm:left-4 sm:bottom-4 z-[60]">
        <button type="button" onClick={onToggle}
          className="relative w-[16vw] min-w-[84px] max-w-[132px] focus:outline-none"
          aria-label="Mở khung chat AI của robot"
        >
          <img src="/robot%20(1).png" alt="Robot" className="w-full object-contain drop-shadow animate-pulse" />
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-white/92 text-emerald-700 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 border border-emerald-200 shadow-sm whitespace-nowrap">
            Hỏi Tí Tách
          </span>
        </button>
      </div>

      {robotChatOpen && typeof document !== "undefined"
        ? createPortal(
            <>
              {/* Mobile overlay */}
              <div className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm lg:hidden" onClick={onClose} />
              {/* Desktop sidebar */}
              <div className="fixed z-[9999] right-0 top-0 h-full w-[340px] max-w-[calc(100vw-1.5rem)] border-l-2 border-cyan-200/70 bg-white/95 backdrop-blur-md shadow-[0_14px_36px_rgba(8,47,73,0.3)] p-3 flex-col gap-3 hidden lg:flex">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <img src="/robot%20(1).png" alt="Tí Tách" className="w-9 h-9 object-contain" />
                    <div>
                      <p className="text-sm font-black text-cyan-700 leading-tight">Tí Tách AI</p>
                      <p className="text-[11px] font-bold text-slate-500 leading-tight">Bài 1 - Ôn tập số đến 100</p>
                    </div>
                  </div>
                  <button type="button" onClick={onClose}
                    className="rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-xs font-black text-cyan-700 hover:bg-cyan-50"
                  >Đóng</button>
                </div>
                <div className="flex-1 overflow-y-auto rounded-2xl border border-cyan-100 bg-cyan-50/40 p-3 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm font-bold leading-relaxed ${
                        msg.role === "user"
                          ? "bg-sky-100 text-sky-800 rounded-br-md"
                          : "bg-white text-slate-700 border border-cyan-100 rounded-bl-md shadow-sm"
                      }`}>
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-slate-500 border border-cyan-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm font-bold shadow-sm">
                        Tí Tách đang suy nghĩ...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <B1RobotAskBar value={value} onChange={onChange} onSend={onSend} loading={loading} onClose={onClose} />
              </div>
              {/* Mobile panel */}
              <div className="fixed z-[9999] inset-x-0 bottom-0 max-h-[85vh] bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(8,47,73,0.2)] rounded-t-3xl border-t-2 border-cyan-200/70 p-3 flex flex-col gap-3 lg:hidden">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <img src="/robot%20(1).png" alt="Tí Tách" className="w-9 h-9 object-contain" />
                    <div>
                      <p className="text-sm font-black text-cyan-700 leading-tight">Tí Tách AI</p>
                      <p className="text-[11px] font-bold text-slate-500 leading-tight">Bài 1 - Ôn tập số đến 100</p>
                    </div>
                  </div>
                  <button type="button" onClick={onClose}
                    className="rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-xs font-black text-cyan-700 hover:bg-cyan-50"
                  >Đóng</button>
                </div>
                <div className="flex-1 overflow-y-auto rounded-2xl border border-cyan-100 bg-cyan-50/40 p-3 space-y-3 max-h-[40vh]">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm font-bold leading-relaxed ${
                        msg.role === "user"
                          ? "bg-sky-100 text-sky-800 rounded-br-md"
                          : "bg-white text-slate-700 border border-cyan-100 rounded-bl-md shadow-sm"
                      }`}>
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white text-slate-500 border border-cyan-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm font-bold shadow-sm">
                        Tí Tách đang suy nghĩ...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <B1RobotAskBar value={value} onChange={onChange} onSend={onSend} loading={loading} onClose={onClose} />
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}

// Utility to generate random numbers
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate questions for 3 rounds
function generateRounds() {
  // Round 1: Max number
  const r1Numbers = [randInt(10, 30), randInt(31, 60), randInt(61, 99)].sort(() => Math.random() - 0.5);
  const r1Answer = Math.max(...r1Numbers);

  // Round 2: Sort order
  const startR2 = randInt(10, 80);
  const r2Numbers = [startR2, startR2 + randInt(1, 3), startR2 + randInt(4, 7), startR2 + randInt(8, 12)].sort(() => Math.random() - 0.5);
  const r2Answer = [...r2Numbers].sort((a, b) => a - b);

  // Round 3: Missing sequence
  const startR3 = randInt(20, 90);
  const r3Sequence = [startR3, startR3 + 1, startR3 + 2, startR3 + 3];
  const missingIdx = randInt(0, 3);
  const r3Answer = r3Sequence[missingIdx];
  const r3Displayed = [...r3Sequence];
  r3Displayed[missingIdx] = -1; // -1 means missing

  const options = [r3Answer, r3Answer - 1, r3Answer + 1].filter(v => v !== -1).sort(() => Math.random() - 0.5);
  if (options.length < 3) options.push(r3Answer + 2);
  
  return {
    round1: { numbers: r1Numbers, answer: r1Answer },
    round2: { numbers: r2Numbers, answer: r2Answer },
    round3: { sequence: r3Displayed, answer: r3Answer, options: options.slice(0, 3).sort(() => Math.random() - 0.5) }
  };
}

// ─── Robot Character Component ──────────────────────────────────────────────
function RobotCharacter({
  message,
  size = "md",
}: {
  message: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32" };
  return (
    <div className="flex items-end gap-2">
      <div className={`${sizeMap[size]} relative robot-idle flex-shrink-0`}>
        <video
          className="w-full h-full object-cover rounded-2xl border-2 border-sky-300 shadow-lg bg-sky-100"
          src="/videos/VideoRobotHoatDong.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          controls={false}
        />
      </div>
      {message && (
        <div className="relative bg-white rounded-2xl shadow-lg px-4 py-2.5 max-w-[260px] animate-fade-in-up">
          <div className="absolute -left-2 bottom-3 w-4 h-4 bg-white rotate-45" />
          <p className="text-sm font-bold text-gray-700 relative z-10">{message}</p>
        </div>
      )}
    </div>
  );
}

// ─── Lesson 1 Maps Metadata ──────────────────────────────────────────────────
const LESSON1_MAPS = [
  { id: 1, name: "Đọc, viết số", emoji: "📝", description: "Ôn tập cách đọc và viết các số" },
  { id: 2, name: "So sánh số", emoji: "⚖️", description: "So sánh các số trong phạm vi 100" },
  { id: 3, name: "Thứ tự các số", emoji: "🔢", description: "Tìm số liền trước, số liền sau" },
];

const ROBOT_GREETINGS = [
    "Chào mừng bạn đến với lớp 2! 🏫",
    "Chúng mình cùng ôn tập các số nhé! 🔢",
    "Học mà chơi, chơi mà học thật vui! 🎈",
];

// ─── Intro Screen Component ──────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center px-4 w-full max-w-4xl animate-fade-in">
      <div className="flex justify-center hover:scale-105 transition-transform duration-500">
        <RobotCharacter message={getRandomItem(ROBOT_GREETINGS)} size="md" />
      </div>

      <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border-2 border-white/60 transform hover:-translate-y-1 transition-transform duration-300">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400"></div>
        <p className="text-gray-700 font-extrabold text-base md:text-lg leading-relaxed">
          <span className="text-2xl inline-block mr-2 animate-bounce">🎒</span>
          Chào mừng các con đến với năm học lớp 2! Hãy cùng bạn{" "}
          <span className="text-sky-600 font-black px-1 underline decoration-sky-300 decoration-4 underline-offset-4">Robot Tí Tách</span> vượt qua
          <span className="text-blue-600 font-black text-xl mx-2 bg-blue-50 px-3 py-1 rounded-lg border-2 border-blue-200 shadow-sm inline-block"> 3 thử thách </span>
          để ôn tập lại các số đến 100 và sẵn sàng cho những bài học mới thật thú vị nhé! 🏫✨
        </p>
      </div>

      <div className="w-full max-w-2xl grid gap-3">
        {LESSON1_MAPS.map((map, index) => (
          <div
            key={map.id}
            className="group flex items-center gap-4 bg-white/60 hover:bg-white rounded-2xl px-5 py-3 border border-white/60 hover:border-sky-300 shadow-sm transition-all duration-300 transform hover:-translate-y-1 cursor-default"
            style={{ animation: `fade-in-up 0.4s ease-out ${index * 0.1}s both` }}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-sky-50 flex items-center justify-center text-2xl shadow-inner border border-sky-100 group-hover:rotate-12 transition-transform">
              {map.emoji}
            </div>
            <div className="text-left flex-1">
              <p className="font-extrabold text-gray-800 text-base group-hover:text-sky-600 transition-colors">Vùng {map.id}: {map.name}</p>
              <p className="text-xs text-gray-500 font-bold mt-0.5">{map.description}</p>
            </div>
            <MapPin size={18} className="text-gray-300 group-hover:text-sky-500 transition-colors" />
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="group relative bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-white font-black text-xl px-12 py-4 rounded-3xl shadow-[0_8px_30px_rgba(58,131,235,0.4)] transition-all duration-300 active:scale-95 hover:scale-105"
      >
          <span className="relative flex items-center justify-center gap-3">
            <span className="text-2xl group-hover:animate-bounce">🚀</span>
            <span>Bắt đầu ôn tập!</span>
          </span>
      </button>
    </div>
  );
}

// ─── 3D Game Components ─────────────────────────────────────────────────────

function SkyAtmosphere() {
  return (
    <group>
      <color attach="background" args={['#7dd3fc']} />
      
      {/* Distant fluffy clouds */}
      <Float speed={1} floatIntensity={2} position={[-12, 6, -15]}>
         <mesh castShadow><sphereGeometry args={[2.5, 32, 32]} /><meshStandardMaterial color="white" roughness={1} /></mesh>
         <mesh position={[2, -0.5, 0]} castShadow><sphereGeometry args={[2, 32, 32]} /><meshStandardMaterial color="white" roughness={1} /></mesh>
         <mesh position={[-2, -0.5, 0]} castShadow><sphereGeometry args={[2, 32, 32]} /><meshStandardMaterial color="white" roughness={1} /></mesh>
      </Float>
      <Float speed={1.2} floatIntensity={1} position={[14, 5, -20]}>
         <mesh castShadow><sphereGeometry args={[3, 32, 32]} /><meshStandardMaterial color="white" roughness={1} /></mesh>
         <mesh position={[2.5, -0.5, 0]} castShadow><sphereGeometry args={[2.5, 32, 32]} /><meshStandardMaterial color="white" roughness={1} /></mesh>
         <mesh position={[-2.5, -0.5, 0]} castShadow><sphereGeometry args={[2.5, 32, 32]} /><meshStandardMaterial color="white" roughness={1} /></mesh>
      </Float>

      {/* Ground layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>
    </group>
  );
}

function ToyBalloon({ 
  value, 
  position, 
  color, 
  status,
  onClick 
}: { 
  value: number; 
  position: [number, number, number]; 
  color: string;
  status: "correct" | "wrong" | null;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + value) * 0.003;
      if (status === "wrong") {
          meshRef.current.position.x += Math.sin(state.clock.elapsedTime * 30) * 0.03;
      }
      const targetScale = hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 15);
    }
  });

  return (
    <group position={position}>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
        <group 
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
          onPointerOut={() => { document.body.style.cursor = 'default'; setHovered(false); }}
        >
          {/* Balloon body */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[1.3, 32, 32]} />
            <meshStandardMaterial color={status === "wrong" ? "#ef4444" : color} roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Balloon tie */}
          <mesh position={[0, -1.3, 0]} castShadow>
            <coneGeometry args={[0.2, 0.4, 16]} />
            <meshStandardMaterial color={status === "wrong" ? "#ef4444" : color} roughness={0.2} />
          </mesh>
        </group>
        <Text
          position={[0, 0, 1.4]}
          fontSize={0.9}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.06}
          outlineColor="#334155"
        >
          {value}
        </Text>
      </Float>
    </group>
  );
}

function SortingBlock({ 
  value, 
  position, 
  color, 
  isSelected,
  status,
  onClick 
}: { 
  value: number; 
  position: [number, number, number]; 
  color: string;
  isSelected: boolean;
  status: "correct" | "wrong" | null;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScale = isSelected ? 0.8 : 1;
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (status === "wrong") {
        meshRef.current.position.x += Math.sin(state.clock.elapsedTime * 30) * 0.02;
      }
      // Spring-like bounce to target scale
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, isSelected ? 0.5 : 0, delta * 10);
    }
  });

  return (
    <group position={[position[0], position[1], position[2]]}>
      <PresentationControls
        enabled={!isSelected}
        global={false}
        cursor={true}
        snap={true}
        speed={1.5}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 4, Math.PI / 4]}
      >
        <RoundedBox
          ref={meshRef}
          args={[1.6, 1.6, 1.6]}
          radius={0.3}
          smoothness={6}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
          onPointerOut={() => { document.body.style.cursor = 'default'; setHovered(false); }}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial 
            color={status === "wrong" ? "#ef4444" : isSelected ? "#34d399" : (hovered ? new THREE.Color(color).lerp(new THREE.Color("white"), 0.2) : color)} 
            roughness={0.8}
            metalness={0.0}
            emissive={status === "wrong" ? "#ef4444" : isSelected ? "#34d399" : "black"}
            emissiveIntensity={(isSelected || status === "wrong") ? 0.2 : 0}
          />
        </RoundedBox>
      </PresentationControls>
      <Text
        position={[0, isSelected ? 0.5 : 0, 0.9]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor={status === "wrong" ? "#7f1d1d" : isSelected ? "#064e3b" : "#475569"}
      >
        {value}
      </Text>
    </group>
  );
}

function CloudBox({ position, value, isCheated, status, onClick }: { position: [number, number, number], value: number, isCheated: boolean, status: "correct" | "wrong" | null, onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current && status === "wrong" && isCheated) {
      groupRef.current.position.x += Math.sin(state.clock.elapsedTime * 30) * 0.02;
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {isCheated ? (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
           <group position={[0, -0.2, 0]} onClick={onClick} onPointerOver={() => {document.body.style.cursor='pointer'}} onPointerOut={() => {document.body.style.cursor='default'}}>
              {/* Opaque Fluffy Cloud made of intersecting spheres */}
              <mesh position={[-0.6, 0, 0]} castShadow receiveShadow>
                <sphereGeometry args={[0.9, 32, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
              </mesh>
              <mesh position={[0.6, 0, 0]} castShadow receiveShadow>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
              </mesh>
              <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
              </mesh>
              <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
              </mesh>
           </group>
           <Text 
              fontSize={1.2} 
              color={status === "wrong" ? "#ef4444" : "#f59e0b"} 
              position={[0, 0.3, 1.1]}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05}
              outlineColor="#475569"
           >
              ?
           </Text>
        </Float>
      ) : (
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <Text 
            fontSize={1.6} 
            color="#ec4899" 
            outlineWidth={0.06} 
            outlineColor="#334155"
          >
            {value}
          </Text>
        </Float>
      )}
    </group>
  );
}

export function Math2B1Game() {
  const navigate = useNavigate();
  const sound = useGameSound();
  const [showExitGate, setShowExitGate] = useState(false);
  const [gameState, setGameState] = useState<"intro" | "playing" | "victory">("intro");
  const [currentRound, setCurrentRound] = useState(1);
  const [data, setData] = useState(() => generateRounds());
  const [soundOn, setSoundOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [totalStars, setTotalStars] = useState(0);
  
  // R2 state
  const [r2Selected, setR2Selected] = useState<number[]>([]);

  // ─── AI Chatbot State ─────────────────────────────────────────────────
  const [robotChatOpen, setRobotChatOpen] = useState(false);
  const [robotInput, setRobotInput] = useState("");
  const [robotLoading, setRobotLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "robot", text: "Xin chào! Tí Tách ở đây để giúp bạn ôn tập các số đến 100. Bạn cần giúp gì nào?" },
  ]);

  const speakRobotAnswer = useCallback((text: string, voiceName?: string) => {
    speakWithUnifiedRobotVoice(text, voiceName);
  }, []);

  const sendRobotQuestion = useCallback(async () => {
    const trimmed = robotInput.trim();
    if (!trimmed || robotLoading) return;
    setChatMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setRobotInput("");
    setRobotLoading(true);
    try {
      const res = await fetch("/api/chat-b1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      if (!res.ok) { const errText = await res.text(); throw new Error(errText || "AI error"); }
      const resData = await res.json();
      const answer = resData?.answer || "Robot chưa nghe rõ. Bạn hỏi lại được không?";
      setChatMessages((prev) => [...prev, { role: "robot", text: answer }]);
      speakRobotAnswer(answer);
    } catch {
      const fallback = "Robot đang bận một chút, bạn thử lại nhé!";
      setChatMessages((prev) => [...prev, { role: "robot", text: fallback }]);
      speakRobotAnswer(fallback);
    } finally {
      setRobotLoading(false);
    }
  }, [robotInput, robotLoading, speakRobotAnswer]);
  const [lastStatus, setLastStatus] = useState<"correct" | "wrong" | null>(null);

  // Function to toggle fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
        setIsFullscreen(true);
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }
  };

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Sound init
  useEffect(() => {
    return () => sound.stopVoice();
  }, [sound]);

  const handleCorrect = () => {
    sound.correctVoice();
    setLastStatus("correct");
    setTotalStars(prev => prev + 1);
    
    // Clear status after a while
    setTimeout(() => setLastStatus(null), 1000);

    if (currentRound < 3) {
      setTimeout(() => {
        setCurrentRound(r => r + 1);
        setR2Selected([]);
      }, 1500);
    } else {
      setTimeout(() => {
        setGameState("victory");
        sound.victoryVoice();
      }, 1500);
    }
  };

  const handleWrong = () => {
    sound.wrongVoice();
    setLastStatus("wrong");
    setTimeout(() => setLastStatus(null), 1000);
    if (currentRound === 2) setR2Selected([]);
  };

  // UI rendering based on round
  const renderRound = () => {
    return (
      <div className="w-full h-[500px] relative rounded-[2rem] overflow-hidden group">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
          
          {/* Enhanced Colorful Lighting for Cartoon Look */}
          <ambientLight intensity={0.9} color="#ffffff" />
          <directionalLight position={[10, 20, 10]} intensity={1.5} color="#fffbeb" castShadow shadow-mapSize={[1024, 1024]} />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#bae6fd" />
          
          {/* Sky and Ground */}
          <SkyAtmosphere />
          
          {currentRound === 1 && (
            <group>
              {data.round1.numbers.map((n, i) => (
                <ToyBalloon 
                  key={`r1-${i}`}
                  value={n}
                  position={[i * 3.8 - 3.8, 0, 0]}
                  color={i === 0 ? "#f43f5e" : i === 1 ? "#eab308" : "#3b82f6"}
                  status={lastStatus}
                  onClick={() => {
                    if (n === data.round1.answer) handleCorrect();
                    else handleWrong();
                  }}
                />
              ))}
            </group>
          )}

          {currentRound === 2 && (
            <group>
              {data.round2.numbers.map((n, i) => (
                <SortingBlock 
                  key={`r2-${i}`}
                  value={n}
                  position={[i * 2.5 - 3.75, 0, 0]}
                  color={["#ef4444", "#f59e0b", "#10b981", "#3b82f6"][i % 4]}
                  isSelected={r2Selected.includes(n)}
                  status={lastStatus}
                  onClick={() => {
                    if (r2Selected.includes(n)) return;
                    const newSel = [...r2Selected, n];
                    setR2Selected(newSel);
                    sound.pickup();
                    
                    if (newSel.length === 4) {
                      if (JSON.stringify(newSel) === JSON.stringify(data.round2.answer)) {
                        handleCorrect();
                      } else {
                        handleWrong();
                      }
                    }
                  }}
                />
              ))}
            </group>
          )}

          {currentRound === 3 && (
            <group>
              {/* Number line glowing track */}
              <mesh position={[0, -1.2, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.08, 0.08, 12, 16]} />
                <meshStandardMaterial color="#94a3b8" emissive="#475569" emissiveIntensity={0.5} />
              </mesh>
              {data.round3.sequence.map((n, i) => (
                <group key={`r3-${i}`}>
                   {/* Track points */}
                   <mesh position={[i * 2.8 - 4.2, -1.2, 0]}>
                     <sphereGeometry args={[0.2, 16, 16]} />
                     <meshStandardMaterial color="#cbd5e1" emissive="#94a3b8" emissiveIntensity={0.5} />
                   </mesh>
                   <CloudBox 
                     position={[i * 2.8 - 4.2, 0, 0]}
                     value={n}
                     isCheated={n === -1}
                     status={lastStatus}
                     onClick={() => {}} // Just visual for now
                   />
                </group>
              ))}
            </group>
          )}

          <Environment preset="city" />
          <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={10} blur={2.4} far={4.5} />
        </Canvas>

        {/* 2D HUD Overlays */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none w-full px-8 text-center flex flex-col items-center">
            {currentRound === 1 && (
                <div className="animate-bounce-in">
                  <h2 className="text-xl md:text-3xl font-black text-slate-700 bg-white py-4 px-8 md:px-12 rounded-full border-4 border-slate-200 shadow-[0_8px_0_#cbd5e1] inline-block tracking-tight">
                      Hãy chạm vào số <span className="text-rose-500 text-2xl md:text-4xl ml-2">LỚN NHẤT</span>
                  </h2>
                </div>
            )}
            {currentRound === 2 && (
                <div className="animate-bounce-in">
                  <h2 className="text-xl md:text-3xl font-black text-slate-700 bg-white py-4 px-8 md:px-12 rounded-full border-4 border-slate-200 shadow-[0_8px_0_#cbd5e1] inline-block tracking-tight">
                      Chạm các khối theo thứ tự <span className="text-emerald-500 text-2xl md:text-4xl ml-2">TĂNG DẦN</span>
                  </h2>
                </div>
            )}
            {currentRound === 3 && (
                <div className="flex flex-col items-center gap-6">
                    <div className="animate-bounce-in">
                      <h2 className="text-xl md:text-3xl font-black text-slate-700 bg-white py-4 px-8 md:px-12 rounded-full border-4 border-slate-200 shadow-[0_8px_0_#cbd5e1] inline-block tracking-tight">
                          Số nào bị ẩn dưới <span className="text-blue-500 text-2xl md:text-4xl ml-2">ĐÁM MÂY</span>?
                      </h2>
                    </div>
                    <div className="flex gap-4 pointer-events-auto transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {data.round3.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (opt === data.round3.answer) handleCorrect();
                                    else handleWrong();
                                }}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-amber-400 text-white font-black text-4xl shadow-[0_8px_0_#b45309] hover:-translate-y-2 hover:shadow-[0_12px_0_#b45309] active:translate-y-2 active:shadow-none transition-all border-4 border-white flex items-center justify-center"
                            >
                                <span style={{ WebkitTextStroke: '2px #92400e' }}>{opt}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {currentRound === 2 && r2Selected.length > 0 && (
                <div className="mt-6 pointer-events-none flex justify-center gap-3">
                    {r2Selected.map((n, idx) => (
                        <div key={idx} className="bg-amber-400 border-4 border-white text-white px-5 py-2 rounded-2xl font-black text-2xl shadow-[0_6px_0_#b45309] animate-kids-bounce-in">
                            <span style={{ WebkitTextStroke: '1.5px #92400e' }}>{n}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-blue-100 to-amber-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Bar - Premium Style */}
      <div className="p-4 flex items-center justify-between z-20 w-full max-w-7xl mx-auto">
        <button
          onClick={() => setShowExitGate(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/90 backdrop-blur-md rounded-full text-sky-800 font-extrabold shadow-lg hover:bg-white transition-all transform hover:-translate-x-1 active:scale-95 border border-white/40"
        >
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Mục lục</span>
        </button>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/40">
                <div className="text-xl">🤖</div>
                <div className="text-sky-800 font-black text-sm hidden md:block">Robot Tí Tách Phiêu Lưu</div>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={toggleFullScreen}
                className="p-3 bg-white/90 rounded-full text-sky-800 shadow-md hover:bg-white transition-all active:scale-90"
            >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button 
                onClick={() => {
                    const next = sound.toggleSound();
                    setSoundOn(next);
                }}
                className={`p-3 rounded-full shadow-md transition-all active:scale-90 ${soundOn ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-400'}`}
            >
                {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button 
                onClick={() => {
                    const next = sound.toggleVoice();
                    setVoiceOn(next);
                }}
                className={`p-3 rounded-full shadow-md transition-all active:scale-90 ${voiceOn ? 'bg-sky-500 text-white' : 'bg-white/90 text-slate-400'}`}
            >
                {voiceOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <div className="px-4 py-2.5 bg-gradient-to-b from-amber-300 to-amber-500 text-amber-900 rounded-full font-black flex items-center gap-2 shadow-lg border-b-4 border-amber-600">
                <Star fill="currentColor" size={20} className="animate-pulse" /> {totalStars}
            </div>
            <button 
                onClick={() => {
                  setData(generateRounds());
                  setCurrentRound(1);
                  setGameState("playing");
                  setR2Selected([]);
                  setTotalStars(0);
                }}
                className="p-3 bg-white/90 rounded-full text-sky-800 shadow-md hover:bg-white transition-all active:scale-90"
                title="Chơi lại từ đầu"
            >
                <div className="relative">
                  <Star size={20} className="text-sky-800" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
                </div>
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {gameState === "intro" && (
          <IntroScreen onStart={() => {
            sound.click();
            setGameState("playing");
          }} />
        )}

        {gameState === "playing" && (
          <div className="w-full max-w-4xl bg-white/60 backdrop-blur-xl border-2 border-white p-8 md:p-14 rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] animate-zoom-in">
            {renderRound()}
          </div>
        )}

        {gameState === "victory" && (
          <div className="relative w-full max-w-2xl animate-bounce-in">
             {/* Rainbow banner */}
            <div className="relative w-full mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 rounded-full blur-sm opacity-60 scale-105" />
              <div className="relative bg-gradient-to-r from-rose-400 via-amber-400 via-emerald-400 via-sky-400 to-violet-400 rounded-full px-8 py-4 shadow-lg">
                <h1 className="text-center font-black text-white text-2xl tracking-wide drop-shadow-md">
                  TUYỆT VỜI! CON ĐÃ HOÀN THÀNH BÀI 1!
                </h1>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-10 md:p-12 rounded-[3rem] shadow-2xl border border-white flex flex-col items-center">
              {/* 3 big stars */}
              <div className="flex justify-center items-end gap-2 mb-6">
                <span className="text-6xl drop-shadow-lg animate-kids-bounce-in" style={{ animationDelay: "0.1s" }}>⭐</span>
                <span className="text-7xl drop-shadow-lg animate-kids-bounce-in -mt-4" style={{ animationDelay: "0.3s" }}>⭐</span>
                <span className="text-6xl drop-shadow-lg animate-kids-bounce-in" style={{ animationDelay: "0.5s" }}>⭐</span>
              </div>

              {/* Bear character + speech bubble */}
              <div className="flex items-end justify-center gap-6 mb-8">
                <div className="text-center animate-kids-bounce-in" style={{ animationDelay: "0.4s" }}>
                  <div className="text-8xl sm:text-9xl drop-shadow-xl">🐻</div>
                  <div className="relative -mt-8">
                    <span className="absolute -left-6 -top-10 text-2xl animate-float-slow">🎊</span>
                    <span className="absolute -right-6 -top-12 text-2xl animate-float-slow" style={{ animationDelay: "0.5s" }}>🎉</span>
                  </div>
                </div>

                <div className="relative bg-white rounded-3xl shadow-xl px-6 py-4 max-w-[220px] animate-fade-in-up border-2 border-sky-100" style={{ animationDelay: "0.6s" }}>
                  <p className="font-extrabold text-gray-700 text-base leading-snug">
                    Chúc mừng con đã hoàn thành bài ôn tập! <br /> Sẵn sàng cho bài học mới nhé! 🥰
                  </p>
                  <div className="absolute -left-2 bottom-6 w-5 h-5 bg-white rotate-45 border-l-2 border-b-2 border-sky-100" />
                </div>
              </div>

              {/* Score summary */}
              <div className="flex items-center gap-3 bg-white border-2 border-amber-200 px-6 py-3 rounded-full shadow-md mb-8">
                <Trophy size={24} className="text-amber-500" />
                <span className="font-black text-amber-600 text-xl">
                  {totalStars} / 3 ⭐
                </span>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/student/quiz/math2-b1")}
                  className="sm:col-span-2 bg-gradient-to-b from-blue-400 to-indigo-600 text-white font-black text-2xl py-5 rounded-2xl shadow-[0_8px_0_#3730a3] active:translate-y-2 active:shadow-none transition-all hover:scale-[1.02]"
                >
                  LÀM BÀI QUIZ NGAY ➔
                </button>
                <button
                  onClick={() => {
                    setData(generateRounds());
                    setCurrentRound(1);
                    setGameState("playing");
                    setR2Selected([]);
                    setTotalStars(0);
                  }}
                  className="bg-white text-sky-600 border-b-4 border-sky-200 font-extrabold py-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} /> CHƠI LẠI
                </button>
                <button
                  onClick={() => navigate("/student")}
                  className="bg-white text-slate-600 border-b-4 border-slate-200 font-extrabold py-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Home size={20} /> MỤC LỤC
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showExitGate && (
        <ParentGate
          onSuccess={() => navigate("/student")}
          onClose={() => setShowExitGate(false)}
        />
      )}

      {/* ─── Floating AI Chatbot ──────────────────────────────────── */}
      <B1FloatingTitechAssistant
        messages={chatMessages}
        robotChatOpen={robotChatOpen}
        onToggle={() => setRobotChatOpen((o) => !o)}
        value={robotInput}
        onChange={setRobotInput}
        onSend={() => void sendRobotQuestion()}
        loading={robotLoading}
        onClose={() => setRobotChatOpen(false)}
      />
    </div>
  );
}
