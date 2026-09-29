const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  preferredLanguage: {
    type: String,
    enum: ['English', 'Hindi', 'Telugu'],
    default: 'English'
  },
  accessibilityPreference: {
    type: String,
    enum: ['standard', 'high_contrast', 'large_text', 'voice_first', 'reduced_motion'],
    default: 'voice_first'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
