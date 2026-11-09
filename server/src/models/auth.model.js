const mongoose = require('mongoose');
const { USERNAME_COLLATION } = require('../utils/usernameHelper');

const userSchema = new mongoose.Schema({

  username: {
    type: String,
    required: [true, 'Username is required'],
    // plain `unique: true` on purpose: with a [true, 'message'] array mongoose swallows the duplicate-key error code,
    // so the error handler (409) and the Google sign-up retry (which look for code 11000) never recognise it
    unique: true,
    trim: true,
    minLength: [4, 'Username must be at least 4 characters'],
    maxLength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    // Password is only required when the user has no linked OAuth providers.
    // Google-only users will have providers.length > 0 and no password set.
    // The stored value is a bcrypt hash, so password length/strength is enforced in the zod validators instead.
    required: function() {
      return !this.providers || this.providers.length === 0;
    }
  },
  // Supports multiple OAuth providers (Google, GitHub, etc.) for future expansion
  providers: [{
    providerName: {
      type: String,
      enum: ['google', 'github'],
      required: true
    },
    providerId: {
      type: String,
      required: true
    }
  }],
  // Stores the user's profile picture URL (populated from OAuth providers)
  avatar: {
    type: String,
    default: null
  },
  // Wrong-password counter for this account (see loginUser). Never sent to the browser: formatUserResponse picks fields by name.
  loginFailures: {
    type: new mongoose.Schema({
      count: { type: Number, default: 0 },
      windowStart: { type: Date },
      lockedUntil: { type: Date }
    }, { _id: false }),
    default: undefined
  },
  // Multi-device active refresh tokens stored as SHA-256 hashes with device fingerprinting
  refreshTokens: [{
    tokenHash: {
      type: String,
      required: true
    },
    // Previous token's hash + when it was rotated: lets a second tab that refreshed at the same
    // moment get through for a few seconds instead of being logged out (see refreshAccessToken)
    prevTokenHash: {
      type: String
    },
    rotatedAt: {
      type: Date
    },
    device: {
      type: String,
      default: 'Unknown Device'
    },
    browser: {
      type: String,
      default: 'Unknown Browser'
    },
    os: {
      type: String,
      default: 'Unknown OS'
    },
    ip: {
      type: String,
      default: 'Unknown IP'
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Case-insensitive unique usernames ("Admin" == "admin"), enforced by the database so parallel sign-ups can't both win.
// If old data already has two names that differ only by case, MongoDB refuses to build this index (the app keeps
// running and still checks case-insensitively in code); rename one of them, then restart to build it.
userSchema.index({ username: 1 }, { unique: true, collation: USERNAME_COLLATION, name: 'username_ci_unique' });
// Index for fast OAuth provider lookups
userSchema.index({ 'providers.providerName': 1, 'providers.providerId': 1 });
// Index for fast token hash lookups during session rotation
userSchema.index({ 'refreshTokens.tokenHash': 1 });

const userModel = mongoose.model('User', userSchema)

module.exports = userModel;