const API_MARKS = 'http://localhost:5000/api/marks';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Structured marks for student dashboard
export async function getMarksForStudent(studentId) {
  // studentId ignored if using req.userId in backend for student role
  try {
    const response = await fetch(API_MARKS, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch marks");
    return await response.json(); // Returns { semesters: [...] }
  } catch (e) {
    console.error(e);
    return { semesters: [] };
  }
}

// Admin helpers

// Helper to fetch all marks for a student (using Admin query param)
async function fetchStudentMarks(userId) {
  try {
    const response = await fetch(`${API_MARKS}?userId=${userId}`, { headers: getHeaders() });
    if (!response.ok) return { semesters: [] };
    return await response.json();
  } catch (e) {
    return { semesters: [] };
  }
}

export async function getSemestersForStudent(userId) {
  const data = await fetchStudentMarks(userId);
  if (!data.semesters) return [];
  return data.semesters.map(s => s.semester);
}

export async function getMarksForStudentAndSemester(userId, semester) {
  const data = await fetchStudentMarks(userId);
  if (!data.semesters) return [];
  const semData = data.semesters.find(s => String(s.semester) === String(semester));
  return semData ? semData.subjects : [];
}

export async function updateMarkRecord(updatedRecord) {
  // updatedRecord: { userId, semester, subject, internalMarks, ... }
  try {
    const response = await fetch(API_MARKS, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedRecord)
    });
    if (!response.ok) throw new Error("Failed update");
    return await response.json();
  } catch (e) {
    console.error(e);
  }
}


