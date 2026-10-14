import React, { useState, useRef, useEffect } from "react";

const MAX_FILE_SIZE_MB = 4;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * ResumeUpload Component
 * Handles file drag-and-drop, validation (file type, size limits),
 * and preview of the selected PDF resume file with an animated parsing status.
 */
const ResumeUpload = ({ value, onChange }) => {
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [isParsed, setIsParsed] = useState(false);
  const fileInputRef = useRef(null);

  // Sync state if value changes externally (e.g. preset selection)
  useEffect(() => {
    if (value) {
      setFileName(value.name || "resume.pdf");
      const sizeInBytes = value.size || 1024 * 1024 * 1.2; // default 1.2MB for mocks
      const sizeInKb = (sizeInBytes / 1024).toFixed(1);
      setFileSize(sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`);
      setIsParsed(true);
    } else {
      setFileName("");
      setFileSize("");
      setIsParsed(false);
      setIsParsing(false);
      setParseProgress(0);
    }
  }, [value]);

  // Validate and handle file input
  const processFile = (file) => {
    setFileError("");
    setIsParsed(false);
    setIsParsing(false);
    setParseProgress(0);

    if (!file) return;

    // Supported formats (Standard Text-based PDFs)
    if (file.type !== "application/pdf") {
      setFileError("Only text-based PDF files are supported.");
      onChange(null);
      return;
    }

    // Size limit checks
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
      onChange(null);
      return;
    }

    // Capture file details
    setFileName(file.name);
    // Format size
    const sizeInKb = (file.size / 1024).toFixed(1);
    setFileSize(sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`);
    
    // Simulate Parsing Process
    setIsParsing(true);
    onChange(file); // Set file immediately for validation but show animated parsing
  };

  // Parsing simulation progress timer
  useEffect(() => {
    let interval;
    if (isParsing) {
      interval = setInterval(() => {
        setParseProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsParsing(false);
            setIsParsed(true);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isParsing]);

  // Remove the selected file
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileName("");
    setFileSize("");
    setFileError("");
    setIsParsing(false);
    setParseProgress(0);
    setIsParsed(false);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0] || null;
    processFile(file);
  };

  return (
    <div className={`flex flex-col h-full bg-background/40 p-6 rounded-2xl border transition-all duration-300 ${
      isDragging ? "border-amber-500/50 shadow-[0_0_15px_rgba(255,102,98,0.15)]" : "border-border/80 hover:border-border/60"
    }`}>
      {/* Header section */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-105"
            style={{
              background: "rgba(255,102,98,0.08)",
              border: "1px solid rgba(255,102,98,0.2)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-primary text-base tracking-wide font-sans">
              Your Resume
            </h2>
            <p className="text-xs text-accent font-medium mt-0.5">Required</p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
          Best Results
        </span>
      </div>

      {/* Drag & Drop Container */}
      <div className="flex-grow flex flex-col justify-center min-h-[280px]">
        <label
          htmlFor="resume-upload-input"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer transition-all duration-300 border-2 border-dashed h-full ${
            isDragging
              ? "border-amber-400/80 bg-amber-500/5 scale-[1.01]"
              : fileName
              ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60"
              : fileError
              ? "border-red-500/40 bg-red-500/5"
              : "border-border bg-background/30 hover:bg-background/60 hover:border-border/80"
          }`}
        >
          {/* Status Icon */}
          <div className={`mb-4 transition-transform duration-300 ${isDragging ? "scale-110" : ""}`}>
            {fileError ? (
              <svg className="w-12 h-12 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : isParsing ? (
              <svg className="w-12 h-12 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.248 10H18.22" />
              </svg>
            ) : isParsed ? (
              <svg className="w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className={`w-12 h-12 transition-colors duration-300 ${isDragging ? "text-amber-400" : "text-secondary"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {fileName ? (
            <div className="flex flex-col items-center gap-3 w-full max-w-xs text-center">
              <div className="bg-background/80 border border-border/80 rounded-xl p-3 w-full">
                <p className="text-sm font-semibold text-primary/90 truncate">
                  {fileName}
                </p>
                <p className="text-[11px] text-secondary mt-1 font-mono">
                  Size: {fileSize} · PDF Document
                </p>
              </div>

              {/* Parsing status bar */}
              {isParsing && (
                <div className="w-full mt-1">
                  <div className="flex justify-between items-center text-[10px] text-secondary mb-1">
                    <span>Parsing structure...</span>
                    <span>{parseProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-100" 
                      style={{ width: `${parseProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Parsed success indicator */}
              {isParsed && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-1">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Metadata parsed successfully
                </div>
              )}

              <button
                onClick={handleRemove}
                className="mt-1 text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-secondary bg-surface border border-border/80 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200"
                aria-label="Remove resume"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Remove Resume
              </button>
            </div>
          ) : (
            <div className="text-center px-4">
              <p className="text-sm font-medium text-primary/90 leading-relaxed">
                {fileError ? fileError : "Click to browse or drag & drop"}
              </p>
              {!fileError && (
                <p className="text-xs text-secondary mt-2 font-mono">
                  PDF format only · Max {MAX_FILE_SIZE_MB}MB
                </p>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            onChange={(e) => processFile(e.target.files[0] || null)}
            hidden
            type="file"
            id="resume-upload-input"
            name="resume"
            accept=".pdf"
          />
        </label>
      </div>

      {/* Info Tip box */}
      <div className="mt-5 flex items-start gap-3 p-3.5 rounded-xl text-xs text-secondary bg-amber-500/5 border border-amber-500/10">
        <svg
          className="w-4 h-4 mt-0.5 shrink-0 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="leading-relaxed font-sans">
          Make sure your resume is in text-based PDF format. Scanned image files cannot be read accurately by the AI engine.
        </p>
      </div>
    </div>
  );
};

export default ResumeUpload;
