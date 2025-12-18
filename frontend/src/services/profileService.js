import mockStudents, { mockStudents as students } from '../data/mockStudents';

// Get profile information for a student by studentId.
// This reads from the shared mock "database" so any admin updates
// to that data are reflected automatically.
export function getProfileForStudent(studentId) {
  if (!studentId) {
    throw new Error('Student ID is required to fetch profile.');
  }

  const allStudents = students || mockStudents;
  const student = allStudents.find((s) => s.studentId === studentId);

  if (!student) {
    throw new Error('Student profile not found.');
  }

  // Optionally merge with auth user info from localStorage
  const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');

  return {
    name: student.name,
    studentId: student.studentId,
    email: student.email,
    phone: student.phone || storedAuth.phone || '',
    department: student.department || '',
  };
}


