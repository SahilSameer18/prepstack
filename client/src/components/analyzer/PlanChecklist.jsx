import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { refLink } from "../../utils/reportLinks";
import { formatDoneAt } from "./planProgress";

// The one study-plan checklist. The report page shows every day; the dashboard "Today" card shows a single day.
// days:     [{ day, focus, extra, items: [{ index?, task, ref, done, doneAt }] }]  (index defaults to the item's position)
// todayDay: the day to highlight (the server works it out)
// onToggle: (day, index, done) => void
const PlanChecklist = ({ days, todayDay, refTitles, onToggle, busyKey }) => (
  <ol className="space-y-3">
    {(days || []).map((d) => {
      const isToday = d.day === todayDay;
      return (
        <li key={d.day} className={`rounded-xl bg-card-hover border border-ink/[0.08] p-4 border-l-2 ${isToday ? "border-l-brand" : "border-l-ink/[0.12]"}`}>
          <p className="text-xs font-ui font-bold text-brand mb-1">DAY {d.day}{isToday && <span className="ml-2 text-fg-3 font-semibold">Today</span>}</p>
          <p className="text-sm text-fg font-semibold">{d.focus}</p>
          <ul className="mt-2 space-y-1">
            {(d.items || []).map((it, pos) => {
              const index = it.index ?? pos;
              const key = `${d.day}:${index}`;
              const l = refLink(it.ref, refTitles);
              const id = `plan-${d.day}-${index}`;
              return (
                <li key={key} className="flex items-start gap-3 text-sm text-fg-3 leading-relaxed">
                  <input
                    id={id} type="checkbox" checked={!!it.done} disabled={busyKey === key}
                    onChange={(e) => onToggle(d.day, index, e.target.checked)}
                    className="peer sr-only"
                  />
                  <label htmlFor={id} className="flex shrink-0 items-center justify-center w-11 h-11 -m-2 cursor-pointer peer-focus-visible:[&>span]:ring-2 peer-focus-visible:[&>span]:ring-brand" aria-label={`${it.done ? "Mark not done" : "Mark done"}: ${it.task}`}>
                    <span className={`flex items-center justify-center w-5 h-5 rounded border transition-colors ${it.done ? "bg-brand border-brand text-on-brand" : "border-ink/[0.3] bg-card"}`}>
                      {it.done && <FiCheck className="text-xs" aria-hidden="true" />}
                    </span>
                  </label>
                  <div className="min-w-0 pt-1.5">
                    <span className={it.done ? "line-through text-muted" : ""}>{it.task}</span>
                    {l && <> <Link to={l.path} className="text-xs text-info hover:text-info">{l.label}</Link></>}
                    {it.done && it.doneAt && <span className="block text-xs text-muted">Done {formatDoneAt(it.doneAt)}</span>}
                  </div>
                </li>
              );
            })}
          </ul>
          {d.extra && <p className="text-xs text-muted mt-2">{d.extra}</p>}
        </li>
      );
    })}
  </ol>
);

export default PlanChecklist;
