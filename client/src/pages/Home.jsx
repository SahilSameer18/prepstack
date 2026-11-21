import React from "react";
import PageBackdrop from "../components/ui/PageBackdrop";
import HeroSection from "../components/homePage/HeroSection";
import StatsRow from "../components/homePage/StatsRow";
import HowItWorks from "../components/homePage/HowItWorks";
import SuiteSection from "../components/homePage/SuiteSection";
import AnalyzerShowcase from "../components/homePage/AnalyzerShowcase";
import WhySection from "../components/homePage/WhySection";
import CtaBanner from "../components/homePage/CtaBanner";
import FAQ from "../components/homePage/FAQ";

const Home = () => {
  return (
    <div className="relative min-h-screen bg-canvas text-fg-2 selection:bg-brand/25 selection:text-fg overflow-x-hidden">
      <PageBackdrop />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 relative z-10 space-y-14 sm:space-y-16">
        <HeroSection />
        <StatsRow />
        <HowItWorks />
        <SuiteSection />
        <AnalyzerShowcase />
        <WhySection />
        <CtaBanner />
        <FAQ />
      </div>
    </div>
  );
};

export default Home;
