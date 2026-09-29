const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/command', aiController.handleCommand);
router.post('/analyze', aiController.analyzeContext);

module.exports = router;
