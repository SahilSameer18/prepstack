import React, { useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaChevronDown,
  FaFileAlt,
  FaLink,
  FaCode,
  FaBriefcase,
  FaGraduationCap,
  FaUser,
} from "react-icons/fa";
import { FiCheck, FiX, FiExternalLink, FiCompass } from "react-icons/fi";

const sections = [
  {
    icon: <FaUser />,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    title: "Contact Information",
    tips: [
      "Include your full name, professional email, phone number, LinkedIn, and GitHub profile.",
      "Use a professional handle (firstname.lastname@gmail.com).",
      "Only include your city/state or remote status, not your full street address.",
      "Verify that all hyperlinks are live, public, and redirect without redirects or 404s.",
    ],
    example: `Rahul Kumar
Email: rahul.kumar@gmail.com  |  Phone: +91 98765 43210
LinkedIn: linkedin.com/in/rahulkumar  |  GitHub: github.com/rahulkumar
Location: Bangalore, Karnataka`,
  },
  {
    icon: <FaGraduationCap />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    title: "Education",
    tips: [
      "List your highest degree first with expected graduation year (reverse chronological).",
      "Include your GPA if it is above 7.5 CGPA or 3.5 on a 4.0 scale.",
      "List relevant technical coursework: Data Structures, Operating Systems, DBMS, Networks.",
      "Include notable academic distinctions, scholarships, or rank achievements.",
    ],
    example: `B.Tech in Computer Science & Engineering
National Institute of Technology                      2021 - 2025
CGPA: 8.6 / 10.0

Coursework: Data Structures & Algorithms, Distributed Systems, Database Management, Computer Networks`,
  },
  {
    icon: <FaCode />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    title: "Technical Skills",
    tips: [
      "Categorize skills into Languages, Frameworks, Infrastructure/Databases, and Developer Tools.",
      "List only technologies you can confidently explain and write code in during live interviews.",
      "Order by proficiency: primary daily drivers first, secondary tools later.",
      "Omit generic software like Microsoft Office or basic command line usage.",
    ],
    example: `Languages:    Java, TypeScript, Python, Go, C++
Frameworks:   React, Next.js, Node.js, Express, Spring Boot
Databases:    PostgreSQL, Redis, MongoDB
Infrastructure: Docker, Kubernetes, AWS (EC2, S3), Git, CI/CD`,
  },
  {
    icon: <FaBriefcase />,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    title: "Work Experience & Internships",
    tips: [
      "Apply the Google XYZ Formula: 'Accomplished [X] as measured by [Y] by doing [Z]'.",
      "Quantify metrics: latency improvements, throughput, user scale, cost reductions.",
      "Lead every bullet with strong engineering verbs: Architected, Optimized, Profiled, Deployed.",
      "Avoid passive responsibility listings; emphasize what you personally engineered.",
    ],
    example: `Software Engineering Intern - Enterprise Systems
June 2024 - August 2024  |  Hyderabad (Remote)

• Engineered an asynchronous Redis caching layer, reducing p99 API response time by 42% for 15,000 daily active requests.
• Refactored the core authentication module to stateless JWT pairs with automatic token rotation, eliminating 30% login latency overhead.
• Collaborated with 4 senior engineers in bi-weekly sprints, delivering 2 core production features ahead of roadmap milestones.`,
  },
  {
    icon: <FaCode />,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    title: "Engineering Projects",
    tips: [
      "Include 2-3 substantial projects demonstrating production architecture over toy apps.",
      "Format each entry: Project Name | Tech Stack | Live Demo Link | Source Code Repository.",
      "Highlight distributed systems challenges: concurrency, caching, rate limiting, data sync.",
      "Ensure live deployment URLs and README documentation are fully functioning.",
    ],
    example: `Distributed Rate Limiter & Task Queue - Go, Redis, Docker, gRPC
Live Demo: ratelimit.dev  |  GitHub: github.com/user/distributed-limiter

• Architected a sliding-window counter rate limiter in Go benchmarked to sustain 45,000 req/sec with sub-2ms overhead.
• Implemented atomic Redis Lua scripts to eliminate race conditions across horizontal cluster nodes.
• Containerized the deployment with Docker Compose and instrumented Prometheus telemetry metrics.`,
  },
  {
    icon: <FaLink />,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    title: "Honors, Contests & Certifications",
    tips: [
      "Include competitive programming ratings (LeetCode, Codeforces, CodeChef).",
      "Highlight hackathon finishes, research papers, or open source pull requests.",
      "List vendor certifications (AWS Certified Solutions Architect, CKA, Google Cloud).",
      "Show evidence of sustained craft and problem solving.",
    ],
    example: `• LeetCode: 1920 Rating (Top 4%) | 500+ algorithmic problems solved
• Codeforces: Specialist (Max Rating 1485)
• Smart India Hackathon: 1st Place out of 400+ national teams (FinTech Track)
• AWS Certified Cloud Practitioner (Validation ID: AWS-849204)
• Open Source: 4 merged PRs in major developer tooling repositories`,
  },
];

const dos = [
  "Keep your resume strictly to 1 page if you have under 5 years of experience.",
  "Use a single-column, ATS-parseable layout with clear section headers.",
  "Standardize typography with modern, neutral fonts (Inter, Roboto, Arial) at 10-11pt.",
  "Include 3-4 bullet points per role, focusing exclusively on impact and tech stack.",
  "Tailor keywords directly from the target job specification.",
  "Export and distribute as a vector-rendered PDF to guarantee layout preservation.",
];

const donts = [
  "Do not include personal photos, age, marital status, or full street addresses.",
  "Avoid multi-column tables, skill rating progress bars, or graphic icon charts.",
  "Never use first-person pronouns ('I', 'we', 'my') in bullet points.",
  "Do not list tools you cannot write code in or explain under technical pressure.",
  "Never submit with unverified grammar, broken hyperlinks, or formatting misalignments.",
];

const SectionCard = ({ section }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`luxury-card rounded-2xl overflow-hidden transition-all duration-300 ${
        open ? "border-[#ffa116]/50 shadow-[0_15px_35px_rgba(0,0,0,0.8)]" : ""
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center gap-4 text-left focus:outline-none cursor-pointer"
      >
        <div className={`p-3 rounded-xl ${section.bg} ${section.color} text-base flex-shrink-0`}>
          {section.icon}
        </div>
        <span className="font-display text-base sm:text-lg font-bold text-white flex-1">{section.title}</span>
        <FaChevronDown
          className={`text-zinc-500 transition-transform duration-300 ${open ? "rotate-180 text-[#ffa116]" : ""}`}
        />
      </button>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-6 border-t border-white/[0.08] pt-5 space-y-5">
          {/* Tips */}
          <ul className="space-y-2.5">
            {section.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-zinc-300 text-sm">
                <FiCheck className="text-[#ffa116] mt-1 flex-shrink-0 text-xs" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          {/* Example */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#ffa116] font-semibold mb-2">
              Verified Production Example
            </p>
            <pre className="bg-black/60 border border-white/[0.08] rounded-xl p-4 text-zinc-300 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono selection:bg-[#ffa116]/30">
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
    <div className="px-4 sm:px-6 pb-12 max-w-5xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-10 pt-2">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-[-0.035em] mb-3">
          SDE Resume Architecture
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl font-normal leading-relaxed">
          The tactical blueprint for building an ATS-optimized, high-signal engineering resume designed to clear FAANG and tier-1 screening rounds.
        </p>
      </div>

      {/* Engineering Rule Callout */}
      <div className="luxury-glass p-5 rounded-2xl mb-12 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-[#ffa116]/10 border border-[#ffa116]/20 flex items-center justify-center text-[#ffa116] flex-shrink-0 mt-0.5">
          <FiCompass className="text-base" />
        </div>
        <div>
          <h3 className="font-display text-sm sm:text-base font-bold text-white mb-1">
            The Core Engineering Principle
          </h3>
          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
            Your resume is an <strong>engineering specification</strong>, not an autobiography. Every bullet point must demonstrate personal technical agency, measurable business impact, and zero fluff.
          </p>
        </div>
      </div>

      {/* Section-by-section guide */}
      <div className="mb-14">
        <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-1">
          Curated Section Blueprint
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mb-6">
          Inspect each section's structural rules and verified high-signal examples.
        </p>
        <div className="space-y-4">
          {sections.map((s, i) => (
            <SectionCard key={i} section={s} />
          ))}
        </div>
      </div>

      {/* Do's and Don'ts */}
      <div className="mb-14">
        <h2 className="font-display text-2xl font-bold text-white tracking-tight mb-6">
          Evaluation Criteria & Standards
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="luxury-card rounded-2xl p-6 border-emerald-500/20">
            <h3 className="font-display text-base font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <FiCheck className="text-emerald-400 text-sm" /> High-Signal Standards
            </h3>
            <ul className="space-y-3">
              {dos.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  <FiCheck className="text-emerald-400 flex-shrink-0 mt-1 text-xs" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="luxury-card rounded-2xl p-6 border-rose-500/20">
            <h3 className="font-display text-base font-bold text-rose-400 mb-4 flex items-center gap-2">
              <FiX className="text-rose-400 text-sm" /> Disqualifying Anti-Patterns
            </h3>
            <ul className="space-y-3">
              {donts.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  <FiX className="text-rose-400 flex-shrink-0 mt-1 text-xs" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Verified Tooling Resources */}
      <div className="luxury-glass p-7 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="max-w-xl mx-auto text-center mb-8">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
            Recommended Authoring Tools
          </h3>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Professional LaTeX editors and verified ATS parsers to validate layout parsing.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[
            { name: "Overleaf (LaTeX Templates)", desc: "De-facto industry standard for clean single-page formatting", url: "https://www.overleaf.com/gallery/tagged/cv" },
            { name: "FlowCV Engine", desc: "Clean ATS-compliant typography generator with zero layout bloat", url: "https://flowcv.io" },
          ].map((tool) => (
            <a
              key={tool.name}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-[#ffa116]/50 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-sm font-bold text-white group-hover:text-[#ffa116] transition-colors">
                  {tool.name}
                </span>
                <FiExternalLink className="text-xs text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{tool.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resume;