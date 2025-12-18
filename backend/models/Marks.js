const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  internalMarks: {
    type: Number,
    default: 0
  },
  externalMarks: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  grade: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);

