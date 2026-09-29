/**
 * Geo Utilities for MemoNav AI
 * Calculates distance, bearing, and proximity for navigation and memory recall
 */

// Calculate great-circle distance between two points in meters using Haversine formula
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return Infinity;
  }
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Format distance nicely for screen readers and voice synthesis
function formatDistanceForVoice(meters) {
  if (meters < 10) return "right here";
  if (meters < 1000) return `${Math.round(meters)} meters`;
  const km = (meters / 1000).toFixed(1);
  return `${km} kilometers`;
}

// Calculate bearing in degrees from point 1 to point 2
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
            Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const brng = Math.atan2(y, x);
  return (toDeg(brng) + 360) % 360;
}

function toDeg(rad) {
  return rad * (180 / Math.PI);
}

// Simple compass direction from bearing
function getCompassDirection(bearing) {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

module.exports = {
  calculateDistanceMeters,
  formatDistanceForVoice,
  calculateBearing,
  getCompassDirection
};
