import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/hooks/useInView";

const stepStyles = [
  { step: "1", bg: "bg-green-100", color: "text-green-600" },
  { step: "2", bg: "bg-blue-100", color: "text-blue-600" },
  { step: "3", bg: "bg-red-100", color: "text-[var(--brand-primary)]" },
];
const stepDelays = ["", "delay-200", "delay-400"];

export function HowItWorksSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  const steps = stepStyles.map((s, i) => ({ ...s, ...t.howItWorks.steps[i] }));
  return (
    <section ref={ref} className="bg-white pb-10 pt-16 transition-colors duration-300 dark:bg-slate-950 sm:pb-12 sm:pt-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <h2
          className={`reveal ${inView ? "visible" : ""} mb-10 text-center text-3xl font-bold text-gray-800 dark:text-slate-100 sm:mb-12 sm:text-4xl`}
        >
          {t.howItWorks.title}
        </h2>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {steps.map((item, index) => (
            <>
              <div
                key={item.step}
                className={`reveal scale-up ${stepDelays[index]} ${inView ? "visible" : ""} text-center max-w-xs group`}
              >
                <div
                  className={`w-20 h-20 ${item.bg} rounded-full flex items-center justify-center text-3xl font-bold ${item.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.step}
                </div>
                <h4 className="text-xl font-bold mb-2 text-gray-800 dark:text-slate-100">
                  {item.title}
                </h4>
                <p className="text-gray-500 dark:text-slate-400">{item.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  key={`divider-${index}`}
                  className="hidden md:block w-24 h-1 bg-gray-200"
                />
              )}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}
