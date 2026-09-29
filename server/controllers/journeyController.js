const { JourneyRepo } = require('../models');

async function create(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { startLocation, destination, distance } = req.body;

    const journey = await JourneyRepo.create({
      userId,
      startLocation: startLocation || { name: 'Current Location' },
      destination: destination || { name: 'Hospital' },
      distance: distance || 0,
      startTime: new Date(),
      status: 'active',
      importantEvents: [
        {
          timestamp: new Date(),
          timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'started',
          description: `Started journey to ${destination?.name || 'Destination'}`
        }
      ]
    });

    res.status(201).json({
      success: true,
      journey
    });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const journeys = await JourneyRepo.find({ userId });
    res.json({
      success: true,
      journeys
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const journey = await JourneyRepo.findById(req.params.id);
    if (!journey || String(journey.userId) !== String(userId)) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }
    res.json({
      success: true,
      journey
    });
  } catch (err) {
    next(err);
  }
}

async function addEvent(req, res, next) {
  try {
    const { type, description, latitude, longitude } = req.body;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = await JourneyRepo.addEvent(req.params.id, {
      type: type || 'info',
      description,
      timeString,
      latitude,
      longitude
    });

    res.json({
      success: true,
      journey: updated
    });
  } catch (err) {
    next(err);
  }
}

async function complete(req, res, next) {
  try {
    const journey = await JourneyRepo.findByIdAndUpdate(req.params.id, {
      status: 'completed',
      endTime: new Date()
    });

    await JourneyRepo.addEvent(req.params.id, {
      type: 'completed',
      description: 'Journey completed successfully.',
      timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    res.json({
      success: true,
      journey
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getAll,
  getById,
  addEvent,
  complete
};
