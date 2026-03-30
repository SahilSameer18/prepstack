const mongoose = require('mongoose');


const blacklistTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, 'Token is required'],
  },
  createdAt: { type: Date, default: Date.now, index: { expires: '1d' } }  // expires after 1 day
}, {
  timestamps: true
});

const blacklistTokenModel = mongoose.model('blacklistToken', blacklistTokenSchema);

module.exports = blacklistTokenModel;