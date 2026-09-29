const { UserPreferenceRepo } = require('../models');

async function get(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    let preferences = await UserPreferenceRepo.findOne({ userId });
    if (!preferences) {
      preferences = await UserPreferenceRepo.updateOrCreate(userId, {});
    }
    res.json({
      success: true,
      preferences
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const updated = await UserPreferenceRepo.updateOrCreate(userId, req.body);
    res.json({
      success: true,
      message: 'Preferences updated successfully.',
      preferences: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get,
  update
};
