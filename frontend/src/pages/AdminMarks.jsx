import { useEffect, useMemo, useState } from 'react';
import {
  getMarksForStudentAndSemester,
  getSemestersForStudent,
  updateMarkRecord,
} from '../services/marksService';
import { getStudentUsers } from '../services/userService';

export default function AdminMarks() {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [semesterMarks, setSemesterMarks] = useState([]);

  // Simple route protection: only allow logged-in admins
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  const studentUsers = useMemo(() => getStudentUsers(), []);

  // Initialize student
  useEffect(() => {
    if (!selectedStudentId && studentUsers.length > 0) {
      setSelectedStudentId(studentUsers[0].studentId);
    }
  }, [selectedStudentId, studentUsers]);

  // Load semesters when student changes
  useEffect(() => {
    if (!selectedStudentId) {
      setAvailableSemesters([]);
      setSelectedSemester('');
      setSemesterMarks([]);
      return;
    }

    const semesters = getSemestersForStudent(selectedStudentId);
    setAvailableSemesters(semesters);

    if (semesters.length > 0) {
      setSelectedSemester(String(semesters[0]));
    } else {
      setSelectedSemester('');
      setSemesterMarks([]);
    }
  }, [selectedStudentId]);

  // Load marks when semester changes
  useEffect(() => {
    if (!selectedStudentId || !selectedSemester) {
      setSemesterMarks([]);
      return;
    }

    const records = getMarksForStudentAndSemester(
      selectedStudentId,
      selectedSemester
    );
    setSemesterMarks(records);
  }, [selectedStudentId, selectedSemester]);

  const handleMarksChange = (index, field, value) => {
    setSemesterMarks((prev) => {
      const updated = [...prev];
      const record = { ...updated[index] };

      if (field === 'subject' || field === 'grade') {
        record[field] = value;
      } else {
        const numeric = Number(value);
        record[field] = Number.isNaN(numeric) ? 0 : numeric;
      }

      // Recalculate total when internal/external change
      if (field === 'internalMarks' || field === 'externalMarks') {
        const internal = Number(record.internalMarks) || 0;
        const external = Number(record.externalMarks) || 0;
        record.total = internal + external;
      }

      updated[index] = record;
      updateMarkRecord(record);

      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Marks Management</h1>
            <p className="text-slate-400 text-sm">
              Adjust student marks by semester. Changes are stored in-memory and
              used directly by the student dashboard.
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
                  <option key={user.studentId} value={user.studentId}>
                    {user.studentId} - {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-300">Select Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={availableSemesters.length === 0}
              >
                {availableSemesters.length === 0 ? (
                  <option value="">No semesters</option>
                ) : (
                  availableSemesters.map((sem) => (
                    <option key={sem} value={String(sem)}>
                      Semester {sem}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </header>

        <section className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
          {semesterMarks.length === 0 ? (
            <div className="p-6 text-slate-400 text-sm">
              No marks records found for this student and semester.
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
                      key={`${record.studentId}-${record.semester}-${record.subject}`}
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


