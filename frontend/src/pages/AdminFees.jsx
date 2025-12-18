import { useEffect, useMemo, useState } from 'react';
import { getFeesRecordsForStudent, updateFeeRecord, addFeeRecord } from '../services/feesService';
import { getStudentUsers } from '../services/userService';

export default function AdminFees() {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [records, setRecords] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  const studentUsers = useMemo(() => getStudentUsers(), []);

  useEffect(() => {
    if (!selectedStudentId && studentUsers.length > 0) {
      setSelectedStudentId(studentUsers[0].studentId);
    }
  }, [selectedStudentId, studentUsers]);

  useEffect(() => {
    if (!selectedStudentId) {
      setRecords([]);
      return;
    }
    const recs = getFeesRecordsForStudent(selectedStudentId);
    setRecords(recs);
  }, [selectedStudentId]);

  const handleChange = (index, field, value) => {
    setRecords((prev) => {
      const updated = [...prev];
      const rec = { ...updated[index] };
      if (field === 'amount') rec.amount = Number(value) || 0;
      else rec[field] = value;
      updated[index] = rec;
      updateFeeRecord(rec);
      return updated;
    });
  };

  const handleAdd = () => {
    setAdding(true);
    const newRec = {
      studentId: selectedStudentId,
      semester: 1,
      amount: 0,
      status: 'Pending',
      dueDate: '',
      paidDate: null,
    };
    addFeeRecord(newRec);
    const recs = getFeesRecordsForStudent(selectedStudentId);
    setRecords(recs);
    setAdding(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Fees Management</h1>
            <p className="text-slate-400 text-sm">Edit fees records for students. Changes are stored in-memory and used by the student dashboard.</p>
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
                  <option key={u.studentId} value={u.studentId}>{u.studentId} - {u.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedStudentId || adding}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 rounded-md text-sm font-medium"
            >
              Add Fee
            </button>
          </div>
        </header>

        <section className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
          {records.length === 0 ? (
            <div className="p-6 text-slate-400 text-sm">No fee records found for this student.</div>
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
                    <tr key={`${rec.studentId}-${rec.semester}-${idx}`} className="border-b border-slate-700/60">
                      <td className="px-4 py-3">
                        <input type="number" min="1" className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md" value={rec.semester} onChange={(e)=> handleChange(idx,'semester',Number(e.target.value)||1)} />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" className="w-32 px-2 py-1 bg-slate-900 border border-slate-700 rounded-md" value={rec.amount} onChange={(e)=> handleChange(idx,'amount',e.target.value)} />
                      </td>
                      <td className="px-4 py-3">
                        <select value={rec.status} onChange={(e)=> handleChange(idx,'status',e.target.value)} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md">
                          <option>Paid</option>
                          <option>Pending</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input type="date" value={rec.dueDate||''} onChange={(e)=> handleChange(idx,'dueDate',e.target.value)} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="date" value={rec.paidDate||''} onChange={(e)=> handleChange(idx,'paidDate',e.target.value)} className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md" />
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
