const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userModel = require('../models/auth.model');
const { sessionFor } = require('../shared/infra/sessionCache');

const unauthorized = (res, message) =>
  res.status(401).json({ success: false, message, errors: [message] });

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.split(' ')[1]
      : req.cookies?.accessToken;

    if (!token) {
      return unauthorized(res, 'Unauthorized');
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET);

    // The signature alone is not enough: the user must still exist and this login session must still
    // be active (not logged out, revoked, expired or wiped by password change / account deletion).
    // A token without a session id (issued before this check existed) gets the same 401, so the
    // client simply refreshes once and carries on with a new token.
    const { id, sid } = decodedToken;
    // The answer is cached for a few seconds (sessionCache.js); every revoke and calendar change clears it.
    const active = mongoose.isValidObjectId(id) && mongoose.isValidObjectId(sid) && await sessionFor(id, sid, async () => {
      const user = await userModel.findOne({
        _id: id,
        refreshTokens: { $elemMatch: { _id: sid, expiresAt: { $gt: new Date() } } },
      }).select({ studyTimeZone: 1, studyDayStart: 1, 'refreshTokens.$': 1 }).lean();
      return user && { entry: { studyTimeZone: user.studyTimeZone, studyDayStart: user.studyDayStart }, expiresAt: user.refreshTokens[0].expiresAt };
    });
    if (!active) {
      return unauthorized(res, 'Session expired');
    }

    req.user = decodedToken;
    req.user._id = decodedToken.id; // normalize: JWT uses 'id', controllers use '_id'
    // Read current preferences from the account, never from a stale JWT.
    req.user.studyTimeZone = active.studyTimeZone || 'Asia/Kolkata';
    req.user.studyDayStart = active.studyDayStart ?? 0;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Access token expired: client should call /refresh
      return unauthorized(res, 'Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      // Token was tampered with: do not refresh
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
        errors: ['Invalid token']
      });
    }
    next(error);
  }
}

module.exports = authMiddleware;
