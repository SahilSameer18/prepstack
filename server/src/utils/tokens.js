const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// short live (15m)
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

// long live (7d)
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// Cryptographically hashes a high-entropy refresh token using SHA-256 for secure at-rest storage
exports.hashToken = (token) => {
  if (!token) return null;
  return crypto.createHash('sha256').update(token).digest('hex');
};

