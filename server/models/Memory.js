const mongoose = require('mongoose');

const MemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'navigation_experience',
      'obstacle',
      'difficult_crossing',
      'place',
      'preference',
      'landmark',
      'safety',
      'instruction',
      'user_note'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: 'Current Location'
  },
  latitude: {
    type: Number,
    index: true
  },
  longitude: {
    type: Number,
    index: true
  },
  importance: {
    type: Number, // 1 to 5
    default: 3,
    min: 1,
    max: 5
  },
  tags: [{
    type: String,
    trim: true
  }],
  source: {
    type: String,
    enum: ['local_mongo', 'hindsight', 'demo_seed'],
    default: 'local_mongo'
  },
  confidence: {
    type: Number,
    default: 0.95
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

// Composite index for geo queries
MemorySchema.index({ latitude: 1, longitude: 1 });
MemorySchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Memory', MemorySchema);
