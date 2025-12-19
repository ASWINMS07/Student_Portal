const Timetable = require('../models/Timetable');

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Get user timetable
exports.getTimetable = async (req, res) => {
  try {
    let targetUserId = req.userId;

    // Check if requester is Admin and wants another student's timetable
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (user && user.role === 'admin' && req.query.userId) {
      targetUserId = req.query.userId;
    }

    const timetable = await Timetable.find({ userId: targetUserId });

    // Group by day
    const schedule = dayOrder.reduce((acc, day) => {
      const dayEntries = timetable
        .filter(entry => entry.day === day)
        .map(entry => ({
          _id: entry._id,
          time: entry.time,
          courseId: entry.courseId,
          courseName: entry.courseName,
          facultyName: entry.facultyName,
          room: entry.room
        }))
        .sort((a, b) => a.time.localeCompare(b.time));

      if (dayEntries.length > 0) {
        acc.push({ day, classes: dayEntries });
      }
      return acc;
    }, []);

    res.json({ schedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update Timetable (Upsert)
exports.updateTimetable = async (req, res) => {
  try {
    const { _id, userId, day, time, courseId, courseName, facultyName, room } = req.body;

    let entry;
    if (_id) {
      entry = await Timetable.findByIdAndUpdate(_id, {
        day, time, courseId, courseName, facultyName, room
      }, { new: true });
    } else {
      entry = new Timetable({ userId, day, time, courseId, courseName, facultyName, room });
      await entry.save();
    }
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete Timetable Entry
exports.deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await Timetable.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

