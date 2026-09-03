import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiShield, FiLock, FiDatabase, FiUserCheck, FiMail } from "react-icons/fi";

const PrivacyPolicy = () => {
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
          <FiShield /> Legal & Governance
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400">
          Last updated: March 2026 · Effective for all registered students and visitors
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-10 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">1.</span> Overview & Purpose
          </h2>
          <p>
            PrepStack (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates an engineered interview preparation platform designed to help engineering students and software developers prepare for technical rounds, DSA assessments, and behavioral interviews.
          </p>
          <p>
            We are committed to transparent, privacy-first data practices. We do not sell your personal data, run invasive third-party ad trackers, or share your practice history with recruiters without your explicit consent.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">2.</span> Information We Collect
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <FiUserCheck className="text-[#ffa116]" /> Account Details
              </div>
              <p className="text-xs text-gray-400">
                When registering, we collect your name, email address, and a securely salted bcrypt hash of your password. For Google OAuth users, we receive your verified email and public avatar.
              </p>
            </div>
            <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <FiDatabase className="text-cyan-400" /> Practice & Learning Progress
              </div>
              <p className="text-xs text-gray-400">
                We store your problem completion statuses, sheet progress across Striver/NeetCode tracks, quiz attempts, and saved AI project blueprints to synchronize your progress across devices.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">3.</span> How Your Data is Used
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-400">
            <li>To authenticate your sessions and manage secure token renewal.</li>
            <li>To persist and display your DSA problem progress and completion statistics.</li>
            <li>To power AI-driven project recommendations tailored to your selected tech stack via the Google Gemini API.</li>
            <li>To detect abuse, enforce rate limits, and protect user accounts from credential stuffing attacks.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">4.</span> Security Architecture
          </h2>
          <p>
            We implement defense-in-depth security standards across all layers:
          </p>
          <div className="bg-[#0b0b0b] border border-white/[0.06] rounded-xl p-4 space-y-2 text-xs font-mono text-gray-400">
            <div className="text-emerald-400 font-semibold">Security Highlights:</div>
            <div>• Passwords salted and hashed with bcrypt (10 rounds)</div>
            <div>• Refresh tokens hashed with SHA-256 and stored with family reuse detection</div>
            <div>• Authentication cookies served with HttpOnly, SameSite, and Secure flags</div>
            <div>• IP-based rate limiting on sensitive authentication and refresh endpoints</div>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">5.</span> Third-Party Service Providers
          </h2>
          <p>
            We rely on trusted third-party cloud infrastructure to deliver our services:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li><strong className="text-white">Google OAuth 2.0:</strong> Identity provider for single sign-on.</li>
            <li><strong className="text-white">Google Gemini API:</strong> Generative AI engine for portfolio architecture blueprints.</li>
            <li><strong className="text-white">MongoDB Atlas:</strong> Encrypted cloud database for progress storage.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">6.</span> Your Rights & Data Deletion
          </h2>
          <p>
            You have full ownership of your data. You may request a complete export of your saved problem history or ask for immediate, irreversible account deletion by contacting us at the email below.
          </p>
        </section>

        {/* Contact */}
        <section className="pt-6 border-t border-white/[0.08]">
          <h3 className="text-white font-semibold mb-2">Questions or Privacy Requests?</h3>
          <p className="text-gray-400 mb-3">
            If you have any questions about this policy or your account data, please reach out directly:
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

export default PrivacyPolicy;
