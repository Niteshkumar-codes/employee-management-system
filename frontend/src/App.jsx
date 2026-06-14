import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation Bar */}
        <nav style={{
          display: 'flex',
          gap: '1.5rem',
          padding: '1rem 2rem',
          backgroundColor: '#1e293b',
          color: 'white',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem', marginRight: 'auto', letterSpacing: '0.5px' }}>
            💼 EMS Portal
          </span>
          <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Login</Link>
          <Link to="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Dashboard</Link>
          <Link to="/employees" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Employees</Link>
          <Link to="/attendance" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Attendance</Link>
          <Link to="/leaves" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Leaves</Link>
          <Link to="/profile" style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = 'white'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Profile</Link>
        </nav>

        {/* Main Content Area */}
        <main style={{ flex: 1, backgroundColor: '#f8fafc', padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
