const userModel = require('../models/auth.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');
const AppError = require('../utils/AppError');

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

// ── Register ──────────────────────────────────────────────────────────────────

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return next(new AppError(409, 'An account with this email already exists'));
    }

    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      return next(new AppError(409, 'Username is already taken. Please choose another.'));
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await userModel.create({ username, email, password: hash });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userModel.findByIdAndUpdate(user._id, { refreshToken });

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user._id, username: user.username, email: user.email },
    });
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

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError(401, 'Invalid email or password'));
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userModel.findByIdAndUpdate(user._id, { refreshToken });

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────

const logoutUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (user) {
      await userModel.findByIdAndUpdate(user._id, { refreshToken: null });
    }

    const CLEAR_OPTIONS = { httpOnly: true, secure: true, sameSite: 'none' };
    res.clearCookie('accessToken', CLEAR_OPTIONS);
    res.clearCookie('refreshToken', CLEAR_OPTIONS);

    res.status(200).json({ success: true, message: 'User logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// ── Get current user ──────────────────────────────────────────────────────────

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return next(new AppError(404, 'User not found'));
    }
    res.status(200).json({
      success: true,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ── Refresh access token ──────────────────────────────────────────────────────

const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return next(new AppError(401, 'No refresh token provided'));
    }

    // Will throw JsonWebTokenError or TokenExpiredError on bad/expired tokens —
    // the centralized error handler maps these to 403/401 automatically.
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return next(new AppError(403, 'Invalid refresh token'));
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await userModel.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    res.cookie('accessToken', newAccessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken };
