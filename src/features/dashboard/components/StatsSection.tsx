import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/hooks/useInView";

export function StatsSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  const delays = ["", "delay-100", "delay-200", "delay-300"];
  return (
    <section
      ref={ref}
      style={{ backgroundColor: "var(--brand-secondary)" }}
      className="py-12"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {t.stats.items.map((stat, i) => (
            <div
              key={stat.label}
              className={`reveal scale-up ${delays[i]} ${inView ? "visible" : ""}`}
            >
              <h3 className="text-4xl font-bold mb-1">{stat.value}</h3>
              <p className="text-blue-100 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
