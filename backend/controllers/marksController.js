const Marks = require('../models/Marks');

// Get user marks grouped by semester
exports.getMarks = async (req, res) => {
  try {
    const marks = await Marks.find({ userId: req.userId }).sort({ semester: 1, subject: 1 });

    // Group by semester
    const semesters = marks.reduce((acc, record) => {
      const sem = record.semester;
      if (!acc[sem]) {
        acc[sem] = {
          semester: sem,
          subjects: [],
          totalMarks: 0,
          maxMarks: 0
        };
      }
      acc[sem].subjects.push({
        subject: record.subject,
        internalMarks: record.internalMarks,
        externalMarks: record.externalMarks,
        total: record.total,
        grade: record.grade
      });
      acc[sem].totalMarks += record.total;
      acc[sem].maxMarks += 100; // Assuming max 100 per subject
      return acc;
    }, {});

    // Convert to array and calculate percentages
    const semesterData = Object.values(semesters).map(sem => ({
      ...sem,
      percentage: sem.maxMarks > 0 ? Math.round((sem.totalMarks / sem.maxMarks) * 100) : 0
    }));

    res.json({ semesters: semesterData });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

