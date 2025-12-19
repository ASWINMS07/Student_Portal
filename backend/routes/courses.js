const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const courseController = require('../controllers/courseController');

router.get('/', auth, courseController.getCourses);
router.put('/', auth, courseController.updateCourse);
router.delete('/:id', auth, courseController.deleteCourse);

module.exports = router;

