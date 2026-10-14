import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { FiGithub, FiLinkedin, FiInstagram, FiMail } from 'react-icons/fi';

const Footer = () => {
  const { user } = useAuth();

  const social = [
    { 
      icon: <FiGithub className="w-4 h-4" />, 
      url: "https://github.com/SahilSameer18", 
      label: "GitHub" 
    },
    { 
      icon: <FiLinkedin className="w-4 h-4" />, 
      url: "https://www.linkedin.com/in/sahil-sameer-siddique/", 
      label: "LinkedIn" 
    },
    { 
      icon: <FiInstagram className="w-4 h-4" />, 
      url: "https://instagram.com/yourprofile", 
      label: "Instagram" 
    },
    { 
      icon: <FiMail className="w-4 h-4" />, 
      url: "mailto:sahilsameer.dev18@gmail.com", 
      label: "Email" 
    },
  ];

  return (
    <footer className="mt-20 sm:mt-24 border-t border-white/[0.06] bg-background relative overflow-hidden w-full max-w-full">
      {/* Subtle ambient glow to match background theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[150px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr] gap-8 sm:gap-10 pb-10 border-b border-white/[0.05]">

          {/* Column 1: Brand & Social */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">

              <span className="text-base font-bold text-primary tracking-wide">
                Skill<span className="text-accent">Bridge</span>
              </span>
            </div>
            <p className="text-secondary text-sm leading-relaxed max-w-xs">
              Reimagining career preparation. Turn resume data and job requirements into structured strategy plans.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {social.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-secondary hover:text-accent hover:bg-accent/10 hover:border-accent/30 transition-all duration-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-primary mb-4 tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { name: "Home", url: "/" },
                { name: "Interview Engine", url: "/generate" },
                { name: "History & Reports", url: "/dashboard" }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.url} className="text-sm text-secondary hover:text-accent transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal & Contact */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-primary mb-4 tracking-wider uppercase">Legal</h4>
              <ul className="space-y-2">
                {[
                  { name: "Privacy Policy", url: "#" }, 
                  { name: "Terms of Use", url: "#" }
                ].map((l) => (
                  <li key={l.name}>
                    <a href={l.url} className="text-sm text-secondary hover:text-accent transition-colors duration-200">
                      {l.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-primary mb-2 tracking-wider uppercase">Contact</h4>
              <a 
                href="mailto:sahilsameer.dev18@gmail.com" 
                className="text-sm text-secondary hover:text-accent flex items-center gap-1.5 transition-colors duration-200"
              >
                <FiMail className="w-3.5 h-3.5" />
                sahilsameer.dev18@gmail.com
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <p className="text-secondary/80 text-xs font-mono">
            © {new Date().getFullYear()} SkillBridge AI. All rights reserved.
          </p>
          <p className="text-secondary/80 text-xs font-mono">Made by Sahil Sameer</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
