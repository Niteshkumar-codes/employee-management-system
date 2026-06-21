import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Profile from './pages/Profile';
import './App.css';

const navItems = [
  { 
    path: '/dashboard', 
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    )
  },
  { 
    path: '/employees', 
    label: 'Employees',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  { 
    path: '/attendance', 
    label: 'Attendance',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  { 
    path: '/leaves', 
    label: 'Leaves',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  },
  { 
    path: '/profile', 
    label: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }
];

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/employees': 'Employee Registry',
  '/attendance': 'Attendance Log Console',
  '/leaves': 'Time-Off Administration',
  '/profile': 'Corporate Profile Hub'
};

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('ems_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing notifications:', e);
      }
    }
    return [
      {
        id: 'welcome',
        type: 'info',
        text: 'Welcome to Enterprise Console!',
        timestamp: Date.now(),
        unread: true
      }
    ];
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Global search bar states and local caches
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  const fallbackEmployees = [
    { _id: 'e1', employeeId: 'EMP001', name: 'Alice Cooper', email: 'employee@ems.com', department: 'Engineering', designation: 'Software Engineer', status: 'active' },
    { _id: 'e2', employeeId: 'EMP002', name: 'Bob Dylan', email: 'bob@ems.com', department: 'Design', designation: 'UI Designer', status: 'active' },
    { _id: 'e3', employeeId: 'EMP003', name: 'Charlie Brown', email: 'charlie@ems.com', department: 'Marketing', designation: 'Marketing Exec', status: 'active' },
    { _id: 'e4', employeeId: 'EMP004', name: 'Jane Doe', email: 'admin@ems.com', department: 'Management', designation: 'System Admin', status: 'active' },
    { _id: 'e5', employeeId: 'EMP005', name: 'John Smith', email: 'hr@ems.com', department: 'HR', designation: 'HR Manager', status: 'active' },
    { _id: 'e6', employeeId: 'EMP006', name: 'Evan Peters', email: 'evan@ems.com', department: 'Engineering', designation: 'QA Lead', status: 'inactive' }
  ];

  const fallbackLeaves = [
    { _id: 'l1', employee: { name: 'Alice Cooper' }, leaveType: 'Sick Leave', startDate: '2026-06-10', endDate: '2026-06-12', reason: 'Fever and cold', status: 'Pending' },
    { _id: 'l2', employee: { name: 'Bob Dylan' }, leaveType: 'Annual Leave', startDate: '2026-06-15', endDate: '2026-06-20', reason: 'Family vacation', status: 'Pending' },
    { _id: 'l3', employee: { name: 'Charlie Brown' }, leaveType: 'Casual Leave', startDate: '2026-06-01', endDate: '2026-06-02', reason: 'Personal work', status: 'Approved' }
  ];

  const fallbackAttendance = [
    { _id: 'a1', date: '2026-06-07', employee: { name: 'Alice Cooper' }, checkIn: '2026-06-07T09:00:00.000Z', checkOut: '2026-06-07T17:00:00.000Z', status: 'Present' },
    { _id: 'a2', date: '2026-06-07', employee: { name: 'Bob Dylan' }, checkIn: '2026-06-07T09:15:00.000Z', checkOut: '2026-06-07T17:30:00.000Z', status: 'Present' },
    { _id: 'a3', date: '2026-06-07', employee: { name: 'Charlie Brown' }, checkIn: null, checkOut: null, status: 'Absent' },
    { _id: 'a4', date: '2026-06-06', employee: { name: 'Alice Cooper' }, checkIn: '2026-06-06T09:05:00.000Z', checkOut: '2026-06-06T17:00:00.000Z', status: 'Present' },
    { _id: 'a5', date: '2026-06-06', employee: { name: 'John Smith' }, checkIn: '2026-06-06T08:55:00.000Z', checkOut: '2026-06-06T17:05:00.000Z', status: 'Present' }
  ];

  const [searchEmployees, setSearchEmployees] = useState(() => {
    const saved = localStorage.getItem('ems_search_employees');
    return saved ? JSON.parse(saved) : fallbackEmployees;
  });

  const [searchLeaves, setSearchLeaves] = useState(() => {
    const saved = localStorage.getItem('ems_search_leaves');
    return saved ? JSON.parse(saved) : fallbackLeaves;
  });

  const [searchAttendance, setSearchAttendance] = useState(() => {
    const saved = localStorage.getItem('ems_search_attendance');
    return saved ? JSON.parse(saved) : fallbackAttendance;
  });

  const [searchProfile, setSearchProfile] = useState(() => {
    const saved = localStorage.getItem('ems_search_profile');
    if (saved) return JSON.parse(saved);
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return { name: u.name, email: u.email, role: u.role, department: 'Management', designation: 'System Admin' };
      } catch (e) {}
    }
    return null;
  });

  const hideLayout = location.pathname === '/' || location.pathname === '/login';
  const pageTitle = pageTitles[location.pathname] || 'EMS Console';

  // Retrieve user details from localStorage
  const user = (() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  })();

  const initials = user?.name 
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() 
    : 'EM';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setDropdownOpen(false);
    navigate('/login');
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen to ems-data-* events from subpages
  useEffect(() => {
    const handleEmployeesChange = (e) => {
      setSearchEmployees(e.detail);
      localStorage.setItem('ems_search_employees', JSON.stringify(e.detail));
    };
    const handleLeavesChange = (e) => {
      setSearchLeaves(e.detail);
      localStorage.setItem('ems_search_leaves', JSON.stringify(e.detail));
    };
    const handleAttendanceChange = (e) => {
      setSearchAttendance(e.detail);
      localStorage.setItem('ems_search_attendance', JSON.stringify(e.detail));
    };
    const handleProfileChange = (e) => {
      setSearchProfile(e.detail);
      localStorage.setItem('ems_search_profile', JSON.stringify(e.detail));
    };

    window.addEventListener('ems-data-employees', handleEmployeesChange);
    window.addEventListener('ems-data-leaves', handleLeavesChange);
    window.addEventListener('ems-data-attendance', handleAttendanceChange);
    window.addEventListener('ems-data-profile', handleProfileChange);

    return () => {
      window.removeEventListener('ems-data-employees', handleEmployeesChange);
      window.removeEventListener('ems-data-leaves', handleLeavesChange);
      window.removeEventListener('ems-data-attendance', handleAttendanceChange);
      window.removeEventListener('ems-data-profile', handleProfileChange);
    };
  }, []);

  // Reset activeIndex when query or results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery, searchResults]);

  // Search matching algorithm
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results = [];

    // 1. Profile Match
    if (searchProfile) {
      const name = searchProfile.name || '';
      const email = searchProfile.email || '';
      const dept = searchProfile.department || '';
      const des = searchProfile.designation || '';

      if (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        dept.toLowerCase().includes(query) ||
        des.toLowerCase().includes(query)
      ) {
        results.push({
          id: 'profile-self',
          category: 'Profile',
          title: name,
          subtitle: `${des} • ${dept} (${email})`,
          path: '/profile',
          recordId: 'profile-card'
        });
      }
    }

    // 2. Employees Match
    if (searchEmployees && searchEmployees.length > 0) {
      searchEmployees.forEach(emp => {
        const name = emp.name || '';
        const email = emp.email || '';
        const dept = emp.department || '';
        const des = emp.designation || '';
        const empId = emp.employeeId || '';

        if (
          name.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          dept.toLowerCase().includes(query) ||
          des.toLowerCase().includes(query) ||
          empId.toLowerCase().includes(query)
        ) {
          results.push({
            id: `emp-${emp._id || empId}`,
            category: 'Employees',
            title: name,
            subtitle: `${des} • ${dept} (ID: ${empId})`,
            path: '/employees',
            recordId: emp._id || empId
          });
        }
      });
    }

    // 3. Attendance Match
    if (searchAttendance && searchAttendance.length > 0) {
      searchAttendance.forEach(att => {
        const empName = att.employee?.name || (user?.role === 'employee' ? user?.name : '') || 'Unknown';
        const status = att.status || '';
        const dateStr = att.date ? new Date(att.date).toLocaleDateString() : '';

        if (
          empName.toLowerCase().includes(query) ||
          status.toLowerCase().includes(query) ||
          dateStr.toLowerCase().includes(query)
        ) {
          results.push({
            id: `att-${att._id || Math.random()}`,
            category: 'Attendance',
            title: `Attendance: ${empName}`,
            subtitle: `${status} on ${dateStr}`,
            path: '/attendance',
            recordId: att._id
          });
        }
      });
    }

    // 4. Leaves Match
    if (searchLeaves && searchLeaves.length > 0) {
      searchLeaves.forEach(lv => {
        const empName = lv.employee?.name || (user?.role === 'employee' ? user?.name : '') || 'Unknown';
        const type = lv.leaveType || '';
        const reason = lv.reason || '';
        const status = lv.status || '';

        if (
          empName.toLowerCase().includes(query) ||
          type.toLowerCase().includes(query) ||
          reason.toLowerCase().includes(query) ||
          status.toLowerCase().includes(query)
        ) {
          results.push({
            id: `lv-${lv._id || Math.random()}`,
            category: 'Leaves',
            title: `${type} Request: ${empName}`,
            subtitle: `Reason: ${reason} (${status})`,
            path: '/leaves',
            recordId: lv._id
          });
        }
      });
    }

    setSearchResults(results.slice(0, 8));
  }, [searchQuery, searchEmployees, searchLeaves, searchAttendance, searchProfile]);

  // Listen to ems-notification event
  useEffect(() => {
    const handleNotification = (e) => {
      const newNotif = {
        id: Math.random().toString(36).substring(2, 9),
        type: e.detail.type,
        text: e.detail.text,
        timestamp: e.detail.timestamp || Date.now(),
        unread: true
      };
      setNotifications(prev => {
        const updated = [newNotif, ...prev].slice(0, 20);
        localStorage.setItem('ems_notifications', JSON.stringify(updated));
        return updated;
      });
    };
    window.addEventListener('ems-notification', handleNotification);
    return () => {
      window.removeEventListener('ems-notification', handleNotification);
    };
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, unread: false }));
      localStorage.setItem('ems_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, unread: false } : n);
      localStorage.setItem('ems_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    localStorage.setItem('ems_notifications', JSON.stringify([]));
  };

  const formatTimeAgo = (timestamp) => {
    const diffMs = Date.now() - timestamp;
    if (diffMs < 60000) return 'Just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const today = new Date();
    const notifDate = new Date(timestamp);
    if (today.toDateString() === notifDate.toDateString()) {
      return 'Today';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (yesterday.toDateString() === notifDate.toDateString()) {
      return 'Yesterday';
    }
    return notifDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'employee':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        );
      case 'attendance':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case 'leave':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        );
      case 'leave-approved':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'leave-rejected':
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      default:
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  const handleResultClick = (path, recordId) => {
    const fullPath = recordId ? `${path}#${recordId}` : path;
    navigate(fullPath);
    setSearchQuery('');
    setIsSearchFocused(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
      e.target.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setActiveIndex(prev => (prev + 1) % searchResults.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setActiveIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && searchResults[activeIndex]) {
        const item = searchResults[activeIndex];
        handleResultClick(item.path, item.recordId);
      } else if (searchResults.length > 0) {
        const item = searchResults[0];
        handleResultClick(item.path, item.recordId);
      }
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} style={{ backgroundColor: 'var(--warning-light)', color: 'var(--text-primary)', padding: '0 2px', borderRadius: '2px', fontWeight: 'bold' }}>{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className={`app-shell ${hideLayout ? 'app-shell--no-layout' : ''}`}>
      {!hideLayout && (
        <>
          {/* Mobile Overlay backdrop */}
          {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
          
          <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
            <div className="sidebar__brand">
              <div className="sidebar__logo-icon">EMS</div>
              <div>
                <h2 className="sidebar__logo-title">Enterprise Console</h2>
                <p className="sidebar__subtitle">Workspace Management</p>
              </div>
            </div>

            <nav className="sidebar__nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sidebar__link-icon">{item.icon}</span>
                  <span className="sidebar__link-label">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="sidebar__footer">
              <div className="sidebar__user-badge">
                <div className="sidebar__user-avatar">{initials}</div>
                <div className="sidebar__user-info">
                  <p className="sidebar__user-name">{user?.name || 'EMS Employee'}</p>
                  <p className="sidebar__user-role">{user?.role ? user.role.toUpperCase() : 'STAFF'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="sidebar__logout-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      <div className="main-shell">
        {!hideLayout && (
          <header className="topbar">
            <button
              type="button"
              className="topbar__menu-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle Sidebar Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            
            <div className="topbar__title-group">
              <span className="topbar__eyebrow">Enterprise Hub</span>
              <h1 className="topbar__title">{pageTitle}</h1>
            </div>

            {/* Topbar Search bar */}
            <div className="topbar__search-bar" ref={searchContainerRef}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search employees, leaves, attendance..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', cursor: 'text' }} 
              />
              
              {isSearchFocused && searchQuery.trim() && (
                <div className="topbar__search-dropdown">
                  {searchResults.length === 0 ? (
                    <div className="search-dropdown__empty">No results found for "{searchQuery}"</div>
                  ) : (
                    <div>
                      {['Profile', 'Employees', 'Attendance', 'Leaves'].map(category => {
                        const categoryResults = searchResults.filter(r => r.category === category);
                        if (categoryResults.length === 0) return null;
                        return (
                          <div key={category}>
                            <div className="search-dropdown__section-title">{category}</div>
                            {categoryResults.map(item => {
                              const absoluteIndex = searchResults.findIndex(r => r.id === item.id);
                              const isActive = absoluteIndex === activeIndex;
                              return (
                                <div 
                                  key={item.id} 
                                  className={`search-dropdown__item ${isActive ? 'search-dropdown__item--active' : ''}`}
                                  onClick={() => handleResultClick(item.path, item.recordId)}
                                >
                                  <span className="search-dropdown__item-title">
                                    {highlightText(item.title, searchQuery)}
                                  </span>
                                  <span className="search-dropdown__item-subtitle">
                                    {highlightText(item.subtitle, searchQuery)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="topbar__actions">
              {/* Notification Dropdown Container */}
              <div className="topbar__notifications-container" ref={notifRef}>
                <button 
                  className="topbar__action-btn" 
                  aria-label="Notifications"
                  onClick={() => setNotifOpen(prev => !prev)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {unreadCount > 0 && <span className="topbar__action-badge">{unreadCount}</span>}
                </button>
                
                {notifOpen && (
                  <div className="topbar__notifications-dropdown">
                    <div className="notifications-header">
                      <h3 className="notifications-header__title">Notifications</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {unreadCount > 0 && (
                          <button className="notifications-header__clear-btn" onClick={handleMarkAllAsRead} style={{ color: 'var(--primary)' }}>
                            Mark Read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button className="notifications-header__clear-btn" onClick={handleClearAll}>
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="notifications-empty">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, marginBottom: '0.25rem' }}>
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        No notifications available.
                      </div>
                    ) : (
                      <ul className="notifications-list">
                        {notifications.map(notif => (
                          <li 
                            key={notif.id} 
                            className={`notifications-item ${notif.unread ? 'notifications-item--unread' : ''}`}
                            onClick={() => handleMarkAsRead(notif.id)}
                          >
                            <div className={`notifications-item__icon notifications-item__icon--${notif.type}`}>
                              {getIconForType(notif.type)}
                            </div>
                            <div className="notifications-item__content">
                              <p className="notifications-item__text">{notif.text}</p>
                              <span className="notifications-item__time">{formatTimeAgo(notif.timestamp)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="topbar__profile-dropdown-container" ref={dropdownRef}>
                <button 
                  className={`topbar__profile-avatar-btn ${dropdownOpen ? 'topbar__profile-avatar-btn--active' : ''}`}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-label="User profile dropdown menu"
                >
                  <div className="topbar__avatar-circle">{initials}</div>
                </button>

                {dropdownOpen && (
                  <div className="topbar__dropdown">
                    <div className="dropdown__header">
                      <p className="dropdown__user-name">{user?.name || 'EMS User'}</p>
                      <p className="dropdown__user-email">{user?.email || 'user@ems.local'}</p>
                    </div>
                    <div className="dropdown__divider"></div>
                    <div className="dropdown__links">
                      <NavLink to="/profile" className="dropdown__link" onClick={() => setDropdownOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        My Profile
                      </NavLink>
                      <NavLink to="/dashboard" className="dropdown__link" onClick={() => setDropdownOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                        </svg>
                        Console Settings
                      </NavLink>
                    </div>
                    <div className="dropdown__divider"></div>
                    <button onClick={handleLogout} className="dropdown__logout-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        <main className={`main-content ${hideLayout ? 'main-content--full-width' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
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

