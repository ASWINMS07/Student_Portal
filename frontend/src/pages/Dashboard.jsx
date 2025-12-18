import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { attendanceAPI, marksAPI, feesAPI, coursesAPI, timetableAPI, profileAPI, seedAPI } from '../services/api';

// Page Components
function DashboardHome() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState({ type: '', text: '' });

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedMessage({ type: '', text: '' });
    try {
      const result = await seedAPI.seedData();
      setSeedMessage({ type: 'success', text: `${result.message} - Attendance: ${result.data.attendance}, Marks: ${result.data.marks}, Fees: ${result.data.fees}, Courses: ${result.data.courses}, Timetable: ${result.data.timetable}` });
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
            <h2 className="text-xl font-semibold text-white mb-2">Welcome back, {user.name || 'Student'}!</h2>
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
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            seedMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {seedMessage.text}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: '85%', color: 'cyan' },
          { label: 'CGPA', value: '8.5', color: 'emerald' },
          { label: 'Pending Fees', value: '₹0', color: 'amber' },
          { label: 'Courses', value: '6', color: 'violet' },
        ].map((stat) => (
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
        const data = await attendanceAPI.getAttendance();
        setAttendance(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getTextColor = (percentage) => {
    if (percentage >= 75) return 'text-emerald-400';
    if (percentage >= 50) return 'text-amber-400';
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
        
        {attendance.subjects.length === 0 ? (
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
        const data = await marksAPI.getMarks();
        setMarksData(data);
        if (data.semesters.length > 0) {
          setSelectedSemester(data.semesters[0].semester);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const getGradeColor = (grade) => {
    if (!grade) return 'text-slate-400';
    if (grade.startsWith('A') || grade === 'O') return 'text-emerald-400';
    if (grade.startsWith('B')) return 'text-cyan-400';
    if (grade.startsWith('C')) return 'text-amber-400';
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
      {marksData.semesters.length === 0 ? (
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
                    <th className="text-center px-6 py-4 text-slate-400 font-medium text-sm">Internal</th>
                    <th className="text-center px-6 py-4 text-slate-400 font-medium text-sm">External</th>
                    <th className="text-center px-6 py-4 text-slate-400 font-medium text-sm">Total</th>
                    <th className="text-center px-6 py-4 text-slate-400 font-medium text-sm">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSemester.subjects.map((subject, index) => (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{subject.subject}</td>
                      <td className="px-6 py-4 text-center text-slate-300">{subject.internalMarks}</td>
                      <td className="px-6 py-4 text-center text-slate-300">{subject.externalMarks}</td>
                      <td className="px-6 py-4 text-center text-white font-semibold">{subject.total}</td>
                      <td className="px-6 py-4 text-center">
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
        const data = await feesAPI.getFees();
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
                className={`bg-slate-900/50 rounded-lg p-5 border-l-4 ${
                  fee.status === 'Paid' ? 'border-emerald-500' : 'border-red-500'
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      fee.status === 'Paid' 
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
  const [coursesData, setCoursesData] = useState({ courses: [], totalCredits: 0, totalCourses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await coursesAPI.getCourses();
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
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Courses</p>
          <p className="text-3xl font-bold text-cyan-400 mt-1">{coursesData.totalCourses}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <p className="text-slate-400 text-sm">Total Credits</p>
          <p className="text-3xl font-bold text-violet-400 mt-1">{coursesData.totalCredits}</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-5">Enrolled Courses</h2>
        
        {coursesData.courses.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No courses enrolled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coursesData.courses.map((course) => (
              <div 
                key={course.id} 
                className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm font-medium rounded-md">
                    {course.courseCode}
                  </span>
                  <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-sm font-medium rounded-md">
                    {course.credits} Credits
                  </span>
                </div>
                
                <h3 className="text-white font-semibold text-lg mb-3">{course.courseName}</h3>
                
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{course.instructor || 'TBA'}</span>
                </div>
              </div>
            ))}
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
        const data = await timetableAPI.getTimetable();
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

  const colors = [
    'bg-cyan-500/20 border-cyan-500/50 text-cyan-300',
    'bg-violet-500/20 border-violet-500/50 text-violet-300',
    'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
    'bg-amber-500/20 border-amber-500/50 text-amber-300',
    'bg-rose-500/20 border-rose-500/50 text-rose-300',
    'bg-blue-500/20 border-blue-500/50 text-blue-300',
  ];

  const subjectColors = {};
  let colorIndex = 0;
  const getSubjectColor = (subject) => {
    if (!subjectColors[subject]) {
      subjectColors[subject] = colors[colorIndex % colors.length];
      colorIndex++;
    }
    return subjectColors[subject];
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
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-5">Weekly Schedule</h2>
        
        {timetableData.schedule.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No timetable available.</p>
        ) : (
          <>
            {/* Desktop Grid */}
            <div className="hidden md:block overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="p-3 text-slate-500 text-sm font-medium">Time</div>
                  {days.map(day => (
                    <div key={day} className="p-3 text-center text-slate-300 font-semibold bg-slate-700/50 rounded-lg">
                      {day.slice(0, 3)}
                    </div>
                  ))}
                </div>
                
                {/* Time Rows */}
                {timeSlots.map(time => (
                  <div key={time} className="grid grid-cols-6 gap-2 mb-2">
                    <div className="p-3 text-slate-500 text-sm font-medium flex items-center">
                      {time}
                    </div>
                    {days.map(day => {
                      const classInfo = getClassForSlot(day, time);
                      return (
                        <div key={`${day}-${time}`} className="min-h-[70px]">
                          {classInfo ? (
                            <div className={`h-full p-3 rounded-lg border ${getSubjectColor(classInfo.subject)}`}>
                              <p className="font-medium text-sm">{classInfo.subject}</p>
                              {classInfo.room && (
                                <p className="text-xs opacity-75 mt-1">{classInfo.room}</p>
                              )}
                            </div>
                          ) : (
                            <div className="h-full bg-slate-900/30 rounded-lg"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile List */}
            <div className="md:hidden space-y-4">
              {days.map(day => {
                const daySchedule = timetableData.schedule.find(s => s.day === day);
                if (!daySchedule || daySchedule.classes.length === 0) return null;
                
                return (
                  <div key={day} className="bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">{day}</h3>
                    <div className="space-y-2">
                      {daySchedule.classes.map((cls, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${getSubjectColor(cls.subject)}`}>
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{cls.subject}</span>
                            <span className="text-xs opacity-75">{cls.time}</span>
                          </div>
                          {cls.room && <p className="text-xs opacity-75 mt-1">{cls.room}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
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
    createdAt: ''
  });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileAPI.getProfile();
        setProfile(data);
        setFormData({ name: data.name, email: data.email, phone: data.phone || '' });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      const data = await profileAPI.updateProfile(formData);
      setProfile(prev => ({ ...prev, ...data.user }));
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...data.user }));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {profile.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
            <p className="text-slate-400">Student ID: {profile.studentId}</p>
            <p className="text-slate-500 text-sm">Member since {formatDate(profile.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-5">Edit Profile</h3>

        {message.text && (
          <div className={`mb-5 p-4 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          {/* Student ID (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Student ID
            </label>
            <input
              type="text"
              value={profile.studentId}
              disabled
              className="w-full px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">Student ID cannot be changed</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
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
    localStorage.removeItem('user');
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
