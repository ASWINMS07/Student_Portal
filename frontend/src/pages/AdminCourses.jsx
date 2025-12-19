import { useEffect, useState } from 'react';
import { getCoursesForStudent, updateCourse, deleteCourse } from '../services/coursesService';

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        courseId: '',
        courseName: '',
        facultyName: '',
        description: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await getCoursesForStudent();
            setCourses(data.courses);
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            if (!formData.courseId || !formData.courseName || !formData.facultyName) {
                throw new Error('Please fill all required fields');
            }

            await updateCourse({
                ...formData,
                _id: editingCourse?._id
            });

            setMessage(editingCourse ? 'Course updated successfully!' : 'Course added successfully!');
            setFormData({ courseId: '', courseName: '', facultyName: '', description: '' });
            setEditingCourse(null);
            fetchCourses();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            courseId: course.courseId,
            courseName: course.courseName,
            facultyName: course.facultyName,
            description: course.description || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            await deleteCourse(id);
            setMessage('Course deleted successfully');
            fetchCourses();
        } catch (err) {
            setError('Failed to delete course');
        }
    };

    if (loading) return <div className="text-white p-6">Loading courses...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Course Management</h1>
                <p className="text-slate-400 text-sm">Add or edit courses in the global catalog.</p>
            </div>

            {/* Form */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Course ID (e.g. CS101)</label>
                        <input
                            type="text"
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                            placeholder="CS101"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Course Name</label>
                        <input
                            type="text"
                            name="courseName"
                            value={formData.courseName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                            placeholder="Intro to Computing"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Faculty Name</label>
                        <input
                            type="text"
                            name="facultyName"
                            value={formData.facultyName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                            placeholder="Dr. Smith"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                            placeholder="Course overview..."
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                        {editingCourse && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingCourse(null);
                                    setFormData({ courseId: '', courseName: '', facultyName: '', description: '' });
                                }}
                                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            {editingCourse ? 'Save Changes' : 'Add Course'}
                        </button>
                    </div>
                </form>

                {message && <p className="mt-4 text-emerald-400 text-sm">{message}</p>}
                {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
            </div>

            {/* List */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900/70 border-b border-slate-700 text-slate-300">
                        <tr>
                            <th className="px-6 py-3">Course ID</th>
                            <th className="px-6 py-3">Course Name</th>
                            <th className="px-6 py-3">Faculty</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {courses.map(course => (
                            <tr key={course._id} className="hover:bg-slate-700/30 transition-colors text-slate-300">
                                <td className="px-6 py-4 font-medium text-white">{course.courseId}</td>
                                <td className="px-6 py-4">{course.courseName}</td>
                                <td className="px-6 py-4">{course.facultyName}</td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button onClick={() => handleEdit(course)} className="text-cyan-400 hover:text-cyan-300">Edit</button>
                                    <button onClick={() => handleDelete(course._id)} className="text-red-400 hover:text-red-300">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {courses.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No courses found. Add your first course above.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
