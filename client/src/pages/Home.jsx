import React from "react";
import { Link } from "react-router-dom";
import {
  FaCode,
  FaBook,
  FaMap,
  FaLightbulb,
  FaArrowRight,
  FaUserTie,
  FaFileAlt,
  FaQuestionCircle,
  FaCalculator,
} from "react-icons/fa";
import about2 from "../assets/about2.png";
import Testimonial from "../components/homePage/Testimonial";
import FAQ from "../components/homePage/FAQ";

const Home = () => {
  const scrollToCards = () => {
    const section = document.getElementById("cards");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      title: "DSA Sheets",
      desc: "Curated problem sheets from Love Babbar, Striver, and other top resources.",
      icon: <FaCode className="text-2xl" />,
      link: "/dsa",
      color: "from-orange-500 to-yellow-500",
    },
    {
      title: "Core CS Notes",
      desc: "Easy-to-understand notes for OS, DBMS, OOPs, and Computer Networks.",
      icon: <FaBook className="text-2xl" />,
      link: "/notes",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Roadmaps",
      desc: "Step-by-step learning paths for different tech stacks and developer roles.",
      icon: <FaMap className="text-2xl" />,
      link: "/roadmaps",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "AI Project Ideas",
      desc: "Generate unique project ideas tailored to your skills and tech stack.",
      icon: <FaLightbulb className="text-2xl" />,
      link: "/ai-projects",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Behavioral Questions",
      desc: "Prepare for HR rounds with common behavioral interview questions.",
      icon: <FaUserTie className="text-2xl" />,
      link: "/behavioral",
      color: "from-pink-500 to-red-500",
    },
    {
      title: "Resume Guide",
      desc: "Learn how to craft a strong resume that stands out for SDE roles.",
      icon: <FaFileAlt className="text-2xl" />,
      link: "/resume",
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Quiz",
      desc: "Test your knowledge with quick quizzes on DSA and core CS subjects.",
      icon: <FaQuestionCircle className="text-2xl" />,
      link: "/quiz",
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Aptitude",
      desc: "Practice quantitative aptitude questions commonly asked in placements.",
      icon: <FaCalculator className="text-2xl" />,
      link: "/aptitude",
      color: "from-teal-500 to-green-500",
    },
  ];

  return (
    <div className="px-6 pb-4">
      {/* Hero Section */}
      <section className="text-center py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ffa116]/10 blur-[120px] rounded-full -z-10"></div>

        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6">
          Master Your Tech <span className="text-[#ffa116]">Journey</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Everything you need to crack interviews and excel in software
          engineering. From DSA to System Design, we've got you covered.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={scrollToCards}
            className="btn-primary flex items-center gap-2 text-lg px-8 py-3"
          >
            Start Preparing <FaArrowRight />
          </button>

          <Link
            to="/login"
            className="px-8 py-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a] transition"
          >
            Join Community
          </Link>
        </div>
      </section>

      {/* Intro Section */}
      <section className="mt-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Complete{" "}
            <span className="text-[#ffa116]">Coding Companion</span>
          </h2>

          <p className="text-gray-400 mb-6 leading-relaxed">
            This platform is designed to guide you through every step of your
            software engineering journey. Practice DSA with curated sheets,
            understand core computer science subjects, follow structured
            roadmaps, and even generate unique AI project ideas.
          </p>

          <p className="text-gray-400 mb-8 leading-relaxed">
            Whether you're preparing for internships, placements, or simply
            improving your skills, everything you need is organized in one
            place.
          </p>
        </div>

        {/* Image */}
        <div className="flex justify-center">
          <img
            src={about2}
            alt="Learning illustration"
            className="w-full max-w-md rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Features / Services Section */}
      <section id="cards" className="mt-16 scroll-mt-22">
        {/* Section Title */}
        <h2 className="text-center text-[#ffa116] text-3xl md:text-4xl font-bold mb-10">
          Services
        </h2>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Link
              key={i}
              to={f.link}
              className="card group hover:border-[#ffa116]/50 transition duration-300 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 blur-2xl transition duration-500`}
              ></div>

              <div className="p-2 bg-[#2a2a2a] rounded-lg w-fit mb-4 group-hover:bg-[#ffa116]/20 group-hover:text-[#ffa116] transition">
                {f.icon}
              </div>

              <h3 className="text-xl font-bold mb-2">{f.title}</h3>

              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {f.desc}
              </p>

              <div className="text-sm font-medium text-[#ffa116] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Explore Now <FaArrowRight className="text-xs" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About Platform Section */}
      <section className="mt-32 p-10 bg-[#141414] rounded-3xl border border-[#2a2a2a]">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Why This <span className="text-[#ffa116]">Platform Exists</span>
        </h2>

        <p className="text-gray-400 text-lg leading-relaxed max-w-4xl mx-auto text-center mb-10">
          Preparing for software engineering interviews can be overwhelming
          because there are countless resources available online. Students often
          struggle to decide what to study, where to start, and which materials
          actually matter. This platform solves that problem by providing
          structured and curated resources specifically designed for Computer
          Science students to help them prepare efficiently and confidently for
          technical interviews.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <h3 className="text-xl font-semibold text-[#ffa116] mb-3">
              Curated DSA Sheets
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Access the most popular and effective DSA sheets including Love
              Babbar 450, Striver A2Z Sheet, NeetCode 150, and Blind 75. These
              sheets contain essential problems with direct links to help
              students practice in a structured way.
            </p>
          </div>

          <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <h3 className="text-xl font-semibold text-[#ffa116] mb-3">
              Core CS Interview Notes
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Well-organized notes covering key Computer Science subjects such
              as Operating Systems, DBMS, OOPs, Computer Networks, and basic
              System Design concepts that are frequently asked in interviews.
            </p>
          </div>

          <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <h3 className="text-xl font-semibold text-[#ffa116] mb-3">
              AI Project Idea Generator
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Using the AI, students can generate unique project
              ideas by selecting their preferred tech stack and other options
              through interactive dropdown menus.
            </p>
          </div>

          <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <h3 className="text-xl font-semibold text-[#ffa116] mb-3">
              Structured Learning Roadmaps
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Explore domain-specific roadmaps such as Web Development, AI/ML,
              and Backend Development, along with year-wise roadmaps to guide
              students throughout their college journey.
            </p>
          </div>

          <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <h3 className="text-xl font-semibold text-[#ffa116] mb-3">
              Focused Interview Preparation
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The goal of this platform is to remove confusion caused by
              excessive resources and instead provide a focused, structured path
              that helps students prepare effectively for internships and
              software engineering interviews.
            </p>
          </div>

          <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
            <h3 className="text-xl font-semibold text-[#ffa116] mb-3">
              Simplifying Interview Preparation
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Many students feel overwhelmed by the number of resources available online.
              This platform simplifies the preparation process by organizing the most
              important materials and learning paths so students can focus on what truly
              matters for technical interviews.
            </p>
          </div>
        </div>
      </section>

      <Testimonial />
      <FAQ />
    </div>
  );
};

export default Home;
