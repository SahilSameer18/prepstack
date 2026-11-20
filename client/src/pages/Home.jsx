import React from "react";
import HeroSection from "../components/homePage/HeroSection";
import BenefitStrip from "../components/homePage/BenefitStrip";
import PlanSection from "../components/homePage/PlanSection";
import Reveal from "../components/ui/Reveal";
import SuiteSection from "../components/homePage/SuiteSection";
import CtaBanner from "../components/homePage/CtaBanner";
import FAQ from "../components/homePage/FAQ";

const Home = () => {
  return (
    <div className="relative min-h-screen bg-canvas text-fg-2 selection:bg-brand/25 selection:text-fg overflow-x-hidden">
      {/* Page backdrop: fading grid paper plus two warm glows. Colours are tokens, strength is --glow. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[820px] pointer-events-none z-0 transform-gpu"
        style={{ maskImage: "radial-gradient(ellipse 70% 80% at 60% 18%, var(--ink) 20%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 60% 18%, var(--ink) 20%, transparent 75%)" }}
      >
        <div className="absolute inset-0 bg-line-grid" />
        <div
          className="absolute inset-0 animate-glow"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 78% 22%, color-mix(in srgb, var(--brand-grad-top) var(--glow), transparent) 0%, transparent 70%), radial-gradient(ellipse 40% 45% at 8% 4%, color-mix(in srgb, var(--brand-grad-top) calc(var(--glow) * 0.5), transparent) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── LUXURY CONTAINER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-36 relative z-10 space-y-28 sm:space-y-36">
        <HeroSection />
        <Reveal><BenefitStrip /></Reveal>
        <SuiteSection />
        <Reveal><PlanSection /></Reveal>
        <Reveal><CtaBanner /></Reveal>
        <Reveal><FAQ /></Reveal>
      </div>
    </div>
  );
};

export default Home;
