const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const attendanceController = require('../controllers/attendanceController');

router.get('/', auth, attendanceController.getAttendance);
router.put('/', auth, attendanceController.updateAttendance); // Should ideally check role='admin'

module.exports = router;

