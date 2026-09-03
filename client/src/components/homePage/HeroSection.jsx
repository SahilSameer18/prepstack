import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import HeroProductShowcase from "./HeroProductShowcase";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="text-center pt-8 pb-14">
      {/* Engineering Monospace Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-gray-400 mb-6 backdrop-blur-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />
        <span className="text-gray-300 font-semibold tracking-wider">PREPSTACK</span>
        <span className="text-white/20">/</span>
        <span className="text-[#ffa116]">SDE PLACEMENT SYSTEM</span>
      </div>

      {/* High-Impact Headline */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.08] mb-6">
        The engineered workspace for{" "}
        <span className="bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
          serious software
        </span>{" "}
        <span className="text-[#ffa116]">placements</span>.
      </h1>

      {/* Authoritative Subtitle */}
      <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
        Curated DSA problem patterns with atomic progress sync, low-level CS interview internals, and recruiter-grade project architectures. Built for developers who value clarity.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
        <Link
          to="/dsa"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ffa116] to-[#ff8c00] text-black font-bold px-7 py-3 rounded-xl hover:from-[#ffb84d] hover:to-[#ffa116] shadow-lg shadow-[#ffa116]/20 hover:shadow-[#ffa116]/30 hover:-translate-y-0.5 transition-all text-sm"
        >
          Start Preparing <FaArrowRight className="text-xs" />
        </Link>

        {user ? (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] bg-white/[0.03] text-gray-300 hover:bg-white/[0.08] hover:text-white transition-all text-sm font-medium"
          >
            Go to Dashboard →
          </Link>
        ) : (
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] bg-white/[0.03] text-gray-300 hover:bg-white/[0.08] hover:text-white transition-all text-sm font-medium"
          >
            Create Free Account
          </Link>
        )}
      </div>

      {/* ── LIVE INTERACTIVE PRODUCT PREVIEW ── */}
      <HeroProductShowcase />
    </section>
  );
};

export default HeroSection;
