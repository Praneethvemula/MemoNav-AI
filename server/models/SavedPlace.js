const mongoose = require('mongoose');

const SavedPlaceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['home', 'hospital', 'work', 'transit', 'market', 'family', 'other'],
    default: 'other'
  },
  icon: {
    type: String,
    default: 'MapPin'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SavedPlace', SavedPlaceSchema);
