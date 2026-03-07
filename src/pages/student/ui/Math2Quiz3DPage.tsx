import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Html, Stars } from "@react-three/drei";

// Simple quiz data
const quizData = [
  {
    question: "Số nào lớn nhất trong các số sau: 12, 45, 78, 34?",
    answers: ["12", "45", "78", "34"],
    correct: 2,
    explanation: "78 là số lớn nhất trong các số đã cho.",
  },
  {
    question: "Kết quả của 25 + 17 là bao nhiêu?",
    answers: ["32", "42", "40", "38"],
    correct: 1,
    explanation: "25 + 17 = 42.",
  },
];

function speak(text: string) {
  if (window.speechSynthesis) {
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = "vi-VN";
    window.speechSynthesis.speak(utter);
  }
}

function QuizCard3D({
  question,
  answers,
  onSelect,
  selected,
  correct,
}: {
  question: string;
  answers: string[];
  onSelect: (idx: number) => void;
  selected: number | null;
  correct: number;
}) {
  useEffect(() => {
    speak(question);
  }, [question]);

  return (
    <Float speed={1.2} floatIntensity={0.5}>
      <Html center style={{ pointerEvents: "auto" }}>
        <div className="bg-white/90 rounded-3xl shadow-2xl p-6 w-[350px] max-w-[90vw] text-center animate-fade-in">
          <h2 className="text-lg font-bold mb-4">{question}</h2>
          <div className="flex flex-col gap-3">
            {answers.map((ans, idx) => (
              <button
                key={idx}
                className={`py-2 rounded-xl font-bold text-base transition-all border-2 ${selected === idx ? (idx === correct ? "border-green-500 bg-green-100" : "border-red-500 bg-red-100") : "border-gray-200 bg-gray-50 hover:bg-blue-100"}`}
                onClick={() => {
                  onSelect(idx);
                  speak(ans);
                }}
                disabled={selected !== null}
              >
                {ans}
              </button>
            ))}
          </div>
        </div>
      </Html>
    </Float>
  );
}

export default function Math2Quiz3DPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const quiz = quizData[step];

  useEffect(() => {
    setSelected(null);
  }, [step]);

  return (
    <div className="relative h-screen w-screen bg-gradient-to-b from-indigo-900 to-sky-900 overflow-hidden">
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 60 }}
          style={{ width: "100vw", height: "100vh" }}
        >
          <Stars
            radius={30}
            depth={20}
            count={1200}
            factor={2.5}
            fade
            speed={0.7}
          />
          <QuizCard3D
            question={quiz.question}
            answers={quiz.answers}
            onSelect={setSelected}
            selected={selected}
            correct={quiz.correct}
          />
        </Canvas>
      </Suspense>
      {selected !== null && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 rounded-2xl px-6 py-3 shadow-xl text-center animate-fade-in">
          <p className="text-base font-bold mb-2">
            {selected === quiz.correct
              ? "✅ Đáp án đúng!"
              : "❌ Đáp án chưa đúng!"}
          </p>
          <p className="text-sm text-gray-700 mb-2">{quiz.explanation}</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all"
            onClick={() => {
              speak(quiz.explanation);
              setStep((s) => (s + 1 < quizData.length ? s + 1 : 0));
            }}
          >
            Tiếp tục
          </button>
        </div>
      )}
    </div>
  );
}
