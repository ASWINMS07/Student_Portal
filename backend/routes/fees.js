const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const feesController = require('../controllers/feesController');

router.get('/', auth, feesController.getFees);

module.exports = router;

