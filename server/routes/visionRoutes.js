const express = require('express');
const router = express.Router();
const visionController = require('../controllers/visionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/analyze', visionController.analyzeFrame);
router.post('/ocr', visionController.processOCR);

module.exports = router;
