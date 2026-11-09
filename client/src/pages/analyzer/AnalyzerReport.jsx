import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiDownload, FiFlag } from "react-icons/fi";
import toast from "react-hot-toast";
import { getReport, deleteReport } from "../../api/services/analyzerService";
import { PageErrorState } from "../../components/ui/ErrorComponents";
import { InlineSpinner, SectionLoader } from "../../components/ui/Skeletons";
import { extractError } from "../../utils/extractError";
import { refLink } from "../../utils/reportLinks";
import { formatTitle } from "../../utils/formatTitle";
import ScoreRing from "../../components/analyzer/ScoreRing";
import RequirementRow from "../../components/analyzer/RequirementRow";
import SkillGapCard from "../../components/analyzer/SkillGapCard";

const ORDER = { missing: 0, partial: 1, met: 2 };
const card = "rounded-xl bg-card-hover border border-ink/[0.08] p-4";
const tag = { missing: "text-bad bg-bad-solid/10 border-bad-solid/25", partial: "text-warn bg-warn-solid/10 border-warn-solid/25", met: "text-ok bg-ok-solid/10 border-ok-solid/25" };

const AnalyzerReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("plan");
  const [downloading, setDownloading] = useState(false);

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
  if (!report) return <SectionLoader message="Loading your report..." />;

  const advice = report.skillAdvice || {};
  const reqs = [...report.requirements].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const gaps = reqs.filter((r) => r.status !== "met");
  const must = report.scoreBreakdown?.must || {};
  const mustTotal = (must.met || 0) + (must.partial || 0) + (must.missing || 0);
  const hours = (report.priorities || []).reduce((n, p) => n + (p.hours || 0), 0);
  const first = report.priorities?.[0];
  // "Start here" links to the first plan item that points at real PrepStack content. No such item: it is shown without a link.
  const startLink = report.plan?.flatMap((d) => d.items || []).map((i) => refLink(i.ref)).find(Boolean);
  const questionCount = (report.technicalQuestions?.length || 0) + (report.behavioralQuestions?.length || 0);

  const tabs = [
    { key: "plan", label: "Plan", n: report.plan?.length || 0 },
    { key: "skills", label: "Skills", n: reqs.length },
    { key: "questions", label: "Questions", n: questionCount },
    { key: "tips", label: "Resume tips", n: report.resumeTweaks?.length || 0 },
  ];

  const shown = new Set(); // one learning card per skill, even when several requirements point at it

  return (
    <div className="px-4 sm:px-6 pb-16 max-w-5xl mx-auto page-enter text-left">
      <div className="flex items-center justify-between gap-3 pt-2 mb-4">
        <Link to="/analyzer" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg min-h-[44px]"><FiArrowLeft /> New report</Link>
        <div className="flex items-center gap-1">
          <button onClick={download} disabled={downloading} className="inline-flex items-center gap-1.5 text-xs text-fg-3 hover:text-fg min-h-[44px] px-2 cursor-pointer disabled:opacity-60">
            {downloading ? <InlineSpinner size={16} color="currentColor" /> : <FiDownload />} {downloading ? "Preparing..." : "Download PDF"}
          </button>
          <button onClick={remove} className="text-xs text-muted hover:text-bad min-h-[44px] px-2 cursor-pointer">Delete report</button>
        </div>
      </div>

      {/* Summary */}
      <div className="titanium-card rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
        <ScoreRing score={report.score} />
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-xs font-ui font-semibold tracking-wider text-brand mb-1">ROLE MATCH</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-fg tracking-[-0.03em] break-words">{formatTitle(report.title)}</h1>
          <p className="text-sm text-muted mt-1">{must.met || 0} of {mustTotal} required skills matched</p>
        </div>
        <dl className="grid grid-cols-3 gap-5 text-center sm:text-left shrink-0">
          {[["Gaps", gaps.length], ["Study time", hours ? `${hours} h` : "-"], ["Plan", `${report.days} days`]].map(([k, v]) => (
            <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-display text-xl font-bold text-fg">{v}</dd></div>
          ))}
        </dl>
      </div>

      {/* Start here */}
      {first && (
        <div className="mt-3 rounded-xl border border-brand/40 bg-brand/[0.04] px-4 py-3 flex items-start sm:items-center gap-3">
          <FiFlag className="shrink-0 mt-0.5 sm:mt-0 text-brand" aria-hidden="true" />
          <p className="flex-1 text-sm text-fg-2 leading-snug"><span className="font-semibold text-fg">Start here:</span> {first.title}{first.hours ? ` (about ${first.hours} hours)` : ""}</p>
          {startLink && <Link to={startLink.path} className="shrink-0 inline-flex items-center gap-1.5 text-xs text-fg-3 hover:text-fg min-h-[44px]">Open <FiArrowRight /></Link>}
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <div className="min-w-0">
          {/* Tabs */}
          <div role="tablist" aria-label="Report sections" className="flex gap-1 border-b border-ink/[0.08] overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                className={`px-3 sm:px-4 py-3 min-h-[44px] text-sm whitespace-nowrap border-b-2 cursor-pointer transition-colors ${tab === t.key ? "border-brand text-fg font-semibold" : "border-transparent text-muted hover:text-fg-2"}`}
              >
                {t.label} <span className="text-xs text-muted font-normal">{t.n}</span>
              </button>
            ))}
          </div>

          <div role="tabpanel" className="mt-4 space-y-3">
            {tab === "plan" && (
              <>
                {report.priorities?.length > 0 && (
                  <ol className="space-y-2">
                    {report.priorities.map((p, i) => (
                      <li key={i} className={card}>
                        <p className="text-sm text-fg font-semibold">{i + 1}. {p.title} <span className="text-xs font-normal text-muted">(about {p.hours} hours)</span></p>
                        <p className="text-sm text-muted mt-1 leading-relaxed">{p.why}</p>
                      </li>
                    ))}
                  </ol>
                )}
                <ol className="space-y-3 pt-2">
                  {(report.plan || []).map((d, idx) => (
                    <li key={d.day} className={`${card} border-l-2 ${idx === 0 ? "border-l-brand" : "border-l-ink/[0.12]"}`}>
                      <p className="text-xs font-ui font-bold text-brand mb-1">DAY {d.day}</p>
                      <p className="text-sm text-fg font-semibold">{d.focus}</p>
                      <ul className="mt-2 space-y-2">
                        {(d.items || []).map((it, i) => {
                          const l = refLink(it.ref);
                          return (
                            <li key={i} className="text-sm text-fg-3 leading-relaxed">
                              {it.task}
                              {l && <> <Link to={l.path} className="text-xs text-info hover:text-info">{l.label}</Link></>}
                            </li>
                          );
                        })}
                      </ul>
                      {d.extra && <p className="text-xs text-muted mt-2">{d.extra}</p>}
                    </li>
                  ))}
                </ol>
                {report.codingTopics?.length > 0 && (
                  <div className="pt-4">
                    <h2 className="font-display font-bold text-fg text-base mb-2">Coding topics to practise</h2>
                    <ul className="space-y-2">
                      {report.codingTopics.map((t, i) => {
                        const l = refLink(t.ref);
                        return (
                          <li key={i} className={`${card} text-sm text-fg-3 leading-relaxed`}>
                            {l ? <Link to={l.path} className="text-fg font-semibold hover:text-brand">{l.label}</Link> : <span className="text-fg font-semibold">{t.ref}</span>}
                            <span className="text-muted"> &mdash; {t.why}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </>
            )}

            {tab === "skills" && (
              <ul className="space-y-3">
                {reqs.map((r, i) => {
                  const a = r.status !== "met" && advice[r.skillKey] && !shown.has(r.skillKey) ? advice[r.skillKey] : null;
                  if (a) shown.add(r.skillKey);
                  return (
                    <Fragment key={i}>
                      <RequirementRow req={r} />
                      {a && <li className="sm:ml-6"><SkillGapCard advice={a} /></li>}
                    </Fragment>
                  );
                })}
              </ul>
            )}

            {tab === "questions" && (
              <>
                {report.technicalQuestions?.map((q, i) => (
                  <div key={i} className={card}>
                    <p className="text-sm text-fg font-semibold leading-snug">{q.question}</p>
                    <p className="text-sm text-muted mt-1.5 leading-relaxed">{q.why}</p>
                    {q.resumeAngle && <p className="text-xs text-muted mt-2">Your resume angle: {q.resumeAngle}</p>}
                    {q.followUps?.length > 0 && <ul className="mt-2 list-disc pl-5 text-xs text-muted space-y-1">{q.followUps.map((f, j) => <li key={j}>{f}</li>)}</ul>}
                  </div>
                ))}
                {report.behavioralQuestions?.length > 0 && (
                  <>
                    <h2 className="font-display font-bold text-fg text-base pt-3">Behavioral questions</h2>
                    {report.behavioralQuestions.map((q, i) => (
                      <div key={i} className={card}>
                        <p className="text-sm text-fg font-semibold leading-snug">{q.question}</p>
                        {q.resumeAngle && <p className="text-xs text-muted mt-2">Your resume angle: {q.resumeAngle}</p>}
                      </div>
                    ))}
                    <Link to="/behavioral" className="inline-flex items-center gap-2 text-sm text-brand hover:underline min-h-[44px]">Practise these on Behavioral Prep <FiArrowRight /></Link>
                  </>
                )}
              </>
            )}

            {tab === "tips" && (
              <>
                {report.resumeTweaks?.length > 0 ? report.resumeTweaks.map((t, i) => (
                  <div key={i} className={`${card} text-sm text-fg-3 leading-relaxed`}><span className="text-fg font-semibold">{t.keyword}</span> &mdash; {t.suggestion}</div>
                )) : <p className="text-sm text-muted">No resume changes to suggest for this job.</p>}
                <Link to="/resume" className="inline-flex items-center gap-2 text-sm text-brand hover:underline min-h-[44px]">Read the Resume Guide <FiArrowRight /></Link>
              </>
            )}
          </div>
        </div>

        {/* Side column: desktop only. On a phone the Skills tab holds the same information. */}
        <aside className="hidden lg:flex flex-col gap-3">
          {gaps.length > 0 && (
            <div className={card}>
              <p className="text-xs text-muted mb-2">Skill gaps</p>
              <div className="flex flex-wrap gap-1.5">
                {gaps.map((r, i) => <span key={i} className={`text-xs rounded-full px-2.5 py-0.5 border ${tag[r.status]}`}>{r.skillKey && r.skillKey !== "none" ? r.skillKey : r.text}</span>)}
              </div>
            </div>
          )}
          <p className="text-xs text-muted leading-relaxed">The score is worked out by our code from these marks, not by the AI. Each match shows the line from your resume that proves it, under Skills.</p>
        </aside>
      </div>

      <p className="mt-10 text-xs text-muted leading-relaxed">
        This report is advice written by an AI and checked by our code. It cannot promise an interview or a job. Your resume was not saved, only this report.
      </p>
    </div>
  );
};

export default AnalyzerReport;
