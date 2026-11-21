import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "../../hooks/useAuth";

const CtaBanner = () => {
  const { user } = useAuth();
  return (
    <section aria-labelledby="home-cta-heading" className="flex flex-col items-start justify-between gap-6 border-t border-ink/[0.1] pt-16 text-left md:flex-row md:items-center">
      <div>
        <h2 id="home-cta-heading" className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl">
          Start free. No card.
        </h2>
        <p className="mt-3 text-base text-muted">Your dream tech career is a plan away.</p>
      </div>
      <Link
        to={user ? "/my-plan" : "/register"}
        className="amber-specular-button group inline-flex min-h-[48px] shrink-0 items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold"
      >
        {user ? "Open My plan" : "Get started free"}
        <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
      </Link>
    </section>
  );
};

export default CtaBanner;
