import { marks as marksRecords } from '../data/mockAcademicData';

// Structured marks for student dashboard
export function getMarksForStudent(studentId) {
  if (!studentId) {
    throw new Error('Student ID is required to fetch marks.');
  }

  const studentMarks = marksRecords.filter(
    (record) => record.studentId === studentId
  );

  if (studentMarks.length === 0) {
    return { semesters: [] };
  }

  const semestersMap = new Map();

  studentMarks.forEach((record) => {
    const semKey = record.semester;
    if (!semestersMap.has(semKey)) {
      semestersMap.set(semKey, {
        semester: semKey,
        subjects: [],
        totalMarks: 0,
        maxMarks: 0,
      });
    }
    const sem = semestersMap.get(semKey);

    const total = record.total;
    const maxPerSubject = 100; // assumption for mock data

    sem.subjects.push({
      subject: record.subject,
      internalMarks: record.internalMarks,
      externalMarks: record.externalMarks,
      total,
      grade: record.grade,
    });

    sem.totalMarks += typeof total === 'number' ? total : 0;
    sem.maxMarks += maxPerSubject;
  });

  const semesters = Array.from(semestersMap.values()).map((sem) => ({
    ...sem,
    percentage:
      sem.maxMarks > 0 ? Math.round((sem.totalMarks / sem.maxMarks) * 100) : 0,
  }));

  semesters.sort((a, b) => a.semester - b.semester);

  return { semesters };
}

// Admin helpers
export function getSemestersForStudent(studentId) {
  if (!studentId) return [];
  const studentMarks = marksRecords.filter(
    (record) => record.studentId === studentId
  );
  return Array.from(new Set(studentMarks.map((rec) => rec.semester))).sort(
    (a, b) => a - b
  );
}

export function getMarksForStudentAndSemester(studentId, semester) {
  if (!studentId || !semester) return [];
  return marksRecords
    .filter(
      (record) =>
        record.studentId === studentId && record.semester === Number(semester)
    )
    .map((record) => ({ ...record }));
}

export function updateMarkRecord(updatedRecord) {
  if (
    !updatedRecord ||
    !updatedRecord.studentId ||
    updatedRecord.semester == null ||
    !updatedRecord.subject
  ) {
    return;
  }

  // Only admins may update marks in the mock data
  try {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      console.warn('Only admins can update mark records.');
      return;
    }
  } catch (e) {
    return;
  }

  const index = marksRecords.findIndex(
    (record) =>
      record.studentId === updatedRecord.studentId &&
      record.semester === updatedRecord.semester &&
      record.subject === updatedRecord.subject
  );

  if (index !== -1) {
    marksRecords[index] = { ...updatedRecord };
  }
}


