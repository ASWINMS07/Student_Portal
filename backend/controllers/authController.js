const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register
exports.register = async (req, res) => {
  try {
    const { name, studentId, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !studentId || !email || !password) {
      return res.status(400).json({
        message: 'Please provide all required fields: name, studentId, email, password'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or student ID' });
    }

    // Create user - Force role to 'student' for public registration
    const user = new User({
      name,
      studentId,
      email,
      password,
      phone,
      role: 'student'
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find user by email or studentId
    const user = await User.findOne({
      $or: [{ email: identifier }, { studentId: identifier }]
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Log token to console (as requested)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({ message: 'Password reset token generated (check server console)' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

