const Fees = require('../models/Fees');

// Get user fees
exports.getFees = async (req, res) => {
  try {
    const fees = await Fees.find({ userId: req.userId }).sort({ semester: -1 });

    // Calculate totals
    const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
    const paidAmount = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    res.json({
      fees: fees.map(f => ({
        id: f._id,
        semester: f.semester,
        amount: f.amount,
        dueDate: f.dueDate,
        status: f.status
      })),
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

