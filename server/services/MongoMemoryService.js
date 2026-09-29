const { MemoryRepo } = require('../models');
const { calculateDistanceMeters } = require('../utils/geoUtils');

class MongoMemoryService {
  constructor() {
    this.sourceName = 'local_mongo';
  }

  async createMemory(userId, memoryData) {
    const memory = await MemoryRepo.create({
      userId,
      type: memoryData.type || 'navigation_experience',
      title: memoryData.title,
      description: memoryData.description,
      location: memoryData.location || 'Current Position',
      latitude: memoryData.latitude !== undefined ? Number(memoryData.latitude) : undefined,
      longitude: memoryData.longitude !== undefined ? Number(memoryData.longitude) : undefined,
      importance: memoryData.importance || 3,
      tags: memoryData.tags || [],
      source: 'local_mongo',
      confidence: memoryData.confidence || 0.95
    });
    return memory;
  }

  async getNearbyMemories(userId, lat, lon, radiusMeters = 300) {
    const memories = await MemoryRepo.find({ userId });
    if (lat === undefined || lon === undefined) {
      return memories;
    }

    const nearby = memories.map(mem => {
      const dist = (mem.latitude !== undefined && mem.longitude !== undefined)
        ? calculateDistanceMeters(lat, lon, mem.latitude, mem.longitude)
        : Infinity;
      return { ...mem, distanceMeters: dist };
    })
    .filter(mem => mem.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return nearby;
  }

  async retrieveRelevantMemories(userId, { lat, lon, query, context, limit = 5 } = {}) {
    const memories = await MemoryRepo.find({ userId });
    const scored = memories.map(mem => {
      let score = 0;

      // 1. Proximity score (0 to 50 points)
      let dist = Infinity;
      if (lat !== undefined && lon !== undefined && mem.latitude !== undefined && mem.longitude !== undefined) {
        dist = calculateDistanceMeters(lat, lon, mem.latitude, mem.longitude);
        if (dist <= 50) score += 50;
        else if (dist <= 150) score += 35;
        else if (dist <= 300) score += 20;
        else if (dist <= 1000) score += 10;
      }

      // 2. Text/semantic query match (0 to 30 points)
      if (query) {
        const q = query.toLowerCase();
        const text = `${mem.title} ${mem.description} ${(mem.tags || []).join(' ')} ${mem.location || ''}`.toLowerCase();
        if (text.includes(q)) score += 30;
        else {
          const qWords = q.split(/\s+/).filter(w => w.length > 3);
          const matchCount = qWords.filter(w => text.includes(w)).length;
          score += matchCount * 8;
        }
      }

      // 3. Importance weighting (1-5 -> 5 to 25 points)
      score += (mem.importance || 3) * 5;

      // 4. Critical obstacle / difficult crossing boost
      if (mem.type === 'difficult_crossing' || mem.type === 'obstacle' || mem.type === 'safety') {
        score += 15;
      }

      return {
        ...mem,
        relevanceScore: score,
        distanceMeters: dist !== Infinity ? Math.round(dist) : null
      };
    });

    // Sort descending by score
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return scored.slice(0, limit);
  }

  async searchMemories(userId, query = '', filters = {}) {
    let memories = await MemoryRepo.find({ userId });

    if (filters.type && filters.type !== 'all') {
      memories = memories.filter(m => m.type === filters.type);
    }

    if (query) {
      const q = query.toLowerCase();
      memories = memories.filter(m =>
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.location && m.location.toLowerCase().includes(q)) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return memories;
  }

  async updateMemory(id, userId, updates) {
    const existing = await MemoryRepo.findById(id);
    if (!existing || String(existing.userId) !== String(userId)) {
      return null;
    }
    return await MemoryRepo.findByIdAndUpdate(id, updates);
  }

  async deleteMemory(id, userId) {
    const existing = await MemoryRepo.findById(id);
    if (!existing || String(existing.userId) !== String(userId)) {
      return null;
    }
    return await MemoryRepo.findByIdAndDelete(id);
  }
}

module.exports = new MongoMemoryService();
