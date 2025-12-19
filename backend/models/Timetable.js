const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  time: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  facultyName: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);

