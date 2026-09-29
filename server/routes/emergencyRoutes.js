const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/contacts', emergencyController.getContacts);
router.post('/contacts', emergencyController.createContact);
router.delete('/contacts/:id', emergencyController.removeContact);
router.post('/trigger', emergencyController.triggerAlert);

module.exports = router;
