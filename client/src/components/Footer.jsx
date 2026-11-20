import { Link } from "react-router-dom";
import { FiMail, FiGithub, FiLinkedin } from "react-icons/fi";
import LogoMark from "./ui/LogoMark";

const COLUMNS = [
  {
    title: "Learn",
    links: [
      { name: "My plan", url: "/my-plan" },
      { name: "DSA Sheets", url: "/dsa" },
      { name: "CS Notes", url: "/notes" },
      { name: "Roadmaps", url: "/roadmaps" },
    ],
  },
  {
    title: "Tools",
    links: [
      { name: "Role Analyzer", url: "/analyzer" },
      { name: "AI Projects", url: "/ai-projects" },
      { name: "Behavioral Prep", url: "/behavioral" },
      { name: "Resume Guide", url: "/resume" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", url: "/privacy" },
      { name: "Terms of Service", url: "/terms" },
    ],
  },
];

const SOCIAL = [
  { icon: <FiGithub className="text-base" />, url: "https://github.com/SahilSameer18", label: "GitHub" },
  { icon: <FiLinkedin className="text-base" />, url: "https://www.linkedin.com/in/sahil-sameer-siddique/", label: "LinkedIn" },
  { icon: <FiMail className="text-base" />, url: "mailto:sahilsameer.dev18@gmail.com", label: "Email" },
];

const Footer = () => (
  <footer className="relative mt-24 border-t border-ink/[0.08] bg-canvas">
    {/* the same grid paper as the home page, fading out downward */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-line-grid"
      style={{ maskImage: "linear-gradient(to bottom, var(--ink), transparent 70%)", WebkitMaskImage: "linear-gradient(to bottom, var(--ink), transparent 70%)" }}
    />
    <div className="relative mx-auto max-w-7xl px-6 py-14">
      <div className="grid gap-10 border-b border-ink/[0.08] pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="group flex min-h-[44px] items-center gap-2.5" aria-label="PrepStack home">
            <LogoMark className="h-8 w-8 shrink-0" />
            <span className="font-display text-xl font-bold tracking-tight text-fg transition-opacity group-hover:opacity-90">
              Prep<span className="text-brand">Stack</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Free interview prep for software engineers. No card needed.
          </p>
          <p aria-hidden="true" className="mt-4 -rotate-2 font-hand text-2xl text-fg-2">
            <span className="draw-underline">Prepare. Build. Excel.</span>
          </p>
          <div className="mt-5 flex items-center gap-2.5">
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-ink/[0.1] bg-card text-muted transition-colors hover:border-ink/[0.2] hover:text-fg"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-3 font-display text-sm font-bold text-fg">{column.title}</h2>
            <ul className="space-y-1">
              {column.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.url} className="inline-block py-2 text-sm text-muted transition-colors hover:text-brand sm:py-1">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} PrepStack. All rights reserved.</p>
        <p className="font-ui">
          Engineered by{" "}
          <a href="https://www.linkedin.com/in/sahil-sameer-siddique/" target="_blank" rel="noopener noreferrer" className="text-fg-3 underline underline-offset-2 transition-colors hover:text-fg">
            Sahil Sameer
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
