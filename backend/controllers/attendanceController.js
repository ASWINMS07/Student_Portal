const Attendance = require('../models/Attendance');

// Get user attendance
exports.getAttendance = async (req, res) => {
  try {
    let targetUserId = req.userId;

    // If admin and userId query param provided, allow viewing other student
    // We need to fetch the logged in user to check role, or rely on middleware adding role to req?
    // The auth middleware only adds userId. We should fetch user or update middleware.
    // Let's fetch user role here efficiently? Or assume middleware helps?
    // Current auth middleware: const decoded = jwt.verify... req.userId = decoded.userId;
    // It doesn't add role. 

    // Quick fix: fetch user role.
    const User = require('../models/User');
    const currentUser = await User.findById(req.userId);

    if (currentUser && currentUser.role === 'admin' && req.query.userId) {
      targetUserId = req.query.userId;
    }

    const attendance = await Attendance.find({ userId: targetUserId });

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

// Admin: Update student attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { _id, userId, subject, attendedClasses, totalClasses } = req.body;

    let attendance;

    if (_id) {
      // Update existing record by ID
      attendance = await Attendance.findById(_id);
      if (attendance) {
        attendance.subject = subject;
        attendance.attendedClasses = attendedClasses;
        attendance.totalClasses = totalClasses;
        await attendance.save();
      }
    }

    // Fallback or New Record if no ID provided OR ID not found (unlikely but safe)
    if (!attendance) {
      // Check duplication by subject only if no ID was meant to be used
      attendance = await Attendance.findOne({ userId, subject });

      if (attendance) {
        attendance.attendedClasses = attendedClasses;
        attendance.totalClasses = totalClasses;
        await attendance.save();
      } else {
        attendance = new Attendance({
          userId,
          subject,
          attendedClasses,
          totalClasses
        });
        await attendance.save();
      }
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

