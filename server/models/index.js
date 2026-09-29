const User = require('./User');
const Memory = require('./Memory');
const Journey = require('./Journey');
const SavedPlace = require('./SavedPlace');
const EmergencyContact = require('./EmergencyContact');
const UserPreference = require('./UserPreference');
const { isFallback, fallbackData, persistFallback } = require('../config/db');

// Helper to generate consistent mock ObjectIDs when fallback is active
function generateId() {
  return Math.random().toString(16).substring(2, 10) +
         Math.random().toString(16).substring(2, 10) +
         Math.random().toString(16).substring(2, 10);
}

// User Repository
const UserRepo = {
  async findOne(filter) {
    if (!isFallback()) return await User.findOne(filter);
    return fallbackData.users.find(u => {
      if (filter._id && (u._id === String(filter._id) || u.id === String(filter._id))) return true;
      if (filter.email && u.email.toLowerCase() === filter.email.toLowerCase()) return true;
      return false;
    }) || null;
  },
  async findById(id) {
    if (!isFallback()) return await User.findById(id);
    return fallbackData.users.find(u => u._id === String(id) || u.id === String(id)) || null;
  },
  async create(data) {
    if (!isFallback()) return await User.create(data);
    const user = {
      _id: generateId(),
      ...data,
      createdAt: new Date()
    };
    fallbackData.users.push(user);
    persistFallback();
    return user;
  }
};

// Memory Repository
const MemoryRepo = {
  async find(filter = {}) {
    if (!isFallback()) return await Memory.find(filter).sort({ createdAt: -1 });
    let results = [...fallbackData.memories];
    if (filter.userId) {
      results = results.filter(m => String(m.userId) === String(filter.userId));
    }
    if (filter.type) {
      results = results.filter(m => m.type === filter.type);
    }
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  async findById(id) {
    if (!isFallback()) return await Memory.findById(id);
    return fallbackData.memories.find(m => m._id === String(id) || m.id === String(id)) || null;
  },
  async create(data) {
    if (!isFallback()) return await Memory.create(data);
    const memory = {
      _id: generateId(),
      ...data,
      createdAt: new Date(),
      lastAccessedAt: new Date()
    };
    fallbackData.memories.push(memory);
    persistFallback();
    return memory;
  },
  async findByIdAndUpdate(id, updates) {
    if (!isFallback()) return await Memory.findByIdAndUpdate(id, updates, { new: true });
    const idx = fallbackData.memories.findIndex(m => m._id === String(id) || m.id === String(id));
    if (idx === -1) return null;
    fallbackData.memories[idx] = {
      ...fallbackData.memories[idx],
      ...updates,
      lastAccessedAt: new Date()
    };
    persistFallback();
    return fallbackData.memories[idx];
  },
  async findByIdAndDelete(id) {
    if (!isFallback()) return await Memory.findByIdAndDelete(id);
    const idx = fallbackData.memories.findIndex(m => m._id === String(id) || m.id === String(id));
    if (idx === -1) return null;
    const removed = fallbackData.memories.splice(idx, 1)[0];
    persistFallback();
    return removed;
  }
};

// Journey Repository
const JourneyRepo = {
  async find(filter = {}) {
    if (!isFallback()) return await Journey.find(filter).sort({ startTime: -1 });
    let results = [...fallbackData.journeys];
    if (filter.userId) {
      results = results.filter(j => String(j.userId) === String(filter.userId));
    }
    return results.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  },
  async findById(id) {
    if (!isFallback()) return await Journey.findById(id);
    return fallbackData.journeys.find(j => j._id === String(id) || j.id === String(id)) || null;
  },
  async create(data) {
    if (!isFallback()) return await Journey.create(data);
    const journey = {
      _id: generateId(),
      importantEvents: [],
      memoriesCreated: [],
      ...data,
      startTime: data.startTime || new Date(),
      createdAt: new Date()
    };
    fallbackData.journeys.push(journey);
    persistFallback();
    return journey;
  },
  async findByIdAndUpdate(id, updates) {
    if (!isFallback()) return await Journey.findByIdAndUpdate(id, updates, { new: true });
    const idx = fallbackData.journeys.findIndex(j => j._id === String(id) || j.id === String(id));
    if (idx === -1) return null;
    fallbackData.journeys[idx] = {
      ...fallbackData.journeys[idx],
      ...updates
    };
    persistFallback();
    return fallbackData.journeys[idx];
  },
  async addEvent(id, event) {
    if (!isFallback()) {
      return await Journey.findByIdAndUpdate(
        id,
        { $push: { importantEvents: event } },
        { new: true }
      );
    }
    const idx = fallbackData.journeys.findIndex(j => j._id === String(id) || j.id === String(id));
    if (idx === -1) return null;
    if (!fallbackData.journeys[idx].importantEvents) {
      fallbackData.journeys[idx].importantEvents = [];
    }
    const evt = {
      _id: generateId(),
      timestamp: new Date(),
      ...event
    };
    fallbackData.journeys[idx].importantEvents.push(evt);
    persistFallback();
    return fallbackData.journeys[idx];
  }
};

// SavedPlace Repository
const SavedPlaceRepo = {
  async find(filter = {}) {
    if (!isFallback()) return await SavedPlace.find(filter).sort({ createdAt: -1 });
    let results = [...fallbackData.savedPlaces];
    if (filter.userId) {
      results = results.filter(p => String(p.userId) === String(filter.userId));
    }
    return results;
  },
  async create(data) {
    if (!isFallback()) return await SavedPlace.create(data);
    const place = {
      _id: generateId(),
      ...data,
      createdAt: new Date()
    };
    fallbackData.savedPlaces.push(place);
    persistFallback();
    return place;
  },
  async findByIdAndDelete(id) {
    if (!isFallback()) return await SavedPlace.findByIdAndDelete(id);
    const idx = fallbackData.savedPlaces.findIndex(p => p._id === String(id) || p.id === String(id));
    if (idx === -1) return null;
    const removed = fallbackData.savedPlaces.splice(idx, 1)[0];
    persistFallback();
    return removed;
  }
};

// EmergencyContact Repository
const EmergencyContactRepo = {
  async find(filter = {}) {
    if (!isFallback()) return await EmergencyContact.find(filter);
    let results = [...fallbackData.emergencyContacts];
    if (filter.userId) {
      results = results.filter(c => String(c.userId) === String(filter.userId));
    }
    return results;
  },
  async create(data) {
    if (!isFallback()) return await EmergencyContact.create(data);
    const contact = {
      _id: generateId(),
      ...data,
      createdAt: new Date()
    };
    fallbackData.emergencyContacts.push(contact);
    persistFallback();
    return contact;
  },
  async findByIdAndDelete(id) {
    if (!isFallback()) return await EmergencyContact.findByIdAndDelete(id);
    const idx = fallbackData.emergencyContacts.findIndex(c => c._id === String(id) || c.id === String(id));
    if (idx === -1) return null;
    const removed = fallbackData.emergencyContacts.splice(idx, 1)[0];
    persistFallback();
    return removed;
  }
};

// UserPreference Repository
const UserPreferenceRepo = {
  async findOne(filter = {}) {
    if (!isFallback()) return await UserPreference.findOne(filter);
    return fallbackData.userPreferences.find(p => String(p.userId) === String(filter.userId)) || null;
  },
  async updateOrCreate(userId, data) {
    if (!isFallback()) {
      return await UserPreference.findOneAndUpdate(
        { userId },
        { ...data, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    const idx = fallbackData.userPreferences.findIndex(p => String(p.userId) === String(userId));
    if (idx === -1) {
      const pref = {
        _id: generateId(),
        userId,
        language: 'English',
        voiceSpeed: 'normal',
        instructionStyle: 'short',
        voiceVolume: 1.0,
        enableMemory: true,
        highContrast: false,
        largeText: false,
        reducedAnimation: false,
        vibrationFeedback: true,
        hindsightSync: true,
        ...data,
        updatedAt: new Date()
      };
      fallbackData.userPreferences.push(pref);
      persistFallback();
      return pref;
    } else {
      fallbackData.userPreferences[idx] = {
        ...fallbackData.userPreferences[idx],
        ...data,
        updatedAt: new Date()
      };
      persistFallback();
      return fallbackData.userPreferences[idx];
    }
  }
};

module.exports = {
  User,
  Memory,
  Journey,
  SavedPlace,
  EmergencyContact,
  UserPreference,
  UserRepo,
  MemoryRepo,
  JourneyRepo,
  SavedPlaceRepo,
  EmergencyContactRepo,
  UserPreferenceRepo
};
