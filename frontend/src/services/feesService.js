const API_FEES = 'http://localhost:5000/api/fees';
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export async function getFeesRecordsForStudent(userId) {
  try {
    const response = await fetch(`${API_FEES}?userId=${userId}`, { headers: getHeaders() });
    if (!response.ok) return [];
    const data = await response.json();
    // Backend returns { fees: [], summary: {} }
    return data.fees || [];
  } catch (e) {
    return [];
  }
}

export async function getStudentFees() {
  try {
    const response = await fetch(API_FEES, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch fees');
    return await response.json();
  } catch (e) {
    throw e;
  }
}

export async function updateFeeRecord(updatedRecord) {
  try {
    const response = await fetch(API_FEES, {
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

export async function addFeeRecord(newRecord) {
  // same endpoint handles upsert
  return updateFeeRecord(newRecord);
}

export default {
  getFeesRecordsForStudent,
  updateFeeRecord,
  addFeeRecord,
};
