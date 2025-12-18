import { useEffect, useMemo, useState } from 'react';
import { getAttendanceRecordsForStudent, updateAttendanceRecord } from '../services/attendanceService';
import { getStudentUsers } from '../services/userService';

export default function AdminAttendance() {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentAttendance, setStudentAttendance] = useState([]);

  // Simple route protection: only allow logged-in admins
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  // Only student users (exclude admin entries)
  const studentUsers = useMemo(
    () => getStudentUsers(),
    []
  );

  // Initialize selected student
  useEffect(() => {
    if (!selectedStudentId && studentUsers.length > 0) {
      setSelectedStudentId(studentUsers[0].studentId);
    }
  }, [selectedStudentId, studentUsers]);

  // Load attendance for selected student
  useEffect(() => {
    if (!selectedStudentId) {
      setStudentAttendance([]);
      return;
    }

    const records = getAttendanceRecordsForStudent(selectedStudentId);
    setStudentAttendance(records);
  }, [selectedStudentId]);

  const handleAttendanceChange = (index, field, value) => {
    setStudentAttendance((prev) => {
      const updated = [...prev];
      const record = { ...updated[index] };

      const numericValue =
        field === 'subject' ? value : Number.isNaN(Number(value)) ? 0 : Number(value);

      record[field] = numericValue;

      // Recalculate percentage when classes change
      if (field === 'attendedClasses' || field === 'totalClasses') {
        const attended = Number(record.attendedClasses) || 0;
        const total = Number(record.totalClasses) || 0;
        record.percentage =
          total > 0 ? Math.round((attended / total) * 100) : 0;
      }

      updated[index] = record;
      updateAttendanceRecord(record);

      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Attendance Management</h1>
            <p className="text-slate-400 text-sm">
              Edit attendance records for students. Changes are stored in-memory and
              reflected in the student dashboard.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <label className="text-sm text-slate-300">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {studentUsers.map((user) => (
                <option key={user.studentId} value={user.studentId}>
                  {user.studentId} - {user.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
          {studentAttendance.length === 0 ? (
            <div className="p-6 text-slate-400 text-sm">
              No attendance records found for this student.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/70 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-300">
                      Attended Classes
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-300">
                      Total Classes
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-300">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentAttendance.map((record, index) => (
                    <tr
                      key={`${record.studentId}-${record.subject}`}
                      className="border-b border-slate-700/60"
                    >
                      <td className="px-4 py-3">
                        <span className="text-slate-100 font-medium">
                          {record.subject}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-center"
                          value={record.attendedClasses}
                          onChange={(e) =>
                            handleAttendanceChange(
                              index,
                              'attendedClasses',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-center"
                          value={record.totalClasses}
                          onChange={(e) =>
                            handleAttendanceChange(
                              index,
                              'totalClasses',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-cyan-400">
                          {record.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


