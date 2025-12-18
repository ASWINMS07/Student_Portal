const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Fees = require('../models/Fees');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');

// Seed dummy data for logged-in user
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.userId;

    // Clear existing data for this user
    await Promise.all([
      Attendance.deleteMany({ userId }),
      Marks.deleteMany({ userId }),
      Fees.deleteMany({ userId }),
      Course.deleteMany({ userId }),
      Timetable.deleteMany({ userId })
    ]);

    // Seed Attendance
    const attendanceData = [
      { userId, subject: 'Mathematics', attendedClasses: 42, totalClasses: 45 },
      { userId, subject: 'Physics', attendedClasses: 38, totalClasses: 45 },
      { userId, subject: 'Chemistry', attendedClasses: 40, totalClasses: 45 },
      { userId, subject: 'English', attendedClasses: 35, totalClasses: 40 },
      { userId, subject: 'Computer Science', attendedClasses: 44, totalClasses: 45 },
      { userId, subject: 'Electronics', attendedClasses: 36, totalClasses: 42 }
    ];
    await Attendance.insertMany(attendanceData);

    // Seed Marks
    const marksData = [
      // Semester 1
      { userId, semester: 1, subject: 'Mathematics I', internalMarks: 28, externalMarks: 62, total: 90, grade: 'A+' },
      { userId, semester: 1, subject: 'Physics I', internalMarks: 25, externalMarks: 55, total: 80, grade: 'A' },
      { userId, semester: 1, subject: 'Chemistry', internalMarks: 22, externalMarks: 50, total: 72, grade: 'B+' },
      { userId, semester: 1, subject: 'English', internalMarks: 26, externalMarks: 58, total: 84, grade: 'A' },
      { userId, semester: 1, subject: 'Programming Basics', internalMarks: 29, externalMarks: 65, total: 94, grade: 'A+' },
      // Semester 2
      { userId, semester: 2, subject: 'Mathematics II', internalMarks: 27, externalMarks: 60, total: 87, grade: 'A' },
      { userId, semester: 2, subject: 'Physics II', internalMarks: 24, externalMarks: 52, total: 76, grade: 'B+' },
      { userId, semester: 2, subject: 'Data Structures', internalMarks: 28, externalMarks: 63, total: 91, grade: 'A+' },
      { userId, semester: 2, subject: 'Digital Electronics', internalMarks: 23, externalMarks: 48, total: 71, grade: 'B+' },
      { userId, semester: 2, subject: 'Communication Skills', internalMarks: 25, externalMarks: 55, total: 80, grade: 'A' },
      // Semester 3
      { userId, semester: 3, subject: 'Mathematics III', internalMarks: 26, externalMarks: 58, total: 84, grade: 'A' },
      { userId, semester: 3, subject: 'Database Systems', internalMarks: 27, externalMarks: 61, total: 88, grade: 'A' },
      { userId, semester: 3, subject: 'Operating Systems', internalMarks: 24, externalMarks: 54, total: 78, grade: 'B+' },
      { userId, semester: 3, subject: 'Computer Networks', internalMarks: 25, externalMarks: 57, total: 82, grade: 'A' },
      { userId, semester: 3, subject: 'OOP with Java', internalMarks: 28, externalMarks: 64, total: 92, grade: 'A+' }
    ];
    await Marks.insertMany(marksData);

    // Seed Fees
    const feesData = [
      { userId, semester: 1, amount: 45000, dueDate: new Date('2024-01-15'), status: 'Paid' },
      { userId, semester: 2, amount: 45000, dueDate: new Date('2024-07-15'), status: 'Paid' },
      { userId, semester: 3, amount: 48000, dueDate: new Date('2025-01-15'), status: 'Paid' },
      { userId, semester: 4, amount: 48000, dueDate: new Date('2025-07-15'), status: 'Pending' }
    ];
    await Fees.insertMany(feesData);

    // Seed Courses
    const coursesData = [
      { userId, courseCode: 'CS301', courseName: 'Database Systems', credits: 4, instructor: 'Dr. Sharma' },
      { userId, courseCode: 'CS302', courseName: 'Operating Systems', credits: 4, instructor: 'Prof. Gupta' },
      { userId, courseCode: 'CS303', courseName: 'Computer Networks', credits: 3, instructor: 'Dr. Patel' },
      { userId, courseCode: 'CS304', courseName: 'Web Development', credits: 3, instructor: 'Ms. Reddy' },
      { userId, courseCode: 'MA301', courseName: 'Discrete Mathematics', credits: 3, instructor: 'Dr. Kumar' },
      { userId, courseCode: 'HS301', courseName: 'Professional Ethics', credits: 2, instructor: 'Prof. Singh' }
    ];
    await Course.insertMany(coursesData);

    // Seed Timetable
    const timetableData = [
      // Monday
      { userId, day: 'Monday', time: '09:00', subject: 'Database Systems', room: 'Room 301' },
      { userId, day: 'Monday', time: '10:00', subject: 'Operating Systems', room: 'Room 205' },
      { userId, day: 'Monday', time: '11:00', subject: 'Computer Networks', room: 'Lab 3' },
      { userId, day: 'Monday', time: '14:00', subject: 'Discrete Mathematics', room: 'Room 102' },
      // Tuesday
      { userId, day: 'Tuesday', time: '09:00', subject: 'Web Development', room: 'Lab 1' },
      { userId, day: 'Tuesday', time: '11:00', subject: 'Database Systems', room: 'Room 301' },
      { userId, day: 'Tuesday', time: '14:00', subject: 'Professional Ethics', room: 'Room 401' },
      { userId, day: 'Tuesday', time: '15:00', subject: 'Operating Systems', room: 'Room 205' },
      // Wednesday
      { userId, day: 'Wednesday', time: '09:00', subject: 'Computer Networks', room: 'Room 303' },
      { userId, day: 'Wednesday', time: '10:00', subject: 'Discrete Mathematics', room: 'Room 102' },
      { userId, day: 'Wednesday', time: '11:00', subject: 'Web Development', room: 'Lab 1' },
      { userId, day: 'Wednesday', time: '14:00', subject: 'Database Systems', room: 'Lab 2' },
      // Thursday
      { userId, day: 'Thursday', time: '09:00', subject: 'Operating Systems', room: 'Lab 4' },
      { userId, day: 'Thursday', time: '10:00', subject: 'Professional Ethics', room: 'Room 401' },
      { userId, day: 'Thursday', time: '11:00', subject: 'Computer Networks', room: 'Room 303' },
      { userId, day: 'Thursday', time: '15:00', subject: 'Discrete Mathematics', room: 'Room 102' },
      // Friday
      { userId, day: 'Friday', time: '09:00', subject: 'Web Development', room: 'Lab 1' },
      { userId, day: 'Friday', time: '10:00', subject: 'Database Systems', room: 'Room 301' },
      { userId, day: 'Friday', time: '11:00', subject: 'Operating Systems', room: 'Room 205' },
      { userId, day: 'Friday', time: '14:00', subject: 'Computer Networks', room: 'Lab 3' }
    ];
    await Timetable.insertMany(timetableData);

    res.json({ 
      message: 'Dummy data seeded successfully',
      data: {
        attendance: attendanceData.length,
        marks: marksData.length,
        fees: feesData.length,
        courses: coursesData.length,
        timetable: timetableData.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding data', error: error.message });
  }
});

module.exports = router;

