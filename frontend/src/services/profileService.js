const API_URL = 'http://localhost:5000/api/profile';

// Get profile from backend
export async function getProfileForStudent(studentId) {
  // We ignore studentId because for "me" route, the token defines the user.
  // Unless we want Admin logic here? But this function name implies getting A profile.
  // For the context of "Resolving Student Profile Not Found", it is the student looking at their own profile.

  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }

  // Transform backend data to match frontend expectations if needed
  return {
    name: data.name,
    studentId: data.studentId,
    email: data.email,
    phone: data.phone || '',
    department: data.department || '', // Backend might not have department yet, send empty string
  };
}

// Update student profile
export async function updateProfile(studentId, updates) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return {
    name: data.user.name,
    studentId: data.user.studentId,
    email: data.user.email,
    phone: data.user.phone || '',
    createdAt: data.user.createdAt
  };
}


