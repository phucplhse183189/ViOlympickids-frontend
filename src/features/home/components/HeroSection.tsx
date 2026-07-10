import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/hooks/useInView";

export function HeroSection() {
  const { t } = useLang();
  const { ref, inView } = useInView<HTMLElement>(0);
  const [isMuted, setIsMuted] = useState(true);

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

      {/* Main Container - Narrowed down to max-w-5xl (~1024px) to make room for banners on 1366px laptops */}
      <div className="container mx-auto max-w-5xl px-6 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        {/* Left content – 6 cols */}
        <div className="text-center md:text-left z-10">
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
            className={`reveal from-left delay-100 ${inView ? "visible" : ""} text-4xl lg:text-5xl font-extrabold leading-[1.15] mb-6 text-gray-800 tracking-tight`}
          >
            {t.hero.titleLine1}{" "}
            <span className="block mt-1">
              {t.hero.titleLine2}{" "}
              <span style={{ color: "var(--brand-primary)" }}>
                {t.hero.titleAccent}
              </span>
            </span>
          </h1>
          <p
            className={`reveal from-left delay-200 ${inView ? "visible" : ""} text-lg md:text-xl text-gray-500 mb-8 leading-relaxed`}
          >
            {t.hero.subtitle}
          </p>
          <div
            className={`reveal from-left delay-300 ${inView ? "visible" : ""} flex flex-col xl:flex-row gap-4 justify-center md:justify-start`}
          >
            <button
              className="px-6 py-3 text-white text-lg font-bold rounded-2xl shadow-lg transition-all btn-bounce active:translate-y-1 hover:-translate-y-1 hover:shadow-xl"
              style={{
                backgroundColor: "var(--brand-primary)",
                boxShadow: "0 6px 0 var(--brand-primary-dark)",
              }}
            >
              {t.hero.ctaPrimary}
            </button>
            <button className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 text-lg font-bold rounded-2xl hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs">
                ▶
              </span>
              {t.hero.ctaSecondary}
            </button>
          </div>
        </div>

        {/* Right visual */}
        <div
          className={`reveal from-right delay-200 ${inView ? "visible" : ""} mt-12 md:mt-0`}
        >
          {/* 16:9 video placeholder */}
          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-shadow duration-500"
            style={{ paddingBottom: "56.25%" }}
          >
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src="/videos/intro-web.mp4"
              autoPlay
              muted={isMuted}
              loop
              controls={false}
              preload="metadata"
              playsInline
              disablePictureInPicture
              controlsList="nodownload noplaybackrate noremoteplayback nofullscreen"
              onContextMenu={(e) => e.preventDefault()}
            />

            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className="absolute bottom-4 right-4 z-10 w-11 h-11 rounded-full bg-black/55 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition"
              aria-label={isMuted ? "Mở tiếng" : "Tắt tiếng"}
              title={isMuted ? "Mở tiếng" : "Tắt tiếng"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
