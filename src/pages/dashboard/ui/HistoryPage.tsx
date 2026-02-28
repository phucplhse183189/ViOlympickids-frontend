import { useState } from "react";
import { Search } from "lucide-react";

type Status = "Hoàn thành" | "Đang dở";

interface Activity {
  datetime: string;
  lesson: string;
  subject: string;
  duration: string;
  score: string;
  status: Status;
}

const ALL_ACTIVITIES: Activity[] = [
  {
    datetime: "28/02 · 08:15",
    lesson: "Nhận diện khối Lập phương",
    subject: "Hình học",
    duration: "18 ph",
    score: "95/100",
    status: "Hoàn thành",
  },
  {
    datetime: "27/02 · 19:40",
    lesson: "Phép cộng có nhớ",
    subject: "Số học",
    duration: "22 ph",
    score: "80/100",
    status: "Hoàn thành",
  },
  {
    datetime: "27/02 · 15:10",
    lesson: "Bảng nhân số 6",
    subject: "Số học",
    duration: "10 ph",
    score: "—",
    status: "Đang dở",
  },
  {
    datetime: "26/02 · 20:00",
    lesson: "So sánh các số có 3 chữ số",
    subject: "Số học",
    duration: "15 ph",
    score: "100/100",
    status: "Hoàn thành",
  },
  {
    datetime: "25/02 · 18:30",
    lesson: "Đo độ dài – cm và m",
    subject: "Đo lường",
    duration: "20 ph",
    score: "70/100",
    status: "Hoàn thành",
  },
  {
    datetime: "24/02 · 17:00",
    lesson: "Góc vuông và góc nhọn",
    subject: "Hình học",
    duration: "25 ph",
    score: "88/100",
    status: "Hoàn thành",
  },
  {
    datetime: "23/02 · 19:15",
    lesson: "Phép trừ có nhớ",
    subject: "Số học",
    duration: "18 ph",
    score: "—",
    status: "Đang dở",
  },
  {
    datetime: "22/02 · 08:00",
    lesson: "Giải toán: tìm số hạng",
    subject: "Lời văn",
    duration: "30 ph",
    score: "75/100",
    status: "Hoàn thành",
  },
  {
    datetime: "21/02 · 16:45",
    lesson: "Đọc giờ đúng – đồng hồ",
    subject: "Đo lường",
    duration: "12 ph",
    score: "90/100",
    status: "Hoàn thành",
  },
  {
    datetime: "20/02 · 20:00",
    lesson: "Bảng nhân số 7",
    subject: "Số học",
    duration: "20 ph",
    score: "82/100",
    status: "Hoàn thành",
  },
];

const statusStyle: Record<Status, string> = {
  "Hoàn thành": "bg-green-100 text-green-700",
  "Đang dở": "bg-yellow-100 text-yellow-700",
};

const subjects = ["Tất cả", "Số học", "Hình học", "Đo lường", "Lời văn"];

export function HistoryPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | Status>("Tất cả");

  const filtered = ALL_ACTIVITIES.filter((a) => {
    const matchSearch = a.lesson.toLowerCase().includes(search.toLowerCase());
    const matchSubject =
      subjectFilter === "Tất cả" || a.subject === subjectFilter;
    const matchStatus = statusFilter === "Tất cả" || a.status === statusFilter;
    return matchSearch && matchSubject && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Lịch sử học tập</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {ALL_ACTIVITIES.length} hoạt động được ghi nhận
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm bài học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {/* Subject */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 bg-white"
        >
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 bg-white"
        >
          {["Tất cả", "Hoàn thành", "Đang dở"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">
            Không tìm thấy kết quả phù hợp.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 pr-4 font-semibold">Ngày / Giờ</th>
                <th className="pb-3 pr-4 font-semibold">Tên bài học</th>
                <th className="pb-3 pr-4 font-semibold">Chủ đề</th>
                <th className="pb-3 pr-4 font-semibold">Thời gian</th>
                <th className="pb-3 pr-4 font-semibold">Điểm số</th>
                <th className="pb-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((a, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                    {a.datetime}
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-700">
                    {a.lesson}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {a.subject}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{a.duration}</td>
                  <td className="py-3 pr-4 font-semibold text-gray-700">
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
        )}
      </div>
    </div>
  );
}
