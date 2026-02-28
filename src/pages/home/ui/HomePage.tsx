import { Header } from "@/widgets/header";
import { HeroSection } from "@/widgets/hero-section";
import { StatsSection } from "@/widgets/stats-section";
import { AboutSection } from "@/widgets/about-section";
import { CoursesSection } from "@/widgets/courses-section";
import { HowItWorksSection } from "@/widgets/how-it-works";
import { CtaSection } from "@/widgets/cta-section";
import { Footer } from "@/widgets/footer";

export function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-700">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <AboutSection />
        <CoursesSection />
        <HowItWorksSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
