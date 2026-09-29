const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
let fallbackMode = false;

// In-memory / file-synced fallback storage if standalone MongoDB daemon is unavailable
const fallbackData = {
  users: [],
  memories: [],
  journeys: [],
  savedPlaces: [],
  emergencyContacts: [],
  userPreferences: []
};

const DB_FILE = path.join(__dirname, '../data/local_db.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Load existing fallback data if present
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    Object.assign(fallbackData, parsed);
  } catch (e) {
    console.warn('[DB] Could not parse existing local_db.json, starting fresh');
  }
}

function persistFallback() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(fallbackData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing fallback storage:', err.message);
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/memonav_ai';
  try {
    console.log(`[DB] Attempting MongoDB connection at ${uri}...`);
    // Set a short server selection timeout so we don't block server startup
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    isConnected = true;
    fallbackMode = false;
    console.log('✅ [DB] Connected to MongoDB successfully.');
  } catch (err) {
    console.warn(`⚠️ [DB] Standalone MongoDB is not active (${err.message}).`);
    console.log('🔄 [DB] Activating resilient local JSON/Memory storage for seamless operation & demo.');
    fallbackMode = true;
    isConnected = true;
  }
}

function isFallback() {
  return fallbackMode;
}

module.exports = {
  connectDB,
  isFallback,
  fallbackData,
  persistFallback
};
