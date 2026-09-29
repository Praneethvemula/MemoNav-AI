/**
 * MemoNav AI API Client
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function getAuthToken() {
  return localStorage.getItem('memonav_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('memonav_token', token);
  } else {
    localStorage.removeItem('memonav_token');
  }
}

export async function apiRequest(endpoint, method = 'GET', body = null) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Enable seamless demo user for testing without immediate login
    headers['x-demo-user'] = 'true';
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`[API Error ${method} ${endpoint}]`, err);
    throw err;
  }
}

// Specialized API endpoints
export const Api = {
  // Auth
  register: (payload) => apiRequest('/auth/register', 'POST', payload),
  login: (payload) => apiRequest('/auth/login', 'POST', payload),
  getMe: () => apiRequest('/auth/me', 'GET'),

  // Memories
  getMemories: (params = '') => apiRequest(`/memories${params ? '?' + params : ''}`, 'GET'),
  createMemory: (data) => apiRequest('/memories', 'POST', data),
  updateMemory: (id, data) => apiRequest(`/memories/${id}`, 'PUT', data),
  deleteMemory: (id) => apiRequest(`/memories/${id}`, 'DELETE'),
  getNearbyMemories: (lat, lon, radius = 300) => apiRequest(`/memories/nearby?lat=${lat}&lon=${lon}&radius=${radius}`, 'GET'),
  getRelevantMemories: (query, lat, lon) => apiRequest(`/memories/relevant?query=${encodeURIComponent(query || '')}&lat=${lat || ''}&lon=${lon || ''}`, 'GET'),
  getMemorySource: () => apiRequest('/memories/source', 'GET'),

  // Journeys
  getJourneys: () => apiRequest('/journeys', 'GET'),
  createJourney: (data) => apiRequest('/journeys', 'POST', data),
  getJourneyById: (id) => apiRequest(`/journeys/${id}`, 'GET'),
  addJourneyEvent: (id, event) => apiRequest(`/journeys/${id}/events`, 'POST', event),
  completeJourney: (id) => apiRequest(`/journeys/${id}/complete`, 'PUT'),

  // Preferences
  getPreferences: () => apiRequest('/preferences', 'GET'),
  updatePreferences: (data) => apiRequest('/preferences', 'PUT', data),

  // Saved Places
  getPlaces: () => apiRequest('/places', 'GET'),
  createPlace: (data) => apiRequest('/places', 'POST', data),
  deletePlace: (id) => apiRequest(`/places/${id}`, 'DELETE'),

  // Emergency
  getEmergencyContacts: () => apiRequest('/emergency/contacts', 'GET'),
  createEmergencyContact: (data) => apiRequest('/emergency/contacts', 'POST', data),
  deleteEmergencyContact: (id) => apiRequest(`/emergency/contacts/${id}`, 'DELETE'),
  triggerEmergencyAlert: (data) => apiRequest('/emergency/trigger', 'POST', data),

  // AI Command
  sendAiCommand: (data) => apiRequest('/ai/command', 'POST', data),
  analyzeContext: (data) => apiRequest('/ai/analyze', 'POST', data),

  // Navigation
  getRoute: (data) => apiRequest('/navigation/route', 'POST', data),

  // Vision & OCR
  analyzeVision: (data) => apiRequest('/vision/analyze', 'POST', data),
  processOCR: (data) => apiRequest('/vision/ocr', 'POST', data),

  // Demo seed
  seedDemo: (userId) => apiRequest('/demo/seed', 'POST', { userId })
};
