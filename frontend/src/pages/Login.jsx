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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-slate-400">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl">
          {/* Error Message */}
          {message && (
            <div className="mb-6 p-4 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-400">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Role
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, role: 'student' }));
                    setErrors(prev => ({ ...prev, studentId: '', email: '' }));
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${formData.role === 'student'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${formData.role === 'admin'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Student ID Field - Only for Students */}
            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="S1001"
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.studentId ? 'border-red-500' : 'border-slate-600'
                    }`}
                />
                {errors.studentId && <p className="mt-1.5 text-sm text-red-400">{errors.studentId}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-slate-600'
                  }`}
              />
              {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-slate-600'
                  }`}
              />
              {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
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
            <p className="mt-6 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          )}


        </div>
      </div>
    </div>
  );
}

