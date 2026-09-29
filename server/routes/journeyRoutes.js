const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journeyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', journeyController.create);
router.get('/', journeyController.getAll);
router.get('/:id', journeyController.getById);
router.post('/:id/events', journeyController.addEvent);
router.put('/:id/complete', journeyController.complete);

module.exports = router;
