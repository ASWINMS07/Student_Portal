import { useEffect, useState } from 'react';
import { getFeesRecordsForStudent, updateFeeRecord, addFeeRecord } from '../services/feesService';
// import { getStudentUsers } from '../services/userService';

export default function AdminFees() {
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(''); // Mongo _id
  const [records, setRecords] = useState([]);
  const [adding, setAdding] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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

  useEffect(() => {
    if (!selectedStudentId && studentUsers.length > 0) {
      setSelectedStudentId(studentUsers[0]._id);
    }
  }, [selectedStudentId, studentUsers]);

  useEffect(() => {
    const fetchFees = async () => {
      if (!selectedStudentId) {
        setRecords([]);
        return;
      }
      const recs = await getFeesRecordsForStudent(selectedStudentId);
      setRecords(recs);
      setMessage('');
    };
    fetchFees();
  }, [selectedStudentId]);

  const handleChange = (index, field, value) => {
    // 1. Optimistic Update (Local Only)
    const updated = [...records];
    const rec = { ...updated[index] };

    if (field === 'amount') rec.amount = Number(value) || 0;
    else rec[field] = value;

    updated[index] = rec;
    setRecords(updated);
    if (message) setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const promises = records.map(async (rec, index) => {
        const savedRecord = await updateFeeRecord({ ...rec, userId: selectedStudentId });
        return { index, savedRecord };
      });

      const results = await Promise.all(promises);

      setRecords(prev => {
        const newList = [...prev];
        results.forEach(({ index, savedRecord }) => {
          if (savedRecord && savedRecord._id) {
            newList[index] = { ...newList[index], _id: savedRecord._id };
          }
        });
        return newList;
      });

      setMessage('Fees saved successfully!');
    } catch (e) {
      console.error(e);
      setMessage('Error saving fees.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    setAdding(true);
    const newRec = {
      userId: selectedStudentId,
      semester: 1,
      amount: 0,
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0],
      paidDate: null,
    };

    // Just add to state (no API call yet)
    setRecords([...records, newRec]);
    setAdding(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Fees Management</h1>
            <p className="text-slate-400 text-sm">Edit fees records for students. Click 'Save Changes' to update.</p>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-300">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {studentUsers.map((u) => (
                  <option key={u._id} value={u._id}>{u.studentId} - {u.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedStudentId}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-md text-sm font-medium"
            >
              Add Fee
            </button>
          </div>
        </header>

        {message && (
          <div className={`p-4 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {message}
          </div>
        )}

        <section className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
          {records.length === 0 ? (
            <div className="p-6 text-slate-400 text-sm text-center">No fee records found for this student.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/70 border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">Semester</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">Due Date</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, idx) => (
                    <tr key={`${selectedStudentId}-${idx}`} className="border-b border-slate-700/60">
                      <td className="px-4 py-3">
                        <input type="number" min="1" className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md" value={rec.semester} onChange={(e) => handleChange(idx, 'semester', Number(e.target.value) || 1)} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-32 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md" value={rec.amount} onChange={(e) => handleChange(idx, 'amount', e.target.value)} />
                      </td>
                      <td className="px-4 py-3">
                        <select value={rec.status} onChange={(e) => handleChange(idx, 'status', e.target.value)} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md">
                          <option>Paid</option>
                          <option>Pending</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input type="date" value={rec.dueDate ? String(rec.dueDate).split('T')[0] : ''} onChange={(e) => handleChange(idx, 'dueDate', e.target.value)} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="date" value={rec.paidDate ? String(rec.paidDate).split('T')[0] : ''} onChange={(e) => handleChange(idx, 'paidDate', e.target.value)} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-700 flex justify-end">
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
