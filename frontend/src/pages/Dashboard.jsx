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
    { label: 'Attendance', value: '...', color: 'cyan', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'CGPA', value: '...', color: 'emerald', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { label: 'Pending Fees', value: '...', color: 'amber', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Courses', value: '...', color: 'violet', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  ]);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const storedAuth = JSON.parse(localStorage.getItem('authData') || '{}');
        const studentId = storedAuth.studentId;

        const [att, marks, fees, courses] = await Promise.all([
          getAttendanceForStudent(studentId),
          getMarksForStudent(studentId),
          getStudentFees(),
          getCoursesForStudent()
        ]);

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
          { label: 'Attendance', value: `${att.overall?.percentage || 0}%`, color: 'cyan', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'CGPA', value: cgpa, color: 'emerald', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { label: 'Pending Fees', value: formatCurrency(fees.summary?.pendingAmount || 0), color: 'amber', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Courses', value: String(courses.totalCourses || 0), color: 'violet', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
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
      window.location.reload();
    } catch (err) {
      setSeedMessage({ type: 'error', text: err.message });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back, Student!</h2>
            <p className="text-indigo-100 text-lg">Here's your academic progress overview for this semester.</p>
          </div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap shadow-lg"
          >
            {seeding ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Seeding...
              </span>
            ) : '🌱 Seed Demo Data'}
          </button>
        </div>
        {seedMessage.text && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium border ${seedMessage.type === 'success'
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100'
            : 'bg-red-500/20 border-red-500/30 text-red-100'
            }`}>
            {seedMessage.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-slate-800 border border-slate-700 group-hover:bg-${stat.color}-500/20 group-hover:border-${stat.color}-500/30 transition-colors`}>
                <svg className={`w-6 h-6 text-slate-400 group-hover:text-${stat.color}-400 transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 group-hover:text-${stat.color}-400 group-hover:border-${stat.color}-500/30 transition-colors`}>
                Latest
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1 tracking-tight">{stat.value}</p>
            </div>
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
        const data = await getAttendanceForStudent(studentId);

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
    if (percentage >= 75) return 'from-emerald-500 to-teal-400 shadow-emerald-500/20';
    if (percentage >= 60) return 'from-amber-500 to-orange-400 shadow-amber-500/20';
    return 'from-red-500 to-rose-400 shadow-red-500/20';
  };

  const getTextColor = (percentage) => {
    if (percentage >= 75) return 'text-emerald-400';
    if (percentage >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 flex items-center gap-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overall Summary Card */}
      {attendance.overall && (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Overall Attendance</h2>
              <p className="text-slate-400">
                You have attended <span className="text-white font-semibold">{attendance.overall.attendedClasses}</span> out of <span className="text-white font-semibold">{attendance.overall.totalClasses}</span> total classes.
              </p>

              {attendance.overall.percentage < 75 && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Attendance below 75% - Improvement needed
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-slate-400">Progress</span>
                <span className={`text-4xl font-bold ${getTextColor(attendance.overall.percentage)}`}>
                  {attendance.overall.percentage}%
                </span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full bg-gradient-to-r ${getProgressColor(attendance.overall.percentage)} transition-all duration-1000 ease-out`}
                  style={{ width: `${attendance.overall.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject-wise Attendance */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-indigo-500"></span>
          Subject-wise Breakdown
        </h3>

        {!attendance.subjects || attendance.subjects.length === 0 ? (
          <p className="text-slate-400 text-center py-12 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
            No attendance records to display.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attendance.subjects.map((subject, index) => (
              <div key={index} className="group bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-white font-semibold line-clamp-2 pr-2 h-12 flex items-center">{subject.subject}</h4>
                  <div className={`text-lg font-bold px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 ${getTextColor(subject.percentage)}`}>
                    {subject.percentage}%
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getProgressColor(subject.percentage)} shadow-none transition-all duration-700`}
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Attended: {subject.attendedClasses}</span>
                    <span>Total: {subject.totalClasses}</span>
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
    if (!grade) return 'text-slate-500';
    const g = String(grade).toUpperCase();
    if (g.startsWith('A') || g === 'O') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (g.startsWith('B')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (g.startsWith('C')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  const currentSemester = marksData.semesters.find(s => s.semester === selectedSemester);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 flex items-center gap-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Semester Selector */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Academic Performance</h2>
            <p className="text-slate-400 text-sm mt-1">Select a semester to view detailed marksheet.</p>
          </div>

          {marksData.semesters.length > 0 && (
            <div className="relative">
              <select
                value={selectedSemester || ''}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="appearance-none pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-[200px]"
              >
                {marksData.semesters.map((sem) => (
                  <option key={sem.semester} value={sem.semester}>
                    Semester {sem.semester}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Marks Table */}
      {!marksData.semesters || marksData.semesters.length === 0 ? (
        <div className="bg-slate-800/50 rounded-2xl p-12 text-center border border-dashed border-slate-700">
          <p className="text-slate-400">No marks records found.</p>
        </div>
      ) : currentSemester ? (
        <>
          {/* Summary Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-8 shadow-2xl shadow-violet-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-indigo-100 font-medium mb-1">Semester {currentSemester.semester} Result</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold text-white">{currentSemester.percentage}%</h3>
                  <span className="text-indigo-200 text-sm">Overall</span>
                </div>
                <p className="text-indigo-100/80 text-sm mt-2">
                  Total Marks: <span className="font-semibold text-white">{currentSemester.totalMarks}</span> / {currentSemester.maxMarks}
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-md">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700/50">
                    <th className="text-left px-8 py-5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Subject</th>
                    <th className="text-left px-8 py-5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Internal</th>
                    <th className="text-left px-8 py-5 text-slate-400 font-semibold text-xs uppercase tracking-wider">External</th>
                    <th className="text-left px-8 py-5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Total</th>
                    <th className="text-left px-8 py-5 text-slate-400 font-semibold text-xs uppercase tracking-wider">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {currentSemester.subjects.map((subject, index) => (
                    <tr key={index} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-8 py-5 text-white font-medium">{subject.subject}</td>
                      <td className="px-8 py-5 text-slate-300">{subject.internalMarks}</td>
                      <td className="px-8 py-5 text-slate-300">{subject.externalMarks}</td>
                      <td className="px-8 py-5 text-white font-semibold">{subject.total}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getGradeColor(subject.grade)}`}>
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
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 flex items-center gap-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Cards */}
      {feesData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Total Fees</p>
            <p className="text-3xl font-bold text-white mt-2">{formatAmount(feesData.summary.totalAmount)}</p>
          </div>

          <div className="bg-emerald-900/20 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-emerald-400 text-sm font-medium uppercase tracking-wide">Paid Amount</p>
            <p className="text-3xl font-bold text-white mt-2">{formatAmount(feesData.summary.paidAmount)}</p>
          </div>

          <div className="bg-amber-900/20 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-24 h-24 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-amber-400 text-sm font-medium uppercase tracking-wide">Pending Due</p>
            <p className="text-3xl font-bold text-white mt-2">{formatAmount(feesData.summary.pendingAmount)}</p>
          </div>
        </div>
      )}

      {/* Fees List */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-indigo-500"></span>
          Payment History
        </h2>

        {feesData.fees.length === 0 ? (
          <p className="text-slate-400 text-center py-12 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">No fees records found.</p>
        ) : (
          <div className="space-y-4">
            {feesData.fees.map((fee) => (
              <div
                key={fee.id}
                className={`bg-slate-900/50 rounded-xl p-6 border border-slate-800 transition-all duration-300 hover:shadow-lg hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 group ${fee.status === 'Paid' ? 'hover:shadow-emerald-500/5' : 'hover:shadow-red-500/5'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrikh-0 ${fee.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {fee.status === 'Paid' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Semester {fee.semester}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">
                      Due Date: <span className="text-slate-300">{formatDate(fee.dueDate)}</span>
                      {isOverdue(fee.dueDate, fee.status) && (
                        <span className="text-red-400 ml-2 font-medium bg-red-500/10 px-2 py-0.5 rounded text-xs animate-pulse">Overdue</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pl-16 md:pl-0">
                  <span className="text-2xl font-bold text-white tracking-tight">{formatAmount(fee.amount)}</span>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${fee.status === 'Paid'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    {fee.status}
                  </span>
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
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 flex items-center gap-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">Academic Courses</h2>
          <p className="text-slate-400">Explore the curriculum and details of your enrolled courses.</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {coursesData.courses.map((course) => (
          <div
            key={course._id}
            className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:bg-slate-800/80 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-default"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-500/20 uppercase tracking-wider">
                {course.courseId}
              </span>
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all duration-300 shadow-md">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
              {course.courseName}
            </h3>

            <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
              <div className="p-1 rounded bg-slate-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium">{course.facultyName}</span>
            </div>

            <div className="border-t border-slate-700/50 pt-4 mt-auto">
              {course.description ? (
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 italic">
                  "{course.description}"
                </p>
              ) : (
                <p className="text-slate-600 text-sm italic">No description available.</p>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
        {coursesData.courses.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="text-slate-500 text-lg">No courses available at the moment.</p>
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
    let hash = 0;
    for (let i = 0; i < courseId.length; i++) {
      hash = courseId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Weekly Schedule</h2>
            <p className="text-slate-400 text-sm mt-1">Your assigned class timings and venues.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold animate-pulse">
            Live Updates
          </span>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 overflow-hidden shadow-xl">
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 gap-4 mb-4">
              <div className="p-4 text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center">Time</div>
              {days.map(day => (
                <div key={day} className="p-4 text-center text-slate-300 font-bold bg-slate-900/50 rounded-xl border border-slate-800/50 shadow-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Time Rows */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-6 gap-4 mb-4">
                <div className="p-3 text-slate-400 text-sm font-mono flex items-center justify-center bg-slate-900/30 rounded-xl border border-slate-800/30">
                  {time}
                </div>
                {days.map(day => {
                  const classInfo = getClassForSlot(day, time);
                  return (
                    <div key={`${day}-${time}`} className="min-h-[100px] relative group h-full">
                      {classInfo ? (
                        <div className={`h-full p-4 rounded-xl border transition-all duration-300 cursor-default flex flex-col justify-between ${getSubjectColor(classInfo.courseId)} hover:scale-[1.05] hover:shadow-xl hover:shadow-black/20 hover:z-50 relative group-hover:bg-opacity-30`}>
                          <div>
                            <p className="font-bold text-sm leading-tight mb-1">{classInfo.courseId}</p>
                            <p className="text-xs opacity-80 line-clamp-2">{classInfo.courseName}</p>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-1.5 opacity-90">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              <span className="text-[11px] font-semibold">{classInfo.room || 'TBA'}</span>
                            </div>
                          </div>

                          {/* Tooltip */}
                          <div className="absolute opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl w-60 -left-6 bottom-full mb-3 pointer-events-none z-[100]">
                            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-2">{classInfo.courseId}</p>
                            <h4 className="text-white text-sm font-bold mb-3 leading-snug">{classInfo.courseName}</h4>
                            <div className="space-y-2">
                              <p className="text-slate-300 text-xs flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></span>
                                Faculty: <span className="text-white ml-auto">{classInfo.facultyName}</span>
                              </p>
                              <p className="text-slate-300 text-xs flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                                Room: <span className="text-white ml-auto">{classInfo.room || 'TBA'}</span>
                              </p>
                            </div>
                            <div className="absolute bottom-[-6px] left-10 w-3 h-3 bg-slate-900/95 border-r border-b border-slate-700 rotate-45"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full bg-slate-800/20 rounded-xl border border-slate-800/30 flex items-center justify-center hover:bg-slate-800/40 transition-colors">
                          <div className="w-1.5 h-1.5 bg-slate-800/50 rounded-full"></div>
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
        const studentId = storedAuth.studentId;

        // We can just rely on the token, but keeping existing checks is fine.
        let data;
        try {
          data = await getProfileForStudent(studentId);
        } catch (err) {
          console.warn('Failed to fetch profile:', err);
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
      if (!profile.name.trim()) throw new Error('Name is required');
      if (!profile.email.trim()) throw new Error('Email is required');

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
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-indigo-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white/10">
            {profile.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-1">{profile.name || 'Student'}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
              <span className="px-3 py-1 rounded-lg bg-black/20 text-white/90 text-sm font-medium border border-white/10">
                ID: {profile.studentId}
              </span>
              <span className="px-3 py-1 rounded-lg bg-black/20 text-white/90 text-sm font-medium border border-white/10">
                Dept: {profile.department || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Form */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Personal Information</h3>
            <p className="text-slate-400 text-sm mt-1">Manage your personal details and contact info.</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Read-Only Fields */}
            <div className="space-y-6">
              <div className="group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Student ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.studentId}
                    readOnly
                    className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-400 font-mono cursor-not-allowed focus:outline-none"
                  />
                  <div className="absolute right-4 top-3.5 text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">Department</label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.department || 'Not Assigned'}
                    readOnly
                    className="w-full px-5 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-400 font-medium cursor-not-allowed focus:outline-none"
                  />
                  <div className="absolute right-4 top-3.5 text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end pt-6 border-t border-slate-700/50">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving Changes...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
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
