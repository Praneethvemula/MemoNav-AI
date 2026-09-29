const AiOrchestratorService = require('../services/AiOrchestratorService');

async function handleCommand(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { text, location, activeJourneyId } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Voice or text command is required.' });
    }

    const result = await AiOrchestratorService.processCommand(userId, {
      text,
      location,
      activeJourneyId
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

async function analyzeContext(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const { lat, lon, heading, mode } = req.body;

    // Retrieve memories and surroundings
    const result = await AiOrchestratorService.processCommand(userId, {
      text: 'what is around me',
      location: { lat, lon }
    });

    res.json({
      success: true,
      analysis: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleCommand,
  analyzeContext
};
