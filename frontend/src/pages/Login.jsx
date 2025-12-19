import { useState } from 'react';
import { loginUser } from '../services/userService';

export default function Login({ onLoginSuccess, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (formData.role === 'student') {
      if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
    } else {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
    }
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      const selectedRole = formData.role;
      const password = formData.password.trim();
      const email = formData.email.trim();
      const studentId = formData.studentId.trim();

      // Find user based on role and credentials
      // Call API login
      const response = await loginUser({
        email,
        studentId: selectedRole === 'student' ? studentId : null,
        password,
        role: selectedRole,
      });

      const user = response.user;
      const token = response.token;

      // Store auth info locally (no backend/token)
      // For students: store role, studentId, email
      // For admins: store role and email (NO studentId)
      const authData = {
        role: user.role,
        email: user.email,
      };

      if (user.role === 'student' && user.studentId) {
        authData.studentId = user.studentId;
      }
      if (user.name) {
        authData.name = user.name;
      }

      localStorage.setItem('authData', JSON.stringify(authData));
      localStorage.setItem('role', user.role);
      localStorage.setItem('token', token);

      onLoginSuccess?.();

      // Redirect handled by App.jsx state switch
      // if (user.role === 'admin') {
      //   window.location.href = '/admin/dashboard';
      // } else {
      //   window.location.href = '/student/dashboard';
      // }
    } catch (err) {
      setMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 opacity-70"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-white/10 mb-4 shadow-lg backdrop-blur-md">
              <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              Sri Eshwar College Of Engineering
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Student Portal Login
            </p>
          </div>

          {/* Error Message */}
          {message && (
            <div className="mb-6 p-4 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Toggle */}
            <div className="bg-slate-950/50 p-1 rounded-xl flex border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, role: 'student' }));
                  setErrors(prev => ({ ...prev, studentId: '', email: '' }));
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${formData.role === 'student'
                    ? 'bg-slate-800 text-white shadow-md shadow-black/20 ring-1 ring-white/10'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, role: 'admin' }));
                  setErrors(prev => ({ ...prev, studentId: '', email: '' }));
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${formData.role === 'admin'
                    ? 'bg-slate-800 text-white shadow-md shadow-black/20 ring-1 ring-white/10'
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
              >
                Admin
              </button>
            </div>

            <div className="space-y-4">
              {/* Student ID Field - Only for Students */}
              {formData.role === 'student' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 ml-1">Student ID</label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="S1001"
                      className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${errors.studentId ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-800 group-hover:border-slate-700'}`}
                    />
                  </div>
                  {errors.studentId && <p className="text-xs text-red-400 ml-1">{errors.studentId}</p>}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 ml-1">Email Address</label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${errors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-800 group-hover:border-slate-700'}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 ml-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400 ml-1">Password</label>
                  <a href="#" className="text-xs text-teal-400 hover:text-teal-300 transition-colors">Forgot?</a>
                </div>
                <div className="relative group">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-slate-950/50 border rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all ${errors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-800 group-hover:border-slate-700'}`}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-400 ml-1">{errors.password}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-teal-500/20 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer - Only for Students */}
          {formData.role === 'student' && (
            <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
              <p className="text-slate-400 text-sm">
                New student?{' '}
                <button
                  onClick={onSwitchToSignup}
                  className="text-teal-400 hover:text-teal-300 font-semibold transition-colors inline-flex items-center gap-1 group"
                >
                  Create an account
                  <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          &copy; 2025 Sri Eshwar College Of Engineering. Secure Login.
        </p>
      </div>
    </div>
  );
}
