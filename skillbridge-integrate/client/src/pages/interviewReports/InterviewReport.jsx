import React, { useState, useEffect, useCallback } from 'react'
import { useInterview } from '../../hooks/useInterview.js'
import { useParams } from 'react-router'
import Skeleton from '../../components/ui/Skeleton'
import { exportReportPdf } from '../../utils/exportReportPdf.js'

const NAV_ITEMS = [
    { id: 'technical',  label: 'Technical Q&A',   short: 'Technical',  icon: 'code'     },
    { id: 'behavioral', label: 'Behavioral Q&A',  short: 'Behavioral', icon: 'messages' },
    { id: 'skills',     label: 'Skill Gaps',       short: 'Skills',     icon: 'target'   },
    { id: 'roadmap',    label: 'Action Plan',      short: 'Roadmap',    icon: 'map-2'    },
]

const SEVERITY_STYLES = {
    high:   'bg-red-500/10 text-red-400 border border-red-500/25 shadow-sm',
    medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-sm',
    low:    'bg-blue-500/10 text-blue-400 border border-blue-500/25 shadow-sm',
}

/* ─────────────────────────────────────────
   SVG Icon Component
───────────────────────────────────────── */
const Icon = ({ name, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" className={className} aria-hidden="true">
        {name === 'code'         && <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>}
        {name === 'messages'     && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
        {name === 'map-2'        && <polygon points="3 11 22 2 13 21 11 13 3 11" />}
        {name === 'target'       && <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>}
        {name === 'chevron-down' && <polyline points="6 9 12 15 18 9" />}
        {name === 'download'     && <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>}
        {name === 'sparkle'      && <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956Z" fill="currentColor" stroke="none" />}
        {name === 'help-circle'  && <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>}
        {name === 'copy'         && <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>}
        {name === 'check'        && <polyline points="20 6 9 17 4 12" />}
    </svg>
)

const YouTubeLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="currentColor" stroke="none" className="text-red-500 shrink-0">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
        <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
)

const DocsLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeLinejoin="round" className="text-rose-400 shrink-0">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
)

/* ─────────────────────────────────────────
   Score Ring Component (Memoized)
───────────────────────────────────────── */
const ScoreRing = React.memo(({ score, color, size = 68, strokeWidth = 5 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const [offset, setOffset] = useState(circumference)

    useEffect(() => {
        const t = setTimeout(() => setOffset(circumference - (score / 100) * circumference), 120)
        return () => clearTimeout(t)
    }, [score, circumference])

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle r={radius} cx={size / 2} cy={size / 2} fill="none" stroke="rgba(51,65,85,0.4)" strokeWidth={strokeWidth} />
            <circle
                r={radius} cx={size / 2} cy={size / 2}
                fill="none" stroke={color}
                strokeWidth={strokeWidth} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
            />
        </svg>
    )
})

/* ─────────────────────────────────────────
   Question Accordion Card (Memoized)
───────────────────────────────────────── */
const QuestionCard = React.memo(({ item, index, badgeColor = 'bg-accent/10 text-accent border border-accent/20', isBehavioral = false }) => {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = (e) => {
        e.stopPropagation()
        if (!item.answer) return
        navigator.clipboard.writeText(item.answer)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`rounded-2xl transition-all duration-200 border ${
            open
                ? 'bg-surface/90 border-border shadow-lg shadow-black/20'
                : 'bg-surface/50 border-border/60 hover:bg-surface/80 hover:border-border/80'
        }`}>
            <button
                type="button"
                className="w-full flex items-start gap-3.5 p-4 sm:p-5 text-left focus:outline-none cursor-pointer"
                onClick={() => setOpen(o => !o)}
            >
                <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-inner ${badgeColor}`}>
                    {String(index + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className={`text-sm sm:text-base font-medium leading-snug transition-colors duration-200 ${
                        open ? 'text-primary' : 'text-primary/90'
                    }`}>
                        {item.question}
                    </p>
                </div>
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-surface/80 border border-border/60 text-secondary transition-transform duration-300 ${
                    open ? 'rotate-180 bg-surface text-primary' : ''
                }`}>
                    <Icon name="chevron-down" className="w-3.5 h-3.5" />
                </div>
            </button>

            <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3.5 border-t border-border/40 pt-4">
                        {/* Intention Section */}
                        {item.intention && (
                            <div className="bg-background/60 rounded-xl p-3.5 border border-border/50">
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Icon name="target" className="w-3 h-3 text-accent" /> Why Interviewers Ask This
                                </p>
                                <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                                    {item.intention}
                                </p>
                            </div>
                        )}

                        {/* Model Answer Section */}
                        <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5">
                                    <Icon name="sparkle" className="w-3 h-3 text-accent" /> Model Answer Framework
                                </p>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-secondary hover:text-primary bg-surface border border-border/60 hover:border-border transition-colors cursor-pointer"
                                >
                                    {copied ? (
                                        <>
                                            <Icon name="check" className="w-3 h-3 text-emerald-400" />
                                            <span className="text-emerald-400">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="copy" className="w-3 h-3" />
                                            <span>Copy Answer</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className={`text-xs sm:text-sm text-primary/95 leading-relaxed rounded-xl p-4 border border-border/60 ${
                                isBehavioral ? 'bg-violet-500/5' : 'bg-surface/70'
                            }`}>
                                {item.answer}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})

/* ─────────────────────────────────────────
   Skill Gap Card (Memoized)
───────────────────────────────────────── */
const SkillGapCard = React.memo(({ gap }) => {
    const resources = gap.skillRef?.resources ?? []
    const severityKey = gap.severity?.toLowerCase()

    return (
        <div className="rounded-2xl p-4 sm:p-5 border border-border/70 bg-surface/60 hover:bg-surface/80 transition-colors duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${
                        severityKey === 'high' ? 'bg-red-500 ring-4 ring-red-500/20' : severityKey === 'medium' ? 'bg-amber-500 ring-4 ring-amber-500/20' : 'bg-blue-500 ring-4 ring-blue-500/20'
                    }`} />
                    <h3 className="text-sm sm:text-base font-semibold text-primary tracking-tight">{gap.skill}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase self-start sm:self-auto ${
                    SEVERITY_STYLES[severityKey] ?? SEVERITY_STYLES.low
                }`}>
                    {gap.severity ?? 'low'} Priority
                </span>
            </div>

            {resources.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                    {resources.map((resource) => (
                        <a
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-surface/80 hover:bg-surface hover:border-accent/40 transition-all duration-200"
                        >
                            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border/80 shadow-inner group-hover:scale-105 transition-transform duration-200">
                                {resource.type === 'VIDEO' ? <YouTubeLogo /> : <DocsLogo />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-primary/90 group-hover:text-primary transition-colors duration-200 truncate">
                                    {resource.title || (resource.type === 'VIDEO' ? 'Watch Tutorial' : 'Read Documentation')}
                                </p>
                                <p className="text-[9px] text-secondary uppercase tracking-wider mt-0.5">
                                    {resource.type === 'VIDEO' ? 'YouTube Guide' : 'Official Docs'}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            ) : (
                <div className="flex items-center gap-2 p-3 mt-2 rounded-xl bg-surface/40 border border-border/40 text-xs text-secondary">
                    <Icon name="help-circle" className="w-3.5 h-3.5 shrink-0" />
                    <span>No curated resources identified. Review foundational documentation for this topic.</span>
                </div>
            )}
        </div>
    )
})

/* ─────────────────────────────────────────
   Roadmap Day Timeline (Memoized)
───────────────────────────────────────── */
const RoadmapDay = React.memo(({ day, index, total }) => (
    <div className="relative flex gap-3.5 sm:gap-5 pb-6 group">
        {index < total - 1 && (
            <div className="absolute left-[19px] sm:left-5 top-11 bottom-0 w-[2px] bg-gradient-to-b from-accent/40 to-accent/5" />
        )}
        <div className="relative z-10 shrink-0 w-10 h-10 rounded-2xl flex flex-col items-center justify-center bg-surface border border-border/80 shadow-[0_0_12px_rgba(255,102,98,0.1)] group-hover:border-accent/50 transition-colors duration-300">
            <span className="text-[7px] font-bold text-secondary uppercase tracking-widest leading-none mb-0.5">Day</span>
            <span className="text-sm font-bold text-accent leading-none">{day.day}</span>
        </div>
        <div className="flex-1 bg-surface/60 border border-border/60 rounded-2xl p-4 sm:p-5 hover:bg-surface/80 transition-colors duration-200">
            <h3 className="text-sm sm:text-base font-semibold text-primary mb-2.5 flex items-center gap-2">
                <Icon name="target" className="text-accent w-4 h-4 shrink-0" />
                {day.focus}
            </h3>
            <ul className="space-y-2">
                {day.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-primary/85 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 shadow-[0_0_6px_rgba(255,102,98,0.6)]" />
                        {task}
                    </li>
                ))}
            </ul>
        </div>
    </div>
))

/* ─────────────────────────────────────────
   Skeleton Loader
───────────────────────────────────────── */
const SkeletonLoader = () => (
    <div className="w-full animate-pulse space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-2">
                <Skeleton width="160px" height="1.5rem" />
                <Skeleton width="340px" height="2.5rem" />
            </div>
            <Skeleton width="160px" height="2.5rem" />
        </div>
        <Skeleton width="300px" height="1.25rem" />
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-64 shrink-0 space-y-3">
                <Skeleton height="14rem" />
            </div>
            <div className="flex-1 w-full space-y-3">
                <Skeleton height="4.5rem" />
                <Skeleton height="4.5rem" />
                <Skeleton height="4.5rem" />
            </div>
        </div>
    </div>
)

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
const InterviewReport = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const [isExporting, setIsExporting] = useState(false)
    const { report, getReportById, loading } = useInterview()
    const { interviewId } = useParams()

    useEffect(() => {
        window.scrollTo(0, 0)
        if (interviewId) getReportById(interviewId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewId])

    const handleExportPdf = useCallback(async () => {
        if (!report || isExporting) return
        setIsExporting(true)
        try {
            await exportReportPdf(report)
        } catch (err) {
            console.error('Failed exporting report PDF:', err)
        } finally {
            setIsExporting(false)
        }
    }, [report, isExporting])

    if (loading || !report) return <SkeletonLoader />

    const skillGaps       = report.skillGaps ?? []
    const totalQuestions  = report.technicalQuestions.length + report.behavioralQuestions.length
    const scoreColor      = report.matchScore >= 80 ? '#34d399' : report.matchScore >= 60 ? '#fbbf24' : '#f87171'
    const scoreLabel      = report.matchScore >= 80 ? 'Strong Match' : report.matchScore >= 60 ? 'Moderate Match' : 'Low Match'
    const scoreLabelColor = report.matchScore >= 80 ? 'text-emerald-400' : report.matchScore >= 60 ? 'text-amber-400' : 'text-red-400'
    const matchBadgeClass = report.matchScore >= 80
        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        : report.matchScore >= 60
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        : 'bg-red-500/10 border-red-500/30 text-red-400'

    return (
        <div className="animate-fade-in w-full pb-16">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5 pb-5 border-b border-border/50">
                <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider">
                        <Icon name="sparkle" className="w-3.5 h-3.5" /> AI Analysis Complete
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight">
                        {report.title || 'Interview Strategy Report'}
                    </h1>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold ${matchBadgeClass}`}>
                        <Icon name="target" className="w-3.5 h-3.5" />
                        {report.matchScore}% {scoreLabel}
                    </div>

                    <button
                        id="export-pdf-btn"
                        onClick={handleExportPdf}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-primary bg-accent hover:opacity-90 active:scale-95 disabled:opacity-60 transition-all duration-200 shadow-[0_0_20px_rgba(255,102,98,0.25)] cursor-pointer whitespace-nowrap"
                    >
                        {isExporting ? (
                            <>
                                <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <span>Generating PDF...</span>
                            </>
                        ) : (
                            <>
                                <Icon name="download" className="w-4 h-4" />
                                <span>Download PDF</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Inline Stats Strip ── */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6 p-3.5 sm:p-4 rounded-2xl bg-surface/50 border border-border/60 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-primary font-bold text-sm sm:text-base">{totalQuestions}</span>
                    <span className="text-secondary">Total Questions</span>
                </div>
                <span className="hidden sm:inline-block w-px h-4 bg-border/80" />
                <div className="flex items-center gap-2">
                    <span className="text-primary font-bold text-sm sm:text-base">{skillGaps.length}</span>
                    <span className="text-secondary">Skill Gaps</span>
                </div>
                <span className="hidden sm:inline-block w-px h-4 bg-border/80" />
                <div className="flex items-center gap-2">
                    <span className="text-primary font-bold text-sm sm:text-base">{report.preparationPlan.length} Days</span>
                    <span className="text-secondary">Preparation Plan</span>
                </div>
                <div className="sm:hidden ml-auto">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold ${matchBadgeClass}`}>
                        {report.matchScore}% Match
                    </span>
                </div>
            </div>

            {/* ── Mobile Tab Navigation (Horizontal Pills) ── */}
            <div className="md:hidden flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveNav(item.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-all duration-200 ${
                            activeNav === item.id
                                ? 'bg-accent/15 border-accent/40 text-primary shadow-sm'
                                : 'bg-surface/60 border-border/60 text-secondary hover:text-primary hover:bg-surface'
                        }`}
                    >
                        <Icon name={item.icon} className="w-3.5 h-3.5" />
                        <span>{item.short}</span>
                        {item.id === 'skills' && skillGaps.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-accent text-background">
                                {skillGaps.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Main Layout: Sticky Sidebar + Content ── */}
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start relative">

                {/* ── Pinned Sticky Sidebar on Desktop/Tablet ── */}
                <aside className="hidden md:flex flex-col w-60 lg:w-72 shrink-0 sticky top-20 self-start space-y-4">
                    <nav className="p-2.5 rounded-2xl bg-surface/80 backdrop-blur-xl border border-border/80 shadow-xl space-y-1">
                        {NAV_ITEMS.map(item => {
                            const isActive = activeNav === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveNav(item.id)}
                                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left border cursor-pointer ${
                                        isActive
                                            ? 'bg-accent/15 text-primary border-accent/30 shadow-inner'
                                            : 'text-secondary hover:text-primary hover:bg-surface/70 border-transparent'
                                    }`}
                                >
                                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                                        isActive ? 'bg-accent text-background shadow-md' : 'bg-surface border border-border/60 text-secondary'
                                    }`}>
                                        <Icon name={item.icon} className="w-4 h-4" />
                                    </div>
                                    <span className="truncate">{item.label}</span>
                                    {item.id === 'skills' && skillGaps.length > 0 && (
                                        <span className={`ml-auto shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            isActive ? 'bg-accent text-background' : 'bg-surface border border-border/60 text-primary/90'
                                        }`}>
                                            {skillGaps.length}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </nav>

                    {/* Match Score Card inside Sidebar */}
                    <div className="p-4 rounded-2xl bg-surface/80 backdrop-blur-xl border border-border/80 shadow-xl flex flex-col items-center text-center">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-3">Overall Match Rating</p>
                        <div className="relative mb-2">
                            <ScoreRing score={report.matchScore} color={scoreColor} size={76} strokeWidth={6} />
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-xl font-bold text-primary leading-none">{report.matchScore}%</span>
                            </div>
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${scoreLabelColor}`}>
                            {scoreLabel}
                        </span>
                        <p className="text-[11px] text-secondary mt-1 max-w-[180px]">
                            Calculated from your resume vs. job description match
                        </p>
                    </div>
                </aside>

                {/* ── Main Content Column ── */}
                <main className="flex-1 min-w-0 w-full">

                    {/* Section Header */}
                    <div className="mb-5">
                        <h2 className="text-lg sm:text-xl font-bold text-primary tracking-tight mb-1">
                            {activeNav === 'technical'  && 'Technical Questions & Answers'}
                            {activeNav === 'behavioral' && 'Behavioral & Leadership Questions'}
                            {activeNav === 'skills'     && 'Identified Skill Gaps & Resources'}
                            {activeNav === 'roadmap'    && '10-Day Targeted Preparation Plan'}
                        </h2>
                        <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                            {activeNav === 'technical'  && 'Tailored technical questions generated directly from your resume and target role requirements.'}
                            {activeNav === 'behavioral' && 'Situational and leadership prompts evaluated against the STAR framework.'}
                            {activeNav === 'skills'     && 'Key technical competencies to refresh before your interview, with curated documentation and video tutorials.'}
                            {activeNav === 'roadmap'    && 'A day-by-day structured checklist to build confidence and prepare effectively.'}
                        </p>
                    </div>

                    {/* Section 1: Technical Questions */}
                    {activeNav === 'technical' && (
                        <div className="space-y-3.5">
                            {report.technicalQuestions.map((q, i) => (
                                <QuestionCard
                                    key={i}
                                    item={q}
                                    index={i}
                                    badgeColor="bg-accent/15 text-accent border border-accent/25"
                                    isBehavioral={false}
                                />
                            ))}
                        </div>
                    )}

                    {/* Section 2: Behavioral Questions */}
                    {activeNav === 'behavioral' && (
                        <div className="space-y-3.5">
                            {report.behavioralQuestions.map((q, i) => (
                                <QuestionCard
                                    key={i}
                                    item={q}
                                    index={i}
                                    badgeColor="bg-violet-500/15 text-violet-400 border border-violet-500/25"
                                    isBehavioral={true}
                                />
                            ))}
                        </div>
                    )}

                    {/* Section 3: Skill Gaps */}
                    {activeNav === 'skills' && (
                        <div className="space-y-3.5">
                            {skillGaps.length > 0 ? (
                                skillGaps.map((gap, i) => <SkillGapCard key={i} gap={gap} />)
                            ) : (
                                <div className="rounded-2xl p-8 sm:p-10 border border-border/60 bg-surface/70 text-center shadow-inner">
                                    <div className="w-14 h-14 mx-auto rounded-2xl bg-surface border border-border/80 flex items-center justify-center mb-3.5">
                                        <Icon name="target" className="w-7 h-7 text-accent" />
                                    </div>
                                    <p className="text-base font-semibold text-primary mb-1">No Skill Gaps Identified</p>
                                    <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto leading-relaxed">
                                        Your background aligns seamlessly with the target job requirements. Focus on polishing your technical and behavioral answers!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section 4: Roadmap */}
                    {activeNav === 'roadmap' && (
                        <div className="pt-2">
                            {report.preparationPlan.map((day, i) => (
                                <RoadmapDay
                                    key={day.day}
                                    day={day}
                                    index={i}
                                    total={report.preparationPlan.length}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default InterviewReport
