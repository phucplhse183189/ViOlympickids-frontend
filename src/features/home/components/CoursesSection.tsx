import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/hooks/useInView";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/auth";

export function CoursesSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const delays = ["", "delay-100", "delay-200"];

  const handlePlanClick = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/dashboard/subscription");
    }
  };

  return (
    <section
      id="courses"
      ref={ref}
      className="relative overflow-hidden bg-blue-50 py-20 transition-colors duration-300 dark:bg-slate-900 sm:py-24"
    >
      {/* Decorative background blobs + shimmer */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[-6%] h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl animate-float-slow" />
        <div className="absolute top-[18%] right-[-10%] h-80 w-80 rounded-full bg-orange-200/35 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[40%] h-72 w-72 rounded-full bg-blue-200/25 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div
          className={`reveal ${inView ? "visible" : ""} text-center max-w-2xl mx-auto mb-12 sm:mb-16`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-slate-100 whitespace-nowrap">
            {t.courses.title}{" "}
            <span style={{ color: "var(--brand-primary)" }}>
              {t.courses.titleAccent}
            </span>
          </h2>
        </div>

        {/* Pricing cards */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 md:grid-cols-3 lg:gap-7">
          {t.courses.plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`reveal scale-up ${delays[i]} ${
                inView ? "visible" : ""
              } relative flex flex-col rounded-3xl p-5 sm:p-7 md:p-8 ${
                plan.highlight
                  ? "scale-[1.02] border-2 border-[#ff6f61] bg-white shadow-[0_18px_45px_-20px_rgba(255,111,97,0.45)] dark:bg-slate-900"
                  : "border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#ff6f61] px-4 py-1.5 text-xs font-bold text-white shadow">
                  {plan.badge}
                </span>
              )}

              {/* Plan name & subtitle */}
              <div className="mb-3 mt-1 flex items-center gap-3">
                <span
                  className={
                    plan.highlight
                      ? "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6f61] shadow-sm"
                      : "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200 shadow-sm dark:bg-slate-800 dark:ring-slate-700"
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
                  <h3 className="text-lg sm:text-2xl font-extrabold text-gray-800 dark:text-slate-100">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-slate-400 sm:text-sm">
                    {plan.subtitle}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-2">
                <span
                  className={`text-4xl font-extrabold ${plan.highlight ? "" : "text-slate-800 dark:text-slate-100"}`}
                  style={{
                    color: plan.highlight ? "var(--brand-primary)" : undefined,
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-base font-medium text-gray-500 dark:text-slate-400">
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
                      className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-slate-800 dark:text-slate-300"
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
                      f.included ? "text-gray-700 font-medium dark:text-slate-200" : "text-gray-400 dark:text-slate-500"
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
                onClick={handlePlanClick}
                className={`mt-8 group w-full relative overflow-hidden py-4 font-bold text-base rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  plan.highlight
                    ? "text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
