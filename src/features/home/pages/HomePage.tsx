import { Header } from "@/features/home/components/Header";
import { HeroSection } from "@/features/home/components/HeroSection";
import { AboutSection } from "@/features/home/components/AboutSection";
import { CoursesSection } from "@/features/home/components/CoursesSection";
import { HowItWorksSection } from "@/features/home/components/HowItWorksSection";
import { CtaSection } from "@/features/home/components/CtaSection";
import { Footer } from "@/features/home/components/Footer";
import BannerAdLeft from "@/features/home/components/BannerAdLeft";
import BannerAdRight from "@/features/home/components/BannerAdRight";

export function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-700 relative">
      {/* Banner quảng cáo bên trái */}
      <BannerAdLeft />
      {/* Banner quảng cáo bên phải */}
      <BannerAdRight />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <CoursesSection />
        <HowItWorksSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
