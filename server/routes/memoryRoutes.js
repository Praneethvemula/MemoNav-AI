const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', memoryController.create);
router.get('/', memoryController.getAll);
router.get('/source', memoryController.getSource);
router.get('/nearby', memoryController.getNearby);
router.get('/relevant', memoryController.getRelevant);
router.put('/:id', memoryController.update);
router.delete('/:id', memoryController.remove);

module.exports = router;
