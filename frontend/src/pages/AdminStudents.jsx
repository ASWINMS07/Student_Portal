import { useEffect, useState } from 'react';
import { getAllStudents, deleteStudent } from '../services/studentService';
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
    const fetchStudents = async () => {
      const all = await getAllStudents();
      setStudents(all);
    };
    fetchStudents();
  }, []);

  const handleEditClick = (studentId) => {
    // We'll pass the whole student object or ID to edit
    // studentId here might be string ID. We likely need the Mongo _id for updates.
    // Let's assume we pass the Mongo _id to the editor if possible, 
    // or we look it up.
    // For now, let's stick to passing the ID we get.
    setEditingStudentId(studentId);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      const success = await deleteStudent(id);
      if (success) {
        setStudents(prev => prev.filter(s => s._id !== id));
      } else {
        alert('Failed to delete student');
      }
    }
  };

  const handleStudentSaved = async () => {
    const all = await getAllStudents();
    setStudents(all);
    setEditingStudentId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Students</h1>
          <p className="text-slate-400 text-sm">
            View and manage all registered students.
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
                <th className="px-4 py-3 text-left font-medium text-slate-300">Phone</th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student._id}
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
                      {student.department || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {student.phone || '-'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {/* Edit Logic: Needs to be connected meaningfully to an editor
                           that handles the _id or specific data. 
                           For now, keeping the button.
                       */}
                      <button
                        type="button"
                        onClick={() => handleEditClick(student._id)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(student._id)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50 transition-colors"
                      >
                        Delete
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


