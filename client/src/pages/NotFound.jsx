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
import Logo from "../components/layout/Logo";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-center px-6 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#ffa116]/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-10 right-10 w-[200px] h-[200px] bg-purple-500/10 blur-[90px] rounded-full -z-10" />
      <div className="absolute bottom-10 left-10 w-[200px] h-[200px] bg-blue-500/10 blur-[90px] rounded-full -z-10" />

      {/* Floating icons */}
      <FaLaptopCode className="absolute top-[20%] left-[10%] text-gray-600 text-3xl animate-bounce opacity-30" />
      <FaServer className="absolute top-[70%] right-[15%] text-gray-600 text-3xl animate-bounce delay-200 opacity-30" />
      <FaDatabase className="absolute bottom-[15%] left-[20%] text-gray-600 text-3xl animate-bounce delay-500 opacity-30" />
      <FaRocket className="absolute top-[30%] right-[10%] text-[#ffa116] text-4xl animate-bounce opacity-40" />

      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 mb-16 transition-transform hover:scale-105"
      >
        <Logo />
      </Link>

      {/* Animated 404 */}
      <h1 className="text-[7rem] md:text-[10rem] font-black leading-none bg-gradient-to-r from-[#ffa116] via-yellow-300 to-orange-500 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient select-none">
        404
      </h1>

      {/* Message */}
      <div className="-mt-6 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-400 max-w-md mx-auto">
          Looks like you took a wrong turn. The page you're looking for
          doesn't exist or might have been moved.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          to="/"
          className="flex items-center gap-2 bg-[#ffa116] text-black font-semibold px-6 py-3 rounded-xl hover:bg-[#ffb84d] transition"
        >
          <FaHome /> Go Home
        </Link>

        <Link
          to="/dsa"
          className="px-6 py-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] text-gray-300 hover:border-[#ffa116]/50 hover:text-white transition"
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