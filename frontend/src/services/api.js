import { attendance, marks, fees } from '../data/mockAcademicData';
import mockStudents from '../data/mockStudents';
import { mockUsers } from '../data/mockUsers';

// All APIs below are mock, in-memory implementations.
// Later you can swap these with real fetch calls without changing the UI.

export const feesAPI = {
  getFees: async () => {
    const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');
    const studentId = storedAuth.studentId;
    const role = storedAuth.role;

    if (role !== 'student') {
      throw new Error('Only students can access fees information.');
    }

    if (!studentId) {
      throw new Error('No student information found. Please log in as a student.');
    }

    const studentFees = fees.filter((f) => f.studentId === studentId);

    const summary = studentFees.reduce(
      (acc, f) => {
        acc.totalAmount += f.amount || 0;
        if (f.status === 'Paid') acc.paidAmount += f.amount || 0;
        if (f.status === 'Pending') acc.pendingAmount += f.amount || 0;
        return acc;
      },
      { totalAmount: 0, paidAmount: 0, pendingAmount: 0 }
    );

    const feesWithIds = studentFees.map((f, index) => ({
      id: `${f.studentId}-${f.semester}-${index}`,
      ...f,
    }));

    return {
      fees: feesWithIds,
      summary,
    };
  },
};

// Simple mock course data (not per-student for now)
const mockCourses = [
  {
    id: 'CSE101',
    courseCode: 'CSE101',
    courseName: 'Programming Fundamentals',
    credits: 4,
    instructor: 'Dr. Smith',
  },
  {
    id: 'MAT101',
    courseCode: 'MAT101',
    courseName: 'Engineering Mathematics I',
    credits: 3,
    instructor: 'Dr. Johnson',
  },
  {
    id: 'PHY101',
    courseCode: 'PHY101',
    courseName: 'Physics I',
    credits: 3,
    instructor: 'Dr. Lee',
  },
];

export const coursesAPI = {
  getCourses: async () => {
    const totalCourses = mockCourses.length;
    const totalCredits = mockCourses.reduce(
      (sum, c) => sum + (c.credits || 0),
      0
    );
    return {
      courses: mockCourses,
      totalCourses,
      totalCredits,
    };
  },
};

// Simple mock timetable data
const mockTimetable = {
  schedule: [
    {
      day: 'Monday',
      classes: [
        { time: '09:00', subject: 'Programming Fundamentals', room: 'Lab 1' },
        { time: '11:00', subject: 'Engineering Mathematics I', room: 'Room 204' },
      ],
    },
    {
      day: 'Wednesday',
      classes: [
        { time: '10:00', subject: 'Physics I', room: 'Room 105' },
        { time: '14:00', subject: 'Programming Fundamentals', room: 'Lab 2' },
      ],
    },
    {
      day: 'Friday',
      classes: [
        { time: '09:00', subject: 'Engineering Mathematics I', room: 'Room 204' },
      ],
    },
  ],
};

export const timetableAPI = {
  getTimetable: async () => mockTimetable,
};

export const profileAPI = {
  getProfile: async () => {
    const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');
    if (!storedAuth || !storedAuth.email) {
      throw new Error('No profile information found. Please log in again.');
    }

    // If admin, return admin-specific profile
    if (storedAuth.role === 'admin') {
      return {
        name: storedAuth.name || 'Admin',
        studentId: '',
        email: storedAuth.email,
        phone: storedAuth.phone || '',
        role: 'admin',
        createdAt: storedAuth.createdAt || new Date().toISOString(),
      };
    }

    // Student profile
    return {
      name: storedAuth.name || '',
      studentId: storedAuth.studentId || '',
      email: storedAuth.email || '',
      phone: storedAuth.phone || '',
      createdAt: storedAuth.createdAt || new Date().toISOString(),
    };
  },

  updateProfile: async (profileData) => {
    const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');
    const role = storedAuth.role || localStorage.getItem('role');

    // Admins can update any profile info stored in authData
    if (role === 'admin') {
      const updatedAuth = {
        ...storedAuth,
        ...profileData,
      };
      localStorage.setItem('authData', JSON.stringify(updatedAuth));
      return { user: updatedAuth };
    }

    // Students may update only limited fields: name, email, phone
    if (role === 'student') {
      const allowed = ['name', 'email', 'phone'];
      const updates = {};
      allowed.forEach((k) => {
        if (profileData[k] !== undefined) updates[k] = profileData[k];
      });

      // Prevent changing email to one already used by another account
      if (updates.email) {
        const emailLower = updates.email.trim().toLowerCase();
        const conflict = mockUsers.find((u) => u.email && u.email.toLowerCase() === emailLower && u.studentId !== storedAuth.studentId);
        if (conflict) throw new Error('Email already in use by another account.');
      }

      const updatedAuth = { ...storedAuth, ...updates };
      localStorage.setItem('authData', JSON.stringify(updatedAuth));

      // Update central student profile
      const studentIndex = mockStudents.findIndex((s) => s.studentId === storedAuth.studentId);
      if (studentIndex > -1) {
        mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updates };
      }

      // Update mockUsers record for this student
      const userIndex = mockUsers.findIndex((u) => u.studentId === storedAuth.studentId);
      if (userIndex > -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      }

      return { user: updatedAuth };
    }

    throw new Error('Insufficient permissions to update profile.');
  },
};

export const seedAPI = {
  seedData: async () => {
    // For mock mode, report counts. If admin, report totals across all students.
    const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');
    const role = storedAuth.role;

    if (role === 'admin') {
      const totalAttendance = attendance.length;
      const totalMarks = marks.length;
      const totalFees = fees.length;
      return {
        message: 'Mock data overview',
        data: {
          attendance: totalAttendance,
          marks: totalMarks,
          fees: totalFees,
          courses: mockCourses.length,
          timetable: mockTimetable.schedule.length,
        },
      };
    }

    const studentId = storedAuth.studentId;
    const studentAttendance = attendance.filter((a) => a.studentId === studentId);
    const studentMarks = marks.filter((m) => m.studentId === studentId);
    const studentFees = fees.filter((f) => f.studentId === studentId);

    return {
      message: 'Mock data already loaded',
      data: {
        attendance: studentAttendance.length,
        marks: studentMarks.length,
        fees: studentFees.length,
        courses: mockCourses.length,
        timetable: mockTimetable.schedule.length,
      },
    };
  },
};

