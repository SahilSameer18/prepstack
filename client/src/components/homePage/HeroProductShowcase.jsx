import React, { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import Tick from "../ui/Tick";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import homeFacts from "../../data/homeFacts.json";
import { SPRING } from "../../utils/motion";

// An interactive example of the planner, in three steps: what fits in your hours, what today looks like, and what happens when you miss a day.
// Everything here is arithmetic on a made-up example, shown on screen; it is not the real planner and says so.
const PROBLEMS = homeFacts.perSheet["blind-75"]; // the real size of the Blind 75 sheet
const MINUTES_PER_PROBLEM = 40; // assumption
const STUDY_DAYS_PER_WEEK = 5; // assumption
const WEEK_CHOICES = [4, 6, 8];
const HOUR_CHOICES = [1, 2, 3];

const TASKS = [
  { id: 1, title: "Two Sum", kind: "DSA problem", minutes: 20 },
  { id: 2, title: "ACID properties", kind: "CS notes", minutes: 25 },
  { id: 3, title: "Review: Binary Search", kind: "Review", minutes: 15 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TASKS_PER_DAY = 3;

const TABS = [
  { id: 0, name: "Your hours" },
  { id: 1, name: "Today" },
  { id: 2, name: "Missed days" },
];

const hoursText = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
};

const Choice = ({ on, onClick, children, label }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    aria-label={label}
    className={`min-h-[44px] flex-1 cursor-pointer rounded-lg px-3 font-code text-sm transition-colors sm:min-h-[40px] ${on ? "border border-brand/45 bg-brand/15 font-semibold text-brand" : "border border-ink/[0.2] bg-card text-fg-3 hover:border-ink/[0.4] hover:text-fg"}`}
  >
    {children}
  </button>
);

const HoursTab = () => {
  const [weeks, setWeeks] = useState(6);
  const [hours, setHours] = useState(1);
  const neededHours = (PROBLEMS * MINUTES_PER_PROBLEM) / 60;
  const haveHours = weeks * STUDY_DAYS_PER_WEEK * hours;
  const fits = haveHours >= neededHours;
  const fitCount = Math.min(PROBLEMS, Math.floor((haveHours * 60) / MINUTES_PER_PROBLEM));
  const pct = Math.min(100, Math.round((haveHours / neededHours) * 100));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-fg-3">Weeks until your deadline</p>
          <div className="flex gap-2">{WEEK_CHOICES.map((w) => <Choice key={w} on={weeks === w} onClick={() => setWeeks(w)} label={`${w} weeks`}>{w}</Choice>)}</div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-fg-3">Hours a day</p>
          <div className="flex gap-2">{HOUR_CHOICES.map((h) => <Choice key={h} on={hours === h} onClick={() => setHours(h)} label={`${h} hours a day`}>{h}</Choice>)}</div>
        </div>
      </div>

      <div aria-live="polite">
        <p className={`font-display text-xl font-bold tracking-tight sm:text-2xl ${fits ? "text-ok" : "text-fg"}`}>
          {fits ? `It fits: all ${PROBLEMS} problems of Blind 75.` : `About ${fitCount} of ${PROBLEMS} problems fit before your deadline.`}
        </p>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-ink/[0.1]"
          role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="How much of the sheet your hours cover"
        >
          <div className="bar-fill h-full w-full rounded-full" style={{ transform: `scaleX(${pct / 100})`, background: "var(--brand-grad-bottom)" }} />
        </div>
        <p className="mt-3 font-code text-xs leading-relaxed text-muted">
          {PROBLEMS} problems × {MINUTES_PER_PROBLEM} min = {neededHours} h needed.<br />
          {weeks} weeks × {STUDY_DAYS_PER_WEEK} days × {hours} h = {haveHours} h available.
        </p>
      </div>
    </div>
  );
};

const TodayTab = () => {
  const [done, setDone] = useState(() => new Set([1]));
  const toggle = (id) => setDone((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const left = TASKS.filter((t) => !done.has(t.id)).reduce((sum, t) => sum + t.minutes, 0);
  const total = TASKS.reduce((sum, t) => sum + t.minutes, 0);

  return (
    <div>
      <p className="font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">{TASKS.length} tasks, about {hoursText(total)}</p>
      <ul className="mt-3 divide-y divide-ink/[0.1] border-y border-ink/[0.1]">
        {TASKS.map((task) => {
          const isDone = done.has(task.id);
          return (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => toggle(task.id)}
                aria-pressed={isDone}
                className="group flex min-h-[52px] w-full cursor-pointer items-center gap-4 py-2 text-left"
              >
                <Tick done={isDone} />
                <span className={`min-w-0 flex-1 ${isDone ? "text-muted line-through" : "text-fg"}`}>
                  <span className="block font-medium">{task.title}</span>
                  <span className="block text-xs text-muted">{task.kind}</span>
                </span>
                <span className="font-code text-xs text-muted">{task.minutes} min</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="font-code text-xs text-muted" aria-live="polite">{done.size} of {TASKS.length} done · {left > 0 ? `${hoursText(left)} left` : "all done for today"}</p>
        <span className="amber-specular-button flex min-h-[44px] items-center rounded-xl px-6 text-sm font-bold text-on-brand sm:min-h-[40px]">Start</span>
      </div>
    </div>
  );
};

const MissedTab = () => {
  const [missed, setMissed] = useState(() => new Set([2]));
  const toggle = (i) => setMissed((prev) => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
  // the tasks of missed days are spread over the days that are still ahead and not missed
  const first = missed.size ? Math.min(...missed) : DAYS.length;
  const ahead = DAYS.map((_, i) => i).filter((i) => i > first && !missed.has(i));
  const carried = missed.size * TASKS_PER_DAY;
  const extra = (i) => (ahead.includes(i) ? Math.floor(carried / ahead.length) + (ahead.indexOf(i) < carried % ahead.length ? 1 : 0) : 0);
  const stuck = missed.size > 0 && ahead.length === 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-3">Tap a day you missed. You see the new schedule before anything changes.</p>
      <ol className="grid grid-cols-5 gap-2" aria-label="Five study days">
        {DAYS.map((day, i) => {
          const isMissed = missed.has(i);
          const n = isMissed ? 0 : TASKS_PER_DAY + extra(i);
          return (
            <li key={day}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={isMissed}
                aria-label={`${day}: ${isMissed ? "missed" : `${n} tasks`}. ${isMissed ? "Tap to undo" : "Tap to mark as missed"}`}
                className={`flex min-h-[88px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border px-1 text-center transition-colors ${isMissed ? "border-dashed border-ink/[0.25] text-muted" : "border-ink/[0.1] text-fg hover:border-ink/[0.3]"}`}
              >
                <span className="font-ui text-xs text-muted">{day}</span>
                <span className={`mt-1 font-code text-2xl ${isMissed ? "line-through" : ""}`}>{isMissed ? TASKS_PER_DAY : n}</span>
                <span className={`mt-0.5 text-xs ${!isMissed && extra(i) > 0 ? "font-semibold text-brand" : "text-muted"}`}>{isMissed ? "missed" : extra(i) > 0 ? `+${extra(i)} moved` : "tasks"}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="text-sm text-muted" aria-live="polite">
        {missed.size === 0 && "Nothing missed. The plan stays as it is."}
        {missed.size > 0 && !stuck && `${carried} tasks from the missed ${missed.size === 1 ? "day move" : "days move"} to the days ahead. Nothing changes until you accept.`}
        {stuck && "No days are left this week, so the plan would show what no longer fits."}
      </p>
    </div>
  );
};

const HeroProductShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="surface-card relative w-full overflow-hidden text-left transform-gpu">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-ink/[0.08] bg-card px-4 py-3.5 sm:px-6">
        <div className="relative flex w-full items-center overflow-x-auto rounded-xl bg-inset/60 p-1 sm:w-auto" role="tablist" aria-label="Planner demo">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 flex min-h-[40px] flex-1 cursor-pointer items-center justify-center rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors sm:flex-none sm:min-h-0 ${isActive ? "text-brand" : "text-muted hover:text-fg-2"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeWorkspaceTab"
                    className="absolute inset-0 -z-10 rounded-lg border border-brand/30 bg-brand/12"
                    transition={SPRING.smooth}
                  />
                )}
                <span className="font-display">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-[374px] flex-col justify-between p-4 sm:p-6">
        <div className="flex flex-1 items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={activeTab}
            role="tabpanel"
            className="w-full"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14 }}
          >
            {activeTab === 0 && <HoursTab />}
            {activeTab === 1 && <TodayTab />}
            {activeTab === 2 && <MissedTab />}
          </motion.div>
        </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-end border-t border-ink/[0.07] pt-3.5 text-xs text-muted">
          <Link
            to="/my-plan"
            className="group inline-flex min-h-[44px] shrink-0 select-none items-center gap-1.5 whitespace-nowrap py-2.5 text-xs font-semibold text-brand transition-colors hover:text-brand-hover sm:min-h-0 sm:py-0"
          >
            Build your own plan{" "}
            <ArrowRight className="text-xs transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroProductShowcase;
