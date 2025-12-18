import { mockUsers } from '../data/mockUsers';
import mockStudents from '../data/mockStudents';

export function getStudentUsers() {
  return mockUsers.filter((user) => user.role === 'student' && user.studentId);
}

// Find a user by email or studentId plus password (used for login)
export function findUserByCredentials({ email, studentId, password, role }) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedStudentId = (studentId || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();

  return mockUsers.find((u) => {
    // Check role matches
    if (u.role !== role) return false;

    // Check password matches
    if (u.password !== trimmedPassword) return false;

    // For students: must match studentId AND email
    if (role === 'student') {
      const matchesStudentId =
        u.studentId && u.studentId.toLowerCase() === trimmedStudentId;
      const matchesEmail =
        u.email && u.email.toLowerCase() === trimmedEmail;
      return matchesStudentId && matchesEmail;
    }

    // For admin: only need to match email
    if (role === 'admin') {
      return u.email && u.email.toLowerCase() === trimmedEmail;
    }

    return false;
  });
}

// Simple in-memory registration for mock data
export function registerStudent({ name, studentId, email, password, role = 'student' }) {
  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedStudentId = (studentId || '').trim().toLowerCase();

  // Prevent duplicates across users and central student store
  const existingUser = mockUsers.find((u) => {
    const emailMatch = u.email && u.email.toLowerCase() === trimmedEmail;
    const idMatch = u.studentId && u.studentId.toLowerCase() === trimmedStudentId;
    return emailMatch || idMatch;
  });

  const existingStudent = mockStudents.find((s) => {
    const idMatch = s.studentId && s.studentId.toLowerCase() === trimmedStudentId;
    const emailMatch = s.email && s.email.toLowerCase() === trimmedEmail;
    return idMatch || emailMatch;
  });

  if (existingUser || existingStudent) {
    throw new Error('A user with this email or student ID already exists.');
  }

  const newUser = {
    studentId,
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'student',
  };

  mockUsers.push(newUser);
  // If registering a student, also add a central student profile (used by admin/student dashboards)
  if ((role || 'student') === 'student') {
    const newStudentProfile = {
      studentId,
      name,
      email,
      phone: '',
      department: '',
    };
    mockStudents.push(newStudentProfile);
  }
  return newUser;
}



