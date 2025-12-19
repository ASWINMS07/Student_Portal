const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const feesController = require('../controllers/feesController');

router.get('/', auth, feesController.getFees);
router.put('/', auth, feesController.updateFees); // Should check role='admin'

module.exports = router;

