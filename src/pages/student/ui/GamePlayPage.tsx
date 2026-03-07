import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import {
  getLessonById,
  getChapterByLessonId,
  isNumberLine,
  isObjectCount,
  isFillBlank,
  isShapeExplore,
  type GameActivity,
} from "@/shared/api/studentMockData";
import { Shape3DViewer } from "@/shared/ui/Shape3DViewer";

type GameState = "playing" | "correct" | "wrong";

// ── Confetti burst ────────────────────────────────────────────────────────────
const CONFETTI_EMOJI = ["⭐", "🎉", "✨", "💫", "🌟", "🎊"];
function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null;
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    emoji: CONFETTI_EMOJI[i % CONFETTI_EMOJI.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    dur: `${0.8 + Math.random() * 0.7}s`,
    size: `${0.9 + Math.random() * 0.7}rem`,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20 rounded-3xl">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: p.left,
            fontSize: p.size,
            animation: `confetti-drop ${p.dur} ${p.delay} ease-in forwards`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// ── Number Line Game ──────────────────────────────────────────────────────────
function NumberLineGameUI({
  game,
  onComplete,
}: {
  game: GameActivity;
  onComplete: (correct: boolean) => void;
}) {
  if (!isNumberLine(game)) return null;
  const { start, end, missing } = game.numberLine;
  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const [filled, setFilled] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleFill = (value: number, input: string) => {
    const num = parseInt(input);
    setFilled((prev) => ({ ...prev, [value]: isNaN(num) ? null : num }));
  };

  const handleSubmit = () => {
    const allCorrect = missing.every((m) => filled[m] === m);
    setSubmitted(true);
    setTimeout(() => onComplete(allCorrect), 800);
  };

  const allFilled = missing.every((m) => filled[m] != null);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {numbers.map((n) => {
          const isMissing = missing.includes(n);
          if (!isMissing) {
            return (
              <div
                key={n}
                className="w-12 h-12 rounded-xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center font-extrabold text-sky-700 text-lg"
              >
                {n}
              </div>
            );
          }
          const isCorrect = submitted && filled[n] === n;
          const isWrong = submitted && filled[n] !== n;
          return (
            <input
              key={n}
              type="number"
              maxLength={3}
              className={`w-12 h-12 rounded-xl border-3 text-center font-extrabold text-lg outline-none transition-colors ${
                isCorrect
                  ? "border-green-400 bg-green-50 text-green-700"
                  : isWrong
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-orange-300 bg-orange-50 text-gray-800 focus:border-orange-500"
              }`}
              onChange={(e) => handleFill(n, e.target.value)}
              disabled={submitted}
            />
          );
        })}
      </div>
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allFilled}
          className={`px-8 py-3 rounded-2xl font-extrabold text-white transition-all ${
            allFilled
              ? "bg-gradient-to-r from-green-400 to-emerald-500 shadow-[0_4px_0_#15803d] active:translate-y-[2px] active:shadow-none"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          ✅ Kiểm tra
        </button>
      )}
    </div>
  );
}

// ── Object Count Game ─────────────────────────────────────────────────────────
function ObjectCountGameUI({
  game,
  onComplete,
}: {
  game: GameActivity;
  onComplete: (correct: boolean) => void;
}) {
  if (!isObjectCount(game)) return null;
  const { objectEmoji, count, options } = game.objectCount;
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (opt: number) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    setTimeout(() => onComplete(opt === count), 800);
  };

  const grid = Array.from({ length: count }, (_, i) => i);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Object grid */}
      <div className="flex flex-wrap justify-center gap-2 p-4 bg-white rounded-2xl border-2 border-gray-200">
        {grid.map((i) => (
          <span
            key={i}
            className="text-3xl animate-badge-pop"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {objectEmoji}
          </span>
        ))}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {options.map((opt) => {
          const isCorrectOpt = answered && opt === count;
          const isWrongSelected = answered && selected === opt && opt !== count;
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={answered}
              className={`py-4 rounded-2xl font-extrabold text-xl transition-all ${
                isCorrectOpt
                  ? "bg-green-400 text-white scale-105 shadow-lg"
                  : isWrongSelected
                    ? "bg-red-400 text-white"
                    : answered
                      ? "bg-gray-200 text-gray-400"
                      : "bg-white border-3 border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Fill Blank Game ───────────────────────────────────────────────────────────
function FillBlankGameUI({
  game,
  onComplete,
}: {
  game: GameActivity;
  onComplete: (correct: boolean) => void;
}) {
  if (!isFillBlank(game)) return null;
  const { question, answer, options } = game.fillBlank;
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (opt: number) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    setTimeout(() => onComplete(opt === answer), 800);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 w-full text-center">
        <p className="text-xl font-extrabold text-gray-800">{question}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {options.map((opt) => {
          const isCorrectOpt = answered && opt === answer;
          const isWrongSelected =
            answered && selected === opt && opt !== answer;
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={answered}
              className={`py-4 rounded-2xl font-extrabold text-xl transition-all ${
                isCorrectOpt
                  ? "bg-green-400 text-white scale-105 shadow-lg"
                  : isWrongSelected
                    ? "bg-red-400 text-white"
                    : answered
                      ? "bg-gray-200 text-gray-400"
                      : "bg-white border-3 border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Shape Explore Game ────────────────────────────────────────────────────────
function ShapeExploreGameUI({
  game,
  onComplete,
}: {
  game: GameActivity;
  onComplete: (correct: boolean) => void;
}) {
  if (!isShapeExplore(game)) return null;
  const { shape, facts, challengeText, challengeAnswer, challengeOptions } =
    game.shapeExplore;
  const [phase, setPhase] = useState<"explore" | "challenge">("explore");
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleChallengeSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    setTimeout(() => onComplete(opt === challengeAnswer), 800);
  };

  if (phase === "explore") {
    return (
      <div className="w-full flex flex-col items-center gap-4">
        <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 w-full flex flex-col items-center gap-4">
          <Shape3DViewer shape={shape} />
          {/* Facts */}
          <div className="w-full grid grid-cols-3 gap-2">
            {facts.map((fact, i) => (
              <div key={i} className="bg-sky-50 rounded-xl p-3 text-center">
                <span className="text-xl">{fact.icon}</span>
                <p className="text-[11px] font-bold text-gray-500 mt-1">
                  {fact.label}
                </p>
                <p className="text-sm font-extrabold text-gray-800">
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setPhase("challenge")}
          className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-extrabold rounded-2xl shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-none transition-all"
        >
          🎯 Thử thách ngay!
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 w-full text-center">
        <p className="text-xl font-extrabold text-gray-800">{challengeText}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {challengeOptions.map((opt) => {
          const isCorrectOpt = answered && opt === challengeAnswer;
          const isWrongSelected =
            answered && selected === opt && opt !== challengeAnswer;
          return (
            <button
              key={opt}
              onClick={() => handleChallengeSelect(opt)}
              disabled={answered}
              className={`py-4 px-3 rounded-2xl font-extrabold text-sm transition-all ${
                isCorrectOpt
                  ? "bg-green-400 text-white scale-105 shadow-lg"
                  : isWrongSelected
                    ? "bg-red-400 text-white"
                    : answered
                      ? "bg-gray-200 text-gray-400"
                      : "bg-white border-3 border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Game Router (renders the right UI based on game type) ─────────────────────
function GameRenderer({
  game,
  onComplete,
}: {
  game: GameActivity;
  onComplete: (correct: boolean) => void;
}) {
  if (isNumberLine(game))
    return <NumberLineGameUI game={game} onComplete={onComplete} />;
  if (isObjectCount(game))
    return <ObjectCountGameUI game={game} onComplete={onComplete} />;
  if (isFillBlank(game))
    return <FillBlankGameUI game={game} onComplete={onComplete} />;
  if (isShapeExplore(game))
    return <ShapeExploreGameUI game={game} onComplete={onComplete} />;
  return null;
}

// ── Main GamePlayPage ─────────────────────────────────────────────────────────
export function GamePlayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lessonId = Number(id);
  const lesson = getLessonById(lessonId);
  const chapter = getChapterByLessonId(lessonId);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [showConfetti, setShowConfetti] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setGameState("playing");
    setShowConfetti(false);
  }, [currentIdx]);

  if (!lesson || !chapter || lesson.games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] gap-4">
        <span className="text-6xl">😕</span>
        <p className="text-xl font-extrabold text-gray-600">
          Không tìm thấy game!
        </p>
        <button
          onClick={() => navigate("/student")}
          className="px-6 py-3 bg-orange-400 text-white font-extrabold rounded-2xl"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  const games = lesson.games;
  const game = games[currentIdx];
  const totalGames = games.length;

  const handleGameComplete = (correct: boolean) => {
    if (correct) {
      setCorrectCount((c) => c + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    }
    setGameState(correct ? "correct" : "wrong");
  };

  const handleNext = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      if (currentIdx + 1 >= totalGames) {
        navigate(`/student/game-result/${lessonId}`, {
          state: {
            correct: correctCount + (gameState === "correct" ? 1 : 0),
            total: totalGames,
          },
        });
      } else {
        setCurrentIdx((i) => i + 1);
        setAnimating(false);
      }
    }, 320);
  };

  const mood =
    gameState === "correct"
      ? {
          face: "🥳",
          bubble: "Tuyệt vời! Bé làm đúng rồi! 🚀",
          bg: "from-green-300 to-green-500",
        }
      : gameState === "wrong"
        ? {
            face: "😢",
            bubble: "Không sao! Thử lại lần sau nhé! 💪",
            bg: "from-red-300 to-red-400",
          }
        : {
            face: "🤖",
            bubble: game.instruction,
            bg: "from-orange-300 to-orange-500",
          };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50" />

      <div
        className="relative z-10 flex flex-col h-full min-h-[calc(100vh-5rem)]"
        style={{ opacity: animating ? 0 : 1, transition: "opacity 0.3s" }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button
            onClick={() => navigate("/student")}
            className="p-2.5 rounded-xl bg-white shadow-md hover:bg-gray-50 transition-colors shrink-0"
          >
            <X size={18} className="text-gray-500" />
          </button>

          {/* Progress */}
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-extrabold text-gray-500 mb-1">
              <span>
                🎮 Game {currentIdx + 1}/{totalGames}
              </span>
              <span>⭐ +{game.xpReward} XP</span>
            </div>
            <div className="h-2.5 bg-white/60 rounded-full overflow-hidden border border-gray-200">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentIdx + 1) / totalGames) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col items-center px-4 pb-6 gap-4 max-w-3xl mx-auto w-full">
          {/* Chapter chip */}
          <div
            className={`${chapter.color} text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-sm mt-1`}
          >
            {chapter.emoji} {chapter.title} · {lesson.title}
          </div>

          {/* Robot + instruction */}
          <div className="w-full flex items-end gap-3">
            <div className="relative shrink-0">
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${mood.bg} flex items-center justify-center text-2xl shadow-lg border-4 border-white transition-all duration-300`}
              >
                {mood.face}
              </div>
            </div>
            <div className="relative flex-1 bg-white rounded-3xl rounded-bl-none shadow-xl px-5 py-3">
              <div
                className="absolute -left-3 bottom-4 w-4 h-4 bg-white"
                style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
              />
              <p className="text-sm font-bold text-gray-700">{mood.bubble}</p>
            </div>
          </div>

          {/* Game card */}
          <div className="relative w-full bg-white rounded-3xl shadow-2xl border-2 border-orange-100 px-6 py-6 overflow-hidden">
            <ConfettiBurst show={showConfetti} />

            {/* Game emoji */}
            <div className="text-5xl text-center mb-4">{game.emoji}</div>

            {/* Game UI */}
            <GameRenderer
              key={`${lessonId}-${currentIdx}`}
              game={game}
              onComplete={handleGameComplete}
            />
          </div>

          {/* Next button (only after answer) */}
          {gameState !== "playing" && (
            <button
              onClick={handleNext}
              className={`w-full py-4 font-extrabold text-lg rounded-2xl text-white transition-all active:scale-[0.97] shadow-[0_5px_0_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 ${
                gameState === "correct"
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : "bg-gradient-to-r from-orange-400 to-orange-500"
              }`}
            >
              {currentIdx + 1 < totalGames ? (
                <>
                  Game tiếp theo <ArrowRight size={20} />
                </>
              ) : (
                "🎯 Xem kết quả!"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
