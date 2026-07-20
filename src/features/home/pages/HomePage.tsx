import { useEffect, useState } from "react";
import { Header } from "@/features/home/components/Header";
import { HeroSection } from "@/features/home/components/HeroSection";
import { AboutSection } from "@/features/home/components/AboutSection";
import { CoursesSection } from "@/features/home/components/CoursesSection";
import { HowItWorksSection } from "@/features/home/components/HowItWorksSection";
import { CtaSection } from "@/features/home/components/CtaSection";
import { Footer } from "@/features/home/components/Footer";
import { FeedbackSection } from "@/features/feedback/components/FeedbackSection";
import BannerAdLeft from "@/features/home/components/BannerAdLeft";
import BannerAdRight from "@/features/home/components/BannerAdRight";
import { BackToTop } from "@/shared/ui/BackToTop";

export function HomePage() {
  const [adsVisible, setAdsVisible] = useState(true);

  useEffect(() => {
    const duration = adsVisible ? 10_000 : 30_000;
    const timer = window.setTimeout(() => {
      setAdsVisible((visible) => !visible);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [adsVisible]);

  return (
    <div className="home-page relative min-h-screen bg-white text-gray-700 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-200">
      {/* Banner quảng cáo bên trái */}
      <BannerAdLeft visible={adsVisible} />
      {/* Banner quảng cáo bên right */}
      <BannerAdRight visible={adsVisible} />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <CoursesSection />
        <HowItWorksSection />
        <FeedbackSection />
        <CtaSection />
      </main>
      <Footer />
      <BackToTop adsVisible={adsVisible} />
    </div>
  );
}
