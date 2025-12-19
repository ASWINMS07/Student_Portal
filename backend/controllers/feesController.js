const Fees = require('../models/Fees');

// Get user fees
exports.getFees = async (req, res) => {
  try {
    let targetUserId = req.userId;

    const User = require('../models/User');
    const currentUser = await User.findById(req.userId);

    if (currentUser && currentUser.role === 'admin' && req.query.userId) {
      targetUserId = req.query.userId;
    }

    const fees = await Fees.find({ userId: targetUserId }).sort({ semester: -1 });

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
        paidDate: f.paidDate, // Add paidDate to response
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

// Admin: Update student fees (create or update)
exports.updateFees = async (req, res) => {
  try {
    const { _id, userId, semester, amount, dueDate, status, paidDate } = req.body;

    let feeRecord;

    if (_id) {
      feeRecord = await Fees.findById(_id);
      if (feeRecord) {
        feeRecord.amount = amount;
        feeRecord.dueDate = dueDate;
        feeRecord.status = status;
        if (paidDate) feeRecord.paidDate = paidDate;
        else if (status === 'Pending') feeRecord.paidDate = undefined;
        await feeRecord.save();
      }
    }

    if (!feeRecord) {
      feeRecord = await Fees.findOne({ userId, semester });

      if (feeRecord) {
        feeRecord.amount = amount;
        feeRecord.dueDate = dueDate;
        feeRecord.status = status;
        if (paidDate) feeRecord.paidDate = paidDate;
        else if (status === 'Pending') feeRecord.paidDate = undefined;

        await feeRecord.save();
      } else {
        feeRecord = new Fees({
          userId,
          semester,
          amount,
          dueDate,
          status,
          paidDate
        });
        await feeRecord.save();
      }
    }

    res.json(feeRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

