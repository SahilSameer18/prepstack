import { Link } from "react-router-dom";
import { Check } from "@phosphor-icons/react";
import { refLink } from "../../utils/reportLinks";
import { formatDoneAt } from "./planProgress";

// The one study-plan checklist: days run down a thin line, each day's tasks sit in one divided list.
// The report page shows every day; My plan shows a week at a time.
// days:     [{ day, focus, extra, items: [{ index?, task, ref, done, doneAt }] }]  (index defaults to the item's position)
// todayDay: the day to highlight (the server works it out)
// onToggle: (day, index, done) => void
const PlanChecklist = ({
  days,
  todayDay,
  refTitles,
  onToggle,
  busyKey,
  readOnly = false,
  renderActions,
  disabled = false,
}) => (
  <ol className="relative ml-2 mt-3 border-l border-ink/[0.12]">
    {(days || []).map((d) => {
      const isToday = d.day === todayDay;
      return (
        <li key={d.day} className="relative pb-7 pl-6 last:pb-1">
          <span
            aria-hidden="true"
            className={`absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 ${isToday ? "border-brand bg-brand" : "border-ink/[0.3] bg-card"}`}
          />
          <p className="text-sm font-semibold text-brand">
            {d.label || `DAY ${d.day}`}
            {isToday && <span className="ml-2 text-fg-3">Today</span>}
          </p>
          <p className="font-display text-lg font-extrabold tracking-tight text-fg">{d.focus}</p>
          <ul className="mt-2 divide-y divide-ink/[0.08] rounded-xl border border-ink/[0.08] bg-card">
            {(d.items || []).map((it, pos) => {
              const index = it.index ?? pos;
              const key = `${d.day}:${index}`;
              const l = refLink(it.ref, refTitles);
              const id = `plan-${d.day}-${index}`;
              return (
                <li key={key} className="flex items-start gap-3 px-4 py-3 text-sm leading-relaxed text-fg-3">
                  {!readOnly && (
                    <input
                      id={id}
                      type="checkbox"
                      checked={!!it.done}
                      disabled={disabled || it.disabled || busyKey === key}
                      onChange={(e) => onToggle(d.day, index, e.target.checked)}
                      className="peer sr-only"
                    />
                  )}
                  {!readOnly && (
                    <label
                      htmlFor={id}
                      className="-m-3 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center peer-focus-visible:[&>span]:ring-2 peer-focus-visible:[&>span]:ring-brand"
                      aria-label={`${it.done ? "Mark not done" : "Mark done"}: ${it.task}`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 ${it.done ? "border-brand bg-brand text-on-brand" : "border-ink/[0.3] bg-card"}`}
                      >
                        {it.done && <Check weight="bold" aria-hidden="true" className="text-xs" />}
                      </span>
                    </label>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className={it.done ? "text-muted line-through" : "text-fg"}>{it.task}</span>
                    {l && (
                      <>
                        {" "}
                        <Link to={l.path} className="text-xs font-semibold text-brand hover:underline">
                          {l.label}
                        </Link>
                      </>
                    )}
                    {it.done && it.doneAt && <span className="block text-xs text-muted">Done {formatDoneAt(it.doneAt)}</span>}
                  </div>
                  {renderActions && <div className="ml-auto shrink-0">{renderActions(it)}</div>}
                </li>
              );
            })}
          </ul>
          {d.extra && <p className="mt-2 text-xs text-muted">{d.extra}</p>}
        </li>
      );
    })}
  </ol>
);

export default PlanChecklist;
