const Attendance = require('../models/Attendance');

// Get user attendance
exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ userId: req.userId });

    // Calculate subject-wise percentage
    const subjects = attendance.map(record => ({
      subject: record.subject,
      attendedClasses: record.attendedClasses,
      totalClasses: record.totalClasses,
      percentage: record.totalClasses > 0 
        ? Math.round((record.attendedClasses / record.totalClasses) * 100) 
        : 0
    }));

    // Calculate overall percentage
    const totalAttended = attendance.reduce((sum, r) => sum + r.attendedClasses, 0);
    const totalClasses = attendance.reduce((sum, r) => sum + r.totalClasses, 0);
    const overallPercentage = totalClasses > 0 
      ? Math.round((totalAttended / totalClasses) * 100) 
      : 0;

    res.json({
      subjects,
      overall: {
        attendedClasses: totalAttended,
        totalClasses,
        percentage: overallPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

