import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./layout/Logo";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef();

  const navLinks = [
    { name: "DSA Sheets", path: "/dsa" },
    { name: "Roadmaps", path: "/roadmaps" },
    { name: "AI Projects", path: "/ai-projects" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.96 },
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#1a1a1a]/70 border-b border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 group transition-transform hover:scale-105"
          >
            <Logo />
          </NavLink>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-gray-300">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `transition hover:text-[#ffa116] ${isActive ? "text-[#ffa116]" : ""}`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Explore Dropdown */}
            <div className="relative" ref={exploreRef}>
              <div
                className="flex items-center gap-1 cursor-pointer hover:text-[#ffa116]"
                onClick={() => setExploreOpen(!exploreOpen)}
              >
                Explore <FaChevronDown className="text-xs" />
              </div>

              <AnimatePresence>
                {exploreOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="absolute top-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md shadow-lg w-44 flex flex-col py-2"
                  >
                    <NavLink
                      to="/notes"
                      className="px-4 py-2 hover:bg-[#2a2a2a]"
                      onClick={() => setExploreOpen(false)}
                    >
                      Notes
                    </NavLink>
                    <NavLink
                      to="/behavioral"
                      className="px-4 py-2 hover:bg-[#2a2a2a]"
                      onClick={() => setExploreOpen(false)}
                    >
                      Behavioral Questions
                    </NavLink>
                    <NavLink
                      to="/resume"
                      className="px-4 py-2 hover:bg-[#2a2a2a]"
                      onClick={() => setExploreOpen(false)}
                    >
                      Resume
                    </NavLink>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Login */}
            <NavLink
              to="/login"
              className="bg-[#ffa116] text-black px-4 py-2 rounded-md font-medium hover:bg-[#ffb84d] transition"
            >
              Login
            </NavLink>
          </div>

          {/* Mobile Icon */}
          <div
            className="md:hidden text-gray-300 text-xl cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            {open ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden bg-[#1a1a1a] border-t border-[#2a2a2a]"
          >
            <div className="flex flex-col items-center gap-6 py-6 text-gray-300">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className="hover:text-[#ffa116]"
                >
                  {link.name}
                </NavLink>
              ))}

              {/* Explore Dropdown in Mobile */}
              <div className="w-full flex flex-col items-center" ref={exploreRef}>
                <div
                  className="flex items-center justify-center gap-1 cursor-pointer hover:text-[#ffa116]"
                  onClick={() => setExploreOpen(!exploreOpen)}
                >
                  Explore <FaChevronDown className="text-xs" />
                </div>

                <AnimatePresence>
                  {exploreOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center mt-2 w-full"
                    >
                      <NavLink
                        to="/notes"
                        className="px-4 py-2 w-full text-center hover:bg-[#2a2a2a]"
                        onClick={() => { setExploreOpen(false); setOpen(false); }}
                      >
                        Notes
                      </NavLink>
                      <NavLink
                        to="/behavioral"
                        className="px-4 py-2 w-full text-center hover:bg-[#2a2a2a]"
                        onClick={() => { setExploreOpen(false); setOpen(false); }}
                      >
                        Behavioral Questions
                      </NavLink>
                      <NavLink
                        to="/resume"
                        className="px-4 py-2 w-full text-center hover:bg-[#2a2a2a]"
                        onClick={() => { setExploreOpen(false); setOpen(false); }}
                      >
                        Resume
                      </NavLink>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Login */}
              <NavLink
                to="/login"
                onClick={() => setOpen(false)}
                className="bg-[#ffa116] text-black px-4 py-2 rounded-md"
              >
                Login
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;