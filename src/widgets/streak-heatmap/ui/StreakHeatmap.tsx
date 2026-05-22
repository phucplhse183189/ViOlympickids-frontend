import { useEffect, useRef, useState } from "react";
import { useActiveChild } from "@/shared/lib/activeChild";

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getDayColor(minutes: number): {
  bg: string;
  label: string;
} {
  if (minutes === 0) return { bg: "#f1f5f9", label: "Không học" };
  if (minutes < 15) return { bg: "#fed7aa", label: `${minutes} phút` };
  if (minutes < 30) return { bg: "#fb923c", label: `${minutes} phút` };
  return { bg: "#ea580c", label: `${minutes} phút` };
}

// Split 28 days into 4 chunks of 7 (each chunk = 1 week)
function chunkWeeks<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function StreakHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);
  const { dashboardData } = useActiveChild();
  const streakDays = dashboardData.streakDaysTable;
  const streakCount = dashboardData.stats.streakDays;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const weeks = chunkWeeks(streakDays, 7);

  return (
    <div
      ref={ref}
      className={`relative bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      onMouseLeave={() => setTooltip(null)}
    >
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Lịch sử học tập
      </h3>

      {/* Grid: rows = days of week, cols = weeks */}
      <div className="flex gap-1.5 items-start">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1.5 shrink-0 mt-6">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="w-5 h-5 flex items-center justify-end text-[10px] text-gray-400 font-medium leading-none"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Week columns */}
        <div className="flex gap-1.5 flex-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5 flex-1">
              {/* Week label */}
              <div className="text-[10px] text-gray-400 font-medium text-center leading-none mb-0.5">
                T{wi + 1}
              </div>

              {/* Day cells */}
              {week.map((day, di) => {
                const { bg, label } = getDayColor(day.minutes);
                const delay = visible ? `${(wi * 7 + di) * 30}ms` : "0ms";
                return (
                  <div
                    key={day.date}
                    className="h-5 rounded-[4px] cursor-pointer transition-transform duration-150 hover:scale-110"
                    style={{
                      backgroundColor: bg,
                      transitionDelay: delay,
                      opacity: visible ? 1 : 0,
                    }}
                    onMouseEnter={(e) => {
                      const rect = (
                        e.currentTarget as HTMLElement
                      ).getBoundingClientRect();
                      const parentRect = (
                        ref.current as HTMLElement
                      ).getBoundingClientRect();
                      setTooltip({
                        text: `${day.date}: ${label}`,
                        x: rect.left - parentRect.left + rect.width / 2,
                        y: rect.top - parentRect.top - 8,
                      });
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 pointer-events-none shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 text-[11px] text-gray-400">
        <span>Ít hơn</span>
        {[
          { bg: "#f1f5f9", title: "Không học" },
          { bg: "#fed7aa", title: "< 15 phút" },
          { bg: "#fb923c", title: "15–30 phút" },
          { bg: "#ea580c", title: "> 30 phút" },
        ].map((c) => (
          <span
            key={c.bg}
            title={c.title}
            className="inline-block w-3.5 h-3.5 rounded-[3px]"
            style={{ backgroundColor: c.bg }}
          />
        ))}
        <span>Nhiều hơn</span>
      </div>

      {/* Streak badge */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2">
        <span className="text-base">🔥</span>
        <span className="text-sm text-gray-600">
          Đang giữ chuỗi:{" "}
          <span className="font-bold text-orange-500">
            {streakCount} ngày học liên tiếp
          </span>
        </span>
      </div>
    </div>
  );
}
