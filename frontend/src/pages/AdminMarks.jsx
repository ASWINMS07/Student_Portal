import { useEffect, useState } from 'react';
import {
  getMarksForStudentAndSemester,
  getSemestersForStudent,
  updateMarkRecord,
} from '../services/marksService';
// import { getStudentUsers } from '../services/userService';

export default function AdminMarks() {
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(''); // Mongo _id
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [semesterMarks, setSemesterMarks] = useState([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Simple route protection
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      const { getAllStudents } = await import('../services/studentService');
      const all = await getAllStudents();
      setStudentUsers(all);
    }
    fetchStudents();
  }, []);

  // Initialize student
  useEffect(() => {
    if (!selectedStudentId && studentUsers.length > 0) {
      setSelectedStudentId(studentUsers[0]._id);
    }
  }, [selectedStudentId, studentUsers]);

  // Load semesters when student changes
  useEffect(() => {
    const fetchSemesters = async () => {
      if (!selectedStudentId) {
        setAvailableSemesters([]);
        setSelectedSemester('');
        setSemesterMarks([]);
        return;
      }

      const semesters = await getSemestersForStudent(selectedStudentId);
      setAvailableSemesters(semesters);

      if (semesters.length > 0) {
        setSelectedSemester(String(semesters[0]));
      } else {
        // Create default Semester 1 view if empty? Or allow user to add?
        // Let's just default to empty and provide a way to add.
        // Or default to '1'.
        setSelectedSemester('1');
      }
    };
    fetchSemesters();
  }, [selectedStudentId]);

  // Load marks when semester changes
  useEffect(() => {
    const fetchMarks = async () => {
      if (!selectedStudentId || !selectedSemester) {
        setSemesterMarks([]);
        return;
      }
      const records = await getMarksForStudentAndSemester(
        selectedStudentId,
        selectedSemester
      );
      setSemesterMarks(records);
      setMessage('');
    }
    fetchMarks();
  }, [selectedStudentId, selectedSemester]);

  const handleMarksChange = (index, field, value) => {
    // 1. Optimistic Update (Local State Only)
    const updated = [...semesterMarks];
    const record = { ...updated[index] };

    // 2. Update field
    if (field === 'subject' || field === 'grade') {
      record[field] = value;
    } else {
      const numeric = Number(value);
      record[field] = Number.isNaN(numeric) ? 0 : numeric;
    }

    // 3. Recalculate total
    if (field === 'internalMarks' || field === 'externalMarks') {
      const internal = Number(record.internalMarks) || 0;
      const external = Number(record.externalMarks) || 0;
      record.total = internal + external;
    }

    // 4. Update UI
    updated[index] = record;
    setSemesterMarks(updated);
    if (message) setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Save all records
      const promises = semesterMarks.map(async (record, index) => {
        const savedRecord = await updateMarkRecord({
          ...record,
          userId: selectedStudentId,
          semester: Number(selectedSemester)
        });
        return { index, savedRecord };
      });

      const results = await Promise.all(promises);

      // Update IDs
      setSemesterMarks(prev => {
        const newList = [...prev];
        results.forEach(({ index, savedRecord }) => {
          if (savedRecord && savedRecord._id) {
            newList[index] = { ...newList[index], _id: savedRecord._id };
          }
        });
        return newList;
      });

      setMessage('Marks saved successfully!');
    } catch (e) {
      console.error(e);
      setMessage('Error saving marks.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Marks Management</h1>
            <p className="text-slate-400 text-sm">
              Adjust student marks. Click 'Save Changes' to update.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex flex-col gap-1">
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

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-300">Select Semester</label>
              <div className="flex gap-2">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {message && (
          <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {message}
          </div>
        )}

        <section className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
          {semesterMarks.length === 0 ? (
            <div className="p-6 text-slate-400 text-sm text-center">
              <p>No marks records found for this student and semester.</p>
              <button
                onClick={() => setSemesterMarks([{ subject: 'New Subject', internalMarks: 0, externalMarks: 0, total: 0, grade: 'F' }])}
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
                      Internal
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-300">
                      External
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-300">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-slate-300">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {semesterMarks.map((record, index) => (
                    <tr
                      key={`${selectedStudentId}-${selectedSemester}-${index}`}
                      className="border-b border-slate-700/60"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-md"
                          value={record.subject}
                          onChange={(e) =>
                            handleMarksChange(index, 'subject', e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-center"
                          value={record.internalMarks}
                          onChange={(e) =>
                            handleMarksChange(
                              index,
                              'internalMarks',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-center"
                          value={record.externalMarks}
                          onChange={(e) =>
                            handleMarksChange(
                              index,
                              'externalMarks',
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-cyan-400">
                          {record.total}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="text"
                          className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-center uppercase"
                          value={record.grade}
                          onChange={(e) =>
                            handleMarksChange(index, 'grade', e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-700 flex justify-between items-center">
                <button
                  onClick={() => setSemesterMarks([...semesterMarks, { subject: 'New Subject', internalMarks: 0, externalMarks: 0, total: 0, grade: 'F' }])}
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


