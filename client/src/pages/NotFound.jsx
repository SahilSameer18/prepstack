import React from "react";
import { Link } from "react-router-dom";
import {
  FaCode,
  FaHome,
  FaRocket,
  FaLaptopCode,
  FaServer,
  FaDatabase
} from "react-icons/fa";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-card text-center px-6 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-10 right-10 w-[200px] h-[200px] bg-violet-solid/10 blur-[90px] rounded-full -z-10" />
      <div className="absolute bottom-10 left-10 w-[200px] h-[200px] bg-info-solid/10 blur-[90px] rounded-full -z-10" />

      {/* Floating icons */}
      <FaLaptopCode className="absolute top-[20%] left-[10%] text-muted text-3xl animate-bounce opacity-30" />
      <FaServer className="absolute top-[70%] right-[15%] text-muted text-3xl animate-bounce delay-200 opacity-30" />
      <FaDatabase className="absolute bottom-[15%] left-[20%] text-muted text-3xl animate-bounce delay-500 opacity-30" />
      <FaRocket className="absolute top-[30%] right-[10%] text-brand text-4xl animate-bounce opacity-40" />

      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 mb-16 min-h-[44px] transition-transform hover:scale-105"
      >
        <span className="text-xl font-bold tracking-tight text-fg">
          Prep<span className="text-brand">Stack</span>
        </span>
      </Link>

      {/* Animated 404 */}
      <h1 className="text-[7rem] md:text-[10rem] font-black leading-none bg-gradient-to-r from-brand via-yellow to-orange-solid bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient select-none">
        404
      </h1>

      {/* Message */}
      <div className="-mt-6 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-fg mb-3">
          Page Not Found
        </h2>

        <p className="text-muted max-w-md mx-auto">
          Looks like you took a wrong turn. The page you're looking for
          doesn't exist or might have been moved.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/"
          className="flex items-center gap-2 bg-brand text-on-brand font-semibold px-6 py-3 rounded-xl hover:bg-brand-hover transition"
        >
          <FaHome /> Go Home
        </Link>

        <Link
          to="/dsa"
          className="px-6 py-3 rounded-xl border border-elevated bg-elevated text-fg-3 hover:border-brand/50 hover:text-fg transition"
        >
          Explore DSA Sheets
        </Link>
      </div>

      {/* Gradient Animation */}
      <style jsx>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          animation: gradientMove 6s ease infinite;
        }
      `}</style>

    </div>
  );
};

export default NotFound;