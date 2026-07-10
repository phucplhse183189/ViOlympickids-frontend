import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { type ActivityStatus } from "@/features/dashboard/types/dashboard";
import { useActiveChild } from "@/features/dashboard/context/activeChild";

// Show only the 5 most recent entries in the overview widget
const PREVIEW_COUNT = 5;

const statusStyle: Record<ActivityStatus, string> = {
  "Hoàn thành": "bg-green-100 text-green-700",
  "Đang dở": "bg-yellow-100 text-yellow-700",
  "Chưa làm": "bg-gray-100 text-gray-500",
};

const statusIcon: Record<ActivityStatus, React.ReactNode> = {
  "Hoàn thành": <CheckCircle2 size={11} className="shrink-0" />,
  "Đang dở": <Clock size={11} className="shrink-0" />,
  "Chưa làm": null,
};

export function RecentActivityTable() {
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
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { dashboardData } = useActiveChild();
  const activities = dashboardData?.activities?.slice(0, PREVIEW_COUNT) || [];

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold text-gray-700">Hoạt động gần đây</h3>
        <a
          href="/dashboard/history"
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
        >
          Xem tất cả <ArrowRight size={13} />
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="pb-3 pr-4 font-semibold whitespace-nowrap">
                Ngày / Giờ
              </th>
              <th className="pb-3 pr-4 font-semibold">Tên bài học</th>
              <th className="pb-3 pr-4 font-semibold whitespace-nowrap">
                Điểm số
              </th>
              <th className="pb-3 font-semibold whitespace-nowrap">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activities.map((a, i) => (
              <tr
                key={a.id}
                className={`hover:bg-gray-50/60 transition-colors ${visible ? "animate-row-in" : "opacity-0"}`}
                style={{ animationDelay: `${i * 65}ms` }}
              >
                <td className="py-3.5 pr-4 text-gray-400 whitespace-nowrap font-medium text-xs">
                  {a.datetime}
                </td>
                <td className="py-3.5 pr-4 font-semibold text-gray-700">
                  {a.lesson}
                </td>
                <td className="py-3.5 pr-4 text-gray-600 font-bold">
                  {a.score ?? "—"}
                </td>
                <td className="py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[a.status]}`}
                  >
                    {statusIcon[a.status]}
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
