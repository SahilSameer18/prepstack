import React from "react";
import { Link } from "react-router-dom";
import {
  FaCode, FaBook, FaMap, FaLightbulb, FaArrowRight,
  FaUserTie, FaFileAlt, FaQuestionCircle, FaCalculator,
  FaStar, FaUsers, FaTrophy,
} from "react-icons/fa";
import { FiZap, FiTarget, FiCheck } from "react-icons/fi";
import about2 from "../assets/about2.png";
import Testimonial from "../components/homePage/Testimonial";
import FAQ from "../components/homePage/FAQ";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { user } = useAuth();
  const scrollToCards = () => {
    const section = document.getElementById("cards");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    { title: "DSA Sheets", desc: "Curated problem sheets from Love Babbar, Striver, and NeetCode.", icon: <FaCode className="text-2xl" />, link: "/dsa", color: "from-orange-500 to-yellow-500", bg: "bg-orange-500/10", textColor: "text-orange-400" },
    { title: "Core CS Notes", desc: "Easy-to-understand notes for OS, DBMS, OOPs, and Computer Networks.", icon: <FaBook className="text-2xl" />, link: "/notes", color: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10", textColor: "text-blue-400" },
    { title: "Roadmaps", desc: "Step-by-step learning paths for different tech stacks and developer roles.", icon: <FaMap className="text-2xl" />, link: "/roadmaps", color: "from-purple-500 to-pink-500", bg: "bg-purple-500/10", textColor: "text-purple-400" },
    { title: "AI Project Ideas", desc: "Generate unique project ideas tailored to your skills and tech stack.", icon: <FaLightbulb className="text-2xl" />, link: "/ai-projects", color: "from-green-500 to-emerald-500", bg: "bg-green-500/10", textColor: "text-green-400" },
    { title: "Behavioral Questions", desc: "Prepare for HR rounds with common behavioral interview questions.", icon: <FaUserTie className="text-2xl" />, link: "/behavioral", color: "from-pink-500 to-red-500", bg: "bg-pink-500/10", textColor: "text-pink-400" },
    { title: "Resume Guide", desc: "Learn how to craft a strong resume that stands out for SDE roles.", icon: <FaFileAlt className="text-2xl" />, link: "/resume", color: "from-indigo-500 to-purple-500", bg: "bg-indigo-500/10", textColor: "text-indigo-400" },
    { title: "Quiz", desc: "Test your knowledge with quick quizzes on DSA and core CS subjects.", icon: <FaQuestionCircle className="text-2xl" />, link: "/quiz", color: "from-yellow-500 to-orange-500", bg: "bg-yellow-500/10", textColor: "text-yellow-400" },
    { title: "Aptitude", desc: "Practice quantitative aptitude questions commonly asked in placements.", icon: <FaCalculator className="text-2xl" />, link: "/aptitude", color: "from-teal-500 to-green-500", bg: "bg-teal-500/10", textColor: "text-teal-400" },
  ];

  const stats = [
    { value: "1200+", label: "DSA Problems", icon: <FaCode /> },
    { value: "5+", label: "CS Subjects", icon: <FaBook /> },
    { value: "4+", label: "Curated Sheets", icon: <FaStar /> },
    { value: "Free", label: "Always Free", icon: <FaTrophy /> },
  ];

  const whyUs = [
    { icon: <FiTarget />, title: "Focused Prep", desc: "No more scattered resources. Everything you need, organized in one place." },
    { icon: <FiZap />, title: "AI-Powered", desc: "Gemini AI generates unique project ideas tailored to your stack and skill level." },
    { icon: <FiCheck />, title: "Structured Paths", desc: "Follow proven roadmaps from beginner to placement-ready developer." },
    { icon: <FaUsers />, title: "Community-Driven", desc: "Built by students, for students — covering real interview patterns." },
  ];

  return (
    <div className="px-6 pb-4 overflow-x-hidden">

      {/* ── Hero Section ── */}
      <section className="text-center pt-16 pb-16 relative">
        {/* Glow blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#ffa116]/8 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute top-20 right-[10%] w-[200px] h-[200px] bg-purple-600/5 blur-[80px] rounded-full -z-10 pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 bg-[#ffa116] rounded-full animate-pulse" />
          <span className="text-[#ffa116] text-xs font-semibold tracking-widest uppercase">Your Interview Prep Hub</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6">
          <span className="bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Stop Guessing What to Study,
          </span>
          <br />
          <span className="text-[#ffa116]">Follow a Proven Path</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          No more jumping between random resources.
          Get structured DSA sheets, core CS topics, and AI-powered project ideas — all in one place.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={scrollToCards}
            className="flex items-center gap-2 bg-gradient-to-r from-[#ffa116] to-[#ff8c00] text-black font-semibold px-8 py-3.5 rounded-xl hover:from-[#ffb84d] hover:to-[#ffa116] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            Start Preparing <FaArrowRight className="text-sm" />
          </button>

          {/* Only show Join Community if NOT logged in */}
          {!user && (
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.04] text-gray-300 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.2] transition-all duration-200 backdrop-blur-sm"
            >
              <FaUsers className="text-sm" /> Join Community
            </Link>
          )}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-[#ffa116] mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About Section ── */}
      <section className="mt-10 grid md:grid-cols-2 gap-12 items-center py-10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-4">
            <FiZap /> Why PrepStack?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-snug">
            Your Complete <span className="text-[#ffa116]">Coding Companion</span>
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            PrepStack is designed to guide you through every step of your software engineering journey. No more jumping between 10 different websites — DSA sheets, CS notes, roadmaps, and AI project ideas, all structured and ready for you.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {whyUs.map((item) => (
              <div key={item.title} className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
                <div className="text-[#ffa116] text-lg mb-2">{item.icon}</div>
                <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <img
            src={about2}
            alt="Learning illustration"
            className="w-full max-w-md rounded-2xl shadow-2xl shadow-black/40"
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="mt-20 mb-12 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-4">
            <FiZap /> Simple Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            How PrepStack <span className="text-emerald-400">Works</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-20 right-20 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

          {[
            { step: "01", title: "Choose Your Path", desc: "Select a roadmap tailored to frontend, backend, completely from scratch or advanced level." },
            { step: "02", title: "Learn & Practice", desc: "Go through curated notes, solve DSA sheets, and build top tier AI project ideas." },
            { step: "03", title: "Nail the Interview", desc: "Prepare with behavioral questions, refine your resume, and land that dream job." }
          ].map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#111] border border-white/[0.08] flex items-center justify-center text-3xl font-black text-emerald-500/50 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-[250px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="cards" className="mt-24 scroll-mt-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#ffa116] bg-[#ffa116]/10 border border-[#ffa116]/20 rounded-full px-3 py-1 mb-4">
            <FaStar /> Everything You Need
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            All Resources, <span className="text-[#ffa116]">One Platform</span>
          </h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm">
            Carefully organized so you always know what to study next.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Link
              key={i}
              to={f.link}
              className="group bg-[#111] border border-white/[0.06] hover:border-white/[0.15] rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 blur-2xl transition-all duration-500`} />

              <div className={`inline-flex p-2.5 rounded-xl ${f.bg} ${f.textColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {f.icon}
              </div>

              <h3 className="text-base font-bold mb-2 text-white group-hover:text-[#ffa116] transition-colors">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">{f.desc}</p>

              <div className="flex items-center gap-1 text-xs font-semibold text-[#ffa116] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Explore <FaArrowRight className="text-[10px]" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Testimonials & FAQ ── */}
      <Testimonial />
      <FAQ />
    </div>
  );
};

export default Home;