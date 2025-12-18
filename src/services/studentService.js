// Central student service for server-side / shared logic.
// Currently uses local mock data, but can be swapped to MongoDB-backed
// models or external APIs without changing callers.

import mockStudents, { mockStudents as studentsArray } from '../data/mockStudents.js';

// Internal helper to always work on the same in-memory array
function getStore() {
  // Prefer named export if available, fallback to default
  return studentsArray || mockStudents;
}

/**
 * Get all students.
 * Later this can call a database (e.g. Student.find()) or an external API.
 */
export function getAllStudents() {
  const store = getStore();
  return store;
}

/**
 * Get a single student by studentId.
 */
export function getStudentById(studentId) {
  if (!studentId) return null;
  const store = getStore();
  return store.find((s) => s.studentId === studentId) || null;
}

/**
 * Update a student's profile.
 * @param {string} studentId
 * @param {Object} updates - fields to update (e.g. { name, email, phone, department })
 * @returns updated student or null if not found
 */
export function updateStudentProfile(studentId, updates = {}) {
  if (!studentId) return null;

  const store = getStore();
  const index = store.findIndex((s) => s.studentId === studentId);
  if (index === -1) return null;

  const updated = {
    ...store[index],
    ...updates,
  };

  store[index] = updated;
  return updated;
}


