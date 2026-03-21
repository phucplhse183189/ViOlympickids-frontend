import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/lib/useInView";

export function CoursesSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  const delays = ["", "delay-100", "delay-200"];

  return (
    <section
      id="courses"
      ref={ref}
      className="relative overflow-hidden py-20 sm:py-24 bg-blue-50"
    >
      {/* Decorative background blobs + shimmer */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[-6%] h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl animate-float-slow" />
        <div className="absolute top-[18%] right-[-10%] h-80 w-80 rounded-full bg-orange-200/35 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[40%] h-72 w-72 rounded-full bg-purple-200/25 blur-3xl" />
        <div
          className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/65 to-transparent ${
            inView ? "animate-gradient-x" : ""
          }`}
          style={{ backgroundSize: "200% 200%" }}
        />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Header */}
        <div
          className={`reveal ${inView ? "visible" : ""} text-center max-w-2xl mx-auto mb-12 sm:mb-16`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-800 whitespace-nowrap">
            {t.courses.title}{" "}
            <span style={{ color: "var(--brand-primary)" }}>
              {t.courses.titleAccent}
            </span>
          </h2>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto items-stretch">
          {t.courses.plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`reveal scale-up ${delays[i]} ${
                inView ? "visible" : ""
              } relative flex flex-col rounded-3xl p-5 sm:p-7 md:p-8 ${
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
              <div className="mb-3 mt-1 flex items-center gap-3">
                <span
                  className={
                    plan.highlight
                      ? "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 shadow-sm animate-float-slow"
                      : "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200 shadow-sm"
                  }
                  aria-hidden
                >
                  {plan.name === "FREE"
                    ? "🧩"
                    : plan.name === "VIP"
                      ? "👑"
                      : "🚀"}
                </span>
                <div>
                  <h3 className="text-lg sm:text-2xl font-extrabold text-gray-800">
                    {plan.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {plan.subtitle}
                  </p>
                </div>
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
                    className={`flex items-start gap-3 text-sm transition-transform hover:-translate-y-0.5 ${
                      f.included ? "text-gray-700 font-medium" : "text-gray-400"
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        f.included
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-500"
                      }`}
                      style={
                        plan.highlight && inView && f.included
                          ? { animation: "pulse-slow 1.8s ease-in-out infinite" }
                          : undefined
                      }
                    >
                      {f.included ? "✓" : "✕"}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`mt-8 group w-full relative overflow-hidden py-4 font-bold text-base rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
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
                <div className="pointer-events-none absolute top-0 -left-[120%] h-full w-[140%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] transition-all duration-700 group-hover:left-[120%]" />
                <span className="relative">{plan.ctaBtn}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
