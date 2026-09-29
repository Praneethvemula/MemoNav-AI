const mongoose = require('mongoose');

const UserPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Telugu'],
    default: 'English'
  },
  voiceSpeed: {
    type: String,
    enum: ['slow', 'normal', 'fast'],
    default: 'normal'
  },
  instructionStyle: {
    type: String,
    enum: ['short', 'detailed'],
    default: 'short'
  },
  voiceVolume: {
    type: Number,
    default: 1.0,
    min: 0.1,
    max: 1.0
  },
  enableMemory: {
    type: Boolean,
    default: true
  },
  highContrast: {
    type: Boolean,
    default: false
  },
  largeText: {
    type: Boolean,
    default: false
  },
  reducedAnimation: {
    type: Boolean,
    default: false
  },
  vibrationFeedback: {
    type: Boolean,
    default: true
  },
  hindsightSync: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
