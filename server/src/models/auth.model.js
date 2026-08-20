const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: [true, 'Username already exists'],
    trim: true,
    minLength: [4, 'Username must be at least 4 characters'],
    maxLength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email already exists'],
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
    required: function() {
      return !this.providers || this.providers.length === 0;
    },
    minLength: [8, 'Password must be at least 8 characters']
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
  refreshToken: {          
    type: String,
    default: null
  }
  // role: {
  //   type: String,
  //   enum: ['user', 'admin'],
  //   default: 'user'
  // }
}, {
  timestamps: true
});

const userModel = mongoose.model('User', userSchema)

module.exports = userModel;
