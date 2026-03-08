import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/lib/useInView";

export function HeroSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>(0);
  return (
    <section
      ref={ref}
      className="relative pt-24 pb-32 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, var(--pastel-blue), white)",
      }}
    >
      {/* Decorative floating shapes */}
      <div className="absolute top-16 left-[5%] w-14 h-14 rounded-full bg-yellow-200/60 animate-float-slow" />
      <div
        className="absolute top-1/3 right-[4%] w-10 h-10 rounded-full bg-pink-200/60 animate-float-slow"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        className="absolute bottom-24 left-[12%] w-8 h-8 rounded-full bg-blue-200/60 animate-float-slow"
        style={{ animationDelay: "0.7s" }}
      />
      <div className="absolute top-20 right-10 text-5xl opacity-20 animate-bounce">
        ☁️
      </div>
      <div className="absolute bottom-20 left-10 text-5xl opacity-20 animate-float-slow">
        ✨
      </div>
      {/* Spinning ring decoration */}
      <div className="absolute -top-20 -right-20 w-64 h-64 border-[3px] border-dashed border-blue-200/40 rounded-full animate-spin-slow" />

      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 items-center gap-12">
        {/* Left content – 5 cols */}
        <div className="md:col-span-5 text-center md:text-left z-10">
          <span
            className={`reveal from-left ${inView ? "visible" : ""} px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-4 inline-block`}
            style={{
              backgroundColor: "rgba(74,183,182,0.1)",
              color: "var(--brand-secondary)",
            }}
          >
            {t.hero.badge}
          </span>
          <h1
            className={`reveal from-left delay-100 ${inView ? "visible" : ""} text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-800`}
          >
            {t.hero.titleLine1}{" "}
            <span className="block">
              {t.hero.titleLine2}{" "}
              <span style={{ color: "var(--brand-primary)" }}>
                {t.hero.titleAccent}
              </span>
            </span>
          </h1>
          <p
            className={`reveal from-left delay-200 ${inView ? "visible" : ""} text-xl text-gray-500 mb-8 leading-relaxed`}
          >
            {t.hero.subtitle}
          </p>
          <div
            className={`reveal from-left delay-300 ${inView ? "visible" : ""} flex flex-col md:flex-row gap-4 justify-center md:justify-start`}
          >
            <button
              className="px-8 py-4 text-white text-xl font-bold rounded-2xl shadow-lg transition-all btn-bounce active:translate-y-1 hover:-translate-y-1 hover:shadow-xl"
              style={{
                backgroundColor: "var(--brand-primary)",
                boxShadow: "0 6px 0 var(--brand-primary-dark)",
              }}
            >
              {t.hero.ctaPrimary}
            </button>
            <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 text-xl font-bold rounded-2xl hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)] hover:-translate-y-1 transition-all flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm">
                ▶
              </span>
              {t.hero.ctaSecondary}
            </button>
          </div>
        </div>

        {/* Right visual – 7 cols */}
        <div
          className={`reveal from-right delay-200 ${inView ? "visible" : ""} md:col-span-7 mt-12 md:mt-0`}
        >
          {/* 16:9 video placeholder */}
          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-shadow duration-500"
            style={{ paddingBottom: "56.25%" }}
          >
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src="/videos/intro-web.mp4"
              controls
              preload="metadata"
              playsInline
            />
          </div>
        </div>
      </div>
    </section>
  );
}
