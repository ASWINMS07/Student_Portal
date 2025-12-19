const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const timetableController = require('../controllers/timetableController');

router.get('/', auth, timetableController.getTimetable);
router.put('/', auth, timetableController.updateTimetable);
router.delete('/:id', auth, timetableController.deleteTimetableEntry);

module.exports = router;

