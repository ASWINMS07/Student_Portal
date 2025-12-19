import { useEffect, useState } from 'react';
import { getTimetableForStudent, updateTimetable, deleteTimetableEntry } from '../services/timetableService';
import { getCoursesForStudent } from '../services/coursesService';
import { getAllStudents } from '../services/studentService';

export default function AdminTimetable() {
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [courses, setCourses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [editingEntry, setEditingEntry] = useState(null);
    const [formData, setFormData] = useState({
        day: 'Monday',
        time: '09:00',
        courseId: '',
        room: ''
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    useEffect(() => {
        const init = async () => {
            try {
                const [studs, crs] = await Promise.all([
                    getAllStudents(),
                    getCoursesForStudent()
                ]);
                setStudents(studs);
                setCourses(crs.courses);
                if (studs.length > 0) setSelectedStudentId(studs[0]._id);
            } catch (err) {
                setError('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (selectedStudentId) fetchTimetable(selectedStudentId);
    }, [selectedStudentId]);

    const fetchTimetable = async (userId) => {
        try {
            const data = await getTimetableForStudent(userId);
            // Flatten the grouped schedule for the table view
            const flat = [];
            data.schedule.forEach(dayGroup => {
                dayGroup.classes.forEach(cls => {
                    flat.push({ ...cls, day: dayGroup.day });
                });
            });
            setTimetable(flat);
        } catch (err) {
            setError('Failed to load timetable');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (!formData.courseId) throw new Error('Please select a course');

            const selectedCourse = courses.find(c => c.courseId === formData.courseId);
            if (!selectedCourse) throw new Error('Invalid course selected');

            await updateTimetable({
                _id: editingEntry?._id,
                userId: selectedStudentId,
                day: formData.day,
                time: formData.time,
                courseId: selectedCourse.courseId,
                courseName: selectedCourse.courseName,
                facultyName: selectedCourse.facultyName,
                room: formData.room
            });

            setMessage('Timetable entry saved!');
            setFormData({ day: 'Monday', time: '09:00', courseId: '', room: '' });
            setEditingEntry(null);
            fetchTimetable(selectedStudentId);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setFormData({
            day: entry.day,
            time: entry.time,
            courseId: entry.courseId,
            room: entry.room || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this entry?')) return;
        try {
            await deleteTimetableEntry(id);
            setMessage('Entry deleted');
            fetchTimetable(selectedStudentId);
        } catch (err) {
            setError('Delete failed');
        }
    };

    if (loading) return <div className="text-white p-6">Loading...</div>;

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Timetable Management</h1>
                    <p className="text-slate-400 text-sm">Assign weekly schedules to students.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Target Student</label>
                    <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                        {students.map(s => (
                            <option key={s._id} value={s._id}>{s.studentId} - {s.name}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* Entry Form */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    {editingEntry ? 'Edit Class Slot' : 'Add New Class Slot'}
                </h2>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Day</label>
                        <select name="day" value={formData.day} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm outline-none shadow-sm">
                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Time (format HH:MM)</label>
                        <input name="time" type="time" value={formData.time} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Course</label>
                        <select name="courseId" value={formData.courseId} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm outline-none">
                            <option value="">Select Course</option>
                            {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseId} - {c.courseName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Room (Optional)</label>
                        <input name="room" type="text" value={formData.room} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm outline-none" placeholder="e.g. Lab 1" />
                    </div>

                    <div className="md:col-span-4 flex justify-end gap-3 mt-2">
                        {editingEntry && (
                            <button type="button" onClick={() => { setEditingEntry(null); setFormData({ day: 'Monday', time: '09:00', courseId: '', room: '' }); }} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-lg">Cancel</button>
                        )}
                        <button type="submit" className="px-10 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-900/20">Save Entry</button>
                    </div>
                </form>
                {message && <p className="mt-4 text-emerald-400 text-sm">{message}</p>}
                {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
            </div>

            {/* Schedule for Selected Student */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900/70 border-b border-slate-700 text-slate-300">
                        <tr>
                            <th className="px-6 py-3">Day</th>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Course</th>
                            <th className="px-6 py-3">Faculty</th>
                            <th className="px-6 py-3">Room</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {days.map(day => {
                            const dayClasses = timetable.filter(t => t.day === day).sort((a, b) => a.time.localeCompare(b.time));
                            if (dayClasses.length === 0) return null;
                            return dayClasses.map((entry, idx) => (
                                <tr key={entry._id} className="hover:bg-slate-700/30 transition-colors text-slate-300">
                                    {idx === 0 && <td className="px-6 py-4 font-bold text-white border-r border-slate-700/50" rowSpan={dayClasses.length}>{day}</td>}
                                    <td className="px-6 py-4 font-mono text-cyan-400">{entry.time}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-white font-medium">{entry.courseId}</span>
                                        <p className="text-xs text-slate-500">{entry.courseName}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{entry.facultyName}</td>
                                    <td className="px-6 py-4">{entry.room || '-'}</td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button onClick={() => handleEdit(entry)} className="text-cyan-400 hover:text-cyan-300">Edit</button>
                                        <button onClick={() => handleDelete(entry._id)} className="text-red-400 hover:text-red-300">Del</button>
                                    </td>
                                </tr>
                            ))
                        })}
                        {timetable.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No timetable entries for this student.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
