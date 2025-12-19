const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

const userController = require('../controllers/userController');

// Get current user profile (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Routes (Should ideally have middleware to check role='admin')
router.get('/students', auth, userController.getAllStudents);
router.get('/students/:id', auth, userController.getStudent);
router.put('/students/:id', auth, userController.updateStudent);
router.delete('/students/:id', auth, userController.deleteStudent);

module.exports = router;

