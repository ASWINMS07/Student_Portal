const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Fees = require('../models/Fees');

// Get all students (Admin only)
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get single student (Admin only - or own profile)
exports.getStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update student (Admin or Self)
exports.updateStudent = async (req, res) => {
    try {
        const { name, email, phone, department } = req.body;

        // TODO: Add strict role check if needed, middleware handles basic 'auth'
        // but here we might want to ensure only Admins can update ANYONE, 
        // and students can only update THEMSELVES (via profile route usually).
        // Assuming this route is protected for Admin use mainly for generic updates.

        const student = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, department },
            { new: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete student (Admin only)
exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await User.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete related data
        await Promise.all([
            Attendance.deleteMany({ userId: studentId }),
            Marks.deleteMany({ userId: studentId }),
            Fees.deleteMany({ userId: studentId }),
            User.findByIdAndDelete(studentId)
        ]);

        res.json({ message: 'Student and related data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};