import { useMemo, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import * as adminService from "@/shared/api/services/adminService";

export function AdminPerformancePage() {
  const [parents, setParents] = useState<adminService.ParentWithChildren[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await adminService.getParents();
        setParents(data);
      } catch (err) {
        console.error("Failed to load parents for performance page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const students = parents.flatMap((p) => p.children);

  const statusDistributionData = useMemo(() => {
    const parentStatus = { active: 0, inactive: 0, suspended: 0 };
    const studentStatus = { active: 0, inactive: 0, suspended: 0 };

    parents.forEach((parent) => {
      // @ts-ignore - Assuming parent has status or fallback to active
      const pStatus = parent.status || "active";
      if (parentStatus[pStatus] !== undefined) {
        parentStatus[pStatus as keyof typeof parentStatus] += 1;
      }
      
      parent.children.forEach((child) => {
        if (studentStatus[child.status] !== undefined) {
          studentStatus[child.status] += 1;
        }
      });
    });

    return [
      {
        name: "Hoạt động",
        parent: parentStatus.active,
        student: studentStatus.active,
      },
      {
        name: "Không HĐ",
        parent: parentStatus.inactive,
        student: studentStatus.inactive,
      },
      {
        name: "Bị khoá",
        parent: parentStatus.suspended,
        student: studentStatus.suspended,
      },
    ];
  }, [parents]);

  const topFamiliesData = useMemo(() => {
    return [...parents]
      .sort((a, b) => b.children.length - a.children.length)
      .slice(0, 8)
      .map((parent) => ({
        name:
          parent.nickname.length > 12
            ? `${parent.nickname.slice(0, 12)}...`
            : parent.nickname,
        students: parent.children.length,
      }));
  }, [parents]);

  const scoreTrendData = useMemo(() => {
    return students.map((student, index) => ({
      idx: index + 1,
      score: student.avgScore || 0,
      lessons: student.totalLessons || 0,
      name: student.name,
    }));
  }, [students]);

  const weakStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => (a.avgScore || 0) - (b.avgScore || 0))
      .slice(0, 5)
      .map((student) => ({
        name: student.name,
        score: student.avgScore || 0,
        lessons: student.totalLessons || 0,
        status: student.status,
      }));
  }, [students]);

  const averageScore = useMemo(() => {
    if (students.length === 0) return 0;
    const total = students.reduce((sum, s) => sum + (s.avgScore || 0), 0);
    return Math.round(total / students.length);
  }, [students]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        Đang tải dữ liệu hiệu suất...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-2xl font-extrabold text-slate-900">
          Hiệu suất học tập
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi sức khoẻ học tập tổng thể của hệ thống.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Điểm TB hệ thống
            </p>
            <p className="text-2xl font-extrabold text-indigo-800 mt-1">
              {averageScore}
            </p>
          </div>
          <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
              Tổng học sinh
            </p>
            <p className="text-2xl font-extrabold text-cyan-800 mt-1">
              {students.length}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Tổng phụ huynh
            </p>
            <p className="text-2xl font-extrabold text-emerald-800 mt-1">
              {parents.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">
            So sánh trạng thái phụ huynh/học sinh
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={statusDistributionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="parent"
                name="Phụ huynh"
                stroke="#3b82f6"
                fill="#bfdbfe"
              />
              <Area
                type="monotone"
                dataKey="student"
                name="Học sinh"
                stroke="#8b5cf6"
                fill="#ddd6fe"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">
            Top gia đình có nhiều học sinh
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topFamiliesData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(value) => `${Number(value ?? 0)} học sinh`}
              />
              <Bar
                dataKey="students"
                name="Số học sinh"
                fill="#06b6d4"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">
          Xu hướng điểm và khối lượng học
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreTrendData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="idx"
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `HS ${v}`}
            />
            <YAxis axisLine={false} tickLine={false} domain={[0, 120]} />
            <Tooltip
              formatter={(value, key) =>
                key === "score"
                  ? `${Number(value ?? 0)} điểm`
                  : `${Number(value ?? 0)} bài`
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              name="Điểm TB"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="lessons"
              name="Số bài"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">
          Danh sách cần chú ý (điểm thấp)
        </h3>
        <div className="overflow-x-auto mt-3">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-2">
                  Học sinh
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-2">
                  Điểm TB
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-2">
                  Bài đã học
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-2">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {weakStudents.map((s) => (
                <tr key={s.name} className="border-b border-slate-100">
                  <td className="px-3 py-2.5 text-sm font-semibold text-slate-800">
                    {s.name}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">
                    {s.score}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">
                    {s.lessons}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">
                    {s.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
