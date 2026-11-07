const mongoose = require('mongoose');
const Report = require('../models/interviewReport.model');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseFormatter');
const { extractPdfText, prepareResumeText } = require('../services/resume.service');
const { buildContext } = require('../services/analyzerContext.service');
const { analyze } = require('../services/analyzer.service');
const { adviceForReport } = require('../services/skills.service');

// Users with a report being written right now (a second request gets a 409). Kept in server memory, so it resets on
// restart and is per server process: fine for a single instance, the same trade-off as the project-idea generator.
const generatingNow = new Set();

// Most reports one user may save in 24 hours (the hourly limit of 3 stays as well). Counted from the database, so it
// survives restarts. A report is a big AI call and the free AI quota is shared by everyone.
const DAY_MS = 24 * 60 * 60 * 1000;
const dailyLimit = () => {
  const n = Number(process.env.ANALYZER_DAILY_LIMIT);
  return Number.isInteger(n) && n > 0 ? n : 5;
};

// What the browser gets back. The resume is not in here (it is never stored) and neither is the answering model.
const present = (doc) => {
  const o = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete o.__v; delete o.aiProvider;
  // What to do about each gap in PrepStack, and the learning links. Worked out on every read from the catalog and never
  // stored, so an improved catalog improves old reports too.
  o.skillAdvice = adviceForReport(o);
  return o;
};


// POST /api/analyzer
const createReport = async (req, res, next) => {
  const userId = req.user._id;
  const key = String(userId);

  // Set before any await, so two requests in the same instant cannot both pass.
  if (generatingNow.has(key)) return next(new AppError(409, 'Your last report is still being written. Please wait for it to finish.'));
  generatingNow.add(key);

  try {
    const { jobDescription, resumeText, days } = req.body;

    // 1. The resume: an uploaded PDF wins, otherwise the pasted text. Contact details are removed here.
    let raw;
    if (req.file) raw = await extractPdfText(req.file.buffer);
    else if (resumeText && resumeText.trim()) raw = resumeText;
    else return next(new AppError(400, 'Please upload your resume as a PDF or paste its text.'));
    const resume = prepareResumeText(raw);

    // 2. The daily limit (only saved reports count, so a failed attempt costs nothing)
    const limit = dailyLimit();
    const recent = await Report.countDocuments({ user: userId, createdAt: { $gte: new Date(Date.now() - DAY_MS) } });
    if (recent >= limit) return next(new AppError(429, `You've reached the limit of ${limit} reports per 24 hours. Please try again later.`));

    // 3. The AI work. The resume text lives only in this function.
    const ctx = await buildContext();
    const result = await analyze({ resume: resume.text, jobDescription, days }, ctx);

    // 4. Save the report (not the resume)
    const saved = await Report.create({
      user: userId,
      title: result.title,
      jobDescription,
      days,
      score: result.score,
      scoreBreakdown: result.scoreBreakdown,
      requirements: result.requirements,
      priorities: result.priorities,
      technicalQuestions: result.technicalQuestions,
      behavioralQuestions: result.behavioralQuestions.map(({ id, question, resumeAngle }) => ({ id, question, resumeAngle })),
      plan: result.plan,
      codingTopics: result.codingTopics,
      resumeTweaks: result.resumeTweaks,
      checks: result.checks,
      aiProvider: result.aiProvider,
    });

    const report = present(saved);
    return sendSuccess(res, 201, 'Report created successfully', { report, resumeTruncated: resume.truncated }, { report });
  } catch (error) {
    return next(error);
  } finally {
    generatingNow.delete(key); // always cleared: success, failure or the early returns above
  }
};


// GET /api/analyzer?page=1&limit=6
const listReports = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));
    const filter = { user: req.user._id };
    const [reports, totalCount] = await Promise.all([
      Report.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('title score days createdAt checks.requirementsTotal').lean(),
      Report.countDocuments(filter),
    ]);
    return sendSuccess(res, 200, 'Reports fetched successfully', { reports, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) }, { reports, totalCount });
  } catch (error) {
    return next(error);
  }
};


// GET /api/analyzer/:id
const getReport = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError(400, 'Invalid report id'));
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) return next(new AppError(404, 'Report not found'));
    return sendSuccess(res, 200, 'Report fetched successfully', { report: present(report) }, { report: present(report) });
  } catch (error) {
    return next(error);
  }
};


// DELETE /api/analyzer/:id
const deleteReport = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError(400, 'Invalid report id'));
    const deleted = await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return next(new AppError(404, 'Report not found'));
    return sendSuccess(res, 200, 'Report deleted successfully', null);
  } catch (error) {
    return next(error);
  }
};

module.exports = { createReport, listReports, getReport, deleteReport };



