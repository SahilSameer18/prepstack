const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// short live (15m). `sid` is the id of the login session (a refreshTokens subdocument) this token
// belongs to; the auth middleware checks it still exists, so logout/revoke/delete take effect at once.
exports.generateAccessToken = (user, sid) => {
  return jwt.sign(
    { id: user._id, username: user.username, sid: String(sid) },
    process.env.ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

// long live (7d). The random jwtid makes every token unique: without it, two tokens signed for the
// same user in the same second are byte-identical (same hash, so rotation and revocation can't tell them apart).
exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d', jwtid: crypto.randomUUID() }
  );
};

// Cryptographically hashes a high-entropy refresh token using SHA-256 for secure at-rest storage
exports.hashToken = (token) => {
  if (!token) return null;
  return crypto.createHash('sha256').update(token).digest('hex');
};

