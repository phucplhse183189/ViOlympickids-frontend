import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const skills = [
  { label: "Số học", pct: 88, color: "bg-blue-500" },
  { label: "Hình học không gian", pct: 94, color: "bg-orange-500" },
  { label: "Đo lường", pct: 72, color: "bg-green-500" },
  { label: "Bảng nhân / chia", pct: 65, color: "bg-purple-500" },
  { label: "Giải toán có lời văn", pct: 80, color: "bg-pink-500" },
];

const weeklyTrend = [
  { week: "T1", diem: 72 },
  { week: "T2", diem: 78 },
  { week: "T3", diem: 75 },
  { week: "T4", diem: 82 },
  { week: "T5", diem: 88 },
  { week: "T6", diem: 85 },
  { week: "T7", diem: 91 },
];

const radialData = [
  { name: "Tổng thể", value: 82, fill: "var(--brand-primary)" },
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
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-2 text-sm">
        <p className="font-semibold text-gray-600">{label}</p>
        <p style={{ color: "var(--brand-primary)" }}>{payload[0].value} điểm</p>
      </div>
    );
  }
  return null;
}

export function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Tiến độ của con</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Cập nhật lần cuối: hôm nay
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overall score radial */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-gray-400 mb-2">
            Điểm tổng thể
          </p>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
                startAngle={90}
                endAngle={90 - 360 * 0.82}
                data={radialData}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  background={{ fill: "#f3f4f6" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-gray-800">82</span>
              <span className="text-xs text-gray-400 font-medium">/100</span>
            </div>
          </div>
          <span className="mt-3 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
            ↑ Tốt hơn tuần trước
          </span>
        </div>

        {/* Weekly trend line */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:col-span-2">
          <p className="text-sm font-bold text-gray-700 mb-4">
            Xu hướng điểm số (7 tuần)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <YAxis
                domain={[60, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="diem"
                stroke="var(--brand-primary)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--brand-primary)", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-sm font-bold text-gray-700 mb-5">
          Phân tích kỹ năng
        </p>
        <div className="space-y-4">
          {skills.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">{s.label}</span>
                <span className="font-bold text-gray-500">{s.pct}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${s.color} transition-all duration-700`}
                  style={{ width: `${s.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
