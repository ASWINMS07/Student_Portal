import { useEffect, useState } from 'react';
import { getAttendanceRecordsForStudent, updateAttendanceRecord } from '../services/attendanceService';
// import { getStudentUsers } from '../services/userService'; // Removed

export default function AdminAttendance() {
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(''); // This will be Mongo _id
  const [studentAttendance, setStudentAttendance] = useState([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Simple route protection: only allow logged-in admins
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  // Fetch students on mount
  useEffect(() => {
    const fetchStudents = async () => {
      // Import dynamically or assume imported. Imported at top.
      const { getAllStudents } = await import('../services/studentService');
      const all = await getAllStudents();
      setStudentUsers(all);
    };
    fetchStudents();
  }, []);

  // Initialize selected student
  useEffect(() => {
    // If no selection and list exists, select first
    if (!selectedStudentId && studentUsers.length > 0) {
      setSelectedStudentId(studentUsers[0]._id);
    }
  }, [selectedStudentId, studentUsers]);

  // Load attendance for selected student
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedStudentId) {
        setStudentAttendance([]);
        return;
      }
      const records = await getAttendanceRecordsForStudent(selectedStudentId);
      setStudentAttendance(records);
      setMessage('');
    };
    fetchAttendance();
  }, [selectedStudentId]);

  const handleAttendanceChange = (index, field, value) => {
    // 1. Create a copy of the list
    const updatedList = [...studentAttendance];
    const record = { ...updatedList[index] };

    // 2. Update the local field
    const numericValue =
      field === 'subject' ? value : Number.isNaN(Number(value)) ? 0 : Number(value);
    record[field] = numericValue;

    // 3. Recalculate percentage
    if (field === 'attendedClasses' || field === 'totalClasses') {
      const attended = Number(record.attendedClasses) || 0;
      const total = Number(record.totalClasses) || 0;
      record.percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    }

    // 4. Update state only (NO AUTO SAVE)
    updatedList[index] = record;
    setStudentAttendance(updatedList);
    if (message) setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Save all records
      // In a real app we might only save modified ones, but sending all ensures consistency
      // especially with the id loop fix.
      const promises = studentAttendance.map(async (record, index) => {
        // Ensure we send back the _id if we have it
        const savedRecord = await updateAttendanceRecord({
          ...record,
          userId: selectedStudentId
        });
        return { index, savedRecord };
      });

      const results = await Promise.all(promises);

      // Update local state with returned _ids to prevent Duplicates on next save
      setStudentAttendance(prev => {
        const newList = [...prev];
        results.forEach(({ index, savedRecord }) => {
          if (savedRecord && savedRecord._id) {
            newList[index] = { ...newList[index], _id: savedRecord._id };
          }
        });
        return newList;
      });

      setMessage('Attendance saved successfully!');
    } catch (e) {
      console.error(e);
      setMessage('Error saving attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Attendance Management</h1>
            <p className="text-slate-400 text-sm">
              Edit attendance records for students. Click 'Save Changes' to update.
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
                <option key={user._id} value={user._id}>
                  {user.studentId} - {user.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {message && (
          <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {message}
          </div>
        )}

        <section className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
          {studentAttendance.length === 0 ? (
            <div className="p-6 text-slate-400 text-sm text-center">
              <p>No attendance records found for this student.</p>
              <button
                onClick={() => setStudentAttendance([{ subject: 'New Subject', attendedClasses: 0, totalClasses: 0, percentage: 0 }])}
                className="mt-4 px-4 py-2 bg-cyan-600 rounded text-white text-sm hover:bg-cyan-500"
              >
                Add First Subject
              </button>
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
                      key={`${selectedStudentId}-${index}`}
                      className="border-b border-slate-700/60"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="bg-transparent border-b border-slate-700 focus:border-cyan-500 outline-none text-slate-100"
                          value={record.subject}
                          onChange={(e) => handleAttendanceChange(index, 'subject', e.target.value)}
                        />
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
              <div className="p-4 border-t border-slate-700 flex justify-between items-center">
                <button
                  onClick={() => setStudentAttendance([...studentAttendance, { subject: 'New Subject', attendedClasses: 0, totalClasses: 0, percentage: 0 }])}
                  className="px-4 py-2 bg-slate-700 rounded text-slate-300 text-sm hover:bg-slate-600"
                >
                  + Add Another Subject
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


