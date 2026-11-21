import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Lightning, Trash, UploadSimple, X } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { createReport, listReports, deleteReport } from "../../api/services/analyzerService";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import { InlineSpinner } from "../../components/ui/Skeletons";
import LongWait from "../../components/ui/LongWait";
import PageBackdrop from "../../components/ui/PageBackdrop";
import { UsageNotice } from "../../components/ui/StateComponents";
import { useUsage } from "../../hooks/useUsage";
import { extractError } from "../../utils/extractError";
import { formatDate } from "../../utils/formatDate";
import { formatTitle } from "../../utils/formatTitle";

const MAX_PDF = 3 * 1024 * 1024; // same limit as the server
const input = "w-full rounded-xl border border-ink/[0.1] bg-card px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-faint hover:border-ink/[0.2] focus:border-brand focus:ring-1 focus:ring-brand";

const Step = ({ n, children }) => (
  <div className="mb-3 flex items-center gap-3 font-display text-lg font-bold tracking-tight text-fg">
    <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/12 text-sm text-brand">{n}</span>
    {children}
  </div>
);

const Analyzer = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [days, setDays] = useState(10);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);
  const { usage, refresh: refreshUsage } = useUsage();

  useEffect(() => {
    listReports().then((r) => setRecent(r?.reports || r?.data?.reports || [])).catch(() => {}); // the list is optional: the form works without it
  }, []);

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return setError("Please choose a PDF file, or paste your resume text instead.");
    if (f.size > MAX_PDF) return setError("That PDF is larger than 3 MB. Please use a smaller file or paste the text.");
    setError(null);
    setFile(f);
  };

  const hasResume = !!file || resumeText.trim().length > 0;
  const limitReached = !!usage && usage.reports.used >= usage.reports.allowed;
  const valid = hasResume && jobDescription.trim().length >= 30 && consent && !limitReached;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || loading) return;
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("jobDescription", jobDescription.trim());
      form.append("days", String(days));
      form.append("consent", "true");
      if (file) form.append("resume", file);
      else form.append("resumeText", resumeText);
      const res = await createReport(form);
      const report = res?.report || res?.data?.report;
      if (res?.data?.resumeTruncated) toast("Your resume was long, so only the first part was read.", { icon: "ℹ️" });
      navigate(`/analyzer/${report._id}`);
    } catch (err) {
      setError(extractError(err, "Could not create the report. Please try again."));
      refreshUsage();
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      await deleteReport(id);
      setRecent((r) => r.filter((x) => x._id !== id));
    } catch (err) {
      toast.error(extractError(err, "Could not delete the report."));
    }
  };

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-2 text-left text-fg sm:px-6">
        <h1 className="break-words font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-5xl">Match your resume to a job</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Paste a job description and add your resume. You get a score, the skills you are missing with where to learn them in PrepStack, likely interview questions and a day-by-day plan.
        </p>

        <form onSubmit={submit} className="surface-card mt-8 p-5 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Resume */}
            <div>
              <Step n="1">Your resume</Step>
              {file ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-ink/[0.1] px-4 py-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-fg-2"><FileText weight="duotone" aria-hidden="true" className="shrink-0 text-xl text-brand" /><span className="truncate">{file.name}</span></span>
                  <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} aria-label="Remove the file" className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center text-muted hover:text-fg"><X aria-hidden="true" /></button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
                    className="flex min-h-[132px] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink/[0.2] px-4 text-fg-3 transition-colors hover:border-brand/50"
                  >
                    <UploadSimple weight="duotone" aria-hidden="true" className="text-3xl text-brand" />
                    <span className="text-sm font-semibold text-fg">Upload a PDF (up to 3 MB)</span>
                    <span className="text-sm text-muted">or drop it here</span>
                  </button>
                  <p className="my-3 text-center text-sm text-muted">or paste your resume text</p>
                  <textarea
                    rows={7}
                    value={resumeText}
                    maxLength={20000}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste the text of your resume here"
                    aria-label="Resume text"
                    className={`${input} resize-y`}
                  />
                </>
              )}
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
            </div>

            {/* Job description */}
            <div className="flex flex-col">
              <Step n="2"><label htmlFor="jd">The job description</label></Step>
              <textarea id="jd" rows={14} value={jobDescription} maxLength={4000} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job posting here" className={`${input} min-h-[200px] flex-1 resize-y`} />
              <p className="mt-2 text-right text-sm text-muted">{jobDescription.trim().length} / 4000 characters (at least 30)</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-ink/[0.08] pt-6">
            {/* Days */}
            <div className="min-w-[240px] flex-1">
              <Step n="3"><label htmlFor="days">Days until your interview</label></Step>
              <div className="flex items-center gap-5">
                <span className="w-16 font-display text-5xl font-black tracking-tight" aria-live="polite">{days}</span>
                <input id="days" type="range" min={3} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-11 w-full accent-brand" />
              </div>
            </div>
            <button
              type="submit"
              disabled={!valid || loading}
              className={`flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-8 font-display text-sm font-bold transition-colors sm:w-auto ${valid && !loading ? "amber-specular-button cursor-pointer text-on-brand" : "cursor-not-allowed border border-ink/[0.08] bg-ink/[0.04] text-muted"}`}
            >
              {loading ? <><InlineSpinner size={16} color="currentColor" /> Reading your resume...</> : <><Lightning weight="fill" aria-hidden="true" /> Analyze my resume</>}
            </button>
          </div>

          <label className="mt-5 flex min-h-[44px] cursor-pointer items-start gap-3 text-sm leading-relaxed text-muted">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-brand" />
            <span>
              I understand that my resume text (without email, phone number and links) and the job description are sent to Google and Groq to write this report. PrepStack does not keep my resume, only the report.
            </span>
          </label>

          <InlineErrorAlert message={error} onDismiss={() => setError(null)} className="mt-4" />
          {loading && <LongWait shape="report" title="Reading your resume" note="This can take up to a minute." className="mt-5" />}
          <UsageNotice usage={usage?.reports} noun="reports" className="mt-4" />
        </form>

        {/* Recent reports */}
        {recent.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 font-display text-2xl font-bold tracking-tight">Your recent reports</h2>
            <ul className="surface-card divide-y divide-ink/[0.08]">
              {recent.map((r) => (
                <li key={r._id} className="flex items-stretch transition-colors hover:bg-ink/[0.02]">
                  <Link to={`/analyzer/${r._id}`} className="group flex min-w-0 flex-1 items-center gap-5 p-5">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-brand font-display text-lg font-bold text-fg">{r.score}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words font-display text-lg font-bold tracking-tight text-fg">{formatTitle(r.title)}</span>
                      <span className="block text-sm text-muted">{formatDate(r.createdAt)} &middot; {r.days}-day plan</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="shrink-0 text-lg text-muted transition-transform duration-150 group-hover:translate-x-1" />
                  </Link>
                  <button type="button" onClick={() => remove(r._id)} aria-label={`Delete report ${r.title}`} className="flex w-14 shrink-0 cursor-pointer items-center justify-center text-xl text-muted transition-colors hover:text-bad"><Trash aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default Analyzer;
