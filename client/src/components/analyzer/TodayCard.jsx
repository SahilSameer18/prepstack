import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { getToday, setPlanItem } from "../../api/services/analyzerService";
import { extractError } from "../../utils/extractError";
import { formatTitle } from "../../utils/formatTitle";
import PlanChecklist from "./PlanChecklist";
import { setItemDone } from "./planProgress";

// Dashboard card: today's items from the latest Role Analyzer report, with the same checklist as the report page.
// It stays hidden while loading, when there is no report with a plan, and when the request fails: the rest of the dashboard
// does not depend on it.
const TodayCard = () => {
  const [data, setData] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  useEffect(() => {
    let live = true;
    getToday().then((r) => live && setData(r?.data ?? null)).catch(() => {});
    return () => { live = false; };
  }, []);

  if (!data) return null;

  const toggle = async (day, index, done) => {
    const before = data;
    const bump = (d, delta) => ({ ...d, progress: { ...d.progress, done: d.progress.done + delta } });
    setBusyKey(`${day}:${index}`);
    setData((d) => bump({ ...d, day: { ...d.day, items: setItemDone([d.day], day, index, done, new Date().toISOString())[0].items } }, done ? 1 : -1));
    try {
      await setPlanItem(data.reportId, day, index, done);
    } catch (err) {
      setData(before);
      toast.error(extractError(err, "Could not save that tick. Please try again."));
    } finally {
      setBusyKey(null);
    }
  };

  const { day, progress, allDone } = data;
  return (
    <section className="mb-6 rounded-2xl border border-ink/[0.08] bg-card p-4 sm:p-5" aria-label="Today's study plan">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-xs font-ui font-semibold tracking-wider text-brand">TODAY</p>
          <h2 className="font-display text-base sm:text-lg font-bold text-fg break-words">{formatTitle(data.title)}</h2>
          <p className="text-xs text-muted mt-0.5" aria-live="polite">{progress.done} of {progress.total} plan items done</p>
        </div>
        <Link to={`/analyzer/${data.reportId}`} className="shrink-0 inline-flex items-center gap-1.5 text-xs text-fg-3 hover:text-fg min-h-[44px]">Open report <FiArrowRight /></Link>
      </div>
      {allDone || !day ? (
        <p className="text-sm text-fg-2">{allDone ? "Plan complete. Every item is ticked." : "Nothing left to tick today."}</p>
      ) : (
        <PlanChecklist days={[day]} todayDay={day.day} refTitles={data.refTitles} onToggle={toggle} busyKey={busyKey} />
      )}
    </section>
  );
};

export default TodayCard;
