import { useEffect, useState } from 'react';
import { getAllStudents } from '../services/studentService';
import AdminEditStudent from './AdminEditStudent';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Simple route protection: only allow logged-in admins
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    const all = getAllStudents();
    setStudents([...all]);
  }, []);

  const handleEditClick = (studentId) => {
    setEditingStudentId(studentId);
  };

  const handleStudentSaved = () => {
    const all = getAllStudents();
    setStudents([...all]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Students</h1>
          <p className="text-slate-400 text-sm">
            View all students from the mock database. Editing will be added later.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Student ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Department</th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    No students found in mock data.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.studentId}
                    className="border-b border-slate-800/70 hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-100 font-mono text-xs sm:text-sm">
                      {student.studentId}
                    </td>
                    <td className="px-4 py-3 text-slate-100">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300 break-all">
                      {student.email}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {student.department}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleEditClick(student.studentId)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingStudentId && (
        <AdminEditStudent
          studentId={editingStudentId}
          onClose={() => setEditingStudentId(null)}
          onSaved={handleStudentSaved}
        />
      )}
    </div>
  );
}


