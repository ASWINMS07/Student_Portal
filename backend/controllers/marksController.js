const Marks = require('../models/Marks');

// Get user marks grouped by semester
exports.getMarks = async (req, res) => {
  try {
    let targetUserId = req.userId;

    // Admin check similar to attendance
    const User = require('../models/User');
    const currentUser = await User.findById(req.userId);

    // If raw list requested (no grouping), we might handle it differently, 
    // but for now let's keep consistent with student view or add specific admin view.
    // The previous code returned grouped semesters.

    if (currentUser && currentUser.role === 'admin' && req.query.userId) {
      targetUserId = req.query.userId;
    }

    const marks = await Marks.find({ userId: targetUserId }).sort({ semester: 1, subject: 1 });

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

// Admin: Update student marks
exports.updateMarks = async (req, res) => {
  try {
    const { _id, userId, semester, subject, internalMarks, externalMarks, total, grade } = req.body;

    let markRecord;

    if (_id) {
      markRecord = await Marks.findById(_id);
      if (markRecord) {
        markRecord.semester = semester;
        markRecord.subject = subject;
        markRecord.internalMarks = internalMarks;
        markRecord.externalMarks = externalMarks;
        markRecord.total = total;
        markRecord.grade = grade;
        await markRecord.save();
      }
    }

    if (!markRecord) {
      markRecord = await Marks.findOne({ userId, semester, subject });

      if (markRecord) {
        markRecord.internalMarks = internalMarks;
        markRecord.externalMarks = externalMarks;
        markRecord.total = total;
        markRecord.grade = grade;
        await markRecord.save();
      } else {
        markRecord = new Marks({
          userId,
          semester,
          subject,
          internalMarks,
          externalMarks,
          total,
          grade
        });
        await markRecord.save();
      }
    }

    res.json(markRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

