const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const userModel = require('../models/auth.model');

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
    const active = mongoose.isValidObjectId(id) && mongoose.isValidObjectId(sid) && await userModel.exists({
      _id: id,
      refreshTokens: { $elemMatch: { _id: sid, expiresAt: { $gt: new Date() } } },
    });
    if (!active) {
      return unauthorized(res, 'Session expired');
    }

    req.user = decodedToken;
    req.user._id = decodedToken.id; // normalize: JWT uses 'id', controllers use '_id'
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
