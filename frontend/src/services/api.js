const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  login: async ({ identifier, password }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }
};

export const attendanceAPI = {
  getAttendance: async () => {
    const response = await fetch(`${API_URL}/attendance`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }
};

export const marksAPI = {
  getMarks: async () => {
    const response = await fetch(`${API_URL}/marks`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }
};

export const feesAPI = {
  getFees: async () => {
    const response = await fetch(`${API_URL}/fees`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }
};

export const coursesAPI = {
  getCourses: async () => {
    const response = await fetch(`${API_URL}/courses`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }
};

export const timetableAPI = {
  getTimetable: async () => {
    const response = await fetch(`${API_URL}/timetable`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }
};

export const profileAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/profile`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }
};

export const seedAPI = {
  seedData: async () => {
    const response = await fetch(`${API_URL}/seed`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }
};

