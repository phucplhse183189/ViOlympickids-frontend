import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/lib/useInView";

const cardStyles = [
  {
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    border: "border-orange-200",
    accent: "bg-orange-500",
  },
  {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    border: "border-blue-200",
    accent: "bg-blue-500",
  },
  {
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    border: "border-purple-200",
    accent: "bg-purple-500",
  },
];
const delays = ["", "delay-200", "delay-400"];

export function AboutSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      id="about"
      ref={ref}
      className="relative overflow-hidden py-20 sm:py-24 bg-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 15% 12%, rgba(56,189,248,0.22), transparent 40%), radial-gradient(circle at 85% 18%, rgba(249,115,22,0.16), transparent 45%), radial-gradient(circle at 50% 85%, rgba(168,85,247,0.12), transparent 45%)",
        }}
      />
      <div className="container relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div
          className={`reveal ${inView ? "visible" : ""} text-center max-w-3xl mx-auto mb-12 sm:mb-16`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 leading-snug">
            {t.about.title}{" "}
            <span style={{ color: "var(--brand-primary)" }}>
              {t.about.titleAccent}
            </span>
          </h2>
        </div>

        {/* 3-column feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {t.about.items.map((item, i) => {
            const s = cardStyles[i];
            return (
              <div
                key={item.title}
                className={`reveal scale-up ${delays[i]} ${inView ? "visible" : ""} group bg-white/85 backdrop-blur border border-gray-100 rounded-3xl p-6 sm:p-7 md:p-8 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 flex flex-col min-h-[220px]`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 ${s.iconBg} rounded-2xl flex items-center justify-center text-3xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                  aria-hidden
                >
                  <span className={s.iconColor}>{item.icon}</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-[14px] leading-relaxed flex-1">
                  {item.desc}
                </p>
                <div className={`mt-5 sm:mt-6 h-1.5 w-14 rounded-full ${s.accent}`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
