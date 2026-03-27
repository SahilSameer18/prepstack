import React, { useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaChevronDown,
  FaLightbulb,
  FaFileAlt,
  FaLink,
  FaCode,
  FaBriefcase,
  FaGraduationCap,
  FaUser,
} from "react-icons/fa";

const sections = [
  {
    icon: <FaUser />,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    title: "Contact Information",
    tips: [
      "Include your full name, email, phone, LinkedIn, and GitHub profile.",
      "Use a professional email (firstname.lastname@gmail.com).",
      "Only include your city/state, not your full home address.",
      "Make sure all links are active and point to the right profiles.",
    ],
    example: `Rahul Kumar
📧 rahul.kumar@gmail.com  |  📞 +91 98765 43210
🔗 linkedin.com/in/rahulkumar  |  github.com/rahulkumar
📍 Bangalore, Karnataka`,
  },
  {
    icon: <FaGraduationCap />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    title: "Education",
    tips: [
      "List your most recent degree first (reverse chronological).",
      "Include your GPA if it's 7.5+ (CGPA) or 3.5+ (4.0 scale).",
      "Mention relevant coursework like DSA, OS, DBMS, CN if applying for SDE roles.",
      "Include any academic achievements, scholarships, or honors.",
    ],
    example: `B.Tech in Computer Science Engineering
XYZ University, Bangalore                      2021 – 2025
CGPA: 8.6 / 10

Relevant Coursework: Data Structures & Algorithms, DBMS,
Operating Systems, Computer Networks, OOP`,
  },
  {
    icon: <FaCode />,
    color: "text-green-400",
    bg: "bg-green-500/10",
    title: "Technical Skills",
    tips: [
      "Group skills by category: Languages, Frameworks, Tools, Cloud, etc.",
      "Only list skills you are genuinely comfortable being asked about.",
      "Put most proficient skills first within each category.",
      "Don't include generic skills like MS Word or Google Docs.",
    ],
    example: `Languages:   Java, Python, JavaScript, C++
Frameworks:  React.js, Node.js, Express.js, Spring Boot
Databases:   MongoDB, MySQL, PostgreSQL
Tools:       Git, Docker, Postman, VS Code
Cloud:       AWS (EC2, S3), Firebase`,
  },
  {
    icon: <FaBriefcase />,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    title: "Experience / Internship",
    tips: [
      "Use the STAR format: Situation, Task, Action, Result — in one concise line.",
      "Always quantify impact: '...reducing load time by 40%' not '...improved performance'.",
      "Use strong action verbs: Engineered, Optimized, Designed, Led, Automated.",
      "List only relevant tech experience. Don't pad with unrelated work.",
    ],
    example: `Software Engineering Intern — ABC Technologies
June 2024 – August 2024  |  Hyderabad (Remote)

• Engineered a caching layer using Redis, reducing API response
  time by 42% for 10K+ daily active users.
• Refactored the authentication module to use JWT tokens,
  improving security and reducing login latency by 30%.
• Collaborated with 3 backend engineers in an Agile sprint cycle,
  delivering 2 features ahead of schedule.`,
  },
  {
    icon: <FaCode />,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    title: "Projects",
    tips: [
      "Include 2–3 strong projects. Quality over quantity.",
      "For each project: Title | Tech Stack | Link (GitHub/Live).",
      "Describe what each project does, what problem it solves, and your impact.",
      "Prefer projects that are deployed or have a live demo link.",
    ],
    example: `PrepNova — MERN Stack, Tailwind CSS, Gemini AI
  github.com/rahulkumar/prepnova  |  prepnova.vercel.app

• Built a full-stack interview prep platform for CSE students 
  with DSA sheets, core CS notes, and an AI project generator.
• Integrated Google Gemini API for AI-generated project ideas,
  handling 500+ API calls with custom rate limiting.
• Achieved 95 Lighthouse performance score through lazy loading
  and route-based code splitting.`,
  },
  {
    icon: <FaLink />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    title: "Achievements & Links",
    tips: [
      "Include any competitive programming rankings (LeetCode, Codeforces ratings).",
      "Add hackathon wins, open source contributions, or publications.",
      "Certifications from reputable platforms (AWS, Google, Coursera) are worth mentioning.",
      "A GitHub with green contribution graph speaks louder than a blank profile.",
    ],
    example: `• LeetCode: 1850 rating (Top 8%)  |  400+ problems solved
• Codeforces: Specialist (Div. 2)
• Winner — Smart India Hackathon 2024, Health Track
• AWS Certified Cloud Practitioner (2024)
• Open Source: 3 merged PRs in freeCodeCamp repository`,
  },
];

const dos = [
  "Keep your resume to 1 page if you are a fresher.",
  "Use a clean, ATS-friendly single-column or two-column layout.",
  "Use consistent, readable fonts like Calibri, Inter, or Arial (10–12pt).",
  "Have 3–4 bullet points per experience/project section.",
  "Tailor your resume for each job description.",
  "Export and share as a PDF to preserve formatting.",
];

const donts = [
  "Don't include a photo, age, gender, or religion.",
  "Don't use tables, text boxes, or complex graphics (ATS can't parse them).",
  "Don't use pronouns like 'I', 'my', or 'we' in bullet points.",
  "Don't list every technology you've ever touched.",
  "Don't use the same template as everyone else — make it stand out subtly.",
  "Don't submit a resume with typos or grammar errors.",
];

const SectionCard = ({ section }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-300 ${open ? "border-[#ffa116]" : "border-[#2a2a2a]"
        } bg-[#1a1a1a]`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center gap-4 text-left focus:outline-none"
      >
        <div className={`p-3 rounded-xl ${section.bg} ${section.color} text-lg flex-shrink-0`}>
          {section.icon}
        </div>
        <span className="text-lg font-semibold flex-1">{section.title}</span>
        <FaChevronDown
          className={`text-gray-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`transition-all duration-300 overflow-hidden ${open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-5 pb-5 border-t border-[#2a2a2a] pt-4 space-y-5">
          {/* Tips */}
          <ul className="space-y-2">
            {section.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                <FaCheckCircle className="text-[#ffa116] mt-1 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>

          {/* Example */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#ffa116] font-semibold mb-2">
              Example
            </p>
            <pre className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 text-gray-300 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
              {section.example}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const Resume = () => {
  return (
    <div className="px-6 pb-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Resume <span className="text-[#ffa116]">Guide</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl">
          A step-by-step guide to crafting an impressive, ATS-friendly resume that stands out for SDE roles.
        </p>
      </div>

      {/* Quick Tip Banner */}
      <div className="flex items-start gap-4 p-5 bg-[#ffa116]/5 border border-[#ffa116]/30 rounded-2xl mb-12">
        <FaLightbulb className="text-[#ffa116] text-2xl flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-white mb-1">The Golden Rule</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your resume is a <strong>marketing document</strong>, not a biography. Every line should answer:{" "}
            <em>"So what? What was the impact?"</em>. Quantify everything you can.
          </p>
        </div>
      </div>

      {/* Section-by-section guide */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold mb-2">
          Section-by-Section <span className="text-[#ffa116]">Breakdown</span>
        </h2>
        <p className="text-gray-500 text-sm mb-6">Click on any section to view tips and a real example.</p>
        <div className="space-y-4">
          {sections.map((s, i) => (
            <SectionCard key={i} section={s} />
          ))}
        </div>
      </div>

      {/* Do's and Don'ts */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold mb-6">
          The <span className="text-[#ffa116]">Do's</span> &amp; Don'ts
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-green-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <FaCheckCircle /> Do's
            </h3>
            <ul className="space-y-3">
              {dos.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                  <FaCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#1a1a1a] border border-red-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <FaTimesCircle /> Don'ts
            </h3>
            <ul className="space-y-3">
              {donts.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                  <FaTimesCircle className="text-red-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Resources */}
      <div className="p-8 bg-[#141414] rounded-3xl border border-[#2a2a2a] text-center">
        <FaFileAlt className="text-[#ffa116] text-3xl mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-3">
          Recommended <span className="text-[#ffa116]">Resume Tools</span>
        </h3>
        <p className="text-gray-400 max-w-lg mx-auto mb-6 text-sm">
          Use these tools to create a clean, professional, and ATS-friendly resume.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { name: "Overleaf (LaTeX)", url: "https://www.overleaf.com/gallery/tagged/cv" },
            { name: "Resume.io", url: "https://resume.io" },
            { name: "Jake's Template", url: "https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs" },
            { name: "Flowcv", url: "https://flowcv.io" },
          ].map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-gray-300 text-sm hover:bg-[#ffa116] hover:text-black font-medium transition"
            >
              {tool.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resume;