import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getAttendanceForStudent } from '../services/attendanceService';
import { getMarksForStudent } from '../services/marksService';
import { getStudentFees } from '../services/feesService';
import { getCoursesForStudent } from '../services/coursesService';
import { getTimetableForStudent } from '../services/timetableService';
import { getProfileForStudent, updateProfile } from '../services/profileService';
import { seedAPI } from '../services/api';

// Page Components
function DashboardHome() {
  const [stats, setStats] = useState([
    { label: 'Attendance', value: '...', color: 'cyan' },
    { label: 'CGPA', value: '...', color: 'emerald' },
    { label: 'Pending Fees', value: '...', color: 'amber' },
    { label: 'Courses', value: '...', color: 'violet' },
  ]);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');
        const studentId = storedAuth.studentId;

        // Fetch all in parallel for speed
        const [att, marks, fees, courses] = await Promise.all([
          getAttendanceForStudent(studentId),
          getMarksForStudent(studentId),
          getStudentFees(),
          getCoursesForStudent()
        ]);

        // Calculate CGPA (simple avg of semester percentages / 10)
        let cgpa = '0.0';
        if (marks.semesters && marks.semesters.length > 0) {
          const totalPerc = marks.semesters.reduce((sum, s) => sum + s.percentage, 0);
          cgpa = (totalPerc / marks.semesters.length / 10).toFixed(1);
        }

        const formatCurrency = (amount) => {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          }).format(amount);
        };

        setStats([
          { label: 'Attendance', value: `${att.overall?.percentage || 0}%`, color: 'cyan' },
          { label: 'CGPA', value: cgpa, color: 'emerald' },
          { label: 'Pending Fees', value: formatCurrency(fees.summary?.pendingAmount || 0), color: 'amber' },
          { label: 'Courses', value: String(courses.totalCourses || 0), color: 'violet' },
        ]);
      } catch (err) {
        console.error('Summary fetch error:', err);
      }
    };
    fetchSummary();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedMessage({ type: '', text: '' });
    try {
      const result = await seedAPI.seedData();
      setSeedMessage({ type: 'success', text: `${result.message} - Attendance: ${result.data.attendance}, Marks: ${result.data.marks}, Fees: ${result.data.fees}, Courses: ${result.data.courses}, Timetable: ${result.data.timetable}` });
      // Refresh after seeding
      window.location.reload();
    } catch (err) {
      setSeedMessage({ type: 'error', text: err.message });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Welcome back, Student!</h2>
            <p className="text-slate-400">Here's an overview of your academic progress.</p>
          </div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {seeding ? 'Seeding...' : '🌱 Seed Demo Data'}
          </button>
        </div>
        {seedMessage.text && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${seedMessage.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
            {seedMessage.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-400 mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AttendancePage() {
  const [attendance, setAttendance] = useState({ subjects: [], overall: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');
        const studentId = storedAuth.studentId;

        // Note: The API primarily uses the token, but we pass studentId if needed
        const data = await getAttendanceForStudent(studentId);

        // Ensure data structure is valid
        if (!data || !data.subjects) {
          setAttendance({ subjects: [], overall: { attendedClasses: 0, totalClasses: 0, percentage: 0 } });
        } else {
          setAttendance(data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load attendance.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-emerald-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTextColor = (percentage) => {
    if (percentage >= 75) return 'text-emerald-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary Card */}
      {attendance.overall && (
        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Overall Attendance</h2>
              <p className="text-slate-400 text-sm mt-1">
                {attendance.overall.attendedClasses} of {attendance.overall.totalClasses} classes attended
              </p>
            </div>
            <div className={`text-4xl font-bold ${getTextColor(attendance.overall.percentage)}`}>
              {attendance.overall.percentage}%
            </div>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(attendance.overall.percentage)} transition-all duration-500`}
              style={{ width: `${attendance.overall.percentage}%` }}
            />
          </div>
          {attendance.overall.percentage < 75 && (
            <p className="text-amber-400 text-sm mt-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Attendance below 75% - Improvement needed
            </p>
          )}
        </div>
      )}

      {/* Subject-wise Attendance */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-5">Subject-wise Attendance</h3>

        {!attendance.subjects || attendance.subjects.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No attendance records found.</p>
        ) : (
          <div className="space-y-4">
            {attendance.subjects.map((subject, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{subject.subject}</span>
                  <span className={`font-semibold ${getTextColor(subject.percentage)}`}>
                    {subject.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(subject.percentage)} transition-all duration-500`}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  {subject.attendedClasses} / {subject.totalClasses} classes
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MarksPage() {
  const [marksData, setMarksData] = useState({ semesters: [] });
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');
        const studentId = storedAuth.studentId;

        const data = await getMarksForStudent(studentId);
        setMarksData(data);

        // Should default to most recent semester or 1st?
        if (data.semesters && data.semesters.length > 0) {
          // If we have semesters, show the first one or the one matching current state if applicable
          setSelectedSemester(prev => prev || data.semesters[0].semester);
        }
      } catch (err) {
        setError(err.message || 'Failed to load marks.');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const getGradeColor = (grade) => {
    if (!grade) return 'text-slate-400';
    // const g = grade.toUpperCase(); // grade might be number or string? Marks usually 'A' 'B'
    // Let's assume string
    const g = String(grade).toUpperCase();
    if (g.startsWith('A') || g === 'O') return 'text-emerald-400';
    if (g.startsWith('B')) return 'text-cyan-400';
    if (g.startsWith('C')) return 'text-amber-400';
    return 'text-red-400';
  };

  const currentSemester = marksData.semesters.find(s => s.semester === selectedSemester);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Semester Selector */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Academic Marks</h2>
            <p className="text-slate-400 text-sm mt-1">View your semester-wise performance</p>
          </div>

          {marksData.semesters.length > 0 && (
            <select
              value={selectedSemester || ''}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {marksData.semesters.map((sem) => (
                <option key={sem.semester} value={sem.semester}>
                  Semester {sem.semester}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Marks Table */}
      {!marksData.semesters || marksData.semesters.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
          <p className="text-slate-400">No marks records found.</p>
        </div>
      ) : currentSemester ? (
        <>
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Semester {currentSemester.semester} Performance</p>
                <p className="text-white mt-1">
                  {currentSemester.totalMarks} / {currentSemester.maxMarks} marks
                </p>
              </div>
              <div className="text-4xl font-bold text-violet-400">
                {currentSemester.percentage}%
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Subject</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Internal</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">External</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Total</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-medium text-sm">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemester.subjects.map((subject, index) => (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{subject.subject}</td>
                      <td className="px-6 py-4 text-left text-slate-300">{subject.internalMarks}</td>
                      <td className="px-6 py-4 text-left text-slate-300">{subject.externalMarks}</td>
                      <td className="px-6 py-4 text-left text-white font-semibold">{subject.total}</td>
                      <td className="px-6 py-4 text-left">
                        <span className={`font-bold ${getGradeColor(subject.grade)}`}>
                          {subject.grade || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function FeesPage() {
  const [feesData, setFeesData] = useState({ fees: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const data = await getStudentFees();
        setFeesData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isOverdue = (dueDate, status) => {
    return status === 'Pending' && new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {feesData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <p className="text-slate-400 text-sm">Total Fees</p>
            <p className="text-2xl font-bold text-white mt-1">{formatAmount(feesData.summary.totalAmount)}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
            <p className="text-emerald-400 text-sm">Paid</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{formatAmount(feesData.summary.paidAmount)}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <p className="text-red-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{formatAmount(feesData.summary.pendingAmount)}</p>
          </div>
        </div>
      )}

      {/* Fees List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-5">Semester-wise Fees</h2>

        {feesData.fees.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No fees records found.</p>
        ) : (
          <div className="space-y-4">
            {feesData.fees.map((fee) => (
              <div
                key={fee.id}
                className={`bg-slate-900/50 rounded-lg p-5 border-l-4 ${fee.status === 'Paid' ? 'border-emerald-500' : 'border-red-500'
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Semester {fee.semester}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      Due: {formatDate(fee.dueDate)}
                      {isOverdue(fee.dueDate, fee.status) && (
                        <span className="text-red-400 ml-2">(Overdue)</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-white font-bold text-xl">{formatAmount(fee.amount)}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${fee.status === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                      }`}>
                      {fee.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoursesPage() {
  const [coursesData, setCoursesData] = useState({ courses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCoursesForStudent();
        setCoursesData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-2">Academic Courses</h2>
        <p className="text-slate-400 text-sm">Explore the available courses in your department.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesData.courses.map((course) => (
          <div
            key={course._id}
            className="group block bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:bg-slate-800/70 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-bold rounded-lg border border-cyan-500/20">
                {course.courseId}
              </span>
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
              {course.courseName}
            </h3>

            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{course.facultyName}</span>
            </div>

            {course.description && (
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 italic">
                {course.description}
              </p>
            )}
          </div>
        ))}
        {coursesData.courses.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No courses available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}

function TimetablePage() {
  const [timetableData, setTimetableData] = useState({ schedule: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await getTimetableForStudent();
        setTimetableData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const getClassForSlot = (day, time) => {
    const daySchedule = timetableData.schedule.find(s => s.day === day);
    if (!daySchedule) return null;
    return daySchedule.classes.find(c => c.time === time);
  };

  const getSubjectColor = (courseId) => {
    const colors = [
      'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
      'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
      'bg-violet-500/20 border-violet-500/50 text-violet-300',
      'bg-amber-500/20 border-amber-500/50 text-amber-300',
      'bg-rose-500/20 border-rose-500/50 text-rose-300',
    ];
    // Simple hash for consistent color
    let hash = 0;
    for (let i = 0; i < courseId.length; i++) {
      hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Weekly Schedule</h2>
            <p className="text-slate-400 text-sm mt-1">Your assigned class timings and venues.</p>
          </div>
          <span className="text-xs text-slate-500 animate-pulse">✨ Hover for details</span>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 overflow-x-auto shadow-2xl">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-6 gap-3 mb-4">
            <div className="p-3 text-slate-500 text-xs font-bold uppercase tracking-widest">Time</div>
            {days.map(day => (
              <div key={day} className="p-3 text-center text-slate-300 font-bold bg-slate-700/30 rounded-xl border border-slate-700/50">
                {day}
              </div>
            ))}
          </div>

          {/* Time Rows */}
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-6 gap-3 mb-3">
              <div className="p-3 text-slate-400 text-sm font-mono flex items-center justify-center bg-slate-900/40 rounded-lg">
                {time}
              </div>
              {days.map(day => {
                const classInfo = getClassForSlot(day, time);
                return (
                  <div key={`${day}-${time}`} className="min-h-[85px] relative group">
                    {classInfo ? (
                      <div className={`h-full p-3 rounded-xl border transition-all duration-300 cursor-default flex flex-col justify-between ${getSubjectColor(classInfo.courseId)} hover:scale-[1.08] hover:shadow-2xl hover:z-50 relative`}>
                        <div>
                          <p className="font-bold text-[13px] leading-tight">{classInfo.courseId}</p>
                          <p className="text-[11px] opacity-80 mt-1 line-clamp-1">{classInfo.courseName}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-1">
                          <span className="text-[10px] font-medium opacity-90">{classInfo.room || 'TBA'}</span>
                          <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>

                        {/* Popover on Hover */}
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl w-56 -left-4 -top-32 pointer-events-none z-[100] backdrop-blur-md">
                          <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-1">{classInfo.courseId}</p>
                          <h4 className="text-white text-sm font-bold mb-2">{classInfo.courseName}</h4>
                          <div className="space-y-1">
                            <p className="text-slate-400 text-[11px] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                              Faculty: {classInfo.facultyName}
                            </p>
                            <p className="text-slate-400 text-[11px] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Room: {classInfo.room || 'TBA'}
                            </p>
                            <p className="text-slate-400 text-[11px] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                              Time: {classInfo.time}
                            </p>
                          </div>
                          <div className="absolute bottom-[-10px] left-10 w-4 h-4 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full bg-slate-900/20 rounded-xl border border-slate-800/30 flex items-center justify-center group-hover:bg-slate-900/40 transition-colors">
                        <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    department: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');
        const studentId = storedAuth.studentId; // Still checking this to ensure logged in context?

        // We can just rely on the token, but keeping existing checks is fine.

        let data;
        try {
          data = await getProfileForStudent(studentId);
        } catch (err) {
          console.warn('Failed to fetch profile:', err);
          // If request failed, maybe show empty or error
          throw err;
        }
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (successMsg) setSuccessMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      // Validate
      if (!profile.name.trim()) throw new Error('Name is required');
      if (!profile.email.trim()) throw new Error('Email is required');

      // Update
      await updateProfile(profile.studentId, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone
      });

      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{profile.name || 'Student'}</h2>
            <p className="text-slate-400">Student ID: {profile.studentId}</p>
            <p className="text-slate-400 text-sm">Department: {profile.department || '-'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
          {successMsg}
        </div>
      )}

      {/* Details Form */}
      <form onSubmit={handleSave} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Profile Details</h3>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Read-Only Fields */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-2">Student ID (Read-only)</label>
            <input
              type="text"
              value={profile.studentId}
              readOnly
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-2">Department (Read-only)</label>
            <input
              type="text"
              value={profile.department || 'Not Assigned'}
              readOnly
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Editable Fields */}
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wide mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </form>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    onLogout?.();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardHome />;
      case 'attendance': return <AttendancePage />;
      case 'marks': return <MarksPage />;
      case 'fees': return <FeesPage />;
      case 'courses': return <CoursesPage />;
      case 'timetable': return <TimetablePage />;
      case 'profile': return <ProfilePage />;
      default: return <DashboardHome />;
    }
  };

  return (
    <DashboardLayout
      activePage={activePage}
      onPageChange={setActivePage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </DashboardLayout>
  );
}
