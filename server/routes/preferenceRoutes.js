const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferenceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', preferenceController.get);
router.put('/', preferenceController.update);

module.exports = router;
