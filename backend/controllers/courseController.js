const Course = require('../models/Course');

// Get user courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId }).sort({ courseCode: 1 });

    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

    res.json({
      courses: courses.map(c => ({
        id: c._id,
        courseCode: c.courseCode,
        courseName: c.courseName,
        credits: c.credits,
        instructor: c.instructor
      })),
      totalCredits,
      totalCourses: courses.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

