const userModel = require('../models/auth.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');
const AppError = require('../utils/AppError');
const googleClient = require('../utils/googleClient');
const { generateUniqueUsername } = require('../utils/usernameHelper');

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatUserResponse = (user) => {
  const dicebearAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username)}`;
  
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || dicebearAvatar,
    providers: user.providers || [],
    hasPassword: !!user.password,
    createdAt: user.createdAt
  };
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

    const dicebearAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    const user = await userModel.create({ 
      username, 
      email, 
      password: hash,
      avatar: dicebearAvatar 
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userModel.findByIdAndUpdate(user._id, { refreshToken });

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: formatUserResponse(user),
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

    if (!user.password) {
      return next(new AppError(401, 'This account uses Google Sign-In. Please click "Continue with Google" to log in.'));
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
      user: formatUserResponse(user),
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
      user: formatUserResponse(user),
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
            const dicebearAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
            user = await userModel.create({
              username,
              email,
              avatar: validGooglePicture || dicebearAvatar,
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userModel.findByIdAndUpdate(user._id, { refreshToken });

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Logged in with Google successfully',
      user: formatUserResponse(user),
    });
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

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return next(new AppError(404, "User not found."));
    }

    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return next(new AppError(403, "The Google account email does not match your account email."));
    }

    const existingLink = await userModel.findOne({ 
      'providers.providerName': 'google', 
      'providers.providerId': googleId, 
      _id: { $ne: req.user.id } 
    });

    if (existingLink) {
      return next(new AppError(409, "This Google account is already linked to another PrepStack account."));
    }

    const isAlreadyLinkedToThis = user.providers && user.providers.some(p => p.providerName === 'google' && p.providerId === googleId);

    if (isAlreadyLinkedToThis) {
      return res.status(200).json({
        success: true,
        message: 'Google account is already linked.',
        user: formatUserResponse(user),
      });
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

    res.status(200).json({
      success: true,
      message: 'Google account linked successfully.',
      user: formatUserResponse(user),
    });
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

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    if (user.password) {
      return next(new AppError(400, "This account already has a password set."));
    }

    const hash = await bcrypt.hash(password, 12);
    user.password = hash;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password set successfully',
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser, refreshAccessToken, googleLogin, linkGoogle, setPassword };

