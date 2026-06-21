import { useEffect, useState } from 'react';
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
          // Resolve employee id via profile endpoint which merges employee record
          const profileResp = await apiService.getProfile();
          const profile = profileResp.data;
          const empId = profile._id || profile.employeeId || profile.id;
          setEmployeeId(empId);
          console.log('Attendance: resolved employee id for user ->', empId);
          const attendanceResp = await apiService.getAttendanceByEmployee(empId);
          setRecords(attendanceResp.data);
          setIsOfflineMode(profileResp.isMock || attendanceResp.isMock);
        } else {
          // Admin / HR
          const { data, isMock } = await apiService.getAttendanceRecords();
          // API returns { total, page, limit, records }
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

    // Find today's record by local date
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

    // Find today's record by local date
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

  const getStatusStyle = (status) => {
    const isPresent = status === 'Present';
    const isHalfDay = status === 'Half-Day';
    return {
      backgroundColor: isPresent ? '#e6fffa' : isHalfDay ? '#fffaf0' : '#fff5f5',
      color: isPresent ? '#047487' : isHalfDay ? '#dd6b20' : '#c53030',
      border: isPresent ? '1px solid #b2f5ea' : isHalfDay ? '1px solid #fbd38d' : '1px solid #feb2b2',
      padding: '0.25rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      display: 'inline-block'
    };
  };

  const isEmployee = user?.role === 'employee';

  return (
    <div className="attendance-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, color: '#0f172a', fontWeight: 'bold' }}>Attendance Log</h1>
          {isOfflineMode && (
            <span style={{
              backgroundColor: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fef3c7',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              ⚡ Demo Mode
            </span>
          )}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Role: <strong style={{ color: '#2563eb', textTransform: 'capitalize' }}>{user?.role || 'Guest'}</strong>
        </div>
      </div>

      <p style={{ color: '#64748b', marginTop: '-1rem', marginBottom: '2rem' }}>
        {isEmployee ? 'Mark your daily attendance, check in and check out.' : 'Monitor daily attendance records for all active employees.'}
      </p>

      {/* Employee Quick Actions */}
      {isEmployee && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>⏱️ Daily Actions</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Check In
            </button>
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#334155'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#475569'}
            >
              Check Out
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div style={{
          backgroundColor: '#f0fdf4',
          color: '#16a34a',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          marginBottom: '1.5rem',
          fontWeight: '500'
        }}>
          ✅ {successMsg}
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          border: '1px solid #fca5a5',
          marginBottom: '2rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #cbd5e1',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Fetching attendance logs, please wait...</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          padding: '1rem',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>
                <th style={{ padding: '0.75rem' }}>Date</th>
                {!isEmployee && <th style={{ padding: '0.75rem' }}>Employee</th>}
                <th style={{ padding: '0.75rem' }}>Check In</th>
                <th style={{ padding: '0.75rem' }}>Check Out</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={isEmployee ? 4 : 5} style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
                    No attendance logs found.
                  </td>
                </tr>
              ) : (
                records.map((rec, index) => (
                  <tr key={rec._id || index} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#334155' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{formatDate(rec.date)}</td>
                    {!isEmployee && (
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: '500', color: '#0f172a' }}>{rec.employee?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {rec.employee?.employeeId || 'N/A'}</div>
                      </td>
                    )}
                    <td style={{ padding: '0.75rem' }}>{formatTime(rec.checkIn)}</td>
                    <td style={{ padding: '0.75rem' }}>{formatTime(rec.checkOut)}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={getStatusStyle(rec.status)}>
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
