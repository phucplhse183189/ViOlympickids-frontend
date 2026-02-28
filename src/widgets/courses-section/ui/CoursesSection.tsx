import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/lib/useInView";

export function CoursesSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  const { traditional, pro } = t.courses;
  return (
    <section id="courses" ref={ref} className="py-24 bg-blue-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div
          className={`reveal ${inView ? "visible" : ""} text-center max-w-2xl mx-auto mb-16`}
        >
          <h2 className="text-4xl font-bold mb-4 text-gray-800">
            {t.courses.title}{" "}
            <span style={{ color: "var(--brand-primary)" }}>
              {t.courses.titleAccent}
            </span>
          </h2>
        </div>

        {/* Pricing cards */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-4xl mx-auto">
          {/* Traditional – muted */}
          <div
            className={`reveal from-left ${inView ? "visible" : ""} flex-1 bg-gray-50 opacity-90 rounded-3xl p-8 shadow-md flex flex-col`}
          >
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {traditional.title}
            </h3>
            <p className="text-3xl font-extrabold text-gray-400 mb-6">
              {traditional.price}
            </p>
            <ul className="space-y-3 flex-1">
              {traditional.cons.map((con) => (
                <li key={con} className="flex items-start gap-3 text-gray-500">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold shrink-0">
                    ✕
                  </span>
                  {con}
                </li>
              ))}
            </ul>
          </div>

          {/* ViOlympicKids Pro – highlighted */}
          <div
            className={`reveal from-right delay-200 ${inView ? "visible" : ""} flex-1 bg-white border-2 border-orange-400 rounded-3xl p-8 shadow-2xl flex flex-col relative`}
          >
            {/* Badge */}
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap shadow">
              {pro.badge}
            </span>

            <h3 className="text-xl font-bold text-gray-800 mb-2 mt-2">
              {pro.title}
            </h3>
            <p
              className="text-3xl font-extrabold mb-1"
              style={{ color: "var(--brand-primary)" }}
            >
              {pro.price}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Tiết kiệm hơn 95% so với gia sư
            </p>

            <ul className="space-y-3 flex-1">
              {pro.pros.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-gray-700 font-medium"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <button
              className="mt-8 w-full py-4 text-white font-bold text-lg rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl active:translate-y-0 transition-all"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              {pro.ctaBtn}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
