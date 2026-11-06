const userModel = require('../models/auth.model')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/tokens');
const AppError = require('../utils/AppError');
const googleClient = require('../utils/googleClient');
const { generateUniqueUsername, findUserByUsername } = require('../utils/usernameHelper');
const { parseDeviceInfo } = require('../utils/deviceParser');
const { sendSuccess } = require('../utils/responseFormatter');
const { formatUserResponse, defaultAvatar } = require('../utils/userResponse');

// ── Helpers ───────────────────────────────────────────────────────────────────

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SESSIONS = 10;
// After a refresh token is rotated, the previous one still works for this long. Two tabs that refresh
// at the same moment both send the same old token; without this the slower tab is logged out.
const REFRESH_GRACE_MS = 10 * 1000;

// Adds a login session (hashed refresh token + device telemetry) to the user's multi-device pool.
// Atomic updates on purpose: load-then-save of the whole array loses data (or throws a VersionError)
// when two requests for the same user overlap.
const createSession = async (userId, sid, refreshToken, req) => {
  const deviceInfo = req ? parseDeviceInfo(req) : {
    device: "Unknown Device",
    browser: "Unknown Browser",
    os: "Unknown OS",
    ip: "Unknown IP"
  };
  const now = new Date();

  // Prune expired sessions
  await userModel.updateOne({ _id: userId }, { $pull: { refreshTokens: { expiresAt: { $lte: now } } } });

  // Add the new session; $slice keeps only the newest MAX_SESSIONS devices
  await userModel.updateOne({ _id: userId }, {
    $push: {
      refreshTokens: {
        $each: [{
          _id: sid,
          tokenHash: hashToken(refreshToken),
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          ip: deviceInfo.ip,
          lastActive: now,
          expiresAt: new Date(now.getTime() + SESSION_TTL_MS)
        }],
        $slice: -MAX_SESSIONS
      }
    }
  });
};

// ── Cookie options (DRY) ──────────────────────────────────────────────────────

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 15 * 60 * 1000,           // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Starts a new login session for `user` and sets both auth cookies (used by register, login, Google login)
const startSession = async (user, req, res) => {
  const sid = new mongoose.Types.ObjectId();
  const accessToken = generateAccessToken(user, sid);
  const refreshToken = generateRefreshToken(user);

  await createSession(user._id, sid, refreshToken, req);

  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
};

// ── Register ──────────────────────────────────────────────────────────────────

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return next(new AppError(409, 'An account with this email already exists'));
    }

    const existingUsername = await findUserByUsername(userModel, username);
    if (existingUsername) {
      return next(new AppError(409, 'Username is already taken. Please choose another.'));
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await userModel.create({ 
      username, 
      email, 
      password: hash,
      avatar: defaultAvatar(username) 
    });

    await startSession(user, req, res);

    const userResponse = formatUserResponse(user);
    sendSuccess(res, 201, 'User registered successfully', { user: userResponse }, { user: userResponse });
  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return next(new AppError(401, 'Invalid email or password'));
    }

    if (!user.password) {
      return next(new AppError(401, 'This account uses Google Sign-In. Please click "Continue with Google" to log in.'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError(401, 'Invalid email or password'));
    }

    await startSession(user, req, res);

    const userResponse = formatUserResponse(user);
    sendSuccess(res, 200, 'User logged in successfully', { user: userResponse }, { user: userResponse });
  } catch (error) {
    next(error);
  }
};

// ── Logout (Current Device) ───────────────────────────────────────────────────

const logoutUser = async (req, res, next) => {
  try {
    // Remove only the current device's session (identified by the access token), leaving other devices active
    await userModel.updateOne({ _id: req.user._id }, { $pull: { refreshTokens: { _id: req.user.sid } } });

    const CLEAR_OPTIONS = { httpOnly: true, secure: true, sameSite: 'none' };
    res.clearCookie('accessToken', CLEAR_OPTIONS);
    res.clearCookie('refreshToken', CLEAR_OPTIONS);

    sendSuccess(res, 200, 'User logged out successfully', null);
  } catch (error) {
    next(error);
  }
};

// ── Logout All Devices (Global Revocation) ────────────────────────────────────

const logoutAllDevices = async (req, res, next) => {
  try {
    // Invalidate all active device sessions globally
    await userModel.updateOne({ _id: req.user._id }, { $set: { refreshTokens: [] } });

    const CLEAR_OPTIONS = { httpOnly: true, secure: true, sameSite: 'none' };
    res.clearCookie('accessToken', CLEAR_OPTIONS);
    res.clearCookie('refreshToken', CLEAR_OPTIONS);

    sendSuccess(res, 200, 'Signed out of all devices successfully', null);
  } catch (error) {
    next(error);
  }
};

// ── Get current user ──────────────────────────────────────────────────────────

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }
    const userResponse = formatUserResponse(user);
    sendSuccess(res, 200, 'Current user fetched successfully', { user: userResponse }, { user: userResponse });
  } catch (error) {
    next(error);
  }
};

// ── Refresh access token (Multi-Device & Hashed Rotation) ────────────────────

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return next(new AppError(401, 'No refresh token provided'));
    }

    // Will throw JsonWebTokenError or TokenExpiredError on bad/expired tokens:
    // the centralized error handler maps these to 403/401 automatically.
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const incomingHash = hashToken(token);
    const now = new Date();
    const newRefreshToken = generateRefreshToken({ _id: decoded.id, username: decoded.username });

    // Single-use rotation as ONE atomic compare-and-swap: the session is only updated if it still holds
    // the token we were sent. If two requests race with the same token, exactly one wins; the old
    // load-modify-save version let both read it and the loser crashed with a VersionError (500).
    // The session keeps its _id, so the access token's session id stays valid across rotations.
    const rotated = await userModel.findOneAndUpdate(
      { _id: decoded.id, refreshTokens: { $elemMatch: { tokenHash: incomingHash, expiresAt: { $gt: now } } } },
      {
        $set: {
          'refreshTokens.$.tokenHash': hashToken(newRefreshToken),
          'refreshTokens.$.prevTokenHash': incomingHash,
          'refreshTokens.$.rotatedAt': now,
          'refreshTokens.$.lastActive': now,
          'refreshTokens.$.expiresAt': new Date(now.getTime() + SESSION_TTL_MS),
        },
      },
      { returnDocument: 'after', projection: { username: 1, refreshTokens: 1 } }
    );

    if (rotated) {
      const session = rotated.refreshTokens.find((t) => t.tokenHash === hashToken(newRefreshToken));
      res.cookie('accessToken', generateAccessToken(rotated, session._id), ACCESS_COOKIE_OPTIONS);
      res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
      return sendSuccess(res, 200, 'Token refreshed', null);
    }

    // Lost the race (or an old token was replayed). If this exact token was rotated just now, the browser
    // already received the winner's new refresh cookie, so only hand out a fresh access token and leave the
    // refresh cookie alone. Anything older than the grace window is rejected.
    const justRotated = await userModel.findOne(
      {
        _id: decoded.id,
        refreshTokens: {
          $elemMatch: {
            prevTokenHash: incomingHash,
            rotatedAt: { $gt: new Date(now.getTime() - REFRESH_GRACE_MS) },
            expiresAt: { $gt: now },
          },
        },
      },
      { username: 1, 'refreshTokens.$': 1 }
    );

    if (!justRotated) {
      return next(new AppError(403, 'Invalid or expired refresh token'));
    }

    res.cookie('accessToken', generateAccessToken(justRotated, justRotated.refreshTokens[0]._id), ACCESS_COOKIE_OPTIONS);
    sendSuccess(res, 200, 'Token refreshed', null);
  } catch (error) {
    next(error);
  }
};

// ── Google OAuth ──────────────────────────────────────────────────────────────

const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, email_verified, name, sub: googleId, picture } = payload;

    if (!email_verified) {
      return next(new AppError(400, "Google account email is not verified. Please verify your email with Google and try again."));
    }

    // Ignore Google's default first-letter avatar
    const isDefaultGooglePic = !picture || picture.includes('default-user');
    const validGooglePicture = isDefaultGooglePic ? null : picture;

    let user = await userModel.findOne({ 'providers.providerName': 'google', 'providers.providerId': googleId });

    if (user) {
      // Existing Google user
      if (validGooglePicture && user.avatar !== validGooglePicture) {
        user.avatar = validGooglePicture;
        await user.save();
      }
    } else {
      // Not found by Google ID, check by email
      user = await userModel.findOne({ email });

      if (user) {
        // Email exists, but no Google provider linked -> Conflict
        return next(new AppError(409, "An account with this email already exists. Please log in with your password to link your Google identity."));
      } else {
        // New user registration
        let username = await generateUniqueUsername(name, userModel);
        let created = false;
        let attempts = 0;

        while (!created && attempts < 2) {
          try {
            user = await userModel.create({
              username,
              email,
              avatar: validGooglePicture || defaultAvatar(username),
              providers: [{ providerName: 'google', providerId: googleId }]
            });
            created = true;
          } catch (err) {
            if (err.code === 11000 && err.keyValue?.username) {
              attempts++;
              username = await generateUniqueUsername(name + " " + Math.floor(Math.random() * 1000), userModel);
            } else {
              throw err;
            }
          }
        }

        if (!created) {
          return next(new AppError(500, "Failed to generate a unique username. Please try again."));
        }
      }
    }

    await startSession(user, req, res);

    const userResponse = formatUserResponse(user);
    sendSuccess(res, 200, 'Logged in with Google successfully', { user: userResponse }, { user: userResponse });
  } catch (error) {
    next(error);
  }
};

const linkGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { email, email_verified, sub: googleId, picture } = payload;

    if (!email_verified) {
      return next(new AppError(400, "Google account email is not verified."));
    }

    // Ignore Google's default first-letter avatar
    const isDefaultGooglePic = !picture || picture.includes('default-user');
    const validGooglePicture = isDefaultGooglePic ? null : picture;

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return next(new AppError(404, "User not found."));
    }

    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return next(new AppError(403, "The Google account email does not match your account email."));
    }

    const existingLink = await userModel.findOne({ 
      'providers.providerName': 'google', 
      'providers.providerId': googleId, 
      _id: { $ne: req.user._id } 
    });

    if (existingLink) {
      return next(new AppError(409, "This Google account is already linked to another PrepStack account."));
    }

    const isAlreadyLinkedToThis = user.providers && user.providers.some(p => p.providerName === 'google' && p.providerId === googleId);

    if (isAlreadyLinkedToThis) {
      const userResponse = formatUserResponse(user);
      return sendSuccess(res, 200, 'Google account is already linked.', { user: userResponse }, { user: userResponse });
    }

    if (!user.providers) {
      user.providers = [];
    }
    user.providers.push({ providerName: 'google', providerId: googleId });

    // If the Google account has a real profile picture, overwrite the current avatar (usually DiceBear)
    if (validGooglePicture) {
      user.avatar = validGooglePicture;
    }

    await user.save();

    const userResponse = formatUserResponse(user);
    sendSuccess(res, 200, 'Google account linked successfully.', { user: userResponse }, { user: userResponse });
  } catch (error) {
    next(error);
  }
};

const setPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 8) {
      return next(new AppError(400, "Password must be at least 8 characters long"));
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    if (user.password) {
      return next(new AppError(400, "This account already has a password set."));
    }

    const hash = await bcrypt.hash(password, 12);
    user.password = hash;
    await user.save();

    const userResponse = formatUserResponse(user);
    sendSuccess(res, 200, 'Password set successfully', { user: userResponse }, { user: userResponse });
  } catch (error) {
    next(error);
  }
};

// ── Get Active Sessions ───────────────────────────────────────────────────────

const getActiveSessions = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    const now = new Date();

    const activeSessions = (user.refreshTokens || [])
      .filter((t) => t.expiresAt && t.expiresAt > now)
      .map((t) => ({
        id: t._id ? t._id.toString() : undefined,
        device: t.device || 'Unknown Device',
        browser: t.browser || 'Unknown Browser',
        os: t.os || 'Unknown OS',
        ip: t.ip || 'Unknown IP',
        lastActive: t.lastActive || t.createdAt,
        createdAt: t.createdAt,
        isCurrent: String(t._id) === req.user.sid
      }))
      .sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0) || new Date(b.lastActive) - new Date(a.lastActive));

    res.status(200).json({
      success: true,
      message: 'Active sessions retrieved successfully',
      data: {
        sessions: activeSessions
      }
    });
  } catch (error) {
    next(error);
  }
};

// ── Revoke Specific Session ───────────────────────────────────────────────────

const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Remove the selected session (own sessions only: the query is scoped to the logged-in user).
    // Match on the session in the filter and check matchedCount: modifiedCount is useless here because
    // mongoose timestamps make every updateOne "modify" updatedAt.
    const result = mongoose.isValidObjectId(sessionId)
      ? await userModel.updateOne(
          { _id: req.user._id, 'refreshTokens._id': sessionId },
          { $pull: { refreshTokens: { _id: sessionId } } }
        )
      : { matchedCount: 0 };

    if (result.matchedCount === 0) {
      return next(new AppError(404, 'Session not found or already revoked'));
    }

    const isCurrentRevoked = sessionId === req.user.sid;

    // If the user revoked their own current session, clear their cookies
    if (isCurrentRevoked) {
      const CLEAR_OPTIONS = { httpOnly: true, secure: true, sameSite: 'none' };
      res.clearCookie('accessToken', CLEAR_OPTIONS);
      res.clearCookie('refreshToken', CLEAR_OPTIONS);
    }

    res.status(200).json({
      success: true,
      message: isCurrentRevoked 
        ? 'Current session revoked. You have been signed out.' 
        : 'Device session revoked successfully.',
      data: {
        isCurrentRevoked
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser, 
  logoutAllDevices, 
  getCurrentUser, 
  refreshAccessToken, 
  googleLogin, 
  linkGoogle, 
  setPassword,
  getActiveSessions,
  revokeSession
};