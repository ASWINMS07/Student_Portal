// Central mock academic data for frontend (student & admin views)
// NOTE: This mirrors the root-level mockAcademicData used elsewhere.

// Attendance records per student and subject
export const attendance = [
  // John Doe (S1001)
  {
    studentId: 'S1001',
    subject: 'Mathematics',
    attendedClasses: 38,
    totalClasses: 40,
    percentage: 95,
  },
  {
    studentId: 'S1001',
    subject: 'Physics',
    attendedClasses: 34,
    totalClasses: 40,
    percentage: 85,
  },
  {
    studentId: 'S1001',
    subject: 'Computer Science',
    attendedClasses: 32,
    totalClasses: 40,
    percentage: 80,
  },

  // Jane Smith (S1002)
  {
    studentId: 'S1002',
    subject: 'Mathematics',
    attendedClasses: 30,
    totalClasses: 40,
    percentage: 75,
  },
  {
    studentId: 'S1002',
    subject: 'Physics',
    attendedClasses: 28,
    totalClasses: 40,
    percentage: 70,
  },
  {
    studentId: 'S1002',
    subject: 'Computer Science',
    attendedClasses: 36,
    totalClasses: 40,
    percentage: 90,
  },
];

// Marks records per student, semester and subject
export const marks = [
  // John Doe (S1001) - Semester 1
  {
    studentId: 'S1001',
    semester: 1,
    subject: 'Mathematics I',
    internalMarks: 25,
    externalMarks: 60,
    total: 85,
    grade: 'A',
  },
  {
    studentId: 'S1001',
    semester: 1,
    subject: 'Physics I',
    internalMarks: 22,
    externalMarks: 58,
    total: 80,
    grade: 'A',
  },
  {
    studentId: 'S1001',
    semester: 1,
    subject: 'Programming Fundamentals',
    internalMarks: 28,
    externalMarks: 62,
    total: 90,
    grade: 'O',
  },

  // Jane Smith (S1002) - Semester 1
  {
    studentId: 'S1002',
    semester: 1,
    subject: 'Mathematics I',
    internalMarks: 20,
    externalMarks: 50,
    total: 70,
    grade: 'B',
  },
  {
    studentId: 'S1002',
    semester: 1,
    subject: 'Physics I',
    internalMarks: 18,
    externalMarks: 48,
    total: 66,
    grade: 'B',
  },
  {
    studentId: 'S1002',
    semester: 1,
    subject: 'Programming Fundamentals',
    internalMarks: 24,
    externalMarks: 55,
    total: 79,
    grade: 'B+',
  },
];

// Fees records per student and semester
export const fees = [
  // John Doe (S1001)
  {
    studentId: 'S1001',
    semester: 1,
    amount: 50000,
    status: 'Paid',
    dueDate: '2025-01-15',
    paidDate: '2025-01-10',
  },
  {
    studentId: 'S1001',
    semester: 2,
    amount: 52000,
    status: 'Pending',
    dueDate: '2025-06-15',
    paidDate: null,
  },

  // Jane Smith (S1002)
  {
    studentId: 'S1002',
    semester: 1,
    amount: 50000,
    status: 'Paid',
    dueDate: '2025-01-15',
    paidDate: '2025-01-14',
  },
  {
    studentId: 'S1002',
    semester: 2,
    amount: 52000,
    status: 'Pending',
    dueDate: '2025-06-15',
    paidDate: null,
  },
];

const mockAcademicData = {
  attendance,
  marks,
  fees,
};

export default mockAcademicData;


