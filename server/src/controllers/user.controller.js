const mongoose = require('mongoose');
const userModel = require('../models/auth.model');
const projectModel = require('../models/project.model');
const progressModel = require('../models/progress.model');
const PasswordReset = require('../models/passwordReset.model');
const DSASheet = require('../models/sheets.model');
const AppError = require('../utils/AppError');
const { findUserByUsername } = require('../utils/usernameHelper');
const bcrypt = require('bcrypt');
const { formatUserResponse } = require('../utils/userResponse');
const { sendSuccess } = require('../utils/responseFormatter');

// The ONE place that decides how many problems a user has solved: only links that still exist in a sheet,
// each counted once (a link repeated in two topics is one problem). Used by both stats endpoints so they agree.
const summarizeProgress = (sheets, userProgress) => {
  const progressMap = new Map(userProgress.map((p) => [p.sheetSlug, p.solvedProblems || []]));

  let totalSolved = 0;
  let totalQuestions = 0;
  let sheetsInProgress = 0;
  let sheetsCompleted = 0;

  const dsaSheets = sheets.map((sheet) => {
    const linkSet = new Set();
    (sheet.topics || []).forEach((t) => {
      (t.problems || []).forEach((p) => {
        if (p.link) linkSet.add(p.link);
      });
    });

    const total = linkSet.size;
    const solved = new Set((progressMap.get(sheet.slug) || []).filter((link) => linkSet.has(link))).size;

    totalSolved += solved;
    totalQuestions += total;
    if (solved > 0 && solved < total) sheetsInProgress++;
    if (solved > 0 && total > 0 && solved >= total) sheetsCompleted++;

    return {
      sheet: {
        name: sheet.name,
        slug: sheet.slug,
        description: sheet.description || '',
      },
      solved,
      total,
    };
  });

  return { totalSolved, totalQuestions, sheetsInProgress, sheetsCompleted, dsaSheets };
};

// Parallel server queries: all DSA sheets, the user's progress records, and the project count
const loadProgressData = (userId) => Promise.all([
  DSASheet.find({}, 'name slug description topics.problems.link'),
  progressModel.find({ user: userId }),
  projectModel.countDocuments({ user: userId })
]);

// ── Get user stats ────────────────────────────────────────────────────────────

const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [sheets, userProgress, generatedProjectsCount] = await loadProgressData(userId);
    const { totalSolved } = summarizeProgress(sheets, userProgress);

    const stats = {
      generatedProjectsCount,
      solvedDSACount: totalSolved
    };

    sendSuccess(res, 200, 'User stats fetched successfully', { stats }, { stats });
  } catch (error) {
    next(error);
  }
};

// ── Get unified dashboard summary (single roundtrip server aggregator) ────────

const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [sheets, userProgress, generatedProjectsCount] = await loadProgressData(userId);
    const { totalSolved, totalQuestions, sheetsInProgress, sheetsCompleted, dsaSheets } =
      summarizeProgress(sheets, userProgress);

    const overallPct =
      totalQuestions === 0
        ? 0
        : Math.round((totalSolved / totalQuestions) * 100);

    sendSuccess(res, 200, 'Dashboard summary fetched successfully', {
      stats: {
        totalSolved,
        totalQuestions,
        sheetsInProgress,
        sheetsCompleted,
        overallPct,
        generatedProjectsCount,
      },
      dsaSheets,
    });
  } catch (error) {
    next(error);
  }
};

// ── Update user profile (username, avatar only, email is immutable) ───────────

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { username, avatar } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    // Check if username is being changed and is already taken by someone else (case-insensitive)
    if (username && username.trim() !== user.username) {
      const cleanUsername = username.trim();
      const existingUsername = await findUserByUsername(userModel, cleanUsername, userId);
      if (existingUsername) {
        return next(new AppError(409, 'This username is already taken. Please choose a unique username.'));
      }
      user.username = cleanUsername;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    const userResponse = formatUserResponse(user);
    sendSuccess(res, 200, 'Profile updated successfully', { user: userResponse }, { user: userResponse });
  } catch (error) {
    next(error);
  }
};

// ── Change user password ───────────────────────────────────────────────────────

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    if (!user.password) {
      return next(new AppError(400, 'This account is managed with Google Sign-In and does not have a password set. Please use "Set Password" first.'));
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return next(new AppError(401, 'Incorrect current password'));
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return next(new AppError(400, 'New password must be different from your current password'));
    }

    const hash = await bcrypt.hash(newPassword, 12);

    // One atomic write: set the new password and sign out every other device (keep only this session,
    // identified by the access token). Their access tokens stop working immediately too.
    await userModel.updateOne(
      { _id: userId },
      { $set: { password: hash }, $pull: { refreshTokens: { _id: { $ne: req.user.sid } } } }
    );

    // An emailed reset link that is still waiting must not work after the password was changed here
    await PasswordReset.deleteMany({ user: userId });

    const userResponse = formatUserResponse(user);
    sendSuccess(res, 200, 'Password changed successfully. Other active devices have been signed out.', { user: userResponse }, { user: userResponse });
  } catch (error) {
    next(error);
  }
};

// ── Delete user account & cascade personal data (GDPR Right to Erasure) ──────

// Every model with a `user` field that references the User model is wiped automatically, so a new
// collection of personal data can't be forgotten here (just give it `user: { ref: 'User' }`).
const userOwnedModels = () => mongoose.modelNames()
  .map((name) => mongoose.model(name))
  .filter((model) => model !== userModel && model.schema.path('user')?.options?.ref === userModel.modelName);

const wipeUserData = async (userId, session) => {
  const options = session ? { session } : {};
  for (const model of userOwnedModels()) {
    await model.deleteMany({ user: userId }, options);
  }
  await userModel.findByIdAndDelete(userId, options);
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { password, confirmationEmail } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    // Security Verification:
    // 1. If account has a password, verify it
    if (user.password) {
      if (!password) {
        return next(new AppError(400, 'Please enter your password to confirm account deletion.'));
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(new AppError(401, 'Incorrect password. Verification failed.'));
      }
    } else {
      // 2. Google OAuth account with no password set: verify email matches
      if (!confirmationEmail || confirmationEmail.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
        return next(new AppError(400, 'Please enter your account email correctly to confirm deletion.'));
      }
    }

    // Atomic Cascade Deletion across all collections
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(() => wipeUserData(userId, session));
    } catch (txError) {
      // Fallback for standalone local MongoDB instances that do not support replica set transactions
      if (
        txError.message?.includes('replica set member') ||
        txError.message?.includes('retryable writes') || // wording used by newer MongoDB drivers
        txError.codeName === 'IllegalOperation' ||
        txError.code === 20
      ) {
        await wipeUserData(userId);
      } else {
        throw txError;
      }
    } finally {
      await session.endSession();
    }

    // Clear authentication cookies
    const CLEAR_OPTIONS = { httpOnly: true, secure: true, sameSite: 'none' };
    res.clearCookie('accessToken', CLEAR_OPTIONS);
    res.clearCookie('refreshToken', CLEAR_OPTIONS);

    sendSuccess(res, 200, 'Your account and all associated data have been permanently deleted.', null);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserStats, getDashboardSummary, updateProfile, changePassword, deleteAccount };

