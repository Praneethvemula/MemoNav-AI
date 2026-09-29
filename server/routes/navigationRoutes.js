const express = require('express');
const router = express.Router();
const navigationController = require('../controllers/navigationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/route', navigationController.getRoute);

module.exports = router;
