import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { SkeletonDSACard } from "../../components/ui/Skeletons";
import { formatDate } from "../../utils/formatDate";
import ProgressMarks from "../../components/ui/ProgressMarks";

// ── DSADash: one card per sheet with a smooth bar ──────────────────────────
const DSADash = ({ dsaData, loading }) => (
  <section className="text-left">
    <div className="mb-5 mt-12 flex items-end justify-between gap-4">
      <h2 className="font-display text-2xl font-bold tracking-tight text-fg">Your sheets</h2>
      <Link to="/dsa" className="group inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold text-brand">
        All sheets <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
      </Link>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loading
        ? Array.from({ length: 3 }).map((_, i) => <SkeletonDSACard key={i} />)
        : dsaData.map(({ sheet, solved, total, lastSolvedAt }) => {
            return (
              <Link key={sheet.slug} to={`/dsa/${sheet.slug}`} className="surface-card surface-card-link block p-6">
                <h3 className="font-display text-lg font-bold tracking-tight text-fg">{sheet.name}</h3>
                <ProgressMarks value={solved} total={total} label={`Progress on ${sheet.name}`} tall className="mt-5" />
                <div className="mt-3 flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-code font-semibold text-fg">{solved} / {total} solved</span>
                  <span className={total > 0 && solved === total ? "font-semibold text-ok" : "text-muted"}>
                    {total > 0 && solved === total ? "Complete" : lastSolvedAt ? `Last solved ${formatDate(lastSolvedAt)}` : "Not started"}
                  </span>
                </div>
              </Link>
            );
          })}
    </div>
  </section>
);

export default DSADash;
