const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');

router.get('/', auth, profileController.getProfile);
router.put('/', auth, profileController.updateProfile);

module.exports = router;

