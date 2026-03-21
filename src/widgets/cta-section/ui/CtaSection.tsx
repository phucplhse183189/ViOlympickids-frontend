import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/lib/useInView";

export function CtaSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <section
      ref={ref}
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: "var(--brand-primary)" }}
    >
      {/* Dot pattern overlay */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-10"
        style={{
          backgroundImage: "radial-gradient(#fff 2px, transparent 2px)",
          backgroundSize: "30px 30px",
        }}
      />
      {/* Floating decorations */}
      <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 animate-float-slow" />
      <div
        className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-white/10 animate-float-slow"
        style={{ animationDelay: "1s" }}
      />

      <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
        <h2
          className={`reveal scale-up ${inView ? "visible" : ""} text-4xl md:text-5xl font-bold text-white mb-6`}
        >
          {t.cta.title}
        </h2>
        <p
          className={`reveal scale-up delay-100 ${inView ? "visible" : ""} text-white/90 text-xl mb-10 max-w-2xl mx-auto`}
        >
          {t.cta.subtitle}
        </p>

        {/* Email capture */}
        <div
          className={`reveal scale-up delay-200 ${inView ? "visible" : ""} flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto`}
        >
          <input
            type="email"
            placeholder={t.cta.emailPlaceholder}
            className="flex-1 px-6 py-4 rounded-full bg-white text-gray-800 text-base outline-none shadow-lg placeholder:text-gray-400 focus:ring-2 focus:ring-white"
          />
          <button
            className="px-8 py-4 bg-white font-bold text-base rounded-full shadow-2xl hover:scale-105 hover:shadow-3xl active:scale-95 transition-all duration-200 whitespace-nowrap"
            style={{ color: "var(--brand-primary)" }}
          >
            {t.cta.button}
          </button>
        </div>

        <p
          className={`reveal delay-300 ${inView ? "visible" : ""} mt-4 text-white/70 text-sm`}
        >
          {t.cta.footnote}
        </p>
      </div>
    </section>
  );
}
