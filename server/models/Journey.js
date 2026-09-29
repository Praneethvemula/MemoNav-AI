const mongoose = require('mongoose');

const JourneyEventSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeString: {
    type: String
  },
  type: {
    type: String, // 'started', 'memory_recalled', 'memory_created', 'obstacle_detected', 'crossing_warning', 'completed', 'rerouted'
    default: 'info'
  },
  description: {
    type: String,
    required: true
  },
  latitude: Number,
  longitude: Number
});

const JourneySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  startLocation: {
    name: { type: String, default: 'Starting Point' },
    latitude: Number,
    longitude: Number
  },
  destination: {
    name: { type: String, required: true },
    latitude: Number,
    longitude: Number
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  distance: {
    type: Number, // in meters
    default: 0
  },
  memoriesCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memory'
  }],
  importantEvents: [JourneyEventSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Journey', JourneySchema);
