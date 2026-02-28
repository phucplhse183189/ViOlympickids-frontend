import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/lib/useInView";

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
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <h2
          className={`reveal ${inView ? "visible" : ""} text-4xl font-bold mb-16 text-center text-gray-800`}
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
                <h4 className="text-xl font-bold mb-2 text-gray-800">
                  {item.title}
                </h4>
                <p className="text-gray-500">{item.description}</p>
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
