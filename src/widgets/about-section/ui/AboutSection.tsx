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
    <section id="about" ref={ref} className="py-24 bg-white">
      <div className="container mx-auto max-w-6xl px-6">
        {/* Header */}
        <div
          className={`reveal ${inView ? "visible" : ""} text-center max-w-3xl mx-auto mb-16`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-snug">
            {t.about.title}{" "}
            <span style={{ color: "var(--brand-primary)" }}>
              {t.about.titleAccent}
            </span>
          </h2>
        </div>

        {/* 3-column feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.about.items.map((item, i) => {
            const s = cardStyles[i];
            return (
              <div
                key={item.title}
                className={`reveal scale-up ${delays[i]} ${inView ? "visible" : ""} group bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col`}
              >
                <div
                  className={`w-14 h-14 ${s.iconBg} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className={s.iconColor}>{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed flex-1">
                  {item.desc}
                </p>
                <div className={`mt-6 h-1 w-12 rounded-full ${s.accent}`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
