import { Link } from "react-router-dom";
import { FiCode, FiMail, FiGithub, FiLinkedin, FiInstagram, FiArrowRight } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

const Footer = () => {
  const resources = [
    { name: "DSA Sheets", url: "/dsa" },
    { name: "CS Notes", url: "/notes" },
    { name: "Roadmaps", url: "/roadmaps" },
    { name: "AI Projects", url: "/ai-projects" },
    { name: "Behavioral Prep", url: "/behavioral" },
    { name: "Resume Guide", url: "/resume" },
    { name: "Quiz", url: "/quiz" },
    { name: "Aptitude", url: "/aptitude" },
  ];

  const social = [
    { icon: <FiGithub />, url: "https://github.com/SahilSameer18", label: "GitHub" },
    { icon: <FiLinkedin />, url: "https://www.linkedin.com/in/sahil-sameer-siddique-abb849233/", label: "LinkedIn" },
    { icon: <FiInstagram />, url: "https://instagram.com/yourprofile", label: "Instagram" },
    { icon: <FiMail />, url: "mailto:sahilsameer.dev18@gmail.com", label: "Email" },
  ];

  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-[#0a0a0a]">

      {/* CTA Strip
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Ready to start your prep? 🚀</h3>
            <p className="text-gray-500 text-sm">Join thousands of students cracking interviews with PrepStack.</p>
          </div>
          <Link
            to="/register"
            className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-[#ffa116] to-[#ff8c00] text-black font-semibold px-6 py-3 rounded-xl hover:from-[#ffb84d] hover:to-[#ffa116] transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5"
          >
            Get Started Free <FiArrowRight />
          </Link>
        </div>
      </div> */}

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-10 pb-10 border-b border-white/[0.05]">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffa116] to-[#ff6b00] flex items-center justify-center shadow-md shadow-orange-500/20">
                <FiCode className="text-white text-sm" />
              </div>
              <span className="text-lg font-bold text-white">Prep<span className="text-[#ffa116]">Stack</span></span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              The ultimate interview prep platform for CSE students. DSA, CS fundamentals, roadmaps, and AI tools — all in one place.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2 mt-5">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {resources.map((r) => (
                <li key={r.name}>
                  <Link to={r.url} className="text-sm text-gray-500 hover:text-[#ffa116] transition-colors">
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                {[{ name: "Privacy Policy", url: "/privacy" }, { name: "Terms of Use", url: "/terms" }].map((l) => (
                  <li key={l.name}>
                    <a href={l.url} className="text-sm text-gray-500 hover:text-[#ffa116] transition-colors">{l.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contact</h4>
              <a href="mailto:sahilsameer.dev18@gmail.com" className="text-sm text-gray-500 hover:text-[#ffa116] flex items-center gap-1.5 transition-colors">
                <FiMail className="text-xs" /> sahilsameer.dev18@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          <p className="text-gray-600 text-xs flex items-center gap-1.5">
            Built for CSE students — © 2026 PrepStack. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs">Made by Sahil Sameer</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;