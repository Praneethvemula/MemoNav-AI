const MemoryService = require('../services/MemoryService');

async function create(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { type, title, description, location, latitude, longitude, importance, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Memory title and description are required.' });
    }

    const memory = await MemoryService.createMemory(userId, {
      type: type || 'navigation_experience',
      title,
      description,
      location: location || 'Current Location',
      latitude: latitude !== undefined ? Number(latitude) : undefined,
      longitude: longitude !== undefined ? Number(longitude) : undefined,
      importance: Number(importance) || 3,
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : [])
    });

    res.status(201).json({
      success: true,
      message: 'Memory saved successfully.',
      memory,
      source: MemoryService.getActiveSource()
    });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { search, type } = req.query;

    const memories = await MemoryService.searchMemories(userId, search, { type });

    res.json({
      success: true,
      count: memories.length,
      source: MemoryService.getActiveSource(),
      memories
    });
  } catch (err) {
    next(err);
  }
}

async function getNearby(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { lat, lon, radius } = req.query;

    if (lat === undefined || lon === undefined) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude parameters are required.' });
    }

    const radiusMeters = radius ? Number(radius) : 300;
    const memories = await MemoryService.getNearbyMemories(userId, Number(lat), Number(lon), radiusMeters);

    res.json({
      success: true,
      count: memories.length,
      radiusMeters,
      source: MemoryService.getActiveSource(),
      memories
    });
  } catch (err) {
    next(err);
  }
}

async function getRelevant(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { lat, lon, query, context, limit } = req.query;

    const memories = await MemoryService.retrieveRelevantMemories(userId, {
      lat: lat !== undefined ? Number(lat) : undefined,
      lon: lon !== undefined ? Number(lon) : undefined,
      query,
      context,
      limit: limit ? Number(limit) : 5
    });

    res.json({
      success: true,
      count: memories.length,
      source: MemoryService.getActiveSource(),
      memories
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const updated = await MemoryService.updateMemory(id, userId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Memory not found or unauthorized.' });
    }

    res.json({
      success: true,
      message: 'Memory updated successfully.',
      memory: updated
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const removed = await MemoryService.deleteMemory(id, userId);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Memory not found or unauthorized.' });
    }

    res.json({
      success: true,
      message: 'Memory deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function getSource(req, res) {
  res.json({
    success: true,
    activeSource: MemoryService.getActiveSource(),
    isHindsightConfigured: MemoryService.hindsight.isConfigured()
  });
}

module.exports = {
  create,
  getAll,
  getNearby,
  getRelevant,
  update,
  remove,
  getSource
};
