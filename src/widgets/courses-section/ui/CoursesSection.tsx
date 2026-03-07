import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/lib/useInView";

export function CoursesSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  const delays = ["", "delay-100", "delay-200"];

  return (
    <section id="courses" ref={ref} className="py-24 bg-blue-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div
          className={`reveal ${inView ? "visible" : ""} text-center max-w-2xl mx-auto mb-16`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 whitespace-nowrap">
            {t.courses.title}{" "}
            <span style={{ color: "var(--brand-primary)" }}>
              {t.courses.titleAccent}
            </span>
          </h2>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {t.courses.plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`reveal scale-up ${delays[i]} ${inView ? "visible" : ""} relative flex flex-col rounded-3xl p-8 ${
                plan.highlight
                  ? "bg-white border-2 border-orange-400 shadow-2xl scale-[1.03]"
                  : "bg-white shadow-md"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap shadow">
                  {plan.badge}
                </span>
              )}

              {/* Plan name & subtitle */}
              <div className="mb-4 mt-1">
                <h3 className="text-2xl font-extrabold text-gray-800">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-400">{plan.subtitle}</p>
              </div>

              {/* Price */}
              <div className="mb-2">
                <span
                  className="text-4xl font-extrabold"
                  style={{
                    color: plan.highlight ? "var(--brand-primary)" : "#1f2937",
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-base text-gray-500 font-medium">
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Alt pricing */}
              {plan.pricing.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {plan.pricing.map((p) => (
                    <span
                      key={p}
                      className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
              {plan.pricing.length === 0 && <div className="mb-5" />}

              {/* Divider */}
              <hr className="border-gray-200 mb-5" />

              {/* Features */}
              <ul className="space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f.text}
                    className={`flex items-start gap-3 text-sm ${
                      f.included ? "text-gray-700 font-medium" : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        f.included
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {f.included ? "✓" : "✕"}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`mt-8 w-full py-4 font-bold text-base rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl active:translate-y-0 transition-all ${
                  plan.highlight
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={
                  plan.highlight
                    ? { backgroundColor: "var(--brand-primary)" }
                    : undefined
                }
              >
                {plan.ctaBtn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
