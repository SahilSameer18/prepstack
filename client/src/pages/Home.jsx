import React from "react";
import HeroSection from "../components/homePage/HeroSection";
import MetricsStrip from "../components/homePage/MetricsStrip";
import EngineeringContrast from "../components/homePage/EngineeringContrast";
import BentoGrid from "../components/homePage/BentoGrid";
import Testimonial from "../components/homePage/Testimonial";
import FAQ from "../components/homePage/FAQ";

const Home = () => {
  return (
    <div className="relative min-h-screen bg-canvas text-fg-2 selection:bg-brand/25 selection:text-fg overflow-x-hidden">
      {/* ── LUXURY AMBIENT HORIZON BEAM ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[480px] pointer-events-none -z-10 opacity-70 transform-gpu"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--brand-deep) 9%, transparent) 0%, color-mix(in srgb, var(--brand-deep) 1.5%, transparent) 55%, transparent 80%)",
        }}
      />

      {/* ── ARCHITECTURAL TOP BORDER HIGHLIGHT ── */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-ink/[0.12] to-transparent pointer-events-none" />

      {/* ── LUXURY CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-36 relative z-10 space-y-28 sm:space-y-36">
        <HeroSection />
        <MetricsStrip />
        <EngineeringContrast />
        <BentoGrid />
        <Testimonial />
        <FAQ />
      </div>
    </div>
  );
};

export default Home;
