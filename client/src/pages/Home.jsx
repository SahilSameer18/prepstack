import React from "react";
import PageBackdrop from "../components/ui/PageBackdrop";
import HeroSection from "../components/homePage/HeroSection";
import BenefitStrip from "../components/homePage/BenefitStrip";
import PlanSection from "../components/homePage/PlanSection";
import WhySection from "../components/homePage/WhySection";
import SuiteSection from "../components/homePage/SuiteSection";
import CtaBanner from "../components/homePage/CtaBanner";
import FAQ from "../components/homePage/FAQ";

const Home = () => {
  return (
    <div className="relative min-h-screen bg-canvas text-fg-2 selection:bg-brand/25 selection:text-fg overflow-x-hidden">
      <PageBackdrop />

      {/* ── LUXURY CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-36 relative z-10 space-y-28 sm:space-y-36">
        <HeroSection />
        <BenefitStrip />
        <WhySection />
        <SuiteSection />
        <PlanSection />
        <CtaBanner />
        <FAQ />
      </div>
    </div>
  );
};

export default Home;
