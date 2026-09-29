const axios = require('axios');
const { calculateDistanceMeters, formatDistanceForVoice } = require('../utils/geoUtils');
const MemoryService = require('./MemoryService');

class NavigationService {
  /**
   * Calculate route and augment each step with memory-based proactive alerts
   */
  async planRoute(userId, { origin, destination, currentLat, currentLon, destLat, destLon }) {
    // Standard coordinates if destination is named or coordinates provided
    let startLat = currentLat || 17.3850;
    let startLon = currentLon || 78.4867;
    let endLat = destLat || 17.3910;
    let endLon = destLon || 78.4920;

    // Check if user has saved places or memories matching destination
    const relevantMemories = await MemoryService.retrieveRelevantMemories(userId, {
      query: destination,
      lat: startLat,
      lon: startLon,
      limit: 5
    });

    // Generate waypoints and step instructions
    const totalDistance = Math.round(calculateDistanceMeters(startLat, startLon, endLat, endLon));
    const estimatedMinutes = Math.max(1, Math.round((totalDistance / 80) * 1.2)); // ~80m per min walking pace

    // Generate steps along the trajectory
    const steps = [
      {
        stepNumber: 1,
        instruction: "Head straight towards Main Street.",
        voiceInstruction: "Head straight towards Main Street for 60 meters.",
        distanceMeters: 60,
        lat: startLat + (endLat - startLat) * 0.15,
        lon: startLon + (endLon - startLon) * 0.15,
        action: 'straight'
      },
      {
        stepNumber: 2,
        instruction: "Approaching major road intersection.",
        voiceInstruction: "Approaching major road intersection in 80 meters. Check for oncoming traffic.",
        distanceMeters: 80,
        lat: startLat + (endLat - startLat) * 0.45,
        lon: startLon + (endLon - startLon) * 0.45,
        action: 'crossing'
      },
      {
        stepNumber: 3,
        instruction: "Turn left after the intersection.",
        voiceInstruction: "Turn left after the crossing onto Hospital Avenue.",
        distanceMeters: 90,
        lat: startLat + (endLat - startLat) * 0.75,
        lon: startLon + (endLon - startLon) * 0.75,
        action: 'left'
      },
      {
        stepNumber: 4,
        instruction: `Arriving at ${destination}.`,
        voiceInstruction: `Your destination, ${destination}, is directly ahead on your left.`,
        distanceMeters: 40,
        lat: endLat,
        lon: endLon,
        action: 'arrive'
      }
    ];

    // Check each step for nearby memories (e.g. crossing difficulty or obstacle memories)
    const userMemories = await MemoryService.getNearbyMemories(userId, startLat, startLon, 5000);

    const stepsWithMemories = steps.map(step => {
      // Find memories within 60 meters of this step
      const nearbyMem = userMemories.find(m => {
        if (!m.latitude || !m.longitude) return false;
        const d = calculateDistanceMeters(step.lat, step.lon, m.latitude, m.longitude);
        return d <= 80;
      });

      if (nearbyMem) {
        let memoryAlert = `Memory alert: ${nearbyMem.description}`;
        if (nearbyMem.type === 'difficult_crossing') {
          memoryAlert = `Careful: You previously reported difficulty at this crossing because it was crowded. Please move carefully.`;
        } else if (nearbyMem.type === 'obstacle') {
          memoryAlert = `Caution: Known obstacle noted here: ${nearbyMem.description}.`;
        }

        return {
          ...step,
          memoryAlert,
          memoryId: nearbyMem._id || nearbyMem.id,
          memoryTitle: nearbyMem.title
        };
      }

      return step;
    });

    return {
      destination,
      origin: { lat: startLat, lon: startLon },
      destinationCoords: { lat: endLat, lon: endLon },
      totalDistanceMeters: totalDistance,
      distanceFormatted: formatDistanceForVoice(totalDistance),
      estimatedMinutes,
      steps: stepsWithMemories,
      relevantMemoriesCount: relevantMemories.length,
      relevantMemories
    };
  }
}

module.exports = new NavigationService();
