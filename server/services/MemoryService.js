const MongoMemoryService = require('./MongoMemoryService');
const HindsightMemoryService = require('./HindsightMemoryService');

class MemoryService {
  constructor() {
    this.hindsight = HindsightMemoryService;
    this.mongo = MongoMemoryService;
  }

  // Returns currently active source name: 'Hindsight' or 'Local Memory'
  getActiveSource() {
    if (this.hindsight.isConfigured()) {
      return 'Hindsight';
    }
    return 'Local Memory';
  }

  getService() {
    if (this.hindsight.isConfigured()) {
      return this.hindsight;
    }
    return this.mongo;
  }

  async createMemory(userId, memoryData) {
    return await this.getService().createMemory(userId, memoryData);
  }

  async retrieveRelevantMemories(userId, params) {
    return await this.getService().retrieveRelevantMemories(userId, params);
  }

  async getNearbyMemories(userId, lat, lon, radiusMeters = 300) {
    return await this.getService().getNearbyMemories(userId, lat, lon, radiusMeters);
  }

  async searchMemories(userId, query, filters) {
    return await this.getService().searchMemories(userId, query, filters);
  }

  async updateMemory(id, userId, updates) {
    return await this.getService().updateMemory(id, userId, updates);
  }

  async deleteMemory(id, userId) {
    return await this.getService().deleteMemory(id, userId);
  }
}

module.exports = new MemoryService();
