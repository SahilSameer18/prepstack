const mongoose = require('mongoose');

// One row per reset link that was sent. Only the SHA-256 hash of the link's token is stored, never the token itself,
// so a database leak cannot be used to reset anyone's password. The `user` reference means deleting an account
// removes its reset rows too, and the TTL index lets the database delete expired rows by itself.
const passwordResetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);