import React from "react";
import { roadmaps } from "../../data/roadmaps";
import { behavioralQuestions } from "../../data/behavioralQuestions";
import homeFacts from "../../data/homeFacts.json";
import CountUp from "../ui/CountUp";

// Four real numbers under the hero, spread across the full width. All come from files in the app (the DSA numbers from
// homeFacts.json, built from the sheet data), so they show at once and cannot go stale: nothing here waits for the server.
const STATS = [
  { value: <CountUp value={homeFacts.problems} format={(n) => n.toLocaleString("en-IN")} />, label: "DSA problems" },
  { value: <CountUp value={homeFacts.sheets} />, label: "curated sheets" },
  { value: <CountUp value={roadmaps.length} />, label: "roadmaps" },
  { value: <CountUp value={behavioralQuestions.length} />, label: "behavioral questions" },
];

const StatsRow = () => (
  <dl className="xl:-mt-6 grid grid-cols-2 gap-y-8 border-y border-ink/[0.1] py-8 text-left md:grid-cols-4 md:gap-y-0 md:divide-x md:divide-ink/[0.1]">
    {STATS.map(({ value, label }) => (
      <div key={label} className="md:px-8 md:first:pl-0 md:last:pr-0">
        <dd className="font-code text-4xl font-medium tracking-tight text-fg sm:text-5xl">{value}</dd>
        <dt className="mt-2 text-sm text-muted sm:text-base">{label}</dt>
      </div>
    ))}
  </dl>
);

export default StatsRow;
