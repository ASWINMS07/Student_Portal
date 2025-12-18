import { mockStudents } from '../data/mockStudents';

export function getAllStudents() {
  return mockStudents;
}

export function getStudentById(studentId) {
  if (!studentId) return null;
  return mockStudents.find((s) => s.studentId === studentId) || null;
}

export function updateStudent(studentId, updates) {
  if (!studentId) return null;
  // Only admins may update student records from the UI
  try {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      console.warn('Only admins can update student records.');
      return null;
    }
  } catch (e) {
    return null;
  }

  const index = mockStudents.findIndex((s) => s.studentId === studentId);
  if (index === -1) return null;

  const updated = {
    ...mockStudents[index],
    ...updates,
  };

  mockStudents[index] = updated;
  return updated;
}


