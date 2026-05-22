import { useEffect, useRef, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useActiveChild } from "@/shared/lib/activeChild";

export function SkillRadarChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { dashboardData } = useActiveChild();
  const radarSkills = dashboardData.radarSkills;

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

  const strongSkill = [...radarSkills].sort((a, b) => b.score - a.score)[0];
  const weakSkill = [...radarSkills].sort((a, b) => a.score - b.score)[0];

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Header */}
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Phân tích Kỹ năng hiện tại
      </h3>

      <div className="flex items-center gap-4">
        {/* Radar Chart */}
        <div className="flex-1 min-w-0" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarSkills} outerRadius={80}>
              <PolarGrid stroke="#f0e8e0" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{
                  fontSize: 11,
                  fill: "#6b7280",
                  fontWeight: 500,
                }}
              />
              <Radar
                name="Kỹ năng"
                dataKey="diem"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.35}
                strokeWidth={2}
                dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }}
                isAnimationActive={visible}
                animationDuration={900}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Notes column */}
        <div className="flex flex-col gap-3 shrink-0 text-xs min-w-[120px]">
          {/* Strength */}
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-400 uppercase tracking-wide font-medium text-[10px]">
              Điểm mạnh
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="font-semibold text-green-600">
                {strongSkill.skill}
              </span>
            </div>
            <span className="text-green-500 font-bold text-sm pl-3.5">
              {strongSkill.score}/100
            </span>
          </div>

          <div className="border-t border-gray-100" />

          {/* Weakness */}
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-400 uppercase tracking-wide font-medium text-[10px]">
              Cần cải thiện
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 shrink-0" />
              <span className="font-semibold text-orange-600">
                {weakSkill.skill}
              </span>
            </div>
            <span className="text-orange-500 font-bold text-sm pl-3.5">
              {weakSkill.score}/100
            </span>
          </div>

          <div className="border-t border-gray-100" />

          {/* All skills mini score list */}
          <div className="flex flex-col gap-1">
            {radarSkills.map((s) => (
              <div
                key={s.skill}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-gray-500 truncate">{s.skill}</span>
                <span
                  className="font-semibold shrink-0"
                  style={{
                    color:
                      s.score >= 80
                        ? "#22c55e"
                        : s.score >= 60
                          ? "#f97316"
                          : "#ef4444",
                  }}
                >
                  {s.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
