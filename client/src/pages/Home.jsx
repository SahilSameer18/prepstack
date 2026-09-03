import React from "react";
import HeroSection from "../components/homePage/HeroSection";
import MetricsStrip from "../components/homePage/MetricsStrip";
import EngineeringContrast from "../components/homePage/EngineeringContrast";
import BentoGrid from "../components/homePage/BentoGrid";
import Testimonial from "../components/homePage/Testimonial";
import FAQ from "../components/homePage/FAQ";

const Home = () => {
  return (
    <div className="relative min-h-screen bg-[#070707] text-white selection:bg-[#ffa116]/30 selection:text-white overflow-x-hidden">
      {/* Subtle Engineering Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Very Subtle Ambient Illumination */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ffa116]/[0.045] blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-24 relative z-10">
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
