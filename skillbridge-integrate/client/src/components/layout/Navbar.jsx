import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth.js";
import { FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/generate", label: "New Plan" },
  { to: "/dashboard", label: "Dashboard" },
];

const getDiceBearAvatar = (seed) =>
  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed || "User")}`;

const Navbar = () => {
  const { handleLogout, user, logoutLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 12;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const onLogoutClick = async () => {
    setUserMenuOpen(false);
    await handleLogout();
    navigate("/login");
  };

  const avatarSrc = user?.avatar || getDiceBearAvatar(user?.username);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border shadow-lg shadow-black/20"
          : "border-b border-transparent"
      }`}
      style={{
        background: scrolled ? "rgba(10,10,10,0.92)" : "rgba(10,10,10,0.60)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <span
              className="text-lg font-bold tracking-tight text-primary"
              style={{ fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
            >
              Skill<span className="text-accent">Bridge</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-accent"
                      : "text-secondary hover:text-primary hover:bg-surface"
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions / User Profile Pill */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-surface/40 hover:bg-surface/80 transition-all duration-200 cursor-pointer"
                >
                  <img
                    src={avatarSrc}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-accent/40"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getDiceBearAvatar(user.username);
                    }}
                  />
                  <span className="text-sm font-medium text-primary max-w-[120px] truncate">
                    {user.username}
                  </span>
                  <FiChevronDown className={`w-3.5 h-3.5 text-secondary transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-background/95 border border-border/80 shadow-xl p-1.5 z-50 animate-fade-in backdrop-blur-xl">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-primary hover:bg-surface hover:text-accent transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={onLogoutClick}
                      disabled={logoutLoading}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FiLogOut className="w-4 h-4" />
                      {logoutLoading ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-semibold rounded-full text-primary bg-accent transition-all duration-200 hover:opacity-90 active:scale-95"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            ref={toggleRef}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg text-secondary hover:text-accent hover:bg-surface transition-all duration-200 focus:outline-none"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center gap-[5px]">
              <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className="md:hidden absolute left-0 right-0 overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: mobileMenuOpen ? "400px" : "0px",
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
        }}
      >
        <div className="border-t border-border px-4 pt-3 pb-5 space-y-1 bg-background/95 backdrop-blur-xl">
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? "text-accent bg-accent/10" : "text-secondary hover:text-primary hover:bg-surface"
                }`}
              >
                {isActive && <span className="w-1 h-4 rounded-full bg-accent shrink-0" />}
                {label}
              </Link>
            );
          })}

          {user && (
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                location.pathname === "/profile" ? "text-accent bg-accent/10" : "text-secondary hover:text-primary hover:bg-surface"
              }`}
            >
              <FiUser className="w-4 h-4" />
              Profile
            </Link>
          )}

          <div className="pt-3 mt-1 border-t border-border">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <img
                    src={avatarSrc}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-accent/40"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getDiceBearAvatar(user.username);
                    }}
                  />
                  <span className="text-sm font-medium text-primary truncate">{user.username}</span>
                </div>
                <button
                  onClick={onLogoutClick}
                  disabled={logoutLoading}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                  {logoutLoading ? "Logging out…" : "Logout"}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-primary bg-accent transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
