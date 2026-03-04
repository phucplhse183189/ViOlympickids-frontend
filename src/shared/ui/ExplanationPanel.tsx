import { Shape3DViewer } from "@/shared/ui/Shape3DViewer";
import type {
  Shape3DName,
  ExplanationStat,
} from "@/shared/api/studentMockData";

// ── Explanation Panel ─────────────────────────────────────────────────────────
// Rich post-answer panel: 3D shape, explanation, fun fact, key stats.
// Slides in after the student answers a question.

interface ExplanationPanelProps {
  explanation: string;
  isCorrect: boolean;
  shape3d?: Shape3DName;
  funFact?: string;
  stats?: ExplanationStat[];
}

export function ExplanationPanel({
  explanation,
  isCorrect,
  shape3d,
  funFact,
  stats,
}: ExplanationPanelProps) {
  return (
    <div className="w-full animate-slide-up flex flex-col gap-3">
      {/* ── Horizontal layout: 3D + text | stats + fun fact ── */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* LEFT COLUMN: Main explanation card */}
        <div
          className={`rounded-3xl p-5 border-2 shadow-lg ${
            isCorrect
              ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
              : "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
          }`}
        >
          {/* 3D shape viewer */}
          {shape3d && (
            <div className="mx-auto mb-3">
              <Shape3DViewer shape={shape3d} className="!max-w-[130px]" />
              <p className="text-[10px] font-semibold text-gray-400 text-center mt-0.5">
                👆 Kéo để xoay · click để spin
              </p>
            </div>
          )}

          {/* Explanation text */}
          <div className="flex items-start gap-2.5">
            <span className="text-2xl shrink-0 mt-0.5">
              {isCorrect ? "🎓" : "📖"}
            </span>
            <div>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                Giải thích
              </p>
              <p className="text-sm font-bold text-gray-700 leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Stats + Fun fact */}
        <div className="flex flex-col gap-3">
          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-[80px] bg-white rounded-2xl border-2 border-indigo-100 p-3 
                             flex flex-col items-center gap-1 shadow-sm hover:scale-[1.03] transition-transform"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-xl font-black text-indigo-700">
                    {stat.value}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Fun fact */}
          {funFact && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-2.5 shadow-sm">
              <span className="text-2xl shrink-0">💡</span>
              <div>
                <p className="text-xs font-extrabold text-yellow-800 mb-0.5">
                  Bạn có biết?
                </p>
                <p className="text-sm font-semibold text-yellow-700 leading-snug">
                  {funFact}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
