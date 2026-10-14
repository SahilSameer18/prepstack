import React, { useEffect, useState } from 'react';
import { useInterview } from '../../hooks/useInterview.js';
import { useNavigate } from 'react-router';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { FiSearch, FiTrash2, FiDownload, FiX, FiArrowRight } from "react-icons/fi";
import { exportReportPdf } from '../../utils/exportReportPdf.js';

// ── Match Level Configuration ────────────────────────────────────────────────
const getMatchDetails = (score) => {
    if (!score) return { bg: "bg-surface/50", text: "text-secondary", border: "border-border/50", badgeBg: "bg-surface/60", label: "Pending" };
    if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/20", badgeBg: "bg-emerald-500/10", label: "Strong Match" };
    if (score >= 60) return { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/20", badgeBg: "bg-amber-500/10", label: "Good Match" };
    return { bg: "bg-red-500", text: "text-red-400", border: "border-red-500/20", badgeBg: "bg-red-500/10", label: "Calibrating" };
};

// ── Linear Progress Bar Component (Memoized) ─────────────────────────────────
const HorizontalProgressBar = React.memo(({ score }) => {
    if (!score) return null;
    const { bg, text } = getMatchDetails(score);

    return (
        <div className="w-full my-4 relative z-10">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest font-mono">Compatibility</span>
                <span className={`text-xs font-black font-mono ${text}`}>{score}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.01]">
                <div 
                    className={`h-full rounded-full ${bg} transition-all duration-1000 ease-out`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
});

// ── Memoized Individual Report Card Component ────────────────────────────────
const ReportCard = React.memo(({ report, onNavigate, onDownloadPdf, onDelete, isDownloading, isDeleting }) => {
    const { label, text, border, badgeBg } = getMatchDetails(report.matchScore);

    return (
        <div
            onClick={() => onNavigate(`/interview/${report.id}`)}
            className="group relative rounded-2xl border border-border/80 bg-surface/30 p-5 flex flex-col justify-between min-h-52 hover:border-accent/40 hover:bg-surface/65 hover:shadow-xl hover:shadow-accent/[0.02] cursor-pointer transition-all duration-300"
        >
            {/* Card Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Card Header (Title & Status Tag) */}
            <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-primary text-base leading-snug group-hover:text-accent transition-colors duration-200 truncate" title={report.title || 'Custom Interview Plan'}>
                        {report.title || 'Custom Interview Plan'}
                    </h3>
                    <p className="text-[10px] text-secondary/70 mt-1 font-mono">
                        Audited {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                </div>
                {report.matchScore && (
                    <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${text} ${border} ${badgeBg}`}>
                        {label}
                    </span>
                )}
            </div>

            {/* Progress Bar Widget */}
            <HorizontalProgressBar score={report.matchScore} />

            {/* Description Snippet */}
            <p className="text-xs text-secondary/75 leading-relaxed flex-grow mt-1.5 line-clamp-2 relative z-10" style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {report.jobDescription || "Custom target interview analysis details."}
            </p>

            {/* Card Footer Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40 relative z-10" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onNavigate(`/interview/${report.id}`)}
                    className="text-xs font-bold text-primary flex items-center gap-1 group/btn hover:text-accent transition-colors cursor-pointer"
                >
                    View Strategy
                    <FiArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                </button>

                <div className="flex gap-2">
                    {/* PDF export */}
                    <button
                        onClick={(e) => onDownloadPdf(e, report)}
                        disabled={isDownloading}
                        title="Quick Export PDF"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface hover:bg-accent/15 border border-border/80 text-secondary hover:text-accent hover:border-accent/20 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        {isDownloading ? (
                            <span className="w-3.5 h-3.5 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                        ) : (
                            <FiDownload className="w-4 h-4" />
                        )}
                    </button>

                    {/* Delete report */}
                    <button
                        onClick={(e) => onDelete(e, report.id)}
                        disabled={isDeleting}
                        title="Delete plan"
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface hover:bg-red-500/15 border border-border/80 text-secondary hover:text-red-400 hover:border-red-500/20 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        {isDeleting ? (
                            <span className="w-3.5 h-3.5 border-2 border-red-500/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                            <FiTrash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

// ── Skeleton Loader Card ─────────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="rounded-2xl p-5 border border-border/60 bg-surface/20 flex flex-col justify-between h-52 transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
            <div className="flex-grow space-y-2">
                <Skeleton width="65%" height="1.1rem" />
                <Skeleton width="35%" height="0.7rem" />
            </div>
            <Skeleton width="70px" height="1.15rem" borderRadius="4px" />
        </div>
        
        {/* Progress Bar Widget Skeleton */}
        <div className="w-full my-4">
            <div className="flex justify-between mb-1.5">
                <Skeleton width="30%" height="0.5rem" />
                <Skeleton width="12%" height="0.5rem" />
            </div>
            <Skeleton width="100%" height="0.5rem" borderRadius="999px" />
        </div>

        {/* Description Snippet Skeleton */}
        <div className="space-y-1.5 flex-grow">
            <Skeleton width="100%" height="0.4rem" />
            <Skeleton width="75%" height="0.4rem" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
            <Skeleton width="80px" height="1.5rem" borderRadius="6px" />
            <div className="flex gap-2">
                <Skeleton width="32px" height="32px" borderRadius="8px" />
                <Skeleton width="32px" height="32px" borderRadius="8px" />
            </div>
        </div>
    </div>
);

// ── Premium Empty State ──────────────────────────────────────────────────────
const EmptyState = ({ onNavigate }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-surface/10 rounded-3xl border border-dashed border-border/80 mt-6 relative overflow-hidden">
        {/* Glow background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-accent mb-6 shadow-inner relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
                <line x1="8" y1="17" x2="16" y2="17"/>
                <line x1="8" y1="9" x2="10" y2="9"/>
            </svg>
        </div>
        <h3 className="text-xl font-bold text-primary mb-2 relative z-10">Generate Preparation Plans</h3>
        <p className="text-sm text-secondary/80 max-w-sm mx-auto mb-8 leading-relaxed relative z-10">
            Upload your resume alongside a target job description to build standard questions, skill gap resource charts, and multi-day schedules.
        </p>
        <button
            onClick={onNavigate}
            className="px-6 py-3 rounded-2xl text-sm font-bold text-primary bg-accent hover:opacity-90 active:scale-95 transition-all duration-200 shadow-[0_4px_20px_rgba(255,102,98,0.25)] relative z-10"
        >
            Create Your First Plan
        </button>
    </div>
);

const Dashboard = () => {
    const { reports, totalReports, getReports, deleteReport } = useInterview();
    const navigate = useNavigate();
    const [deletingId, setDeletingId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterTier, setFilterTier] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 6;

    useEffect(() => {
        const fetchReports = async () => {
            if (reports.length === 0) {
                setIsFetching(true);
                await getReports(1, limit);
                setIsFetching(false);
            }
        };
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLoadMore = React.useCallback(async () => {
        const nextPage = page + 1;
        setPage(nextPage);
        setIsFetching(true);
        await getReports(nextPage, limit);
        setIsFetching(false);
    }, [page, limit, getReports]);

    const handleDelete = React.useCallback(async (e, id) => {
        e.stopPropagation();
        setDeletingId(id);
        await deleteReport(id);
        setDeletingId(null);
    }, [deleteReport]);

    const handlePdfDownload = React.useCallback(async (e, report) => {
        e.stopPropagation();
        setDownloadingId(report.id);
        try {
            await exportReportPdf(report);
        } catch (err) {
            console.error("Failed downloading report PDF:", err);
        } finally {
            setDownloadingId(null);
        }
    }, []);

    const handleNavigate = React.useCallback((path) => {
        navigate(path);
    }, [navigate]);

    // Calculate Summary Stats from loaded reports
    const scoreValids = reports.filter(r => r.matchScore !== null);
    const avgScore = scoreValids.length > 0
        ? Math.round(scoreValids.reduce((acc, curr) => acc + curr.matchScore, 0) / scoreValids.length)
        : 0;
    const highMatches = scoreValids.filter(r => r.matchScore >= 80).length;

    // Client-side dynamic filtering
    const filteredReports = reports.filter((report) => {
        const titleMatch = report.title ? report.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const jdMatch = report.jobDescription ? report.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const matchesSearch = titleMatch || jdMatch;

        if (filterTier === "all") return matchesSearch;
        if (filterTier === "strong") return matchesSearch && report.matchScore >= 80;
        if (filterTier === "medium") return matchesSearch && report.matchScore >= 60 && report.matchScore < 80;
        if (filterTier === "low") return matchesSearch && report.matchScore < 60;
        return matchesSearch;
    });

    const isInitialLoading = isFetching && page === 1 && reports.length === 0;
    const hasMore = reports.length < totalReports;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-primary mb-1.5 tracking-tight">
                        My Preparation Console
                    </h1>
                    <p className="text-secondary text-sm">
                        {isInitialLoading ? 'Syncing...' : `Managing ${totalReports} calibrated job profiles`}
                    </p>
                </div>
                {!isInitialLoading && reports.length > 0 && (
                    <button
                        onClick={() => navigate('/generate')}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-primary bg-accent hover:opacity-90 active:scale-95 transition-all duration-200 shadow-[0_4px_20px_rgba(255,102,98,0.2)] cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        New Plan
                    </button>
                )}
            </div>

            {/* ── Stats Summary Grid ── */}
            {!isInitialLoading && reports.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    {/* Stat 1 */}
                    <div className="rounded-2xl p-5 bg-surface/30 border border-border/60 flex flex-col justify-between min-h-[110px] relative overflow-hidden group hover:border-border transition-colors duration-200">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-accent/5 rounded-full blur-[40px] pointer-events-none" />
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Total Audited</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-4xl font-extrabold text-primary leading-none">{totalReports}</span>
                            <span className="text-xs text-secondary/80 font-medium">roles</span>
                        </div>
                    </div>
                    {/* Stat 2 */}
                    <div className="rounded-2xl p-5 bg-surface/30 border border-border/60 flex flex-col justify-between min-h-[110px] relative overflow-hidden group hover:border-border transition-colors duration-200">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Avg Match Compatibility</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-4xl font-extrabold text-primary leading-none" style={{ color: avgScore >= 80 ? '#34d399' : avgScore >= 60 ? '#fbbf24' : '#f87171' }}>
                                {avgScore}%
                            </span>
                            <span className="text-xs text-secondary/80 font-medium">strength</span>
                        </div>
                    </div>
                    {/* Stat 3 */}
                    <div className="rounded-2xl p-5 bg-surface/30 border border-border/60 flex flex-col justify-between min-h-[110px] relative overflow-hidden group hover:border-border transition-colors duration-200">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Strong Alignments (≥80%)</span>
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-4xl font-extrabold text-emerald-400 leading-none">{highMatches}</span>
                            <span className="text-xs text-secondary/80 font-medium">matching</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Search & Filters Console Bar ── */}
            {!isInitialLoading && reports.length > 0 && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-surface/20 mb-8">
                    {/* Search Field */}
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
                            <FiSearch className="text-secondary/50 w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by job title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-10 py-2.5 bg-surface/40 border border-white/[0.06] rounded-xl text-sm text-primary placeholder-secondary/40 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/60 transition-all duration-300"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/55 hover:text-primary transition-colors cursor-pointer"
                            >
                                <FiX className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
                        {[
                            { id: "all", label: "All Cases" },
                            { id: "strong", label: "Strong (80%+)" },
                            { id: "medium", label: "Mid (60-79%)" },
                            { id: "low", label: "Calibration (<60%)" }
                        ].map((pill) => (
                            <button
                                key={pill.id}
                                onClick={() => setFilterTier(pill.id)}
                                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                                    filterTier === pill.id
                                        ? "bg-accent/15 border-accent text-accent"
                                        : "bg-surface/30 border-white/[0.06] text-secondary hover:bg-surface/70 hover:text-primary"
                                }`}
                            >
                                {pill.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Grid Skeletons ── */}
            {isInitialLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {/* ── Empty State ── */}
            {!isInitialLoading && reports.length === 0 && (
                <EmptyState onNavigate={() => navigate('/generate')} />
            )}

            {/* ── Report Card Grid ── */}
            {!isInitialLoading && reports.length > 0 && (
                <>
                    {filteredReports.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                            {filteredReports.map((report) => (
                                <ReportCard
                                    key={report.id}
                                    report={report}
                                    onNavigate={handleNavigate}
                                    onDownloadPdf={handlePdfDownload}
                                    onDelete={handleDelete}
                                    isDownloading={downloadingId === report.id}
                                    isDeleting={deletingId === report.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-surface/5 border border-border/50 rounded-2xl mt-4">
                            <span className="text-secondary/40 text-sm">No results match your search and filter criteria.</span>
                            <button
                                onClick={() => { setSearchTerm(""); setFilterTier("all"); }}
                                className="text-xs font-semibold text-accent mt-3 hover:underline cursor-pointer"
                            >
                                Reset Search Filters
                            </button>
                        </div>
                    )}

                    {/* Load More Footer */}
                    {hasMore && (
                        <div className="pt-8 pb-4 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={isFetching}
                                className="px-6 py-2.5 rounded-2xl text-xs font-bold text-primary bg-surface/50 border border-border hover:bg-surface/80 transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
                            >
                                {isFetching ? 'Loading...' : 'Load More Plans'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Dashboard;



