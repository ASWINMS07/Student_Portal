const API_URL = 'http://localhost:5000/api/user/students';

// Helper to get headers with token
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export async function getAllStudents() {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

export async function getStudentById(studentId) {
  try {
    const response = await fetch(`${API_URL}/${studentId}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Student not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching student:', error);
    return null;
  }
}

export async function updateStudent(id, updates) {
  try {
    // 'id' here should be the MongoDB _id
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update student');
    return await response.json();
  } catch (error) {
    console.error('Error updating student:', error);
    return null;
  }
}

export async function deleteStudent(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete student');
    return true;
  } catch (error) {
    console.error('Error deleting student:', error);
    return false;
  }
}


