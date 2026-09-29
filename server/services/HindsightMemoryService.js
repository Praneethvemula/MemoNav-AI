const axios = require('axios');
const MongoMemoryService = require('./MongoMemoryService');

class HindsightMemoryService {
  constructor() {
    this.sourceName = 'hindsight';
    this.apiKey = process.env.HINDSIGHT_API_KEY || '';
    this.apiUrl = process.env.HINDSIGHT_API_URL || 'https://api.hindsight.ai/v1';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async createMemory(userId, memoryData) {
    if (!this.isConfigured()) {
      return await MongoMemoryService.createMemory(userId, memoryData);
    }

    try {
      // Attempt Hindsight Persistent Memory API
      const response = await axios.post(
        `${this.apiUrl}/memories`,
        {
          userId: String(userId),
          content: `${memoryData.title}: ${memoryData.description}`,
          type: memoryData.type,
          metadata: {
            latitude: memoryData.latitude,
            longitude: memoryData.longitude,
            location: memoryData.location,
            importance: memoryData.importance,
            tags: memoryData.tags
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );

      // Also persist locally as backup cache and return memory object
      const localRecord = await MongoMemoryService.createMemory(userId, {
        ...memoryData,
        source: 'hindsight'
      });
      return {
        ...localRecord,
        source: 'hindsight',
        hindsightId: response.data.id || response.data.memory_id
      };
    } catch (err) {
      console.warn(`[Hindsight API] Memory sync warning (${err.message}). Persisting to Mongo fallback.`);
      return await MongoMemoryService.createMemory(userId, memoryData);
    }
  }

  async retrieveRelevantMemories(userId, params) {
    if (!this.isConfigured()) {
      return await MongoMemoryService.retrieveRelevantMemories(userId, params);
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/memories/recall`,
        {
          userId: String(userId),
          query: params.query || params.context || '',
          location: params.lat && params.lon ? { lat: params.lat, lon: params.lon } : undefined,
          limit: params.limit || 5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 4000
        }
      );

      if (response.data && Array.isArray(response.data.memories)) {
        return response.data.memories.map(m => ({
          ...m,
          source: 'hindsight'
        }));
      }
    } catch (err) {
      console.warn(`[Hindsight API] Recall failed (${err.message}). Using Mongo memory retrieval.`);
    }

    return await MongoMemoryService.retrieveRelevantMemories(userId, params);
  }

  async getNearbyMemories(userId, lat, lon, radiusMeters) {
    return await MongoMemoryService.getNearbyMemories(userId, lat, lon, radiusMeters);
  }

  async searchMemories(userId, query, filters) {
    return await MongoMemoryService.searchMemories(userId, query, filters);
  }

  async updateMemory(id, userId, updates) {
    return await MongoMemoryService.updateMemory(id, userId, updates);
  }

  async deleteMemory(id, userId) {
    return await MongoMemoryService.deleteMemory(id, userId);
  }
}

module.exports = new HindsightMemoryService();
