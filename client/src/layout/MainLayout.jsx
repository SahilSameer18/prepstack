import React from "react";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import PageLoader from "../components/ui/PageLoader";

const MainLayout = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#060608] text-[#f4f4f5] selection:bg-[#ffa116]/25 selection:text-white overflow-x-hidden">
      {/* ── LUXURY ATMOSPHERIC CANVAS (Subtle architectural grid + radial light) ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Subtle dot matrix grid with top radial mask */}
        <div className="absolute inset-0 bg-dot-grid radial-mask-top opacity-50" />
        
        {/* Top horizon specular arc */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[550px] opacity-70 transform-gpu"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255, 161, 22, 0.08) 0%, rgba(255, 161, 22, 0.015) 50%, transparent 80%)",
          }}
        />

        {/* Crisp top hairline specular separator */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      </div>

      <ScrollToTop />
      <Navbar />
      <main className="flex-grow pt-20 sm:pt-24 px-4 pb-12 overflow-x-hidden relative z-10">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet /> {/* Render the child route pages here */}
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;