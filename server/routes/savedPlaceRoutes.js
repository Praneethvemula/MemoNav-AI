const express = require('express');
const router = express.Router();
const savedPlaceController = require('../controllers/savedPlaceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', savedPlaceController.getAll);
router.post('/', savedPlaceController.create);
router.delete('/:id', savedPlaceController.remove);

module.exports = router;
