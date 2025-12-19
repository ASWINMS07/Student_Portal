const Course = require('../models/Course');

// Get all courses (Global pool)
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseId: 1 });

    res.json({
      courses: courses.map(c => ({
        _id: c._id,
        courseId: c.courseId,
        courseName: c.courseName,
        facultyName: c.facultyName,
        description: c.description
      })),
      totalCourses: courses.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update Course (Upsert)
exports.updateCourse = async (req, res) => {
  try {
    const { _id, courseId, courseName, facultyName, description } = req.body;

    let course;
    if (_id) {
      course = await Course.findByIdAndUpdate(_id, {
        courseId, courseName, facultyName, description
      }, { new: true });
    } else {
      // Check if courseId exists
      const exists = await Course.findOne({ courseId });
      if (exists) {
        return res.status(400).json({ message: 'Course ID already exists' });
      }
      course = new Course({ courseId, courseName, facultyName, description });
      await course.save();
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete Course
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await Course.findByIdAndDelete(id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

