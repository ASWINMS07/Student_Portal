import { attendance as attendanceRecords } from '../data/mockAcademicData';

// Get structured attendance for a single student (used by student dashboard)
export function getAttendanceForStudent(studentId) {
  if (!studentId) {
    throw new Error('Student ID is required to fetch attendance.');
  }

  const studentRecords = attendanceRecords.filter(
    (record) => record.studentId === studentId
  );

  if (studentRecords.length === 0) {
    return { subjects: [], overall: null };
  }

  const subjects = studentRecords.map((record) => ({
    subject: record.subject,
    attendedClasses: record.attendedClasses,
    totalClasses: record.totalClasses,
    percentage:
      typeof record.percentage === 'number'
        ? record.percentage
        : Math.round(
            (record.attendedClasses / Math.max(record.totalClasses || 1, 1)) *
              100
          ),
  }));

  const totalAttended = studentRecords.reduce(
    (sum, r) => sum + (r.attendedClasses || 0),
    0
  );
  const totalClasses = studentRecords.reduce(
    (sum, r) => sum + (r.totalClasses || 0),
    0
  );

  const overall =
    totalClasses > 0
      ? {
          attendedClasses: totalAttended,
          totalClasses,
          percentage: Math.round((totalAttended / totalClasses) * 100),
        }
      : null;

  return { subjects, overall };
}

// Raw attendance records for admin editing
export function getAttendanceRecordsForStudent(studentId) {
  if (!studentId) return [];
  return attendanceRecords
    .filter((record) => record.studentId === studentId)
    .map((record) => ({ ...record }));
}

// Update a single attendance record in the shared mock data
export function updateAttendanceRecord(updatedRecord) {
  if (!updatedRecord || !updatedRecord.studentId || !updatedRecord.subject) {
    return;
  }

  // Only admins may update attendance in the mock data
  try {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      console.warn('Only admins can update attendance records.');
      return;
    }
  } catch (e) {
    return;
  }

  const index = attendanceRecords.findIndex(
    (record) =>
      record.studentId === updatedRecord.studentId &&
      record.subject === updatedRecord.subject
  );

  if (index !== -1) {
    attendanceRecords[index] = { ...updatedRecord };
  }
}


