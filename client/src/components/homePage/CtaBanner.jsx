import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Trophy } from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";

const CtaBanner = () => {
  const { user } = useAuth();
  return (
    <section aria-labelledby="home-cta-heading" className="flex flex-col items-start gap-6 rounded-3xl border border-brand/25 bg-brand/10 p-6 sm:p-8 md:flex-row md:items-center md:justify-between text-left shadow-[0_24px_50px_-30px_color-mix(in_srgb,var(--shadow)_55%,transparent)]">
      <div className="flex items-center gap-5">
        <span className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-brand/30 bg-card text-4xl text-brand">
          <Trophy weight="duotone" aria-hidden="true" />
        </span>
        <div>
          <h2 id="home-cta-heading" className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-fg">
            Your dream tech career is a plan away.
          </h2>
          <p className="mt-1 text-sm text-muted">Start your preparation with PrepStack today. It is free.</p>
        </div>
      </div>
      <Link
        to={user ? "/my-plan" : "/register"}
        className="amber-specular-button group inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
      >
        {user ? "Open My plan" : "Get started free"}
        <FiArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
      </Link>
    </section>
  );
};

export default CtaBanner;
