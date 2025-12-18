const mongoose = require('mongoose');

const feesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Fees', feesSchema);

