import { coverageLists } from "../../utils/planFormat";

// What a plan leaves out, in plain words, by topic and subject. Older saved plans have no list: nothing is shown for them.
const unit = (group) => (group.kind === "notes" ? "sections" : "problems");

export default function PlanCoverage({ byGroup, className = "" }) {
  const { none, part } = coverageLists(byGroup);
  if (!none.length && !part.length) return null;
  return (
    <div className={"space-y-2 text-sm leading-relaxed text-fg-3 " + className}>
      {none.length > 0 && (
        <p>
          <span className="font-semibold text-fg">Not in your plan:</span>{" "}
          {none.map((group) => group.label).join(", ")}.
        </p>
      )}
      {part.length > 0 && (
        <div>
          <p className="font-semibold text-fg">Only some of:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 sm:columns-2">
            {part.map((group) => (
              <li key={group.kind + group.label} className="break-inside-avoid">
                {group.label} ({group.placed} of {group.total} {unit(group)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
