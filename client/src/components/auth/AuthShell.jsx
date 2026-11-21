import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import PageBackdrop from "../ui/PageBackdrop";

const EASE = [0.23, 1, 0.32, 1];

// The form column: its Items arrive one after another (title, fields, button). Reduced motion: plain fades, no delay between them.
export const AuthEnter = ({ children, className }) => {
  const calm = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: calm ? 0 : 0.07, delayChildren: 0.12 } } }}
    >
      {children}
    </motion.div>
  );
};

// One piece of the form that arrives with the stagger
export const Item = ({ children, className }) => {
  const calm = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: calm ? { opacity: 0 } : { opacity: 0, transform: "translate3d(0, 18px, 0)" },
        show: { opacity: 1, transform: "translate3d(0, 0, 0)", transition: { duration: calm ? 0.2 : 0.6, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
};

export const Logo = ({ className = "text-2xl" }) => (
  <Link to="/" className={`${className} w-fit font-display font-bold tracking-tight text-fg`}>
    Prep<span className="text-brand">Stack</span>
  </Link>
);

export const BackLink = ({ to = "/", label = "Back to home" }) => (
  <Link to={to} className="group mb-4 inline-flex min-h-[44px] items-center gap-2 font-ui text-sm text-muted transition-colors hover:text-fg">
    <ArrowLeft aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5" />
    {label}
  </Link>
);

// The left panel's message glides in from the side, a little after the page appears
const AsideGlide = ({ children, className }) => {
  const calm = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={calm ? { opacity: 0 } : { opacity: 0, transform: "translate3d(-24px, 0, 0)" }}
      animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
      transition={{ duration: calm ? 0.2 : 0.7, ease: EASE, delay: calm ? 0 : 0.1 }}
    >
      {children}
    </motion.div>
  );
};

// Login and sign-up: a message panel on the left (wide screens) and the form on the right.
const AuthShell = ({ aside, children }) => (
  <div className="flex min-h-screen bg-canvas selection:bg-brand/25 selection:text-fg">
    <aside className="relative hidden flex-col overflow-hidden border-r border-ink/[0.08] p-10 lg:flex lg:w-1/2 xl:p-14">
      <PageBackdrop />
      <div className="relative z-10 flex flex-1 flex-col">
        <Logo />
        <AsideGlide className="my-auto max-w-md py-10">{aside}</AsideGlide>
      </div>
    </aside>

    <main className="flex w-full flex-col items-center justify-center px-6 py-8 sm:py-12 lg:w-1/2">
      <div className="mb-4 lg:hidden"><Logo className="text-xl" /></div>
      <AuthEnter className="w-full max-w-md">{children}</AuthEnter>
    </main>
  </div>
);

export default AuthShell;
