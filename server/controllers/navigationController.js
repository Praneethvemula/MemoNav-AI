const NavigationService = require('../services/NavigationService');

async function getRoute(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { destination, origin, currentLat, currentLon, destLat, destLon } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, message: 'Destination is required.' });
    }

    const routeData = await NavigationService.planRoute(userId, {
      destination,
      origin,
      currentLat: currentLat ? Number(currentLat) : undefined,
      currentLon: currentLon ? Number(currentLon) : undefined,
      destLat: destLat ? Number(destLat) : undefined,
      destLon: destLon ? Number(destLon) : undefined
    });

    res.json({
      success: true,
      route: routeData
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getRoute
};
