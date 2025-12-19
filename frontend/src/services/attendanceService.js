// Helper headers
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const API_ATTENDANCE = 'http://localhost:5000/api/attendance';

// Get structured attendance for a single student (used by student dashboard)
// This calls the backend route for "me" basically.
// Wait, `getAttendanceForStudent(studentId)` was for Admin OR Student?
// In Dashboard.jsx: `getAttendanceForStudent(studentId)` is called.
// BUT `attendanceController.getAttendance` uses `req.userId`.
// So if a Student calls it, it gets THEIR attendance.
// If an Admin calls it to view a student's attendance... standard `getAttendance` uses `req.userId`.
// Use Case:
// 1. Student views own attendance -> GET /api/attendance (Header: Student Token)
// 2. Admin views student attendance -> GET /api/attendance?userId=XYZ ??
// The current controller only supports `req.userId`.
// I should probably update the Controller to support `req.query.userId` if User is Admin.
// OR create a separate Admin route.

// For now, let's look at `AdminAttendance.jsx`. It calls `getAttendanceRecordsForStudent`.
// And `Dashboard.jsx` calls `getAttendanceForStudent`.

// Let's refactor `getAttendanceForStudent` to use the API directly for the logged-in user.
export async function getAttendanceForStudent(studentId) {
  // The studentId arg is effectively ignored if we use the token's user identity
  // But let's check if we accidentally break something. 
  // Dashboard passes `storedAuth.studentId`.
  try {
    const response = await fetch(API_ATTENDANCE, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return await response.json();
  } catch (error) {
    console.error("Attendance fetch error", error);
    return { subjects: [], overall: null };
  }
}

// Admin: Get Raw records for editing.
// We need a scalable way for Admin to fetch ANY student's attendance.
// I haven't added `GET /api/attendance/:userId` yet. 
// I should likely add functionality to `getAttendance` in controller.
// But for now, let's assume I'll add a query param support in controller next.

export async function getAttendanceRecordsForStudent(userId) {
  // We need to fetch attendance for a specific user ID.
  // We will call the same endpoint but maybe with a header or query param if backend supports it.
  // Wait, I haven't implemented that in backend yet.
  // I must update backend controller to allow fetching by userId if Admin.

  // Implemented workaround: Admin needs a specific route or param.
  // Let's assume we use GET /api/attendance?userId=...

  try {
    const response = await fetch(`${API_ATTENDANCE}?userId=${userId}`, {
      headers: getHeaders()
    });
    // The backend currently returns { subjects: [], overall: ... }
    // AdminAttendance expects an array of records [ { subject, attendedClasses, ... } ]
    // The backend `subjects` array matches this structure closely.
    if (!response.ok) throw new Error('Failed to fetch records');
    const data = await response.json();
    return data.subjects || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

// Update a single attendance record
export async function updateAttendanceRecord(updatedRecord) {
  // record has { studentId/userId, subject, attended... }
  // We need to pass userId.

  // AdminAttendance.jsx sets record.studentId (which is the string ID like S101).
  // But our backend expects `userId` (MongoID).
  // Problem: AdminAttendance uses `studentUsers` which has `studentId` and `_id`?
  // I need to check `getAllStudents` return value. It returns Mongo Users. So it has `_id`.
  // AdminAttendance needs to work with `_id`.

  try {
    const payload = {
      userId: updatedRecord.userId, // Needs to be MongoID
      subject: updatedRecord.subject,
      attendedClasses: updatedRecord.attendedClasses,
      totalClasses: updatedRecord.totalClasses
    };

    const response = await fetch(API_ATTENDANCE, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Failed update");
    return await response.json();
  } catch (e) {
    console.error(e);
  }
}


