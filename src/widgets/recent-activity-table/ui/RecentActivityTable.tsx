type Status = "Hoàn thành" | "Đang dở";

interface Activity {
  datetime: string;
  lesson: string;
  score: string;
  status: Status;
}

import { useEffect, useRef, useState } from "react";

const activities: Activity[] = [
  {
    datetime: "28/02 · 08:15",
    lesson: "Nhận diện khối Lập phương",
    score: "95/100",
    status: "Hoàn thành",
  },
  {
    datetime: "27/02 · 19:40",
    lesson: "Phép cộng có nhớ",
    score: "80/100",
    status: "Hoàn thành",
  },
  {
    datetime: "27/02 · 15:10",
    lesson: "Bảng nhân số 6",
    score: "—",
    status: "Đang dở",
  },
  {
    datetime: "26/02 · 20:00",
    lesson: "So sánh các số có 3 chữ số",
    score: "100/100",
    status: "Hoàn thành",
  },
  {
    datetime: "25/02 · 18:30",
    lesson: "Đo độ dài – cm và m",
    score: "70/100",
    status: "Hoàn thành",
  },
];

const statusStyle: Record<Status, string> = {
  "Hoàn thành": "bg-green-100 text-green-700",
  "Đang dở": "bg-yellow-100 text-yellow-700",
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

  return (
    <div ref={ref} className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-700 mb-5">
        Hoạt động gần đây
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="pb-3 pr-4 font-semibold">Ngày / Giờ</th>
              <th className="pb-3 pr-4 font-semibold">Tên bài học</th>
              <th className="pb-3 pr-4 font-semibold">Điểm số</th>
              <th className="pb-3 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activities.map((a, i) => (
              <tr
                key={a.datetime + a.lesson}
                className={`hover:bg-gray-50 transition-colors ${visible ? "animate-row-in" : "opacity-0"}`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                  {a.datetime}
                </td>
                <td className="py-3 pr-4 font-medium text-gray-700">
                  {a.lesson}
                </td>
                <td className="py-3 pr-4 text-gray-600 font-semibold">
                  {a.score}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusStyle[a.status]}`}
                  >
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
