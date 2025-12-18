import { fees as feesRecords } from '../data/mockAcademicData';

export function getFeesRecordsForStudent(studentId) {
  if (!studentId) return [];
  return feesRecords.filter((f) => f.studentId === studentId).map((r) => ({ ...r }));
}

export function updateFeeRecord(updatedRecord) {
  if (!updatedRecord || !updatedRecord.studentId || updatedRecord.semester == null) return;
  try {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      console.warn('Only admins can update fee records.');
      return;
    }
  } catch (e) {
    return;
  }

  const index = feesRecords.findIndex(
    (r) => r.studentId === updatedRecord.studentId && r.semester === updatedRecord.semester
  );

  if (index !== -1) {
    feesRecords[index] = { ...updatedRecord };
  }
}

export function addFeeRecord(newRecord) {
  if (!newRecord || !newRecord.studentId || newRecord.semester == null) return;
  try {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      console.warn('Only admins can add fee records.');
      return;
    }
  } catch (e) {
    return;
  }

  feesRecords.push({ ...newRecord });
}

export default {
  getFeesRecordsForStudent,
  updateFeeRecord,
  addFeeRecord,
};
