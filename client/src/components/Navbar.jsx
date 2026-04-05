import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import {
  FiCode, FiMap, FiCpu, FiBook, FiMessageSquare, FiFileText,
  FiHelpCircle, FiActivity, FiArrowRight, FiZap, FiLogOut, FiGrid
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { InlineSpinner } from "../components/ui/Skeletons";

const Navbar = () => {

  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef();
  const userRef = useRef();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, handleLogout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) setExploreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const mainLinks = [
    { name: "DSA Sheets", path: "/dsa", icon: <FiCode /> },
    { name: "Roadmaps", path: "/roadmaps", icon: <FiMap /> },
    { name: "AI Projects", path: "/ai-projects", icon: <FiCpu /> },
  ];

  const exploreLinks = [
    { name: "CS Notes", path: "/notes", icon: <FiBook />, desc: "OS, DBMS, Networks & OOPs" },
    { name: "Behavioral Prep", path: "/behavioral", icon: <FiMessageSquare />, desc: "HR & soft skills questions" },
    { name: "Resume Guide", path: "/resume", icon: <FiFileText />, desc: "Build an ATS-ready resume" },
    { name: "Quiz", path: "/quiz", icon: <FiHelpCircle />, desc: "Test your knowledge" },
    { name: "Aptitude", path: "/aptitude", icon: <FiActivity />, desc: "Placement aptitude prep" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.05)]' : 'bg-[#0a0a0a]/80 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center justify-between h-[62px]">

          {/* ── Logo (text only) ── */}
          <NavLink to="/" className="flex items-center group">
            <span className="text-xl font-bold tracking-tight text-white group-hover:opacity-90 transition-opacity">
              Prep<span className="text-[#ffa116]">Stack</span>
            </span>
          </NavLink>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "text-[#ffa116] bg-[#ffa116]/10" : "text-gray-400 hover:text-white hover:bg-white/[0.06]"}`
                }
              >
                <span className="text-base">{link.icon}</span>
                {link.name}
              </NavLink>
            ))}

            {/* Explore Dropdown */}
            <div className="relative" ref={exploreRef}>
              <button
                onClick={() => setExploreOpen(!exploreOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${exploreOpen ? "text-white bg-white/[0.06]" : "text-gray-400 hover:text-white hover:bg-white/[0.06]"}`}
              >
                Explore
                <motion.span animate={{ rotate: exploreOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FaChevronDown className="text-[10px]" />
                </motion.span>
              </button>

              <AnimatePresence>
                {exploreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-72 bg-[#111] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">More Resources</p>
                    </div>
                    <div className="p-2">
                      {exploreLinks.map((link) => (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          onClick={() => setExploreOpen(false)}
                          className={({ isActive }) =>
                            `flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${isActive ? "bg-[#ffa116]/10" : "hover:bg-white/[0.04]"}`
                          }
                        >
                          <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center text-gray-400 group-hover:text-[#ffa116] group-hover:bg-[#ffa116]/10 transition-all flex-shrink-0 mt-0.5">
                            {link.icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{link.name}</div>
                            <div className="text-xs text-gray-500">{link.desc}</div>
                          </div>
                        </NavLink>
                      ))}
                    </div>
                    <div className="m-2 mt-0 bg-gradient-to-r from-[#ffa116]/10 to-orange-600/5 border border-[#ffa116]/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <FiZap className="text-[#ffa116] text-sm flex-shrink-0" />
                      <p className="text-xs text-gray-300">Try the <span className="text-[#ffa116] font-semibold">AI Project Generator</span></p>
                      <FiArrowRight className="text-[#ffa116] text-xs ml-auto flex-shrink-0" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-gray-300 hover:bg-white/[0.08] transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-[#ffa116] flex items-center justify-center">
                    <span className="text-black text-xs font-bold">{user.username?.[0]?.toUpperCase() || "U"}</span>
                  </div>
                  {user.username}
                  <FaChevronDown className="text-[10px]" />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[calc(100%+8px)] w-44 bg-[#111] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-white/[0.06]">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user.username}</p>
                      </div>
                      <Link
                        to="/project-dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/[0.04] transition-colors"
                      >
                        <FiGrid className="text-xs" /> Saved Projects
                      </Link>
                      <button
                        onClick={logout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? (
                          <>
                            <InlineSpinner size={16} color="#f87171" />
                            <span>Signing out...</span>
                          </>
                        ) : (
                          <>
                            <FiLogOut /> Sign out
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-black bg-gradient-to-r from-[#ffa116] to-[#ff8c00] hover:from-[#ffb84d] hover:to-[#ffa116] shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started <FiArrowRight className="text-xs" />
              </NavLink>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <FaTimes />
                </motion.span>
              ) : (
                <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <FaBars />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-[#0d0d0d] border-t border-white/[0.05]"
          >
            <div className="px-5 py-4 space-y-1">
              {[...mainLinks, ...exploreLinks].map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "text-[#ffa116] bg-[#ffa116]/10" : "text-gray-300 hover:text-white hover:bg-white/[0.04]"}`
                  }
                >
                  <span className="text-base text-gray-500">{link.icon}</span>
                  {link.name}
                </NavLink>
              ))}
              <div className="pt-3 pb-1 border-t border-white/[0.05] mt-2">
                {user ? (
                  <div className="space-y-2">
                    <Link
                      to="/project-dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                      <FiGrid className="text-base text-gray-500" />
                      Saved Projects
                    </Link>
                    <button
                      onClick={() => { if(!isLoggingOut) logout(); setMobileOpen(false); }}
                      disabled={isLoggingOut}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <>
                          <InlineSpinner size={16} color="#f87171" />
                          <span>Signing out...</span>
                        </>
                      ) : (
                        <>
                          <FiLogOut /> Sign out
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-black bg-gradient-to-r from-[#ffa116] to-[#ff8c00]"
                  >
                    Get Started Free <FiArrowRight />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};


export default Navbar;