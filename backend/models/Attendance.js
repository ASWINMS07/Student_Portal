const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  attendedClasses: {
    type: Number,
    default: 0
  },
  totalClasses: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

