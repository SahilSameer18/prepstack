import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiTarget, FiUploadCloud, FiFileText, FiX, FiTrash2, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { createReport, listReports, deleteReport } from "../../api/services/analyzerService";
import { InlineErrorAlert } from "../../components/ui/ErrorComponents";
import { InlineSpinner } from "../../components/ui/Skeletons";
import { extractError } from "../../utils/extractError";
import { formatDate } from "../../utils/formatDate";
import { formatTitle } from "../../utils/formatTitle";

const MAX_PDF = 3 * 1024 * 1024; // same limit as the server
const input = "w-full bg-card-hover border border-ink/[0.08] hover:border-ink/[0.15] focus:border-brand focus:ring-1 focus:ring-brand rounded-xl px-4 py-3 text-sm text-fg placeholder-faint outline-none transition-colors";

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
  const valid = hasResume && jobDescription.trim().length >= 30 && consent;

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
    <div className="px-4 sm:px-6 pb-12 max-w-4xl mx-auto page-enter text-left">
      <div className="mb-8 pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-ui text-muted mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span className="tracking-wider font-semibold text-fg-3">Role Analyzer</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-fg tracking-[-0.035em] mb-3">Match your resume to a job</h1>
        <p className="text-muted max-w-2xl text-base sm:text-lg leading-relaxed">
          Paste a job description and add your resume. You get a score, the skills you are missing with where to learn them in PrepStack, likely interview questions and a day-by-day plan.
        </p>
      </div>

      <form onSubmit={submit} className="titanium-card rounded-2xl p-5 sm:p-6 space-y-6">
        {/* Resume */}
        <div className="space-y-2.5">
          <label className="text-xs font-ui font-bold text-muted">Your resume <span className="text-brand">*</span></label>
          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-card-hover border border-ink/[0.08] px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-fg-2 min-w-0"><FiFileText className="shrink-0 text-brand" /><span className="truncate">{file.name}</span></span>
              <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} aria-label="Remove the file" className="shrink-0 w-9 h-9 flex items-center justify-center text-muted hover:text-fg cursor-pointer"><FiX /></button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
                className="w-full rounded-xl border border-dashed border-ink/[0.18] hover:border-brand/50 bg-card-hover px-4 py-6 flex flex-col items-center gap-2 text-fg-3 transition-colors cursor-pointer"
              >
                <FiUploadCloud className="text-2xl text-brand" />
                <span className="text-sm font-medium">Upload a PDF (up to 3 MB)</span>
                <span className="text-xs text-muted">or drop it here</span>
              </button>
              <p className="text-xs text-muted text-center">or paste your resume text</p>
              <textarea
                rows={6}
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
        <div className="space-y-2.5">
          <label htmlFor="jd" className="text-xs font-ui font-bold text-muted">Job description <span className="text-brand">*</span></label>
          <textarea id="jd" rows={8} value={jobDescription} maxLength={4000} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job posting here" className={`${input} resize-y`} />
          <p className="text-xs text-muted">{jobDescription.trim().length} / 4000 characters (at least 30)</p>
        </div>

        {/* Days */}
        <div className="space-y-2.5">
          <label htmlFor="days" className="text-xs font-ui font-bold text-muted">Days until your interview: <span className="text-fg">{days}</span></label>
          <input id="days" type="range" min={3} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-brand" />
        </div>

        {/* Consent */}
        <label className="flex items-start gap-3 rounded-xl bg-ink/[0.02] border border-ink/[0.06] p-3.5 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand shrink-0" />
          <span className="text-xs text-fg-3 leading-relaxed">
            I understand that my resume text (without email, phone number and links) and the job description are sent to Google and Groq to write this report. PrepStack does not keep my resume, only the report.
          </span>
        </label>

        <InlineErrorAlert message={error} onDismiss={() => setError(null)} className="" />

        <button
          type="submit"
          disabled={!valid || loading}
          className={`w-full py-3 min-h-[44px] rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${valid && !loading ? "amber-specular-button text-on-brand font-bold cursor-pointer" : "bg-ink/[0.04] border border-ink/[0.08] text-muted cursor-not-allowed"}`}
        >
          {loading ? <><InlineSpinner size={16} color="currentColor" /> Reading your resume. This can take up to a minute...</> : <><FiTarget /> Analyze my resume</>}
        </button>
        <p className="text-xs text-muted text-center">You can create 3 reports per hour and 5 per day.</p>
      </form>

      {/* Recent reports */}
      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display font-bold text-fg text-lg mb-3">Your recent reports</h2>
          <ul className="space-y-2">
            {recent.map((r) => (
              <li key={r._id} className="flex items-center gap-2 rounded-xl bg-card border border-ink/[0.08] hover:border-ink/[0.18] transition-colors">
                <Link to={`/analyzer/${r._id}`} className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 min-h-[56px]">
                  <span className="font-display font-extrabold text-fg w-10 shrink-0">{r.score}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-fg-1 truncate">{formatTitle(r.title)}</span>
                    <span className="block text-xs text-muted">{formatDate(r.createdAt)} &middot; {r.days}-day plan</span>
                  </span>
                  <FiArrowRight className="shrink-0 text-muted" />
                </Link>
                <button type="button" onClick={() => remove(r._id)} aria-label={`Delete report ${r.title}`} className="shrink-0 w-11 h-11 mr-1 flex items-center justify-center text-muted hover:text-bad cursor-pointer"><FiTrash2 /></button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Analyzer;
