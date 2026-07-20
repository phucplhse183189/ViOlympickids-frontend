import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLang } from "@/shared/lib/i18n";
import { useInView } from "@/shared/hooks/useInView";

export function CtaSection() {
  const { t, lang } = useLang();
  const { ref, inView } = useInView<HTMLElement>();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError(lang === "vi" ? "Vui lòng nhập địa chỉ email hợp lệ." : "Please enter a valid email address.");
      return;
    }
    localStorage.setItem("vio-offer-email", value);
    setError("");
    setSubmitted(true);
  };
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
        <form
          onSubmit={handleSubmit}
          className={`reveal scale-up delay-200 ${inView ? "visible" : ""} flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto`}
        >
          <input
            type="email"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setError(""); setSubmitted(false); }}
            placeholder={t.cta.emailPlaceholder}
            aria-invalid={Boolean(error)}
            aria-describedby="offer-status"
            className="flex-1 px-6 py-4 rounded-full bg-white text-gray-800 text-base outline-none shadow-lg placeholder:text-gray-400 focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            disabled={submitted}
            className="whitespace-nowrap rounded-full border-2 border-white bg-white px-8 py-4 text-base font-bold text-[#e75348] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-transparent hover:text-white active:translate-y-0 disabled:cursor-default disabled:opacity-90"
          >
            {t.cta.button}
          </button>
        </form>

        <div id="offer-status" aria-live="polite" className="mx-auto mt-3 min-h-6 max-w-lg text-sm font-semibold text-white">
          {error && <span>{error}</span>}
          {submitted && <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" />{lang === "vi" ? "Đã ghi nhận! Ưu đãi sẽ được gửi đến email của bạn." : "You're on the list! We'll send the offer to your email."}</span>}
        </div>

        <p
          className={`reveal delay-300 ${inView ? "visible" : ""} mt-2 text-white/80 text-sm`}
        >
          {t.cta.footnote}
        </p>
      </div>
    </section>
  );
}
