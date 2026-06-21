import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../services/api';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    return null;
  });
  const [retryToggle, setRetryToggle] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const location = useLocation();

  // Dispatch attendance list update for in-memory global search
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ems-data-attendance', { detail: records }));
  }, [records]);

  // Scroll to search highlighted item
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.style.backgroundColor = 'rgba(79, 70, 229, 0.08)';
          element.style.transition = 'background-color 0.5s ease';
          const fadeTimer = setTimeout(() => {
            element.style.backgroundColor = '';
          }, 3000);
          return () => clearTimeout(fadeTimer);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location, records]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) {
        setError('User not found. Please log in.');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        if (user.role === 'employee') {
          const profileResp = await apiService.getProfile();
          const profile = profileResp.data;
          const empId = profile._id || profile.employeeId || profile.id;
          setEmployeeId(empId);
          console.log('Attendance: resolved employee id for user ->', empId);
          const attendanceResp = await apiService.getAttendanceByEmployee(empId);
          setRecords(attendanceResp.data);
          setIsOfflineMode(profileResp.isMock || attendanceResp.isMock);
        } else {
          const { data, isMock } = await apiService.getAttendanceRecords();
          setRecords(data.records || data || []);
          setIsOfflineMode(isMock);
        }
      } catch (err) {
        console.error('Attendance API Error:', err);
        let errMsg = 'Failed to fetch attendance logs. Please try again.';
        if (err.response) {
          errMsg = err.response.data?.message || `Server Error (${err.response.status}).`;
        } else if (err.message) {
          errMsg = err.message;
        }
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user, retryToggle]);

  const formatLocalDate = (input) => {
    const d = new Date(input);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleCheckIn = async () => {
    if (!user) return;

    const todayStr = formatLocalDate(new Date());
    const todayRecord = records.find(rec => {
      if (!rec?.date) return false;
      const recDateStr = formatLocalDate(rec.date);
      return recDateStr === todayStr;
    });

    if (todayRecord && todayRecord.checkIn) {
      setError('You have already checked in today.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        employee: employeeId || user._id,
        date: new Date().toISOString(),
        checkIn: new Date().toISOString(),
        status: 'Present'
      };
      console.log('Attendance.checkIn payload:', payload);
      const { data, isMock } = await apiService.markAttendance(payload);
      console.log('Attendance.checkIn response:', data);
      setIsOfflineMode(isMock);
      setSuccessMsg('Successfully checked in!');
      
      const event = new CustomEvent('ems-notification', {
        detail: {
          type: 'attendance',
          text: `Attendance marked: ${user?.name || 'Employee'} checked in`,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);

      setRetryToggle(prev => !prev);
    } catch (err) {
      console.error('Check-in error:', err);
      if (err?.response) {
        const raw = err.response.data?.message || err.response.data || err.response.statusText;
        setError(typeof raw === 'string' ? raw : JSON.stringify(raw));
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Failed to mark check-in.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user) return;

    const todayStr = formatLocalDate(new Date());
    const todayRecord = records.find(rec => {
      if (!rec?.date) return false;
      const recDateStr = formatLocalDate(rec.date);
      return recDateStr === todayStr;
    });

    if (!todayRecord || !todayRecord.checkIn) {
      setError('Please Check In first before checking out.');
      return;
    }

    if (todayRecord.checkOut) {
      setError('You have already checked out today.');
      return;
    }

    const checkInTime = new Date(todayRecord.checkIn).getTime();
    const checkOutTime = Date.now();

    if (checkOutTime < checkInTime) {
      setError('Check Out time must never be earlier than Check In time.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        employee: employeeId || user._id,
        date: todayRecord.date || new Date().toISOString(),
        checkIn: todayRecord.checkIn,
        checkOut: new Date(checkOutTime).toISOString(),
        status: 'Present'
      };
      console.log('Attendance.checkOut payload:', payload);
      const { data, isMock } = await apiService.markAttendance(payload);
      console.log('Attendance.checkOut response:', data);
      setIsOfflineMode(isMock);
      setSuccessMsg('Successfully checked out!');
      
      const event = new CustomEvent('ems-notification', {
        detail: {
          type: 'attendance',
          text: `Attendance marked: ${user?.name || 'Employee'} checked out`,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);

      setRetryToggle(prev => !prev);
    } catch (err) {
      console.error('Check-out error:', err);
      if (err?.response) {
        const raw = err.response.data?.message || err.response.data || err.response.statusText;
        setError(typeof raw === 'string' ? raw : JSON.stringify(raw));
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Failed to mark check-out.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const val = status?.toLowerCase();
    if (val === 'present') return 'badge badge--success';
    if (val === 'half-day') return 'badge badge--warning';
    return 'badge badge--danger';
  };

  const isEmployee = user?.role === 'employee';

  return (
    <div className="section-card section-card--wide" style={{ animation: 'fade-in-up 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Attendance Logs</h1>
          {isOfflineMode && <span className="badge badge--warning">Demo Fallback Mode</span>}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
          Logged in as: <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user?.role || 'Guest'}</strong>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', marginTop: '-1.25rem', marginBottom: '2rem', fontSize: '0.95rem' }}>
        {isEmployee ? 'Punch your daily check-in and check-out logs to record active working hours.' : 'Monitor daily attendance records for all active employees across workspaces.'}
      </p>

      {/* Employee Quick Actions */}
      {isEmployee && (
        <div style={{
          background: 'var(--background)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Punch Console
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                transition: 'transform 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.target.style.transform = 'none'}
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--text-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                transition: 'transform 0.2s ease, background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.backgroundColor = '#1e293b';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'none';
                e.target.style.backgroundColor = 'var(--text-primary)';
              }}
            >
              Check Out
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="badge badge--success" style={{ padding: '0.75rem 1rem', width: '100%', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
          <span>✅</span> {successMsg}
        </div>
      )}

      {error && (
        <div className="alert" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span>
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Fetching attendance registry, please wait...</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Date</th>
                {!isEmployee && <th>Employee Details</th>}
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={isEmployee ? 4 : 5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>
                    No daily attendance logs found on record.
                  </td>
                </tr>
              ) : (
                records.map((rec, index) => (
                  <tr key={rec._id || index} id={rec._id}>
                    <td style={{ fontWeight: 600 }}>{formatDate(rec.date)}</td>
                    {!isEmployee && (
                      <td>
                        <div className="table-employee">
                          <strong>{rec.employee?.name || 'Unknown'}</strong>
                          <span>ID: {rec.employee?.employeeId || 'N/A'}</span>
                        </div>
                      </td>
                    )}
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatTime(rec.checkIn)}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatTime(rec.checkOut)}</td>
                    <td>
                      <span className={getStatusClass(rec.status)}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Attendance;
