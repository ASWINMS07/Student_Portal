const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const courseController = require('../controllers/courseController');

router.get('/', auth, courseController.getCourses);

module.exports = router;

