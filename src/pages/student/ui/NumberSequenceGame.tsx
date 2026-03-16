import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  createContext,
  useContext,
  type DragEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  Trophy,
  MapPin,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Home,
  Play,
  Maximize,
  Minimize,
} from "lucide-react";
import { useGameSound } from "@/shared/lib/useGameSound";
import {
  MAPS,
  ROBOT_HINTS,
  ROBOT_GREETINGS,
  getRandomItem,
  generateBridgePuzzle,
  generateTrainPuzzle,
  generateBalloonPuzzle,
  generateRabbitPuzzle,
} from "@/shared/lib/robotGameLogic";
import { ParentGate } from "@/shared/ui/ParentGate";

// ═══════════════════════════════════════════════════════════════════════════════
// SOUND CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════

type GameSoundAPI = ReturnType<typeof useGameSound>;
const GameSoundContext = createContext<GameSoundAPI | null>(null);

function useSounds(): GameSoundAPI {
  const ctx = useContext(GameSoundContext);
  if (!ctx) throw new Error("useSounds must be used inside GameSoundContext");
  return ctx;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Robot Tí Tách ────────────────────────────────────────────────────────────

function RobotCharacter({
  message,
  size = "md",
}: Readonly<{
  message: string;
  size?: "sm" | "md" | "lg";
}>) {
  const sizeMap = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32" };

  return (
    <div className="flex items-end gap-2">
      {/* Robot body */}
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
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
        />
      </div>

      {/* Speech bubble */}
      {message && (
        <div className="relative bg-white rounded-2xl shadow-lg px-4 py-2.5 max-w-[260px] animate-fade-in-up">
          <div className="absolute -left-2 bottom-3 w-4 h-4 bg-white rotate-45" />
          <p className="text-sm font-bold text-gray-700 relative z-10">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A855F7",
  "#3B82F6",
  "#F472B6",
  "#34D399",
  "#FB923C",
];

function ConfettiEffect() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 1.5 + Math.random() * 1.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animation: `confetti-drop ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Stars badge ──────────────────────────────────────────────────────────────

function StarsDisplay({ count }: Readonly<{ count: number }>) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={22}
          className={`transition-all duration-300 ${
            i <= count
              ? "text-yellow-400 fill-yellow-400 scale-110"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Victory Modal ────────────────────────────────────────────────────────────

function VictoryModal({
  stars,
  onNext,
  onReplay,
  message,
  isLastMap,
}: Readonly<{
  stars: number;
  onNext: () => void;
  onReplay: () => void;
  message: string;
  isLastMap: boolean;
}>) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <ConfettiEffect />
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-kids-bounce-in relative z-50">
        <div className="text-6xl mb-3">🏆</div>
        <h2 className="text-2xl font-extrabold text-emerald-600 mb-2">
          Hoàn thành!
        </h2>
        <div className="flex justify-center mb-2">
          <StarsDisplay count={stars} />
        </div>
        <p className="text-gray-500 font-bold mt-3 mb-6">{message}</p>
        <div className="space-y-3">
          {!isLastMap && (
            <button
              onClick={onNext}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white
                         font-extrabold text-lg py-3 rounded-2xl shadow-md
                         hover:shadow-lg transition-all active:scale-95
                         flex items-center justify-center gap-2"
            >
              Map tiếp theo <ChevronRight size={20} />
            </button>
          )}
          <button
            onClick={onReplay}
            className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white
                       font-extrabold py-3 rounded-2xl shadow-md transition-all active:scale-95
                       flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> Chơi lại
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAP 1: VƯỜN TÁO SỐ — Kéo thả số (quả táo) vào tia số
// ═══════════════════════════════════════════════════════════════════════════════

function AppleGardenMap({
  onComplete,
  difficulty,
}: Readonly<{
  onComplete: (stars: number) => void;
  difficulty: number;
}>) {
  const fixedNumberLine = [1, 2, null, 4, null, 6, null];
  const fixedMissingIndices = [2, 4, 6];
  const fixedAnswers: Record<number, number> = { 2: 3, 4: 5, 6: 7 };

  const [placed, setPlaced] = useState<Record<number, number | null>>({});
  const [remaining, setRemaining] = useState<number[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [robotMsg, setRobotMsg] = useState(
    "Kéo quả táo vào ô trống trên tia số nhé! 🍎",
  );
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const [touchDragValue, setTouchDragValue] = useState<number | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const dropZoneRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const completedRef = useRef(false);

  useEffect(() => {
    setRemaining([3, 5, 7]);
    setPlaced({ 2: null, 4: null, 6: null });
    setAttempts(0);
    completedRef.current = false;
  }, [difficulty]);

  const sound = useSounds();

  const tryDrop = useCallback(
    (targetIdx: number, value: number) => {
      const correct = fixedAnswers[targetIdx];
      if (value === correct) {
        setPlaced((p) => ({ ...p, [targetIdx]: value }));
        setRemaining((r) => {
          const idx = r.indexOf(value);
          return idx >= 0 ? [...r.slice(0, idx), ...r.slice(idx + 1)] : r;
        });
        const msg = sound.correctVoice();
        setRobotMsg(msg);
      } else {
        setAttempts((a) => a + 1);
        const msg = sound.wrongVoice();
        setRobotMsg(msg);
        setShake(targetIdx);
        setTimeout(() => setShake(null), 500);
      }
    },
    [sound],
  );

  const handleDrop = (targetIdx: number) => {
    if (dragging === null) return;
    sound.drop();
    tryDrop(targetIdx, dragging);
    setDragging(null);
  };

  const handleTouchStart = (value: number, e: ReactTouchEvent) => {
    e.preventDefault();
    sound.pickup();
    setTouchDragValue(value);
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (touchDragValue === null) return;
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (touchDragValue === null || touchPos === null) {
      setTouchDragValue(null);
      setTouchPos(null);
      return;
    }
    for (const [idx, el] of dropZoneRefs.current.entries()) {
      const rect = el.getBoundingClientRect();
      if (
        touchPos.x >= rect.left &&
        touchPos.x <= rect.right &&
        touchPos.y >= rect.top &&
        touchPos.y <= rect.bottom
      ) {
        tryDrop(idx, touchDragValue);
        break;
      }
    }
    setTouchDragValue(null);
    setTouchPos(null);
  };

  // Check victory
  useEffect(() => {
    if (completedRef.current) return;
    if (fixedMissingIndices.length === 0) return;
    const allFilled = fixedMissingIndices.every(
      (i) => typeof placed[i] === "number",
    );
    if (allFilled) {
      completedRef.current = true;
      const stars = attempts === 0 ? 3 : attempts <= 2 ? 2 : 1;
      setTimeout(() => onComplete(stars), 600);
    }
  }, [placed, attempts, onComplete]);

  return (
    <div
      className="relative rounded-[30px] overflow-hidden border-2 border-emerald-900/35 shadow-[0_16px_35px_rgba(21,84,52,0.24)]"
      style={{
        backgroundImage: "url('/NenVuonTao.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-5 sm:py-6 min-h-[560px] sm:min-h-[620px]">
        <div className="absolute left-1/2 -translate-x-1/2 top-5 sm:top-6 w-[76%] max-w-[620px]">
          <img src="/bang.png" alt="Tiêu đề" className="w-full object-contain" />
        </div>

        <div className="absolute left-[8%] top-[34%] w-[19%] min-w-[88px] max-w-[160px]">
          <img src="/robot%20(1).png" alt="Robot" className="w-full object-contain drop-shadow" />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-[25%] w-[40%] min-w-[220px] max-w-[370px]">
          <img src="/khungThoai.png" alt="Khung thoại" className="w-full object-contain" />
          <p className="absolute left-[15%] right-[15%] top-[22%] bottom-[22%] flex items-center justify-center text-[13px] sm:text-[16px] font-black text-gray-800 text-center leading-tight">
            {robotMsg}
          </p>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-[56%] w-[78%]">
          <div className="h-[7px] bg-amber-500 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]" />
          <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-l-[16px] border-l-amber-500 border-y-[10px] border-y-transparent" />

          <div className="absolute left-[8%] right-[8%] -top-[22px] flex items-end justify-between">
            {fixedNumberLine.map((num, idx) => {
              const isMissing = fixedMissingIndices.includes(idx);
              const placedValue = placed[idx];

              return (
                <div
                  key={`nl-${idx}`}
                  ref={(el) => {
                    if (el && isMissing && placedValue === null) {
                      dropZoneRefs.current.set(idx, el);
                    } else {
                      dropZoneRefs.current.delete(idx);
                    }
                  }}
                  className={`flex flex-col items-center ${shake === idx ? "animate-shake" : ""}`}
                  onDragOver={(e: DragEvent) => {
                    if (isMissing && placedValue === null) e.preventDefault();
                  }}
                  onDrop={() => {
                    if (isMissing && placedValue === null) handleDrop(idx);
                  }}
                >
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-xl sm:text-2xl ${
                      isMissing && placedValue === null
                        ? "border-2 border-dashed border-amber-500 bg-amber-50/95 text-amber-500"
                        : isMissing && placedValue !== null
                          ? "bg-emerald-500 text-white shadow-lg border-2 border-emerald-300"
                          : "bg-[#f1e9c9]/95 text-stone-700 border-2 border-amber-700/55"
                    }`}
                  >
                    {isMissing ? (placedValue !== null ? placedValue : "?") : num}
                  </div>
                  <div className="w-1 h-2 bg-amber-800/70 rounded-full mt-1" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-[21%] flex items-center justify-center gap-6 sm:gap-8 min-h-[86px]">
          {remaining.map((num, i) => (
            <div
              key={`apple-${num}-${i}`}
              draggable
              onDragStart={() => {
                sound.pickup();
                setDragging(num);
              }}
              onTouchStart={(e) => handleTouchStart(num, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`cursor-grab active:cursor-grabbing select-none hover:scale-105 active:scale-95 transition-transform ${dragging === num ? "opacity-50 scale-90" : ""}`}
            >
              <img
                src={num === 3 ? "/tao3.png" : num === 5 ? "/tao5.png" : "/tao7.png"}
                alt={`Táo số ${num}`}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow"
              />
            </div>
          ))}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-[8%]" />
      </div>

      {touchDragValue !== null && touchPos && (
        <div className="fixed z-50 pointer-events-none" style={{ left: touchPos.x - 32, top: touchPos.y - 32 }}>
          <img
            src={
              touchDragValue === 3
                ? "/tao3.png"
                : touchDragValue === 5
                  ? "/tao5.png"
                  : "/tao7.png"
            }
            alt="Táo đang kéo"
            className="w-16 h-16 object-contain drop-shadow-2xl opacity-95"
          />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAP 2: CÂY CẦU SỐ — Robot nhảy qua bậc đá (số liền trước/sau)
// ═══════════════════════════════════════════════════════════════════════════════

function BridgeMap({
  onComplete,
  difficulty,
}: Readonly<{
  onComplete: (stars: number) => void;
  difficulty: number;
}>) {
  const [puzzle, setPuzzle] = useState(() => generateBridgePuzzle(difficulty));
  const [robotPos, setRobotPos] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [robotMsg, setRobotMsg] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const p = generateBridgePuzzle(difficulty);
    setPuzzle(p);
    setRobotPos(0);
    setAnswered(false);
    setSelected(null);
    setIsCorrect(null);
    setAttempts(0);
    setRobotMsg(
      `Tìm số liền ${p.type === "next" ? "sau" : "trước"} rồi giúp mình nhảy qua cầu nhé! 🌉`,
    );
  }, [difficulty]);

  const sound = useSounds();

  const handleSelect = (value: number) => {
    if (answered) return;
    setSelected(value);
    sound.click();
    if (value === puzzle.correctAnswer) {
      setIsCorrect(true);
      setAnswered(true);
      const msg = sound.correctVoice();
      setRobotMsg(msg);
      // Robot jumps across stones
      let pos = 0;
      const jump = () => {
        pos++;
        setRobotPos(pos);
        if (pos < puzzle.stones.length - 1) {
          setTimeout(jump, 320);
        } else {
          const stars = attempts === 0 ? 3 : attempts <= 1 ? 2 : 1;
          setTimeout(() => onComplete(stars), 600);
        }
      };
      setTimeout(jump, 300);
    } else {
      setIsCorrect(false);
      setAttempts((a) => a + 1);
      const msg = sound.wrongVoice();
      setRobotMsg(msg);
      setTimeout(() => {
        setSelected(null);
        setIsCorrect(null);
      }, 1000);
    }
  };

  // Determine question text
  const questionRef =
    puzzle.type === "next"
      ? puzzle.stones[puzzle.missingIndex - 1]
      : puzzle.stones[puzzle.missingIndex + 1];
  const questionText =
    puzzle.type === "next"
      ? `Số liền sau của ${questionRef} là bao nhiêu?`
      : `Số liền trước của ${questionRef} là bao nhiêu?`;

  return (
    <div className="space-y-6">
      <RobotCharacter message={robotMsg} size="sm" />

      {/* Bridge scene */}
      <div className="relative bg-gradient-to-b from-sky-200 to-blue-300 rounded-3xl p-4 sm:p-6 shadow-inner min-h-[220px] overflow-hidden">
        {/* Water  */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-500/60 to-blue-400/30 rounded-b-3xl" />
        {/* Waves */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-around opacity-50">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="text-lg animate-float-slow"
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              〰️
            </span>
          ))}
        </div>

        {/* Stones */}
        <div className="relative flex items-end justify-center gap-2 sm:gap-3 pb-16 pt-10">
          {puzzle.stones.map((num, idx) => {
            const isMissing = idx === puzzle.missingIndex && !answered;
            const isRobotHere = idx === robotPos;

            return (
              <div
                key={`stone-${idx}`}
                className="flex flex-col items-center relative"
              >
                {/* Robot on stone */}
                {isRobotHere && (
                  <div className="absolute -top-14 z-20 robot-jump">
                    <div className="w-11 h-11 bg-gradient-to-b from-sky-400 to-sky-500 rounded-xl border-3 border-sky-300 flex flex-col items-center justify-center shadow-lg">
                      <div className="flex gap-1 text-white text-xs font-bold">
                        <span>◕</span>
                        <span>◕</span>
                      </div>
                      <span className="text-white text-[10px]">◡</span>
                    </div>
                    {/* Robot legs */}
                    <div className="flex justify-center gap-1 -mt-0.5">
                      <div className="w-2 h-3 bg-sky-600 rounded-b" />
                      <div className="w-2 h-3 bg-sky-600 rounded-b" />
                    </div>
                  </div>
                )}

                {/* Stone block */}
                <div
                  className={`
                    w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center
                    font-extrabold text-lg sm:text-xl transition-all duration-300 relative z-10
                    ${
                      isMissing
                        ? "bg-amber-300 border-3 border-amber-400 text-amber-700 animate-pulse-slow shadow-lg"
                        : answered && idx === puzzle.missingIndex
                          ? "bg-green-400 border-3 border-green-300 text-white shadow-lg"
                          : "bg-gradient-to-b from-stone-300 to-stone-400 border-3 border-stone-500 text-white shadow-md"
                    }
                  `}
                >
                  {isMissing ? "❓" : num}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question & options */}
      {!answered && (
        <div className="text-center space-y-4">
          <p className="font-extrabold text-sky-700 text-base sm:text-lg">
            {questionText}
          </p>
          <div className="flex justify-center gap-4">
            {puzzle.options.map((opt) => (
              <button
                key={`opt-${opt}`}
                onClick={() => handleSelect(opt)}
                className={`
                  w-16 h-16 sm:w-18 sm:h-18 rounded-2xl font-extrabold text-2xl
                  transition-all duration-200 shadow-md
                  ${
                    selected === opt && isCorrect === false
                      ? "bg-red-400 text-white scale-90 animate-shake"
                      : selected === opt && isCorrect === true
                        ? "bg-green-400 text-white scale-110"
                        : "bg-white text-gray-700 hover:bg-sky-50 hover:scale-105 active:scale-95 border-2 border-sky-200"
                  }
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAP 3: ĐƯỜNG RAY TÀU SỐ — Kéo toa tàu vào dãy số
// ═══════════════════════════════════════════════════════════════════════════════

function TrainMap({
  onComplete,
  difficulty,
}: Readonly<{
  onComplete: (stars: number) => void;
  difficulty: number;
}>) {
  const [puzzle, setPuzzle] = useState(() => generateTrainPuzzle(difficulty));
  const [placed, setPlaced] = useState<Record<number, number | null>>({});
  const [remaining, setRemaining] = useState<number[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [robotMsg, setRobotMsg] = useState(
    "Kéo toa tàu vào đúng vị trí trên đường ray! 🚂",
  );
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const [touchDragValue, setTouchDragValue] = useState<number | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const dropZoneRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const completedRef = useRef(false);

  useEffect(() => {
    const p = generateTrainPuzzle(difficulty);
    setPuzzle(p);
    setRemaining([...p.trainCars]);
    const init: Record<number, number | null> = {};
    p.missingIndices.forEach((i) => (init[i] = null));
    setPlaced(init);
    setAttempts(0);
    completedRef.current = false;
  }, [difficulty]);

  const sound = useSounds();

  const tryDrop = useCallback(
    (targetIdx: number, value: number) => {
      const correct = puzzle.fullSequence[targetIdx];
      if (value === correct) {
        setPlaced((p) => ({ ...p, [targetIdx]: value }));
        setRemaining((r) => {
          const i = r.indexOf(value);
          return i >= 0 ? [...r.slice(0, i), ...r.slice(i + 1)] : r;
        });
        const msg = sound.correctVoice();
        setRobotMsg(msg);
      } else {
        setAttempts((a) => a + 1);
        const msg = sound.wrongVoice();
        setRobotMsg(msg);
        setShake(targetIdx);
        setTimeout(() => setShake(null), 500);
      }
    },
    [puzzle.fullSequence, sound],
  );

  const handleDrop = (targetIdx: number) => {
    if (dragging === null) return;
    sound.drop();
    tryDrop(targetIdx, dragging);
    setDragging(null);
  };

  const handleTouchStart = (value: number, e: ReactTouchEvent) => {
    e.preventDefault();
    sound.pickup();
    setTouchDragValue(value);
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };
  const handleTouchMove = (e: ReactTouchEvent) => {
    if (touchDragValue === null) return;
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };
  const handleTouchEnd = () => {
    if (touchDragValue === null || touchPos === null) {
      setTouchDragValue(null);
      setTouchPos(null);
      return;
    }
    for (const [idx, el] of dropZoneRefs.current.entries()) {
      const rect = el.getBoundingClientRect();
      if (
        touchPos.x >= rect.left &&
        touchPos.x <= rect.right &&
        touchPos.y >= rect.top &&
        touchPos.y <= rect.bottom
      ) {
        tryDrop(idx, touchDragValue);
        break;
      }
    }
    setTouchDragValue(null);
    setTouchPos(null);
  };

  useEffect(() => {
    if (completedRef.current) return;
    if (puzzle.missingIndices.length === 0) return;
    const allFilled = puzzle.missingIndices.every(
      (i) => typeof placed[i] === "number",
    );
    if (allFilled && remaining.length === 0) {
      completedRef.current = true;
      const stars = attempts === 0 ? 3 : attempts <= 2 ? 2 : 1;
      setTimeout(() => onComplete(stars), 600);
    }
  }, [placed, puzzle.missingIndices, attempts, onComplete, remaining]);

  return (
    <div className="space-y-6">
      <RobotCharacter message={robotMsg} size="sm" />

      <div className="bg-gradient-to-b from-amber-100 to-yellow-200 rounded-3xl p-4 sm:p-6 shadow-inner">
        <p className="text-center text-amber-700 font-extrabold text-sm mb-4">
          🚂 Đường ray tàu số
        </p>

        <div className="relative">
          {/* Rail tracks */}
          <div className="absolute bottom-7 left-0 right-0 h-2 bg-amber-700 rounded-full" />
          <div className="absolute bottom-5 left-0 right-0 h-1.5 bg-amber-800 rounded-full" />
          {/* Rail ties */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="w-2 h-4 bg-amber-900/40 rounded-sm" />
            ))}
          </div>

          <div className="flex items-end justify-center gap-1 sm:gap-2 pb-10 relative z-10">
            {/* Locomotive */}
            <div className="flex flex-col items-center mr-1">
              <div className="w-14 h-16 bg-gradient-to-b from-red-500 to-red-600 rounded-t-2xl rounded-b-lg border-3 border-red-400 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🚂</span>
              </div>
              <div className="flex gap-1.5 -mt-1">
                <div className="w-4 h-4 bg-gray-700 rounded-full border-2 border-gray-500" />
                <div className="w-4 h-4 bg-gray-700 rounded-full border-2 border-gray-500" />
              </div>
            </div>

            {/* Cars */}
            {puzzle.fullSequence.map((num, idx) => {
              const isMissing = puzzle.missingIndices.includes(idx);
              const placedValue = placed[idx];

              return (
                <div key={`car-${idx}`} className="flex flex-col items-center">
                  <div
                    ref={(el) => {
                      if (el && isMissing && placedValue === null) {
                        dropZoneRefs.current.set(idx, el);
                      } else {
                        dropZoneRefs.current.delete(idx);
                      }
                    }}
                    className={`
                      w-11 h-14 sm:w-14 sm:h-16 rounded-lg flex items-center justify-center
                      font-extrabold text-lg transition-all duration-300
                      ${shake === idx ? "animate-shake" : ""}
                      ${
                        isMissing && placedValue === null
                          ? "border-3 border-dashed border-orange-400 bg-orange-50 text-orange-300"
                          : isMissing && placedValue !== null
                            ? "bg-green-400 text-white shadow-lg border-3 border-green-300"
                            : "bg-gradient-to-b from-amber-400 to-amber-500 text-white border-3 border-amber-300 shadow-md"
                      }
                    `}
                    onDragOver={(e: DragEvent) => {
                      if (isMissing && placedValue === null) e.preventDefault();
                    }}
                    onDrop={() => {
                      if (isMissing && placedValue === null) handleDrop(idx);
                    }}
                  >
                    {isMissing
                      ? placedValue !== null
                        ? placedValue
                        : "?"
                      : num}
                  </div>
                  <div className="flex gap-1 -mt-1 relative z-10">
                    <div className="w-3 h-3 bg-gray-700 rounded-full border border-gray-500" />
                    <div className="w-3 h-3 bg-gray-700 rounded-full border border-gray-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smoke effect */}
        <div className="absolute top-4 left-16 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-gray-300/60 rounded-full animate-float-slow"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </div>
      </div>

      {/* Spare cars */}
      <div className="text-center">
        <p className="text-amber-700 font-extrabold text-sm mb-3">
          🚃 Kéo toa tàu vào đúng vị trí:
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          {remaining.map((num, i) => (
            <div
              key={`spare-${num}-${i}`}
              draggable
              onDragStart={() => {
                sound.pickup();
                setDragging(num);
              }}
              onTouchStart={(e) => handleTouchStart(num, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-14 h-16 sm:w-16 sm:h-18 rounded-lg cursor-grab active:cursor-grabbing
                         bg-gradient-to-b from-blue-400 to-blue-500 text-white font-extrabold text-xl
                         flex items-center justify-center shadow-lg select-none
                         hover:scale-110 active:scale-95 transition-transform border-3 border-blue-300"
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {touchDragValue !== null && touchPos && (
        <div
          className="fixed z-50 pointer-events-none w-14 h-16 rounded-lg
                     bg-gradient-to-b from-blue-400 to-blue-500 text-white font-extrabold text-xl
                     flex items-center justify-center shadow-2xl border-3 border-blue-300 opacity-90"
          style={{ left: touchPos.x - 28, top: touchPos.y - 32 }}
        >
          {touchDragValue}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAP 4: THÀNH PHỐ BÓNG BAY — Kéo bóng bay mang số về đúng vị trí
// ═══════════════════════════════════════════════════════════════════════════════

function BalloonCityMap({
  onComplete,
  difficulty,
}: Readonly<{
  onComplete: (stars: number) => void;
  difficulty: number;
}>) {
  const [puzzle, setPuzzle] = useState(() => generateBalloonPuzzle(difficulty));
  const [placed, setPlaced] = useState<Record<number, number | null>>({});
  const [remaining, setRemaining] = useState<typeof puzzle.balloons>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [robotMsg, setRobotMsg] = useState(
    "Bắt bóng bay và kéo về đúng ô trống! 🎈",
  );
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const [touchDragValue, setTouchDragValue] = useState<number | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const dropZoneRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const completedRef = useRef(false);

  useEffect(() => {
    const p = generateBalloonPuzzle(difficulty);
    setPuzzle(p);
    setRemaining([...p.balloons]);
    const init: Record<number, number | null> = {};
    p.missingIndices.forEach((i) => (init[i] = null));
    setPlaced(init);
    setAttempts(0);
    completedRef.current = false;
  }, [difficulty]);

  const sound = useSounds();

  const tryDrop = useCallback(
    (targetIdx: number, value: number) => {
      const correct = puzzle.numberLine[targetIdx];
      if (value === correct) {
        setPlaced((p) => ({ ...p, [targetIdx]: value }));
        setRemaining((r) => r.filter((b) => b.value !== value));
        const msg = sound.correctVoice();
        setRobotMsg(msg);
      } else {
        setAttempts((a) => a + 1);
        const msg = sound.wrongVoice();
        setRobotMsg(msg);
        setShake(targetIdx);
        setTimeout(() => setShake(null), 500);
      }
    },
    [puzzle.numberLine, sound],
  );

  const handleDrop = (targetIdx: number) => {
    if (dragging === null) return;
    sound.drop();
    tryDrop(targetIdx, dragging);
    setDragging(null);
  };

  const handleTouchStart = (value: number, e: ReactTouchEvent) => {
    e.preventDefault();
    sound.pickup();
    setTouchDragValue(value);
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };
  const handleTouchMove = (e: ReactTouchEvent) => {
    if (touchDragValue === null) return;
    const touch = e.touches[0];
    setTouchPos({ x: touch.clientX, y: touch.clientY });
  };
  const handleTouchEnd = () => {
    if (touchDragValue === null || touchPos === null) {
      setTouchDragValue(null);
      setTouchPos(null);
      return;
    }
    for (const [idx, el] of dropZoneRefs.current.entries()) {
      const rect = el.getBoundingClientRect();
      if (
        touchPos.x >= rect.left &&
        touchPos.x <= rect.right &&
        touchPos.y >= rect.top &&
        touchPos.y <= rect.bottom
      ) {
        tryDrop(idx, touchDragValue);
        break;
      }
    }
    setTouchDragValue(null);
    setTouchPos(null);
  };

  useEffect(() => {
    if (completedRef.current) return;
    if (puzzle.missingIndices.length === 0) return;
    const allFilled = puzzle.missingIndices.every(
      (i) => typeof placed[i] === "number",
    );
    if (allFilled && remaining.length === 0) {
      completedRef.current = true;
      const stars = attempts === 0 ? 3 : attempts <= 2 ? 2 : 1;
      setTimeout(() => onComplete(stars), 600);
    }
  }, [placed, puzzle.missingIndices, attempts, onComplete, remaining]);

  return (
    <div className="space-y-6">
      <RobotCharacter message={robotMsg} size="sm" />

      {/* Floating balloons */}
      <div className="text-center">
        <p className="text-pink-700 font-extrabold text-sm mb-3">
          🎈 Kéo bóng bay về đúng vị trí:
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {remaining.map((balloon) => (
            <div
              key={`balloon-${balloon.id}`}
              draggable
              onDragStart={() => {
                sound.pickup();
                setDragging(balloon.value);
              }}
              onTouchStart={(e) => handleTouchStart(balloon.value, e)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex flex-col items-center cursor-grab active:cursor-grabbing
                         hover:scale-110 active:scale-95 transition-transform select-none balloon-float"
            >
              <div
                className="w-14 h-[72px] sm:w-16 sm:h-20 rounded-[50%] flex items-center justify-center
                           font-extrabold text-xl text-white shadow-lg border-2 border-white/40
                           relative overflow-hidden"
                style={{ background: balloon.color }}
              >
                {/* Shine */}
                <div className="absolute top-2 left-3 w-3 h-4 bg-white/30 rounded-full rotate-[-20deg]" />
                <span className="relative z-10">{balloon.value}</span>
              </div>
              {/* Knot + string */}
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: balloon.color }}
              />
              <div className="w-px h-8 bg-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* City number line */}
      <div className="bg-gradient-to-b from-pink-100 to-rose-200 rounded-3xl p-4 sm:p-6 shadow-inner relative overflow-hidden">
        {/* City skyline background */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around opacity-20">
          {[40, 60, 35, 70, 45, 55, 30, 65].map((h, i) => (
            <div
              key={i}
              className="bg-gray-500 rounded-t"
              style={{ width: "8%", height: `${h}px` }}
            />
          ))}
        </div>

        <p className="text-center text-pink-700 font-extrabold text-sm mb-4 relative z-10">
          🏙️ Tia số trong thành phố
        </p>
        {/* Arrow line */}
        <div className="relative px-2 mb-2 z-10">
          <div className="h-1 bg-pink-400 rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-pink-400 border-y-4 border-y-transparent" />
        </div>
        <div className="flex items-end justify-center gap-1 sm:gap-2 overflow-x-auto pb-2 relative z-10">
          {puzzle.numberLine.map((num, idx) => {
            const isMissing = puzzle.missingIndices.includes(idx);
            const placedValue = placed[idx];

            return (
              <div
                key={`city-${idx}`}
                ref={(el) => {
                  if (el && isMissing && placedValue === null) {
                    dropZoneRefs.current.set(idx, el);
                  } else {
                    dropZoneRefs.current.delete(idx);
                  }
                }}
                className={`flex flex-col items-center gap-1 ${shake === idx ? "animate-shake" : ""}`}
                onDragOver={(e: DragEvent) => {
                  if (isMissing && placedValue === null) e.preventDefault();
                }}
                onDrop={() => {
                  if (isMissing && placedValue === null) handleDrop(idx);
                }}
              >
                <div
                  className={`
                    w-11 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center
                    font-extrabold text-lg transition-all duration-300
                    ${
                      isMissing && placedValue === null
                        ? "border-3 border-dashed border-pink-400 bg-pink-50 text-pink-300 animate-pulse-slow"
                        : isMissing && placedValue !== null
                          ? "bg-emerald-400 text-white shadow-lg border-3 border-emerald-300"
                          : "bg-white text-pink-700 border-2 border-pink-300 shadow-sm"
                    }
                  `}
                >
                  {isMissing ? (placedValue !== null ? placedValue : "?") : num}
                </div>
                <div className="w-3 h-1 bg-pink-400 rounded-full" />
              </div>
            );
          })}
        </div>
      </div>

      {touchDragValue !== null && touchPos && (
        <div
          className="fixed z-50 pointer-events-none w-14 h-[72px] rounded-[50%]
                     bg-gradient-to-b from-pink-400 to-rose-500 text-white font-extrabold text-xl
                     flex items-center justify-center shadow-2xl border-2 border-white/30 opacity-90"
          style={{ left: touchPos.x - 28, top: touchPos.y - 36 }}
        >
          {touchDragValue}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAP 5: ĐƯỜNG ĐUA THỎ — Chạm vào thỏ để sắp xếp theo thứ tự
// ═══════════════════════════════════════════════════════════════════════════════

function RabbitRaceMap({
  onComplete,
  difficulty,
}: Readonly<{
  onComplete: (stars: number) => void;
  difficulty: number;
}>) {
  const [puzzle, setPuzzle] = useState(() => generateRabbitPuzzle(difficulty));
  const [order, setOrder] = useState<number[]>([]);
  const [robotMsg, setRobotMsg] = useState(
    "Sắp xếp các bạn thỏ theo thứ tự từ bé đến lớn! 🐰",
  );
  const [attempts, setAttempts] = useState(0);
  const [checked, setChecked] = useState(false);

  const sound = useSounds();

  const availableRabbits = puzzle.rabbits.filter(
    (r) => !order.includes(r.value),
  );

  useEffect(() => {
    const p = generateRabbitPuzzle(difficulty);
    setPuzzle(p);
    setOrder([]);
    setChecked(false);
    setAttempts(0);
    const msg = "Sắp xếp các bạn thỏ theo thứ tự từ bé đến lớn! 🐰";
    setRobotMsg(msg);
    sound.speak(msg);
  }, [difficulty, sound]);

  const handleTapRabbit = (value: number) => {
    if (checked) return;
    sound.click();
    setOrder((prev) => [...prev, value]);
  };

  const handleRemoveLast = () => {
    sound.click();
    setOrder((prev) => prev.slice(0, -1));
  };

  const handleCheck = () => {
    const correct =
      order.length === puzzle.correctOrder.length &&
      order.every((v, i) => v === puzzle.correctOrder[i]);
    setChecked(true);
    if (correct) {
      const msg = sound.correctVoice();
      setRobotMsg(msg);
      const stars = attempts === 0 ? 3 : attempts <= 1 ? 2 : 1;
      setTimeout(() => onComplete(stars), 800);
    } else {
      setAttempts((a) => a + 1);
      const msg = sound.wrongVoice();
      setRobotMsg(msg);
      setTimeout(() => {
        setOrder([]);
        setChecked(false);
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      <RobotCharacter message={robotMsg} size="sm" />

      {/* Race track */}
      <div className="bg-gradient-to-r from-violet-100 via-purple-50 to-fuchsia-100 rounded-3xl p-4 sm:p-6 shadow-inner relative overflow-hidden">
        {/* Track lines */}
        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-around opacity-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-0.5 bg-purple-800" />
          ))}
        </div>

        <p className="text-center text-purple-700 font-extrabold text-sm mb-3 relative z-10">
          🏁 Đường đua (từ bé → lớn)
        </p>

        {/* Placed order */}
        <div className="flex items-center gap-2 min-h-[90px] flex-wrap justify-center relative z-10">
          {order.length === 0 && (
            <p className="text-purple-300 font-bold text-sm italic">
              ← Chạm vào thỏ bên dưới để xếp vào đây →
            </p>
          )}
          {order.map((val, i) => {
            const rabbit = puzzle.rabbits.find((r) => r.value === val);
            return (
              <div
                key={`placed-${val}`}
                className="flex flex-col items-center animate-kids-bounce-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="relative">
                  {/* Position number */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-extrabold flex items-center justify-center shadow z-10">
                    {i + 1}
                  </div>
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center
                               text-2xl shadow-lg border-3 border-white/40 transition-all"
                    style={{ background: rabbit?.color ?? "#A78BFA" }}
                  >
                    🐰
                  </div>
                </div>
                <span className="font-extrabold text-purple-700 text-lg mt-1">
                  {val}
                </span>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        {order.length > 0 && !checked && (
          <div className="flex justify-center gap-3 mt-3 relative z-10">
            <button
              onClick={handleRemoveLast}
              className="bg-white text-purple-600 font-bold text-sm px-4 py-2 rounded-xl shadow-sm
                         hover:bg-purple-50 transition-all active:scale-95 flex items-center gap-1"
            >
              <RotateCcw size={14} /> Bỏ cuối
            </button>
            {order.length === puzzle.correctOrder.length && (
              <button
                onClick={handleCheck}
                className="bg-gradient-to-r from-purple-400 to-violet-500 text-white font-extrabold
                           px-6 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                Kiểm tra! ✓
              </button>
            )}
          </div>
        )}
      </div>

      {/* Available rabbits */}
      {availableRabbits.length > 0 && (
        <div className="text-center">
          <p className="text-purple-700 font-extrabold text-sm mb-3">
            🐰 Chạm thỏ để xếp vào đường đua:
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {availableRabbits.map((rabbit) => (
              <button
                key={`rabbit-${rabbit.id}`}
                onClick={() => handleTapRabbit(rabbit.value)}
                className="flex flex-col items-center transition-all duration-200
                           hover:scale-110 active:scale-90 group"
              >
                <div
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center
                             text-2xl shadow-lg border-3 border-white/30
                             group-hover:shadow-xl transition-shadow"
                  style={{ background: rabbit.color }}
                >
                  🐰
                </div>
                <span className="font-extrabold text-gray-700 text-lg mt-1">
                  {rabbit.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTRO SCREEN (shown before Map 1 starts)
// ═══════════════════════════════════════════════════════════════════════════════

function IntroScreen({ onStart }: Readonly<{ onStart: () => void }>) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 md:space-y-5 text-center px-4 w-full h-full min-h-[70vh] pb-8">
      {/* Robot greeting */}
      <div className="flex justify-center hover:scale-105 transition-transform duration-500">
        <RobotCharacter message={getRandomItem(ROBOT_GREETINGS)} size="md" />
      </div>

      {/* Story intro */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-2 border-white/60 max-w-4xl mx-auto transform hover:-translate-y-1 transition-transform duration-300">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400"></div>
        <p className="text-gray-700 font-extrabold text-sm md:text-base leading-relaxed">
          <span className="text-xl inline-block mr-2 animate-bounce">🌪️</span>
          Một cơn bão toán học đã xáo trộn tất cả các số!
          Hãy giúp robot <span className="text-sky-600 font-black relative px-1">Tí Tách<span className="absolute -bottom-0.5 left-0 w-full h-1 bg-sky-300/50 rounded-full"></span></span> vượt qua
          <span className="text-amber-600 font-black text-lg mx-1.5 bg-amber-100/80 px-2.5 py-0.5 rounded-lg border-2 border-amber-200/60 shadow-sm inline-block transform hover:scale-105 transition-transform"> 5 vùng đất </span>
          để thu thập và sắp xếp lại nào! 🤖
        </p>
      </div>

      {/* Map preview list */}
      <div className="w-full max-w-3xl mx-auto grid gap-2">
        {MAPS.map((map, index) => (
          <div
            key={map.id}
            className="group flex items-center gap-3 bg-white/60 hover:bg-white rounded-xl px-4 py-2.5
                       border border-white/60 hover:border-sky-300 shadow-sm hover:shadow-[0_4px_15px_rgba(56,189,248,0.15)] 
                       transition-all duration-300 transform hover:-translate-y-0.5 cursor-default"
            style={{ animation: `fade-in-up 0.4s ease-out ${index * 0.08}s both` }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-sky-50 flex items-center justify-center text-xl shadow-inner border border-sky-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              {map.emoji}
            </div>
            <div className="text-left flex-1">
              <p className="font-extrabold text-gray-800 text-sm group-hover:text-sky-600 transition-colors">
                Vùng {map.id}: {map.name}
              </p>
              <p className="text-[11px] text-gray-500 font-bold mt-0.5 line-clamp-1">
                {map.description}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-sky-100 group-hover:shadow-inner transition-colors duration-300">
               <MapPin size={14} className="text-gray-400 group-hover:text-sky-500 transition-colors duration-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Start button */}
      <div className="pt-2 pb-1">
        <button
          onClick={onStart}
          className="relative overflow-hidden group bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-white font-black
                     text-lg md:text-xl px-10 py-3 rounded-3xl shadow-[0_8px_30px_rgba(56,189,248,0.4)]
                     transition-all duration-300 active:scale-95 hover:scale-105 hover:shadow-[0_12px_40px_rgba(56,189,248,0.5)]"
        >
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 ease-in-out skew-x-12"></div>
          <span className="relative flex items-center justify-center gap-2">
             <span className="text-2xl group-hover:animate-bounce drop-shadow-md">🚀</span> 
             <span>Bắt đầu phiêu lưu!</span>
          </span>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL VICTORY SCREEN (after completing all 5 maps)
// ═══════════════════════════════════════════════════════════════════════════════

function FinalVictoryScreen({
  totalStars,
  mapStars,
  onRestart,
  onBack,
  onNextLesson,
}: Readonly<{
  totalStars: number;
  mapStars: Record<number, number>;
  onRestart: () => void;
  onBack: () => void;
  onNextLesson: () => void;
}>) {
  const avgStars =
    MAPS.length > 0
      ? Math.round(
          Object.values(mapStars).reduce((a, b) => a + b, 0) / MAPS.length,
        )
      : 3;

  return (
    <div className="relative w-full min-h-[70vh] flex flex-col items-center justify-center">
      {/* Confetti */}
      <ConfettiEffect />
      <ConfettiEffect />

      {/* ── Classroom background ── */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        {/* Wall */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-200 via-emerald-100 to-amber-50" />
        {/* Blackboard */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[80%] h-[45%] bg-gradient-to-b from-green-800 to-green-900 rounded-xl shadow-lg border-4 border-amber-700">
          {/* Bar chart on blackboard */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-1.5 h-[60%]">
            {[35, 50, 70, 45, 85, 60, 40, 75, 55, 90, 65, 80].map((h, i) => (
              <div
                key={`bar-${i}`}
                className="flex-1 rounded-t transition-all"
                style={{
                  height: `${h}%`,
                  background: [
                    "#60A5FA",
                    "#34D399",
                    "#FBBF24",
                    "#F472B6",
                    "#A78BFA",
                    "#FB923C",
                    "#38BDF8",
                    "#4ADE80",
                    "#FCD34D",
                    "#F87171",
                    "#818CF8",
                    "#FB7185",
                  ][i],
                }}
              />
            ))}
          </div>
          {/* Number line on blackboard */}
          <div className="absolute bottom-1 left-6 right-6 flex justify-between">
            {[0, 1, 2, 3, 4, 5, "", "", "", 17, "", "", 20].map((n, i) => (
              <span
                key={`num-${i}`}
                className="text-white/60 text-[8px] font-bold"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-b from-amber-100 to-amber-200" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-4 py-6">
        {/* Rainbow banner */}
        <div className="relative w-full mb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 rounded-full blur-sm opacity-60 scale-105" />
          <div className="relative bg-gradient-to-r from-rose-400 via-amber-400 via-emerald-400 via-sky-400 to-violet-400 rounded-full px-6 py-3 shadow-lg">
            <h1
              className="text-center font-black text-white text-lg sm:text-xl tracking-wide drop-shadow-md"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
            >
              TUYỆT VỜI! CON ĐÃ HOÀN THÀNH XUẤT SẮC BÀI 2!
            </h1>
          </div>
        </div>

        {/* 3 big stars */}
        <div className="flex justify-center items-end gap-1 mb-3">
          <span
            className="text-5xl drop-shadow-lg animate-kids-bounce-in"
            style={{ animationDelay: "0.1s" }}
          >
            {avgStars >= 1 ? "⭐" : "☆"}
          </span>
          <span
            className="text-6xl drop-shadow-lg animate-kids-bounce-in -mt-2"
            style={{ animationDelay: "0.3s" }}
          >
            {avgStars >= 2 ? "⭐" : "☆"}
          </span>
          <span
            className="text-5xl drop-shadow-lg animate-kids-bounce-in"
            style={{ animationDelay: "0.5s" }}
          >
            {avgStars >= 3 ? "⭐" : "☆"}
          </span>
        </div>

        {/* Bear character + speech bubble */}
        <div className="flex items-end justify-center gap-3 mb-4">
          {/* Bear */}
          <div
            className="text-center animate-kids-bounce-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div
              className="text-7xl sm:text-8xl"
              style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.15))" }}
            >
              🐻
            </div>
            {/* Confetti around bear */}
            <div className="relative -mt-6">
              <span className="absolute -left-4 -top-8 text-lg animate-float-slow">
                🎊
              </span>
              <span
                className="absolute -right-4 -top-10 text-lg animate-float-slow"
                style={{ animationDelay: "0.5s" }}
              >
                🎉
              </span>
              <span
                className="absolute left-2 -top-14 text-sm animate-float-slow"
                style={{ animationDelay: "1s" }}
              >
                ✨
              </span>
            </div>
          </div>

          {/* Speech bubble */}
          <div
            className="relative bg-white rounded-2xl shadow-lg px-5 py-3 max-w-[200px] animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <p className="font-extrabold text-gray-700 text-sm leading-snug">
              Giỏi quá!
              <br />
              Cố lên con nhé! 🥰
            </p>
            <span className="text-xl absolute -bottom-1 right-4">🎤</span>
            {/* Bubble tail */}
            <div className="absolute -left-2 bottom-3 w-4 h-4 bg-white rotate-45 shadow-sm" />
          </div>
        </div>

        {/* Score summary */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-5 py-2 shadow-md mb-4">
          <Trophy size={20} className="text-amber-500" />
          <span className="font-extrabold text-amber-600">
            {totalStars} / 15
          </span>
          <span className="text-amber-400">⭐</span>
        </div>

        {/* ── Buttons ── */}
        <div className="w-full space-y-3">
          {/* Primary: Bài tiếp theo */}
          <button
            onClick={onNextLesson}
            className="w-full bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700
                       text-white font-black text-lg sm:text-xl py-4 rounded-2xl shadow-lg
                       transition-all active:scale-95 hover:scale-[1.02] hover:shadow-xl
                       flex items-center justify-center gap-3
                       border-b-4 border-green-700"
          >
            <Play size={22} fill="white" /> LÀM BÀI QUIZ
          </button>

          {/* Secondary row: Chơi lại + Về mục lục */}
          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="flex-1 bg-gradient-to-b from-cyan-400 to-teal-500 hover:from-cyan-500 hover:to-teal-600
                         text-white font-extrabold py-3 rounded-2xl shadow-md
                         transition-all active:scale-95 flex items-center justify-center gap-2
                         border-b-4 border-teal-600 text-sm sm:text-base"
            >
              <RotateCcw size={16} /> CHƠI LẠI
            </button>
            <button
              onClick={onBack}
              className="flex-1 bg-gradient-to-b from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600
                         text-white font-extrabold py-3 rounded-2xl shadow-md
                         transition-all active:scale-95 flex items-center justify-center gap-2
                         border-b-4 border-blue-600 text-sm sm:text-base"
            >
              <Home size={16} /> VỀ MỤC LỤC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAP PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════════

function MapProgressBar({
  activeMap,
  completedMaps,
}: Readonly<{
  activeMap: number;
  completedMaps: Record<number, number>;
}>) {
  return (
    <div className="flex items-center justify-center gap-1 mb-4">
      {MAPS.map((map) => {
        const stars = completedMaps[map.id] ?? 0;
        const isActive = map.id === activeMap;
        const isCompleted = stars > 0;
        const isLocked = map.id > activeMap && !isCompleted;

        return (
          <div key={map.id} className="flex items-center">
            <div
              className={`
                w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                font-extrabold text-sm transition-all duration-300
                ${
                  isActive
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg scale-110 ring-2 ring-amber-300 ring-offset-2"
                    : isCompleted
                      ? "bg-emerald-400 text-white shadow-md"
                      : isLocked
                        ? "bg-gray-200 text-gray-400"
                        : "bg-white text-gray-500 shadow-sm"
                }
              `}
              title={`${map.emoji} ${map.name}`}
            >
              {isCompleted ? "✓" : map.id}
            </div>
            {map.id < MAPS.length && (
              <div
                className={`w-4 sm:w-6 h-1 rounded-full mx-0.5 transition-all ${
                  isCompleted ? "bg-emerald-300" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ROUNDS_PER_MAP: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 3 };

export function NumberSequenceGame() {
  const navigate = useNavigate();
  const sound = useGameSound();
  const [gameState, setGameState] = useState<"intro" | "playing" | "finished">(
    "intro",
  );
  const [activeMap, setActiveMap] = useState(1);
  const [completedMaps, setCompletedMaps] = useState<Record<number, number>>(
    {},
  );
  const [showVictory, setShowVictory] = useState(false);
  const [lastStars, setLastStars] = useState<number>(0);
  const [showHint, setShowHint] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundStars, setRoundStars] = useState<number[]>([]);
  const [showRoundTransition, setShowRoundTransition] = useState(false);
  const [showPinGate, setShowPinGate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // State to track if we're asking for PIN specifically to exit fullscreen
  const [pinActionTarget, setPinActionTarget] = useState<"menu" | "fullscreen" | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const totalStars = Object.values(completedMaps).reduce((a, b) => a + b, 0);
  const difficulty = activeMap;
  const totalRounds = ROUNDS_PER_MAP[activeMap] ?? 3;

  const toggleFullScreen = async () => {
    sound.click();
    if (!document.fullscreenElement) {
      try {
        await gameContainerRef.current?.requestFullscreen();
        // Attempt to lock ESC key so user cannot exit fullscreen without PIN
        if ("keyboard" in navigator && (navigator as any).keyboard?.lock) {
          try {
            await (navigator as any).keyboard.lock(["Escape"]);
          } catch (lockErr) {
            console.warn("Keyboard lock not supported or failed:", lockErr);
          }
        }
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      // If we are playing, require PIN to exit fullscreen
      if (gameState === "playing") {
        setPinActionTarget("fullscreen");
        setShowPinGate(true);
      } else {
        if (document.exitFullscreen) {
          // Unlock keyboard if it was locked
          if ("keyboard" in navigator && (navigator as any).keyboard?.unlock) {
            (navigator as any).keyboard.unlock();
          }
          await document.exitFullscreen();
        }
      }
    }
  };

  // Prevent accidental tab close/refresh while playing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (gameState === "playing") {
        e.preventDefault();
        e.returnValue = ""; // Required for Chrome to show the prompt
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [gameState]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const currentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(currentlyFullscreen);

      // If the browser forced an exit (e.g. user pressed ESC) while playing
      // and we didn't explicitly authorize it via PIN success (pinActionTarget is null)
      if (!currentlyFullscreen && gameState === "playing" && pinActionTarget === null) {
        // We immediately show the PIN gate
        setPinActionTarget("fullscreen");
        setShowPinGate(true);
        // Force them right back into fullscreen instantly
        gameContainerRef.current?.requestFullscreen().catch(console.error);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && gameState === "playing" && document.fullscreenElement) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // Use capture phase to intercept before native browser handlers if possible
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [gameState, pinActionTarget]);

  const handleBackToMenu = () => {
    sound.click();
    if (gameState === "playing") {
      setPinActionTarget("menu");
      setShowPinGate(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
      navigate("/student");
    }
  };

  const handlePinSuccess = () => {
    setShowPinGate(false);
    
    if (pinActionTarget === "menu") {
      if (document.fullscreenElement) {
        if ("keyboard" in navigator && (navigator as any).keyboard?.unlock) {
          (navigator as any).keyboard.unlock();
        }
        document.exitFullscreen().catch(console.error);
      }
      navigate("/student");
    } else if (pinActionTarget === "fullscreen") {
      if (document.fullscreenElement) {
        if ("keyboard" in navigator && (navigator as any).keyboard?.unlock) {
          (navigator as any).keyboard.unlock();
        }
        document.exitFullscreen().catch(console.error);
      }
    }
    
    setPinActionTarget(null);
  };

  const handlePinCancel = () => {
    setShowPinGate(false);

    // If they were trying to exit fullscreen via ESC and cancelled the PIN
    // we force them back into fullscreen.
    if (pinActionTarget === "fullscreen" && !document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen().catch(console.error);
    }

    setPinActionTarget(null);
  };

  const handleMapComplete = useCallback(
    (stars: number) => {
      const newRoundStars = [...roundStars, stars];
      setRoundStars(newRoundStars);
      const rounds = ROUNDS_PER_MAP[activeMap] ?? 3;

      if (newRoundStars.length < rounds) {
        // More rounds to go — show brief transition then regenerate puzzle
        sound.correctVoice();
        setShowRoundTransition(true);
        setTimeout(() => {
          setCurrentRound((r) => r + 1);
          setMapKey((k) => k + 1);
          setShowRoundTransition(false);
        }, 1500);
      } else {
        // All rounds done — calculate average stars
        const avg =
          newRoundStars.reduce((a, b) => a + b, 0) / newRoundStars.length;
        const finalStars = Math.round(avg);
        setCompletedMaps((prev) => ({
          ...prev,
          [activeMap]: Math.max(prev[activeMap] ?? 0, finalStars),
        }));
        setLastStars(finalStars);
        sound.victoryVoice();

        if (activeMap >= MAPS.length) {
          // Last map done → go straight to FinalVictoryScreen
          setCurrentRound(1);
          setRoundStars([]);
          setTimeout(() => setGameState("finished"), 800);
        } else {
          setShowVictory(true);
        }
      }
    },
    [activeMap, sound, roundStars],
  );

  const handleNextMap = () => {
    setShowVictory(false);
    setCurrentRound(1);
    setRoundStars([]);
    sound.click();
    if (activeMap < MAPS.length) {
      setActiveMap((m) => m + 1);
      setMapKey((k) => k + 1);
    } else {
      setGameState("finished");
    }
  };

  const handleReplay = () => {
    setShowVictory(false);
    setCurrentRound(1);
    setRoundStars([]);
    sound.click();
    setMapKey((k) => k + 1);
  };

  const handleStart = () => {
    setGameState("playing");
    setActiveMap(1);
    setCompletedMaps({});
    setCurrentRound(1);
    setRoundStars([]);
    setMapKey((k) => k + 1);
    sound.click();
    sound.introVoice();
  };

  const handleRestart = () => {
    setGameState("intro");
    setActiveMap(1);
    setCompletedMaps({});
    setCurrentRound(1);
    setRoundStars([]);
    setShowVictory(false);
    setShowHint(false);
    sound.click();
  };

  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setSoundOn(newState);
  };

  const handleToggleVoice = () => {
    const newState = sound.toggleVoice();
    setVoiceOn(newState);
  };

  const currentMapInfo = MAPS.find((m) => m.id === activeMap);

  return (
    <GameSoundContext.Provider value={sound}>
      <div ref={gameContainerRef} className="min-h-screen relative overflow-hidden flex flex-col">
        {/* Background Base */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${
            gameState === "playing" && currentMapInfo
              ? currentMapInfo.bgGradient
              : "from-sky-200 via-indigo-100 to-emerald-100"
          } transition-all duration-700`}
        />
        
        {/* Ambient light blobs (Intro only) */}
        {gameState === "intro" && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-300/30 rounded-full blur-[80px] animate-pulse-slow mix-blend-multiply pointer-events-none" />
            <div className="absolute top-[20%] right-[-5%] w-[35%] h-[45%] bg-amber-300/30 rounded-full blur-[80px] animate-pulse-slow mix-blend-multiply pointer-events-none" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] bg-blue-300/30 rounded-full blur-[100px] animate-pulse-slow mix-blend-multiply pointer-events-none" style={{ animationDelay: '1s' }} />
          </>
        )}

        {/* Floating clouds */}
        <div className="absolute top-8 left-10 text-5xl animate-float-slow opacity-60 pointer-events-none drop-shadow-sm">
          ☁️
        </div>
        <div
          className="absolute top-24 right-12 text-4xl animate-float-slow opacity-40 pointer-events-none drop-shadow-sm"
          style={{ animationDelay: "1.5s" }}
        >
          ☁️
        </div>
        <div
          className="absolute bottom-1/4 left-5 text-3xl animate-float-slow opacity-30 pointer-events-none drop-shadow-sm"
          style={{ animationDelay: "2.5s" }}
        >
           ☁️
        </div>
        <div
          className="absolute top-10 right-1/3 text-3xl animate-float-slow opacity-50 pointer-events-none drop-shadow-sm"
          style={{ animationDelay: "3s" }}
        >
          ☁️
        </div>

        <div className="relative flex-1 flex flex-col z-10 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4">
          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-2 bg-white/80 hover:bg-white rounded-2xl px-4 py-2
                         text-gray-600 font-bold text-sm shadow-sm transition-all active:scale-95 z-50 relative"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Mục lục</span>
            </button>

            <div className="text-center absolute left-0 right-0 pointer-events-none flex flex-col items-center">
              <h1 className="font-extrabold text-gray-800 text-sm sm:text-lg flex items-center gap-2 drop-shadow-sm">
                🤖 Robot Tí Tách Phiêu Lưu
              </h1>
              {gameState === "playing" && currentMapInfo && (
                <p className="text-xs font-bold text-gray-500 mt-0.5 drop-shadow-sm">
                  {currentMapInfo.emoji} Vùng {activeMap}: {currentMapInfo.name}
                  <span className="ml-2 text-amber-500">
                    (Lượt {currentRound}/{totalRounds})
                  </span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 relative z-50">
              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullScreen}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                           transition-all active:scale-95 ${
                             isFullscreen
                               ? "bg-indigo-400 text-white"
                               : "bg-gray-200 text-gray-500 hover:bg-white"
                           }`}
                aria-label={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
              >
                {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              </button>
              {/* Sound toggle */}
              <button
                onClick={handleToggleSound}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                           transition-all active:scale-95 ${
                             soundOn
                               ? "bg-emerald-400 text-white"
                               : "bg-gray-200 text-gray-400"
                           }`}
                aria-label={soundOn ? "Tắt âm thanh" : "Bật âm thanh"}
              >
                {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
              {/* Voice toggle */}
              <button
                onClick={handleToggleVoice}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm
                           transition-all active:scale-95 ${
                             voiceOn
                               ? "bg-sky-400 text-white"
                               : "bg-gray-200 text-gray-400"
                           }`}
                aria-label={voiceOn ? "Tắt giọng nói" : "Bật giọng nói"}
              >
                {voiceOn ? <Mic size={14} /> : <MicOff size={14} />}
              </button>
              {gameState === "playing" && (
                <button
                  onClick={() => {
                    sound.hint();
                    setShowHint((h) => !h);
                  }}
                  className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-500 text-white
                             flex items-center justify-center shadow-sm transition-all active:scale-95"
                  aria-label="Gợi ý"
                >
                  <HelpCircle size={14} />
                </button>
              )}
              <div className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-1.5 shadow-sm">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="font-extrabold text-amber-600 text-sm">
                  {totalStars}
                </span>
              </div>
            </div>
          </div>

          {/* Hint */}
          {showHint && gameState === "playing" && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 mb-4 text-sm font-bold text-amber-700 animate-fade-in-down flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>
                {ROBOT_HINTS[activeMap]?.[0] ??
                  "Hãy quan sát kỹ và tìm quy luật!"}
              </span>
            </div>
          )}

          {/* ── Content ── */}
          <div className="flex-1 flex flex-col justify-center w-full relative">
          {gameState === "intro" && <IntroScreen onStart={handleStart} />}

          {gameState === "finished" && (
            <FinalVictoryScreen
              totalStars={totalStars}
              mapStars={completedMaps}
              onRestart={handleRestart}
              onBack={() => {
                sound.click();
                navigate("/student");
              }}
              onNextLesson={() => {
                sound.click();
                navigate("/student/quiz/math2-b2");
              }}
            />
          )}

          {gameState === "playing" && (
            <>
              <MapProgressBar
                activeMap={activeMap}
                completedMaps={completedMaps}
              />

              <div className="bg-white/40 backdrop-blur-sm rounded-3xl shadow-lg border-2 border-white/60 p-4 sm:p-6">
                {activeMap === 1 && (
                  <AppleGardenMap
                    key={mapKey}
                    onComplete={handleMapComplete}
                    difficulty={difficulty}
                  />
                )}
                {activeMap === 2 && (
                  <BridgeMap
                    key={mapKey}
                    onComplete={handleMapComplete}
                    difficulty={difficulty}
                  />
                )}
                {activeMap === 3 && (
                  <TrainMap
                    key={mapKey}
                    onComplete={handleMapComplete}
                    difficulty={difficulty}
                  />
                )}
                {activeMap === 4 && (
                  <BalloonCityMap
                    key={mapKey}
                    onComplete={handleMapComplete}
                    difficulty={difficulty}
                  />
                )}
                {activeMap === 5 && (
                  <RabbitRaceMap
                    key={mapKey}
                    onComplete={handleMapComplete}
                    difficulty={difficulty}
                  />
                )}
              </div>
            </>
          )}

          {/* Victory modal */}
          {showVictory && (
            <VictoryModal
              stars={lastStars}
              onNext={handleNextMap}
              onReplay={handleReplay}
              message={
                lastStars === 3
                  ? "Tuyệt vời! Bạn đạt 3 sao! ⭐⭐⭐"
                  : lastStars === 2
                    ? "Giỏi lắm! Thử lại để đạt 3 sao nhé!"
                    : "Hoàn thành rồi! Cố gắng thêm nhé!"
              }
              isLastMap={activeMap === MAPS.length}
            />
          )}

          {/* Round transition overlay */}
          {showRoundTransition && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center animate-kids-bounce-in">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-extrabold text-emerald-600 mb-1">
                  Lượt {currentRound}/{totalRounds} hoàn thành!
                </h3>
                <p className="text-gray-500 font-bold text-sm">
                  Chuẩn bị lượt tiếp theo...
                </p>
                <div className="flex justify-center gap-1 mt-2">
                  {roundStars.map((s, i) => (
                    <span key={`rs-${i}`} className="text-lg">
                      {s >= 1 ? "⭐" : "☆"}
                      {s >= 2 ? "⭐" : "☆"}
                      {s >= 3 ? "⭐" : "☆"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PIN Gate Modal */}
          {showPinGate && (
            <ParentGate
              onSuccess={handlePinSuccess}
              onClose={handlePinCancel}
            />
          )}

          </div>
        </div>
      </div>
    </GameSoundContext.Provider>
  );
}
