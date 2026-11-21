import { useEffect, useState } from "react";
import { Skeleton } from "./Skeletons";

const IdeaShape = () => (
  <div className="space-y-5">
    <div className="flex items-center gap-3">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-8 w-3/4 rounded-xl" />
    <div className="space-y-2.5">
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-11/12 rounded-md" />
      <Skeleton className="h-4 w-2/3 rounded-md" />
    </div>
    <div className="flex flex-wrap gap-2">
      {["w-16", "w-20", "w-14", "w-24"].map((w, i) => <Skeleton key={i} className={`h-7 rounded-md ${w}`} />)}
    </div>
    <div className="space-y-2.5 pt-2">
      {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
    </div>
  </div>
);

const ReportShape = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-5">
      <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
      <div className="w-full space-y-2.5">
        <Skeleton className="h-6 w-1/2 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
    </div>
    <div className="space-y-2.5">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
    </div>
  </div>
);

// For a wait that can take a while (the AI writing a project idea or a report): a shape like the finished result,
// one honest line, and the seconds so far. It claims no progress it cannot know about.
export default function LongWait({ shape = "idea", title, note, className = "" }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`surface-card fade-in p-6 sm:p-8 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div role="status">
          <p className="font-display text-xl font-bold tracking-tight text-fg">{title}</p>
          <p className="mt-1 text-sm text-muted">{note}</p>
        </div>
        <span aria-hidden="true" className="shrink-0 font-ui text-sm tabular-nums text-muted">{seconds} s</span>
      </div>
      <div aria-hidden="true" className="mt-6">
        {shape === "report" ? <ReportShape /> : <IdeaShape />}
      </div>
    </div>
  );
}
