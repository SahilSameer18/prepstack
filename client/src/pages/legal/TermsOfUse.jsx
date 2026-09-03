import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiAlertCircle, FiCheckSquare, FiMail } from "react-icons/fi";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen text-gray-300 py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Back navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-[#ffa116] transition-colors mb-8"
      >
        <FiArrowLeft /> Back to PrepStack
      </Link>

      {/* Header */}
      <div className="border-b border-white/[0.08] pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/20 text-[#ffa116] text-xs font-mono mb-4">
          <FiFileText /> Agreement
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Terms of Use
        </h1>
        <p className="text-sm text-gray-400">
          Last updated: March 2026 · Governing all access and usage of PrepStack
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">1.</span> Acceptance of Terms
          </h2>
          <p>
            By accessing or creating an account on PrepStack, you agree to comply with and be bound by these Terms of Use. If you do not agree with any part of these terms, you may not use the platform.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">2.</span> Educational Mission & License
          </h2>
          <p>
            PrepStack is provided as a 100% free educational platform created to democratize interview preparation for software engineering candidates. You are granted a personal, non-exclusive, non-transferable license to access our curated roadmaps, CS cheat-sheets, and interactive problem trackers for personal learning purposes.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">3.</span> Intellectual Property & Third-Party Content
          </h2>
          <p>
            DSA problem descriptions, problem titles, and external links are curated from publicly recognized problem sets (such as LeetCode, Striver A2Z, NeetCode 150, and Love Babbar 450). Original copyrights and trademarks for those respective problems remain the property of their original creators and platforms.
          </p>
          <p>
            PrepStack provides structured pattern organization, progress persistence, and synthesized educational notes designed for interview recall.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">4.</span> Acceptable Use & Account Integrity
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li>Deploy automated bots, scrapers, or spiders against PrepStack APIs.</li>
            <li>Attempt to bypass rate limiting, authentication safeguards, or DDoS protections.</li>
            <li>Share access tokens or compromise the security of other students accounts.</li>
            <li>Use the AI generation endpoints to produce malicious, fraudulent, or harmful code.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">5.</span> Disclaimer of Placement Guarantee
          </h2>
          <p>
            While PrepStack is engineered to provide top-tier preparation material modeled after FAANG and top product company placement interviews, we do not guarantee specific employment offers or placement results. Final outcomes depend on candidate preparation, interview performance, and company hiring discretion.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">6.</span> Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that engage in platform abuse, API flooding, or security breaches without prior notice.
          </p>
        </section>

        {/* Contact */}
        <section className="pt-6 border-t border-white/[0.08]">
          <h3 className="text-white font-semibold mb-2">Inquiries Regarding Terms</h3>
          <p className="text-gray-400 mb-3">
            For questions or enterprise usage inquiries, contact the creator:
          </p>
          <a
            href="mailto:sahilsameer.dev18@gmail.com"
            className="inline-flex items-center gap-2 text-sm text-[#ffa116] hover:underline"
          >
            <FiMail /> sahilsameer.dev18@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
};

export default TermsOfUse;
