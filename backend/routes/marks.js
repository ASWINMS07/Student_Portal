const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const marksController = require('../controllers/marksController');

router.get('/', auth, marksController.getMarks);
router.put('/', auth, marksController.updateMarks); // Should check role='admin'

module.exports = router;

