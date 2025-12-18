const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const timetableController = require('../controllers/timetableController');

router.get('/', auth, timetableController.getTimetable);

module.exports = router;

