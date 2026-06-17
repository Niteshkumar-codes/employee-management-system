import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Profile from './pages/Profile';
import './App.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/employees', label: 'Employees' },
  { path: '/attendance', label: 'Attendance' },
  { path: '/leaves', label: 'Leaves' },
  { path: '/profile', label: 'Profile' }
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/leaves': 'Leaves',
  '/profile': 'Profile'
};

function AppShell() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hideLayout = location.pathname === '/';
  const pageTitle = pageTitles[location.pathname] || 'EMS Portal';
  const user = (() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  })();
  const initials = user?.name ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() : 'EM';

  return (
    <div className="app-shell">
      {!hideLayout && (
        <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
          <div className="sidebar__brand">
            <div className="sidebar__logo">EMS</div>
            <p className="sidebar__subtitle">Employee Management</p>
          </div>

          <nav className="sidebar__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="sidebar__link"
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar__footer">
            <div>
              <p className="sidebar__footer-label">Logged in as</p>
              <p className="sidebar__footer-value">{user?.name || 'Guest User'}</p>
            </div>
          </div>
        </aside>
      )}

      <div className="main-shell">
        {!hideLayout && (
          <header className="topbar">
            <button
              type="button"
              className="topbar__menu"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
            <div className="topbar__title-group">
              <p className="topbar__eyebrow">Admin Panel</p>
              <h1 className="topbar__title">{pageTitle}</h1>
            </div>
            <div className="topbar__profile">
              <div className="topbar__avatar">{initials}</div>
              <div className="topbar__profile-meta">
                <p className="topbar__profile-name">{user?.name || 'EMS User'}</p>
                <p className="topbar__profile-role">{user?.role ? user.role.toUpperCase() : 'USER'}</p>
              </div>
            </div>
          </header>
        )}

        <main className={`main-content ${hideLayout ? 'main-content--center' : ''}`} onClick={() => sidebarOpen && setSidebarOpen(false)}>
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
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
