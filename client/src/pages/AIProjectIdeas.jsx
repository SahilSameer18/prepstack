import React from "react";
import { FaLightbulb, FaRobot, FaCogs, FaRocket } from "react-icons/fa";

const AIProjectIdeas = () => {
  return (
    <div className="px-6 pb-4">
      <div className="relative p-12 glass rounded-3xl border border-[#2a2a2a] overflow-hidden mb-12">
        <div className="absolute top-0 right-0 p-8 text-7xl text-[#ffa116]/10">
          <FaRobot />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          AI-Powered <span className="text-[#ffa116]">Project</span> Generator
        </h1>
        <p className="text-gray-400 max-w-xl text-lg mb-8">
          Stuck with "To-Do" apps? Use our Gemini-powered engine to generate
          unique, industry-relevant projects tailored to your tech stack.
        </p>
        
        <div className="flex flex-wrap gap-4 items-center">
            <select className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-6 py-3 text-gray-300 outline-none focus:border-[#ffa116]">
                <option>Select Tech Stack</option>
                <option>MERN Stack</option>
                <option>Python / Django</option>
                <option>React Native</option>
                <option>Next.js / Tailwind</option>
            </select>
            <select className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-6 py-3 text-gray-300 outline-none focus:border-[#ffa116]">
                <option>Complexity Level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
            </select>
            <button className="btn-primary flex items-center gap-2 px-8 py-3">
                Generate Idea <FaRocket className="text-sm" />
            </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card border-dashed border-[#2a2a2a] opacity-50 flex flex-col items-center justify-center py-20">
            <FaCogs className="text-4xl mb-4 text-gray-600" />
            <p className="text-gray-500">Your generated ideas will appear here.</p>
        </div>
        <div className="card space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <FaLightbulb className="text-[#ffa116]" /> Popular Tags
            </h3>
            <div className="flex flex-wrap gap-3">
                {["Open Source", "FinTech", "HealthTech", "Web3", "E-Commerce", "SaaS", "Portfolio", "Hackathon"].map(tag => (
                    <span key={tag} className="px-4 py-2 bg-[#2a2a2a] rounded-full text-xs text-gray-400 hover:text-[#ffa116] hover:bg-[#ffa116]/10 cursor-pointer transition">
                        #{tag}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIProjectIdeas;