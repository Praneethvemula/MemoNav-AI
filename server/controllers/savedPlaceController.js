const { SavedPlaceRepo } = require('../models');

async function getAll(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const places = await SavedPlaceRepo.find({ userId });
    res.json({
      success: true,
      places
    });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { name, address, latitude, longitude, category, icon, notes } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Name, latitude, and longitude are required.' });
    }

    const place = await SavedPlaceRepo.create({
      userId,
      name,
      address: address || '',
      latitude: Number(latitude),
      longitude: Number(longitude),
      category: category || 'other',
      icon: icon || 'MapPin',
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Place saved successfully.',
      place
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    await SavedPlaceRepo.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Place removed.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  create,
  remove
};
