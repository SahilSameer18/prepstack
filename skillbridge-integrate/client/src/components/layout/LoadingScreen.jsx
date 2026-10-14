import React, { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * LoadingScreen Component
 * A premium, full-screen loading overlay that replaces generic spinners.
 * Features an animated gradient SVG logo, dynamic text, and a visual progress step tracker.
 */
const LoadingScreen = ({
  message = "Loading...",
  subtitle = "Please wait while we set things up for you.",
  steps = [],
  currentStep = 0,
  fullScreen = true,
}) => {
  // Prevent page scrolling while full screen loader is active
  useEffect(() => {
    if (fullScreen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      
      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [fullScreen]);

  const content = (
    <div
      className={`flex flex-col items-center justify-center animate-fade-in ${
        fullScreen ? "fixed inset-0 z-[99999] overflow-hidden" : "relative py-12 px-6 w-full rounded-2xl"
      }`}
      style={{
        position: fullScreen ? "fixed" : "relative",
        top: fullScreen ? 0 : "auto",
        left: fullScreen ? 0 : "auto",
        width: fullScreen ? "100vw" : "100%",
        height: fullScreen ? "100vh" : "auto",
        zIndex: fullScreen ? 99999 : "auto",
        background: fullScreen
          ? "radial-gradient(circle at center, #0a1223 0%, #0d0c0c 100%)"
          : "rgba(10, 18, 35, 0.4)",
        backdropFilter: fullScreen ? "none" : "blur(8px)",
        WebkitBackdropFilter: fullScreen ? "none" : "blur(8px)",
        border: fullScreen ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      {/* Dynamic Ambient Background Glows */}
      {fullScreen && (
        <>
          <div
            className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] pointer-events-none animate-pulse duration-[8000ms]"
            style={{
              background: "radial-gradient(circle at center, rgba(6, 182, 212, 0.08) 0%, transparent 65%)",
              willChange: "opacity",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] pointer-events-none animate-pulse duration-[12000ms]"
            style={{
              background: "radial-gradient(circle at center, rgba(168, 85, 247, 0.08) 0%, transparent 65%)",
              willChange: "opacity",
            }}
          />
        </>
      )}

      {/* Main Glass Card Loader */}
      <div className="flex flex-col items-center max-w-md w-full px-8 py-10 rounded-3xl text-center relative z-10">
        
        {/* Animated Premium SVG Icon */}
        <div className="relative mb-8 group animate-float" style={{ willChange: "transform" }}>
          <div
            className="absolute inset-0 scale-150 animate-pulse duration-[3000ms] pointer-events-none"
            style={{
              background: "radial-gradient(circle at center, rgba(6, 182, 212, 0.12) 0%, rgba(168, 85, 247, 0.12) 40%, transparent 70%)",
              willChange: "opacity",
            }}
          />
          
          <svg
            className="w-20 h-20 text-rose-400 relative z-10"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background static circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="6"
            />
            {/* Outer animated arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#loaderGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset="120"
              className="animate-spin-slow origin-center"
            />
            {/* Inner pulsating circle */}
            <circle
              cx="50"
              cy="50"
              r="22"
              fill="url(#innerGradient)"
              className="animate-pulse"
            />
            {/* Decorative orbits */}
            <path
              d="M50 15A35 35 0 0 1 85 50"
              stroke="#fe9a00"
              strokeWidth="2"
              strokeDasharray="4, 4"
              strokeLinecap="round"
            />
            <path
              d="M50 85A35 35 0 0 1 15 50"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeDasharray="4, 4"
              strokeLinecap="round"
            />

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="loaderGradient" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="var(--color-accent)" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#fe9a00" />
              </linearGradient>
              <linearGradient id="innerGradient" x1="28" y1="28" x2="72" y2="72">
                <stop offset="0%" stopColor="rgba(6, 182, 212, 0.3)" />
                <stop offset="100%" stopColor="rgba(168, 85, 247, 0.3)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Dynamic Titles */}
        <h3 className="text-2xl font-bold text-primary mb-2 tracking-tight">
          {message}
        </h3>
        <p className="text-secondary text-sm max-w-xs mx-auto mb-8 font-normal leading-relaxed">
          {subtitle}
        </p>

        {/* Steps Visualizer */}
        {steps.length > 0 && (
          <div className="w-full flex flex-col gap-3.5 bg-surface/40 p-5 rounded-2xl border border-border/50 text-left animate-fade-in-up">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              const isUpcoming = idx > currentStep;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 transition-opacity duration-300"
                  style={{
                    opacity: isUpcoming ? 0.35 : 1,
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : isActive
                        ? "bg-accent/20 text-accent border border-accent animate-pulse"
                        : "bg-surface text-secondary border border-border/50"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      isActive ? "text-accent font-medium" : isCompleted ? "text-primary/90" : "text-secondary/70"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return createPortal(content, document.body);
  }

  return content;
};

export default LoadingScreen;
