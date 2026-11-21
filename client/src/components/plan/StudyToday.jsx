import { formatPlanDate, formatPlanMinutes } from "../../utils/studyPlan";

// Sacred surface: tasks, time and exactly one Start button. Controls belong in other tabs.
export default function StudyToday({ today, onStart }) {
  const label = today.isToday ? "Today" : formatPlanDate(today.date);
  return (
    <section aria-label="Today" className="mx-auto max-w-2xl space-y-5">
      <h2 className="font-display text-3xl font-bold tracking-tight text-fg">
        {label}: {today.items.length} tasks, {formatPlanMinutes(today.minutes)}
      </h2>
      <button
        type="button"
        onClick={() => onStart(today.startItem)}
        disabled={!today.startItem}
        className="amber-specular-button min-h-[56px] w-full cursor-pointer rounded-2xl px-5 py-3 text-base font-bold text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
      >
        Start
      </button>
      <ul className="surface-card divide-y divide-ink/[0.08] px-5">
        {today.items.map((item) => (
          <li
            key={item.originalKey || item.key}
            className="flex items-start justify-between gap-4 py-4 text-base"
          >
            <span className="min-w-0 text-fg-3">
              {item.title}{item.part && ` (part ${item.part.n} of ${item.part.of})`}
            </span>
            <span className="shrink-0 text-muted">
              {formatPlanMinutes(item.plannedMinutes)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
