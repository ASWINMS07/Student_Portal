const Timetable = require('../models/Timetable');

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Get user timetable
exports.getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.find({ userId: req.userId });

    // Group by day
    const schedule = dayOrder.reduce((acc, day) => {
      const dayEntries = timetable
        .filter(entry => entry.day === day)
        .map(entry => ({
          id: entry._id,
          time: entry.time,
          subject: entry.subject,
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

