import { useEffect, useRef, useState } from "react";
import { Clock, Trophy, Target } from "lucide-react";
import { StudyProgressChart } from "@/widgets/study-progress-chart";
import { RecentActivityTable } from "@/widgets/recent-activity-table";

/* ── tiny count-up hook ── */
function useCountUp(target: number, duration = 1000, enabled = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const timer = setInterval(() => {
      frame++;
      setCount(Math.min(Math.round((frame / totalFrames) * target), target));
      if (frame >= totalFrames) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, enabled]);
  return count;
}

/* ── scroll-reveal hook ── */
function useReveal() {
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
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

interface StatCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  countTarget?: number;
  countSuffix?: string;
  badge?: string;
  badgeColor?: string;
  delay?: number;
}

function StatCard({
  icon,
  iconBg,
  title,
  value,
  countTarget,
  countSuffix = "",
  badge,
  badgeColor,
  delay = 0,
}: StatCardProps) {
  const { ref, visible } = useReveal();
  const count = useCountUp(
    countTarget ?? 0,
    1000,
    visible && countTarget !== undefined,
  );
  const displayValue =
    countTarget !== undefined && visible ? `${count}${countSuffix}` : value;

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={`bg-white rounded-2xl shadow-sm p-6 flex items-start gap-4 hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${visible ? "animate-fade-in-up" : "opacity-0"}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${visible ? "animate-icon-bounce-in" : ""}`}
        style={{ animationDelay: `${delay + 150}ms` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
        <p
          className={`text-2xl font-extrabold text-gray-800 leading-tight ${visible ? "animate-count-pop" : "opacity-0"}`}
          style={{ animationDelay: `${delay + 200}ms` }}
        >
          {displayValue}
        </p>
        {badge && (
          <span
            className={`inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeColor} ${visible ? "animate-badge-pop" : "opacity-0"}`}
            style={{ animationDelay: `${delay + 320}ms` }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

export function OverviewPage() {
  const headingRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartVisible, setChartVisible] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [tableVisible, setTableVisible] = useState(false);

  useEffect(() => {
    const observe = (el: HTMLElement | null, cb: () => void) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            cb();
            obs.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(el);
      return () => obs.disconnect();
    };
    observe(headingRef.current, () => setHeadingVisible(true));
    observe(chartRef.current, () => setChartVisible(true));
    observe(tableRef.current, () => setTableVisible(true));
  }, []);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div
        ref={headingRef}
        className={headingVisible ? "animate-fade-in-up" : "opacity-0"}
      >
        <h2 className="text-xl font-bold text-gray-800">Tổng quan</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Chào buổi sáng! Hôm nay con đã sẵn sàng học chưa? 🎉
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={<Clock size={22} className="text-blue-500" />}
          iconBg="bg-blue-50"
          title="Thời gian học tuần này"
          value="120 phút"
          countTarget={120}
          countSuffix=" phút"
          badge="+15% so với tuần trước"
          badgeColor="bg-green-100 text-green-700"
          delay={0}
        />
        <StatCard
          icon={<Trophy size={22} className="text-yellow-500" />}
          iconBg="bg-yellow-50"
          title="Số bài Toán hoàn thành"
          value="15 bài"
          countTarget={15}
          countSuffix=" bài"
          badge="Tuần này"
          badgeColor="bg-yellow-100 text-yellow-700"
          delay={100}
        />
        <StatCard
          icon={<Target size={22} className="text-purple-500" />}
          iconBg="bg-purple-50"
          title="Kỹ năng tốt nhất"
          value="Hình học không gian"
          badge="⭐ Điểm mạnh nổi bật"
          badgeColor="bg-purple-100 text-purple-700"
          delay={200}
        />
      </div>

      {/* Progress chart */}
      <div
        ref={chartRef}
        className={chartVisible ? "animate-fade-in-up" : "opacity-0"}
        style={{ animationDelay: "80ms" }}
      >
        <StudyProgressChart />
      </div>

      {/* Activity table */}
      <div
        ref={tableRef}
        className={tableVisible ? "animate-fade-in-up" : "opacity-0"}
        style={{ animationDelay: "120ms" }}
      >
        <RecentActivityTable />
      </div>
    </div>
  );
}
