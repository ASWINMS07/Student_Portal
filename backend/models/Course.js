const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseCode: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    required: true
  },
  instructor: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);

