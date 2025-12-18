import { useEffect, useState } from 'react';
import AdminStudents from './AdminStudents';
import AdminAttendance from './AdminAttendance';
import AdminMarks from './AdminMarks';
import AdminFees from './AdminFees';

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState('dashboard');

  // Simple route protection: only allow logged-in admins
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'students', label: 'Students' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'marks', label: 'Marks' },
    { id: 'fees', label: 'Fees' },
  ];

  const renderContent = () => {
    switch (activePage) {
      case 'students':
        return <AdminStudents />;
      case 'attendance':
        return <AdminAttendance />;
      case 'marks':
        return <AdminMarks />;
      case 'fees':
        return <AdminFees />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">
              Overview of academic data and quick links to management tools.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Students</p>
                <p className="text-2xl font-bold text-cyan-400 mt-1">Mock Data</p>
              </div>
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Attendance</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">Managed</p>
              </div>
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                <p className="text-slate-400 text-sm">Marks</p>
                <p className="text-2xl font-bold text-violet-400 mt-1">Managed</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-800">
          <h1 className="text-xl font-semibold tracking-tight">
            Admin Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Academic Management
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="px-6 py-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}


