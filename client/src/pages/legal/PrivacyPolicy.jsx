import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiShield, FiLock, FiDatabase, FiUserCheck, FiMail } from "react-icons/fi";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen text-gray-300 py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Back navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 min-h-[44px] text-xs font-ui text-gray-400 hover:text-[#ffa116] transition-colors mb-4"
      >
        <FiArrowLeft /> Back to PrepStack
      </Link>

      {/* Header */}
      <div className="border-b border-white/[0.08] pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/20 text-[#ffa116] text-xs font-ui mb-4">
          <FiShield /> Legal & Governance
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400">
          Last updated: November 2026 · Effective for all registered students and visitors
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
            We are committed to transparent, privacy-first data practices. We do not sell your personal data, run advertising or analytics trackers, or share your practice history with recruiters without your explicit consent.
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
                When registering, we collect your username, email address, and a securely salted bcrypt hash (12 rounds) of your password. If you sign in with Google, we receive your verified email, your Google account ID and your profile picture link. Your avatar is stored as an image link (an auto-generated avatar by default).
              </p>
            </div>
            <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <FiDatabase className="text-cyan-400" /> Practice & Learning Progress
              </div>
              <p className="text-xs text-gray-400">
                We store which DSA problems you have marked as solved on each sheet, and the AI project ideas generated for you (title, description, features, tech stack, difficulty, time estimate and the domain you chose), so your progress is available on all your devices.
              </p>
            </div>
            <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4 space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <FiShield className="text-emerald-400" /> Devices & active sessions
              </div>
              <p className="text-xs text-gray-400">
                To protect against unauthorized access and power your Active Devices & Sessions Manager, we record your browser name, operating system and device type (taken from your User-Agent), your IP address and the time of last activity alongside a hashed session token. This is used for authentication security and account fraud prevention. A session record is kept until you sign out, revoke that device, or it expires (7 days after its last renewal).
              </p>
            </div>
            <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <FiLock className="text-purple-400" /> Notes Stored in Your Browser
              </div>
              <p className="text-xs text-gray-400">
                The approach notes you write on DSA problems (pattern, complexity, free text) are saved only in your own browser. They are never sent to our servers, so we cannot see or recover them.
              </p>
            </div>
            <div className="bg-[#111] border border-white/[0.08] rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <FiDatabase className="text-amber-400" /> Server Logs
              </div>
              <p className="text-xs text-gray-400">
                Our server writes a short log line for each request: the method, the page address without any query string, the status code and how long it took. Request bodies, passwords and tokens are not logged. Our hosting providers may also keep standard connection logs, which include IP addresses.
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
            <li>To authenticate your sessions and manage secure token renewal across up to 10 concurrent devices.</li>
            <li>To persist and display your DSA problem progress and completion statistics.</li>
            <li>To generate AI project ideas: the options you enter on the AI Projects page (tech stack, complexity, domain and any extra notes) are sent to Google's Gemini API and, if Gemini is busy or unavailable, to Groq's API. Please do not put personal information in the extra notes.</li>
            <li>To detect abuse, enforce rate limits, and protect user accounts from credential stuffing attacks.</li>
            <li>To operate and debug the service using the request logs described above.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">4.</span> Cookies & Browser Storage
          </h2>
          <p>
            We use only the cookies needed to keep you signed in. We do not use advertising or analytics cookies.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li><strong className="text-white">Access cookie:</strong> proves who you are for 15 minutes at a time.</li>
            <li><strong className="text-white">Refresh cookie:</strong> renews your access for up to 7 days, and is replaced every time it is used.</li>
            <li>Both cookies are HttpOnly (page scripts cannot read them) and Secure.</li>
            <li><strong className="text-white">Browser storage:</strong> your approach notes (see above) are kept in your browser&apos;s local storage until you clear your browser data.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">5.</span> Security Architecture
          </h2>
          <p>
            We implement defense-in-depth security standards across all application layers:
          </p>
          <div className="bg-[#0b0b0b] border border-white/[0.06] rounded-xl p-4 space-y-2 text-xs font-ui text-gray-400">
            <div className="text-emerald-400 font-semibold">Security Highlights:</div>
            <div>• Passwords salted and hashed with bcrypt (12 rounds)</div>
            <div>• Refresh tokens cryptographically hashed with SHA-256 at rest (zero plaintext storage)</div>
            <div>• Short-lived access (15 minutes) and rotating refresh tokens (7 days)</div>
            <div>• Multi-device session isolation capped at 10 active devices with individual revocation</div>
            <div>• Authentication cookies served with HttpOnly, SameSite=None, and Secure flags</div>
            <div>• Granular IP-based rate limiting on sensitive login, refresh, and Google linking endpoints</div>
            <div>• Immediate revocation: signing out, removing a device, changing your password or deleting your account ends the affected sessions at once</div>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">6.</span> Third-Party Service Providers
          </h2>
          <p>
            We rely on trusted third-party services to deliver PrepStack:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400">
            <li><strong className="text-white">Google OAuth 2.0:</strong> Identity provider for single sign-on.</li>
            <li><strong className="text-white">Google Gemini API:</strong> Generative AI engine for project ideas. It receives the options you enter when you generate an idea.</li>
            <li><strong className="text-white">Groq API:</strong> Backup AI engine used only when Gemini is busy or unavailable. It receives the same options. We use the free plans of both AI services, and under their own terms they may use what is sent to them to improve their services, so please keep personal information out of the extra notes.</li>
            <li><strong className="text-white">MongoDB Atlas:</strong> Encrypted cloud database for accounts, progress and sessions.</li>
            <li><strong className="text-white">Our hosting providers:</strong> serve the website and the API and keep standard server logs.</li>
            <li><strong className="text-white">DiceBear (api.dicebear.com):</strong> generates the default avatar image. Your browser requests it directly, and the request contains your username as the image seed.</li>
            <li><strong className="text-white">Google Fonts:</strong> your browser loads page fonts from Google&apos;s font servers.</li>
          </ul>
          <p className="text-xs text-gray-400">
            Problem links on DSA sheets open third-party websites (such as LeetCode, GeeksforGeeks and takeUforward). Those sites have their own privacy practices.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-[#ffa116]">7.</span> Your Rights & Self-Service Account Erasure (GDPR Article 17)
          </h2>
          <p>
            You have full ownership of your data under GDPR Article 17 (Right to Erasure). You can permanently and irreversibly delete your account, solved DSA problem history, and generated projects at any moment directly from your <strong className="text-white">Profile &gt; Delete Account</strong> dashboard.
          </p>
          <p className="text-xs text-gray-400">
            Upon confirmation, our backend deletes your account record, solved-problem history, saved AI project ideas and all session records from our database in one operation, and clears your authentication cookies.
          </p>
          <p className="text-xs text-gray-400">
            Notes stored in your own browser are not removed by account deletion because we cannot access them. Clear your browser&apos;s site data to remove them.
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
            className="inline-flex items-center gap-2 min-h-[44px] text-sm text-[#ffa116] hover:underline"
          >
            <FiMail /> sahilsameer.dev18@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
