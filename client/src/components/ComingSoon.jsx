import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiClock, FiBell } from "react-icons/fi";
import { FaRocket, FaCode, FaBook, FaMap } from "react-icons/fa";

const ComingSoon = ({ feature = "This Feature" }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand/8 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute top-10 right-[10%] w-[200px] h-[200px] bg-violet-solid/5 blur-[80px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-[10%] w-[200px] h-[200px] bg-info-solid/5 blur-[80px] rounded-full -z-10 pointer-events-none" />

      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <FaRocket className="text-4xl text-brand" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand flex items-center justify-center">
          <FiClock className="text-on-brand text-xs" />
        </div>
      </div>

      {/* Heading */}
      <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 mb-5">
        <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
        <span className="text-brand text-xs font-semibold uppercase tracking-wider">In Development</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-fg via-fg-2 to-muted bg-clip-text text-transparent">
        Coming Soon
      </h1>

      <h2 className="text-xl md:text-2xl font-bold text-fg mb-3">
        <span className="text-brand">{feature}</span> is being built
      </h2>

      <p className="text-muted max-w-md mx-auto mb-8 text-sm leading-relaxed">
        We&apos;re crafting something powerful to help you prepare smarter and crack interviews faster. Stay tuned!
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        <Link
          to="/"
          className="flex items-center gap-2 bg-gradient-to-r from-brand to-brand-deep text-on-brand font-semibold px-5 py-2.5 rounded-xl hover:from-brand-hover hover:to-brand transition-all shadow-lg shadow-orange-solid/20"
        >
          <FiArrowLeft /> Go Home
        </Link>
        <Link
          to="/dsa"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-ink/[0.1] bg-ink/[0.04] text-fg-3 hover:bg-ink/[0.08] hover:text-fg transition-all text-sm"
        >
          <FaCode /> Explore DSA Sheets
        </Link>
      </div>

      {/* Other available resources */}
      <div className="max-w-sm w-full">
        <p className="text-xs text-muted font-semibold uppercase tracking-wider mb-3">Meanwhile, explore these</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: "DSA Sheets", icon: <FaCode />, path: "/dsa" },
            { name: "CS Notes", icon: <FaBook />, path: "/notes" },
            { name: "Roadmaps", icon: <FaMap />, path: "/roadmaps" },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="bg-ink/[0.03] border border-ink/[0.06] rounded-xl p-3 text-center hover:bg-ink/[0.06] hover:border-ink/[0.12] transition-all group"
            >
              <div className="text-brand text-lg mx-auto mb-1.5 group-hover:scale-110 transition-transform">{item.icon}</div>
              <p className="text-xs text-muted font-medium">{item.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
