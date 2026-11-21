import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, DownloadSimple, Flag } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { getReport, deleteReport, setPlanItem } from "../../api/services/analyzerService";
import { PageErrorState } from "../../components/ui/ErrorComponents";
import { InlineSpinner, Skeleton } from "../../components/ui/Skeletons";
import PageBackdrop from "../../components/ui/PageBackdrop";
import { useLoadingGate } from "../../hooks/useLoadingGate";
import { extractError } from "../../utils/extractError";
import { refLink } from "../../utils/reportLinks";
import { formatTitle } from "../../utils/formatTitle";
import ScoreStrip from "../../components/analyzer/ScoreStrip";
import RequirementRow from "../../components/analyzer/RequirementRow";
import { orderRequirements, missingRequired, requirementName } from "../../components/analyzer/requirements";
import SkillGapCard from "../../components/analyzer/SkillGapCard";
import PlanChecklist from "../../components/analyzer/PlanChecklist";
import { countPlan, setItemDone } from "../../components/analyzer/planProgress";
import ReportPlanImport from '../../components/plan/ReportPlanImport';

const list = "surface-card divide-y divide-ink/[0.08]";
const heading = "mb-4 font-display text-xl font-bold tracking-tight text-fg";

const ReportSkeleton = () => (
  <div aria-hidden="true" className="space-y-4">
    <div className="surface-card space-y-6 p-6 sm:p-8">
      <Skeleton className="h-4 w-28 rounded-md" />
      <Skeleton className="h-9 w-2/3 rounded-md" />
      <div className="grid items-end gap-8 lg:grid-cols-[auto_1fr_auto]">
        <Skeleton className="h-16 w-40 rounded-md" />
        <Skeleton className="h-3 w-full rounded-full" />
        <Skeleton className="h-12 w-56 rounded-md" />
      </div>
    </div>
    <Skeleton className="h-14 w-full rounded-2xl" />
    <div className="surface-card space-y-5 p-6">
      {[0, 1, 2].map((i) => <div key={i} className="space-y-2"><Skeleton className="h-4 w-1/3 rounded-md" /><Skeleton className="h-3 w-3/4 rounded-md" /></div>)}
    </div>
  </div>
);

const AnalyzerReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const calm = useReducedMotion();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("plan");
  const [downloading, setDownloading] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const gate = useLoadingGate(!report && !error);

  // Tick at once, then ask the server; if it fails, put the box back and say so.
  const toggleItem = async (day, index, done) => {
    const before = report.plan;
    setBusyKey(`${day}:${index}`);
    setReport((r) => ({ ...r, plan: setItemDone(r.plan, day, index, done, new Date().toISOString()) }));
    try {
      const res = await setPlanItem(id, day, index, done);
      const saved = res?.data;
      setReport((r) => ({ ...r, todayDay: saved?.todayDay ?? r.todayDay, plan: setItemDone(r.plan, day, index, done, saved?.doneAt) }));
    } catch (err) {
      setReport((r) => ({ ...r, plan: before }));
      toast.error(extractError(err, "Could not save that tick. Please try again."));
    } finally {
      setBusyKey(null);
    }
  };

  useEffect(() => {
    let live = true;
    getReport(id)
      .then((r) => live && setReport(r?.report || r?.data?.report))
      .catch((err) => live && setError(extractError(err, "Could not load this report.")));
    return () => { live = false; };
  }, [id]);

  const download = async () => {
    setDownloading(true);
    try {
      const { exportReportPdf } = await import("../../utils/exportReportPdf");
      await exportReportPdf(report);
    } catch {
      toast.error("Could not create the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    try {
      await deleteReport(id);
      navigate("/analyzer", { replace: true });
    } catch (err) {
      toast.error(extractError(err, "Could not delete the report."));
    }
  };

  if (error) return <PageErrorState message={error} backTo="/analyzer" backLabel="Back to Role Analyzer" />;

  const advice = report?.skillAdvice || {};
  const reqs = orderRequirements(report?.requirements || []); // required skills first, gaps first inside each group
  const gaps = reqs.filter((r) => r.status !== "met");
  const missingMust = missingRequired(reqs);
  const must = report?.scoreBreakdown?.must || {};
  const mustTotal = (must.met || 0) + (must.partial || 0) + (must.missing || 0);
  const hours = (report?.priorities || []).reduce((n, p) => n + (p.hours || 0), 0);
  const first = report?.priorities?.[0];
  // "Start here" links to the first plan item that points at real PrepStack content. No such item: it is shown without a link.
  const startLink = report?.plan?.flatMap((d) => d.items || []).map((i) => refLink(i.ref, report.refTitles)).find(Boolean);
  const planCount = countPlan(report?.plan);
  const questionCount = (report?.technicalQuestions?.length || 0) + (report?.behavioralQuestions?.length || 0);

  const tabs = [
    { key: "plan", label: "Plan", n: report?.plan?.length || 0 },
    { key: "skills", label: "Skills", n: reqs.length },
    { key: "questions", label: "Questions", n: questionCount },
    { key: "tips", label: "Resume tips", n: report?.resumeTweaks?.length || 0 },
  ];

  const shown = new Set(); // one learning card per skill, even when several requirements point at it

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-2 text-left text-fg sm:px-6">
        {!report || gate !== "ready" ? (
          gate === "skeleton" ? <ReportSkeleton /> : <div className="min-h-[60vh]" />
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <Link to="/analyzer" className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap text-sm text-muted transition-colors hover:text-fg"><ArrowLeft aria-hidden="true" /> New report</Link>
              <div className="flex items-center gap-1 sm:gap-2">
                <button type="button" onClick={download} disabled={downloading} className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 whitespace-nowrap px-2 text-sm text-fg-3 transition-colors hover:text-fg disabled:opacity-60">
                  {downloading ? <InlineSpinner size={16} color="currentColor" /> : <DownloadSimple aria-hidden="true" />} {downloading ? "Preparing..." : "Download PDF"}
                </button>
                <button type="button" onClick={remove} className="min-h-[44px] cursor-pointer whitespace-nowrap px-2 text-sm text-muted transition-colors hover:text-bad">Delete report</button>
              </div>
            </div>

            {/* Summary */}
            <div className="surface-card p-5 sm:p-8">
              <p className="font-ui text-xs font-semibold tracking-wider text-brand">EVIDENCE MATCH</p>
              <h1 className="mt-1 break-words font-display text-3xl font-black tracking-[-0.03em] sm:text-4xl">{formatTitle(report.title)}</h1>
              <div className="mt-6 grid items-end gap-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-8">
                <ScoreStrip score={report.score} reqs={reqs} />
                <dl className="grid grid-cols-3 divide-x divide-ink/[0.08] text-left">
                  {[["Gaps", gaps.length], ["Study time", hours ? `${hours} h` : "-"], ["Plan", `${report.days} days`]].map(([k, v]) => (
                    <div key={k} className="px-3 first:pl-0 sm:px-5"><dt className="text-sm text-muted">{k}</dt><dd className="font-display text-xl font-bold sm:text-2xl">{v}</dd></div>
                  ))}
                </dl>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {must.met || 0} of {mustTotal} required skills matched. How much of the job&rsquo;s list your resume backs with proof. Required skills count 3 points, nice to have 1. It is not a chance of getting the job.
              </p>
              {missingMust.length > 0 && (
                <p role="note" className="mt-5 border-t border-ink/[0.08] pt-4 text-sm leading-snug">
                  <span className="font-semibold text-bad">{missingMust.length} required {missingMust.length === 1 ? "skill is" : "skills are"} not shown in your resume:</span>{" "}
                  <span className="text-fg-2">{missingMust.map(requirementName).join(", ")}. A high score does not hide this.</span>
                </p>
              )}
            </div>

            <ReportPlanImport key={report._id} reportId={report._id} />

            {/* Start here */}
            {first && (
              <div className="mt-3 flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/[0.05] px-5 py-4 sm:items-center">
                <Flag weight="duotone" aria-hidden="true" className="mt-0.5 shrink-0 text-xl text-brand sm:mt-0" />
                <p className="flex-1 text-sm leading-snug text-fg-2"><span className="font-semibold text-fg">Start here:</span> {first.title}{first.hours ? ` (about ${first.hours} hours)` : ""}</p>
                {startLink && <Link to={startLink.path} className="group inline-flex min-h-[44px] shrink-0 items-center gap-1.5 text-sm font-bold text-brand">Open <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" /></Link>}
              </div>
            )}

            {/* Tabs */}
            <div role="tablist" aria-label="Report sections" className="mb-6 mt-8 flex gap-1 overflow-x-auto sm:gap-1.5">
              {tabs.map((t) => (
                <button
                  key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                  className={`relative flex min-h-[44px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-sm transition-colors sm:px-4 ${tab === t.key ? "font-semibold text-brand" : "text-muted hover:bg-ink/[0.05] hover:text-fg"}`}
                >
                  {tab === t.key && (
                    <motion.span
                      aria-hidden="true"
                      layoutId={calm ? undefined : "report-tab-slide"}
                      className="absolute inset-0 -z-10 rounded-xl bg-brand/12"
                      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                    />
                  )}
                  {t.label} <span className="font-normal text-muted">{t.n}</span>
                </button>
              ))}
            </div>

            <div role="tabpanel" className="space-y-8">
              {tab === "plan" && (
                <>
                  {report.priorities?.length > 0 && (
                    <section>
                      <h2 className={heading}>What to learn first</h2>
                      <ol className={list}>
                        {report.priorities.map((p, i) => (
                          <li key={i} className="p-5 sm:p-6">
                            <p className="font-semibold text-fg">{i + 1}. {p.title} <span className="text-sm font-normal text-muted">(about {p.hours} hours)</span></p>
                            <p className="mt-1 text-sm leading-relaxed text-fg-3">{p.why}</p>
                          </li>
                        ))}
                      </ol>
                    </section>
                  )}
                  <section>
                    <h2 className={heading}>Day by day</h2>
                    {planCount.total > 0 && (
                      <p className="text-sm text-fg-2" aria-live="polite">
                        <span className="font-semibold text-fg">{planCount.done} of {planCount.total}</span> plan items done
                      </p>
                    )}
                    <PlanChecklist days={report.plan} todayDay={report.todayDay} refTitles={report.refTitles} onToggle={toggleItem} busyKey={busyKey} />
                  </section>
                  {report.codingTopics?.length > 0 && (
                    <section>
                      <h2 className={heading}>Coding topics to practise</h2>
                      <ul className={list}>
                        {report.codingTopics.map((t, i) => {
                          const l = refLink(t.ref, report.refTitles);
                          return (
                            <li key={i} className="p-5 text-sm leading-relaxed text-fg-3 sm:p-6">
                              {l ? <Link to={l.path} className="font-semibold text-fg hover:text-brand">{l.label}</Link> : <span className="font-semibold text-fg">{t.ref}</span>}
                              <span className="text-muted"> &mdash; {t.why}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )}
                </>
              )}

              {tab === "skills" && (
                <ul className={list}>
                  {reqs.map((r, i) => {
                    const a = r.status !== "met" && advice[r.skillKey] && !shown.has(r.skillKey) ? advice[r.skillKey] : null;
                    if (a) shown.add(r.skillKey);
                    return <RequirementRow key={i} req={r}>{a && <SkillGapCard advice={a} />}</RequirementRow>;
                  })}
                </ul>
              )}

              {tab === "questions" && (
                <>
                  {report.technicalQuestions?.length > 0 && (
                    <section>
                      <h2 className={heading}>Technical questions</h2>
                      <ul className={list}>
                        {report.technicalQuestions.map((q, i) => (
                          <li key={i} className="p-5 sm:p-6">
                            <p className="font-semibold leading-snug text-fg">{q.question}</p>
                            <p className="mt-1.5 text-sm leading-relaxed text-fg-3">{q.why}</p>
                            {q.resumeAngle && <p className="mt-2 text-sm text-muted">Your resume angle: {q.resumeAngle}</p>}
                            {q.followUps?.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">{q.followUps.map((f, j) => <li key={j}>{f}</li>)}</ul>}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {report.behavioralQuestions?.length > 0 && (
                    <section>
                      <h2 className={heading}>Behavioral questions</h2>
                      <ul className={list}>
                        {report.behavioralQuestions.map((q, i) => (
                          <li key={i} className="p-5 sm:p-6">
                            <p className="font-semibold leading-snug text-fg">{q.question}</p>
                            {q.resumeAngle && <p className="mt-2 text-sm text-muted">Your resume angle: {q.resumeAngle}</p>}
                          </li>
                        ))}
                      </ul>
                      <Link to="/behavioral" className="group mt-3 inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold text-brand">Practise these on Behavioral Prep <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" /></Link>
                    </section>
                  )}
                </>
              )}

              {tab === "tips" && (
                <section>
                  {report.resumeTweaks?.length > 0 ? (
                    <ul className={list}>
                      {report.resumeTweaks.map((t, i) => (
                        <li key={i} className="p-5 text-sm leading-relaxed text-fg-3 sm:p-6"><span className="font-semibold text-fg">{t.keyword}</span> &mdash; {t.suggestion}</li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-muted">No resume changes to suggest for this job.</p>}
                  <Link to="/resume" className="group mt-3 inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold text-brand">Read the Resume Guide <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" /></Link>
                </section>
              )}
            </div>

            <p className="mt-12 text-xs leading-relaxed text-muted">
              The evidence match is worked out by our code from these marks, not by the AI. Each match shows the line from your resume that proves it, under Skills.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              This report is advice written by an AI and checked by our code. It cannot promise an interview or a job. Your resume was not saved, only this report.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyzerReport;
