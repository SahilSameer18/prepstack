import { Link } from "react-router-dom";
import { FiMail, FiGithub, FiLinkedin, FiInstagram, FiTerminal } from "react-icons/fi";

const Footer = () => {
  const resources = [
    { name: "DSA Sheets", url: "/dsa" },
    { name: "CS Notes", url: "/notes" },
    { name: "Roadmaps", url: "/roadmaps" },
    { name: "AI Projects", url: "/ai-projects" },
    { name: "Behavioral Prep", url: "/behavioral" },
    { name: "Resume Guide", url: "/resume" },
    { name: "Quiz Practice", url: "/quiz" },
    { name: "Aptitude Tests", url: "/aptitude" },
  ];

  const social = [
    { icon: <FiGithub className="text-base" />, url: "https://github.com/SahilSameer18", label: "GitHub" },
    { icon: <FiLinkedin className="text-base" />, url: "https://www.linkedin.com/in/sahil-sameer-siddique/", label: "LinkedIn" },
    { icon: <FiInstagram className="text-base" />, url: "https://instagram.com/yourprofile", label: "Instagram" },
    { icon: <FiMail className="text-base" />, url: "mailto:sahilsameer.dev18@gmail.com", label: "Email" },
  ];

  return (
    <footer className="mt-24 border-t border-white/[0.08] bg-[#060608]">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-[1.2fr_1fr_auto] gap-10 pb-12 border-b border-white/[0.06]">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-display text-xl font-bold tracking-tight text-white group-hover:opacity-90 transition-opacity">
                Prep<span className="text-[#ffa116]">Stack</span>
              </span>
            </Link>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm font-sans">
              The high-signal preparation workspace for software engineers. Curated DSA pattern progressions, low-level systems internals, and production architectural blueprints.
            </p>

            {/* Social icons with 44px touch targets */}
            <div className="flex items-center gap-2.5 pt-2">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.18] transition-all cursor-pointer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-display text-xs uppercase tracking-widest text-zinc-300 font-bold mb-4">
              Curriculum & Tools
            </h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {resources.map((r) => (
                <li key={r.name}>
                  <Link
                    to={r.url}
                    className="text-sm text-zinc-400 hover:text-[#ffa116] transition-colors py-1 inline-block"
                  >
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Status Column */}
          <div className="space-y-6">
            <div>
              <h4 className="font-display text-xs uppercase tracking-widest text-zinc-300 font-bold mb-4">
                Governance
              </h4>
              <ul className="space-y-2.5">
                {[
                  { name: "Privacy Policy", url: "/privacy" },
                  { name: "Terms of Service", url: "/terms" },
                ].map((l) => (
                  <li key={l.name}>
                    <Link
                      to={l.url}
                      className="text-sm text-zinc-400 hover:text-[#ffa116] transition-colors py-1 inline-block"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live Telemetry Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.07] font-mono text-[11px] text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Platform Status: Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-zinc-500 font-sans">
          <p className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} PrepStack Platform. All rights reserved.</span>
          </p>
          <p className="font-mono text-[11px] text-zinc-500">
            Engineered by Sahil Sameer
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;