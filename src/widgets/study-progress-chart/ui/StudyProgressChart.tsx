import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "T2", phut: 20 },
  { day: "T3", phut: 35 },
  { day: "T4", phut: 15 },
  { day: "T5", phut: 40 },
  { day: "T6", phut: 30 },
  { day: "T7", phut: 50 },
  { day: "CN", phut: 25 },
];

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
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2 text-sm">
        <p className="font-semibold text-gray-700">{label}</p>
        <p style={{ color: "var(--brand-primary)" }}>{payload[0].value} phút</p>
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

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-sm p-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <h3 className="text-base font-bold text-gray-700 mb-6">
        Nhịp độ học tập
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f3f4f6" }} />
          <Bar
            dataKey="phut"
            fill="var(--brand-primary)"
            radius={[8, 8, 0, 0]}
            isAnimationActive={visible}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
