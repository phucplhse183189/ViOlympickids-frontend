import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useActiveChild } from "@/shared/lib/activeChild";

const GOAL_MINUTES = 40; // minutes/day goal – swap with API value later

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2.5 text-sm">
        <p className="font-semibold text-gray-700 mb-0.5">{label}</p>
        <p style={{ color: "var(--brand-primary)" }} className="font-bold">
          {val} phút
        </p>
        <p
          className={`text-xs mt-0.5 ${val >= GOAL_MINUTES ? "text-green-600" : "text-orange-500"}`}
        >
          {val >= GOAL_MINUTES
            ? "✓ Đạt mục tiêu"
            : `Còn ${GOAL_MINUTES - val} phút`}
        </p>
      </div>
    );
  }
  return null;
}

export function StudyProgressChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { dashboardData } = useActiveChild();
  const data = dashboardData.studyDays;
  const totalMinutes = data.reduce((s, d) => s + d.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / data.length);
  const goalDays = data.filter((d) => d.minutes >= GOAL_MINUTES).length;

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-gray-700">
            Nhịp độ học tập tuần này
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Mục tiêu: {GOAL_MINUTES} phút / ngày
          </p>
        </div>
        {/* Mini stats */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-800">
              {totalMinutes}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">Tổng phút</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-800">{avgMinutes}</p>
            <p className="text-[11px] text-gray-400 font-medium">TB/ngày</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-lg font-extrabold text-green-600">
              {goalDays}/7
            </p>
            <p className="text-[11px] text-gray-400 font-medium">
              Đạt mục tiêu
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={30}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f3f4f6"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 13, fill: "#9ca3af" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            unit=" ph"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Bar
            dataKey="phut"
            radius={[8, 8, 0, 0]}
            isAnimationActive={visible}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.minutes >= GOAL_MINUTES
                    ? "var(--brand-primary)"
                    : "#e0e7ff"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Goal legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ backgroundColor: "var(--brand-primary)" }}
          />
          Đạt mục tiêu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-100 inline-block" />
          Chưa đạt
        </span>
      </div>
    </div>
  );
}
