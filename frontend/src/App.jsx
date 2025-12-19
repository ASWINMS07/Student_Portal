import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [page, setPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Force redirect to login on visit/refresh by not checking token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   setIsAuthenticated(true);
    // }
    setIsAuthenticated(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPage('login');
  };

  if (isAuthenticated) {
    const role = localStorage.getItem('role');
    if (role === 'admin') {
      return <AdminDashboard />;
    }
    return <Dashboard onLogout={handleLogout} />;
  }

  return page === 'login' ? (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onSwitchToSignup={() => setPage('signup')}
    />
  ) : (
    <Signup onSwitchToLogin={() => setPage('login')} />
  );
}

export default App;
