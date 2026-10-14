import React, { useState, useEffect } from "react";
import { useInterview } from "../../hooks/useInterview.js";
import { useNavigate } from "react-router";
import { interviewFormSchema } from "../../schemas/interview.schema.js";
import JobDescriptionInput from "./components/JobDescriptionInput.jsx";
import ResumeUpload from "./components/ResumeUpload.jsx";
import LoadingScreen from "../../components/layout/LoadingScreen.jsx";

// Simulated step notifications during AI generation process
const LOADING_STEPS = [
  { label: "Parsing Resume Data..." },
  { label: "Analyzing Job Description..." },
  { label: "Generating Technical Questions..." },
  { label: "Finalizing Preparation Plan..." },
];

/**
 * Form Component
 * Career assessment console with side-by-side inputs and interactive ready state meters.
 */
const Form = () => {
  const { generateReport } = useInterview();
  const navigate = useNavigate();

  // Core Form State
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  // Zod validation check to reactively enable/disable CTA button
  const canGenerate = interviewFormSchema.safeParse({
    jobDescription,
    resumeFile,
  }).success;

  // Clear Form state completely
  const handleClear = () => {
    setError("");
    setJobDescription("");
    setResumeFile(null);
  };

  // Triggers AI report generation
  const handleGenerateReport = async () => {
    setError("");

    // Double-check validation before dispatching
    const validationResult = interviewFormSchema.safeParse({
      jobDescription,
      resumeFile,
    });
    
    if (!validationResult.success) {
      const firstError =
        validationResult.error.issues?.[0]?.message ||
        validationResult.error.errors?.[0]?.message ||
        "Please fill in all required fields.";
      setError(firstError);
      return;
    }

    setIsGenerating(true);
    try {
      const data = await generateReport({
        jobDescription,
        resumeFile,
      });
      if (data && data.id) {
        // Navigate to the dynamic report dashboard
        navigate(`/interview/${data.id}`);
      } else {
        setError("Failed to generate report. Please ensure resume or job description is not empty.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err?.message || "Something went wrong. Please check your credentials and connection."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Step-by-step loading animation interval
  useEffect(() => {
    let interval;
    if (isGenerating) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 6000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Determine current console match setup state description
  const getConsoleStatusText = () => {
    if (!jobDescription.trim() && !resumeFile) {
      return "Career Engine Offline: Awaiting details";
    }
    if (jobDescription.trim() && !resumeFile) {
      return "Awaiting Resume Upload to complete calibration...";
    }
    if (!jobDescription.trim() && resumeFile) {
      return "Awaiting Job Description to begin sync...";
    }
    return "All Systems Calibrated: Console ready for strategy execution";
  };

  return (
    <div className="animate-fade-in py-4 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded-full mb-4 bg-accent/10 text-accent border border-accent/20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          AI-Powered Match Engine v2.0
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary mb-4 tracking-tight">
          Compare Your <span className="text-accent">Resume & Job Description</span>
        </h1>
        <p className="text-secondary max-w-2xl mx-auto text-sm leading-relaxed">
          Upload your resume and paste the job description to get a customized interview questions bank, matched skill gaps assessment, and a 10-day prep roadmap.
        </p>
      </div>

      {/* Clear state button */}
      {(jobDescription.trim() || resumeFile) && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleClear}
            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-200 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Reset Console
          </button>
        </div>
      )}

      {/* Global error banner */}
      {error && (
        <div
          className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-2xl text-sm text-red-300 animate-fade-in"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.25a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 6a.875.875 0 100-1.75.875.875 0 000 1.75z" clipRule="evenodd" />
          </svg>
          <div className="flex-grow">
            <p className="font-semibold text-red-200">Execution Error</p>
            <p className="text-xs text-red-350/90 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError("")}
            className="ml-auto shrink-0 text-red-400 hover:text-red-200 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 01-1.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Console Box */}
      <div
        className="rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-border/80 bg-surface relative"
      >
        {/* Calibration Status Bar at top of Workspace */}
        <div className="flex items-center gap-3 px-6 md:px-8 py-3.5 bg-background/60 border-b border-border/80">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            canGenerate ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-amber-400"
          }`} />
          <span className="text-xs font-mono font-bold tracking-wide text-secondary truncate">
            {getConsoleStatusText()}
          </span>
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <LoadingScreen
            message={LOADING_STEPS[loadingStep].label}
            subtitle="Comparing resume credentials and job expectations. This usually takes about 30 seconds."
            steps={LOADING_STEPS.map((s) => s.label)}
            currentStep={loadingStep}
            fullScreen={true}
          />
        )}

        {/* Side-by-side Grid Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8">
          <JobDescriptionInput
            value={jobDescription}
            onChange={(val) => {
              setJobDescription(val);
            }}
          />
          <ResumeUpload
            value={resumeFile}
            onChange={(file) => {
              setResumeFile(file);
            }}
          />
        </div>

        {/* Footer Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-8 py-5 border-t border-border bg-background/40">
          <div className="flex items-center gap-2 text-xs text-secondary/70">
            <svg className="w-4 h-4 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Orchestrates technical and behavioral roadmap matches</span>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={!canGenerate}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-2xl font-bold text-primary text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg active:scale-95 ${
              canGenerate 
                ? "bg-accent hover:shadow-accent/20 shadow-[0_4px_20px_rgba(255,102,98,0.2)] cursor-pointer" 
                : "bg-surface"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={canGenerate ? "animate-pulse" : ""}
            >
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
            Generate My Interview Strategy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Form;
