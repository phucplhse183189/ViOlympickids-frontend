import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as lessonService from "@/shared/api/services/lessonService";
import * as leaderboardService from "@/shared/api/services/leaderboardService";
import { useGameSound } from "@/shared/lib/useGameSound";
import { ArrowLeft, Star, Heart } from "lucide-react";
import { ParentGate } from "@/shared/ui/ParentGate";

export function Math2B1QuizPage() {
  const navigate = useNavigate();
  const sound = useGameSound();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showExitGate, setShowExitGate] = useState(false);
  const [answeredState, setAnsweredState] = useState<"idle" | "correct" | "wrong">("idle");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [questions, setQuestions] = useState<lessonService.QuizQuestion[]>([]);

  useEffect(() => {
    lessonService.getQuiz("math2-b1").then(setQuestions).catch(console.error);
  }, []);

  const currentQ = questions[currentIdx] || null;

  // Colors for 4 options
  const optColors = [
    "from-rose-400 to-red-500 shadow-[0_8px_0_#be123c]",
    "from-amber-400 to-orange-500 shadow-[0_8px_0_#b45309]",
    "from-emerald-400 to-green-500 shadow-[0_8px_0_#15803d]",
    "from-sky-400 to-blue-500 shadow-[0_8px_0_#1d4ed8]",
  ];

  useEffect(() => {
    // sound.click(); // or other initialization
    return () => sound.stopVoice();
  }, []);

  const handleSelect = (optIndex: number) => {
    if (answeredState !== "idle") return;
    
    setSelectedOption(optIndex);
    const isCorrect = optIndex === currentQ.correctIndex;
    
    if (isCorrect) {
      setAnsweredState("correct");
      sound.correctVoice();
      setCorrectCount(c => c + 1);
    } else {
      setAnsweredState("wrong");
      sound.wrongVoice();
    }

    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        sound.victoryVoice();
        const childId = sessionStorage.getItem("vio_active_child_id") || localStorage.getItem("vio_active_child_id");
        if (childId) {
          leaderboardService.submitAttempt(childId, questions[0]?.lessonId || "math2-b1", correctCount + (isCorrect ? 1 : 0), questions.length).catch(console.error);
        }
        navigate("/student/result/math2-b1", { state: { correct: correctCount + (isCorrect ? 1 : 0), total: questions.length } });
      } else {
        setAnsweredState("idle");
        setSelectedOption(null);
        setCurrentIdx(i => i + 1);
      }
    }, 2000);
  };

  const progress = ((currentIdx) / questions.length) * 100;

  if (questions.length === 0 || !currentQ) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-500 font-bold">
        Đang tải bài tập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-white px-4 md:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10 w-full relative">
        <button
          onClick={() => setShowExitGate(true)}
          className="flex items-center gap-2 text-slate-500 font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} /> <span className="hidden sm:inline">Thoát</span>
        </button>
        <div className="text-sm md:text-lg font-black text-slate-700 bg-slate-100 px-4 md:px-6 py-2 rounded-full border border-slate-200">
           Bài 1: Ôn tập các số đến 100
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 text-rose-500 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
            <Heart fill="currentColor" size={18} /> {correctCount}
          </div>
          <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
            <Star fill="currentColor" size={18} /> {currentIdx + 1}/{questions.length}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-3 bg-slate-200">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500 rounded-r-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-5xl mx-auto">
        <div className="bg-white rounded-[2rem] shadow-xl w-full flex flex-col overflow-hidden border border-slate-100 animate-fade-in-up">
          
          {/* Question Box */}
          <div className="flex-1 p-8 md:p-16 flex items-center justify-center min-h-[250px] md:min-h-[350px] bg-slate-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(203,213,225,0.4)_1px,transparent_1px)] bg-[length:24px_24px] pointer-events-none"></div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 text-center leading-tight relative drop-shadow-sm px-4">
              {currentQ.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-8 gap-6 bg-slate-100 border-t border-slate-200">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedOption === i;
              const statusClass = 
                answeredState === "idle" ? `bg-gradient-to-b ${optColors[i % 4]} hover:-translate-y-1 active:translate-y-2 active:shadow-none cursor-pointer` :
                isSelected && answeredState === "correct" ? "bg-gradient-to-b from-emerald-400 to-green-500 shadow-[0_8px_0_#15803d] ring-4 ring-emerald-300 scale-105" :
                isSelected && answeredState === "wrong" ? "bg-rose-500 shadow-none ring-4 ring-rose-300 scale-95 opacity-80 cursor-not-allowed" :
                !isSelected && i === currentQ.correctIndex ? "bg-gradient-to-b from-emerald-400 to-green-500 shadow-[0_8px_0_#15803d] ring-4 ring-emerald-300 animate-pulse" :
                "bg-slate-300 shadow-[0_8px_0_#94a3b8] opacity-50 cursor-not-allowed text-slate-500";

              return (
                <button
                  key={i}
                  disabled={answeredState !== "idle"}
                  onClick={() => handleSelect(i)}
                  className={`
                    transition-all duration-300
                    min-h-[100px] md:h-32 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white px-6 py-4
                    ${statusClass}
                  `}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Feedback message */}
        <div className={`mt-8 text-2xl md:text-3xl font-black transition-opacity duration-300 h-10 ${answeredState !== "idle" ? "opacity-100" : "opacity-0"}`}>
          {answeredState === "correct" && <span className="text-emerald-500 flex items-center gap-2 drop-shadow-sm"><Star fill="currentColor" className="animate-spin-slow" /> Tuyệt vời! Chính xác rồi!</span>}
          {answeredState === "wrong" && <span className="text-rose-500 drop-shadow-sm">Ôi, sai mất rồi! Thử lại ở câu sau nhé!</span>}
        </div>
      </div>

      {showExitGate && (
        <ParentGate
          onSuccess={() => navigate("/student")}
          onClose={() => setShowExitGate(false)}
        />
      )}
    </div>
  );
}
