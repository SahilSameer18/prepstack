import React from "react";

const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ffa116]/5 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/4 rounded-full blur-[100px] animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Animated logo mark */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffa116] animate-spin" style={{ width: 72, height: 72 }} />
          {/* Middle pulsing ring */}
          <div className="absolute inset-[6px] rounded-full border border-[#ffa116]/20 animate-ping" />
          {/* Inner icon container */}
          <div className="w-[72px] h-[72px] rounded-full bg-[#ffa116]/10 border border-[#ffa116]/20 flex items-center justify-center">
            <span className="text-2xl font-black text-[#ffa116]">P</span>
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <p className="text-white font-bold text-xl tracking-tight">
            Prep<span className="text-[#ffa116]">Stack</span>
          </p>
          <p className="text-gray-500 text-sm mt-1 animate-pulse">{message}</p>
        </div>

        {/* Dot loader bar */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#ffa116]/60"
              style={{
                animation: "dotBounce 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;