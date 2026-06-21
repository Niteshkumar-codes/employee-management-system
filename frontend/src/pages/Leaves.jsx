import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../services/api';

const Leaves = () => {
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
  
  // Apply Leave form state
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const location = useLocation();

  // Dispatch leaves list update for in-memory global search
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ems-data-leaves', { detail: records }));
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
    const fetchLeaves = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, isMock } = await apiService.getLeaveRequests();
        let allRecords = data.records || data || [];
        
        if (user && user.role === 'employee') {
          allRecords = allRecords.filter(
            r => r.employee?._id === user._id || r.employee?.email === user.email || r.employee === user._id
          );
        }
        
        setRecords(allRecords);
        setIsOfflineMode(isMock);
      } catch (err) {
        console.error('Leaves API Error:', err);
        let errMsg = 'Failed to fetch leave requests. Please try again.';
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

    fetchLeaves();
  }, [user, retryToggle]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      setError('Please fill in all fields.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const leaveTypeMap = {
        'Sick Leave': 'Sick',
        'Casual Leave': 'Casual',
        'Annual Leave': 'Earned',
        'Maternity Leave': 'Earned',
        'Paternity Leave': 'Earned'
      };

      const payload = {
        leaveType: leaveTypeMap[leaveType] || leaveType,
        startDate,
        endDate,
        reason,
        employee: user?._id
      };

      console.log('Leaves.jsx apply payload:', payload);
      const { data, isMock } = await apiService.applyLeave(payload);
      console.log('Leaves.jsx apply response:', data);
      setIsOfflineMode(isMock);
      setSuccessMsg('Leave request submitted successfully!');
      
      const event = new CustomEvent('ems-notification', {
        detail: {
          type: 'leave',
          text: `Leave request submitted by ${user?.name || 'Employee'} for ${leaveType}`,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);

      setShowApplyForm(false);
      
      setStartDate('');
      setEndDate('');
      setReason('');
      setRetryToggle(prev => !prev);
    } catch (err) {
      console.error('Leaves.jsx apply error:', err);
      if (err?.response) {
        const raw = err.response.data?.message || err.response.data || err.response.statusText;
        setError(typeof raw === 'string' ? raw : JSON.stringify(raw));
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Failed to submit leave request.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const record = records.find(r => r._id === id);
      const empName = record?.employee?.name || 'Employee';
      const { isMock } = await apiService.approveLeave(id);
      setIsOfflineMode(isMock);
      setSuccessMsg('Leave request approved!');
      
      const event = new CustomEvent('ems-notification', {
        detail: {
          type: 'leave-approved',
          text: `Leave approved for ${empName}`,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);

      setRetryToggle(prev => !prev);
    } catch (err) {
      console.error(err);
      setError('Failed to approve leave request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const record = records.find(r => r._id === id);
      const empName = record?.employee?.name || 'Employee';
      const { isMock } = await apiService.rejectLeave(id);
      setIsOfflineMode(isMock);
      setSuccessMsg('Leave request rejected!');
      
      const event = new CustomEvent('ems-notification', {
        detail: {
          type: 'leave-rejected',
          text: `Leave rejected for ${empName}`,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);

      setRetryToggle(prev => !prev);
    } catch (err) {
      console.error(err);
      setError('Failed to reject leave request.');
    } finally {
      setActionLoading(false);
    }
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
    switch (status) {
      case 'Approved':
        return 'badge badge--success';
      case 'Rejected':
        return 'badge badge--danger';
      case 'Pending':
      default:
        return 'badge badge--warning';
    }
  };

  const isEmployee = user?.role === 'employee';
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="section-card section-card--wide" style={{ animation: 'fade-in-up 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Leave Requests</h1>
          {isOfflineMode && <span className="badge badge--warning">Demo Fallback Mode</span>}
        </div>
        
        {isEmployee && (
          <button
            onClick={() => setShowApplyForm(prev => !prev)}
            style={{
              padding: '0.625rem 1.25rem',
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {showApplyForm ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </>
              )}
            </svg>
            {showApplyForm ? 'Close Console' : 'Apply for Leave'}
          </button>
        )}
      </div>

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

      {/* Apply Leave Form */}
      {isEmployee && showApplyForm && (
        <div style={{
          backgroundColor: 'var(--background)',
          padding: '2rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.10rem', fontWeight: 700 }}>📝 Fill Time-Off Request</h3>
          <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Reason Details</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for requesting time-off..."
                required
                style={{ padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              style={{
                alignSelf: 'flex-start',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: '600',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.target.style.transform = 'none'}
            >
              Submit Roster Request
            </button>
          </form>
        </div>
      )}

      {/* Leave Requests Table */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Fetching leave logs, please wait...</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                {!isEmployee && <th>Employee Details</th>}
                <th>Leave Category</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                {isAdminOrHR && <th style={{ textAlign: 'center' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrHR ? 7 : isEmployee ? 5 : 6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>
                    No leave requests found on record.
                  </td>
                </tr>
              ) : (
                records.map((rec, index) => (
                  <tr key={rec._id || index} id={rec._id}>
                    {!isEmployee && (
                      <td>
                        <div className="table-employee">
                          <strong>{rec.employee?.name || 'Unknown'}</strong>
                          <span>ID: {rec.employee?.employeeId || 'N/A'}</span>
                        </div>
                      </td>
                    )}
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.leaveType}</td>
                    <td>{formatDate(rec.startDate)}</td>
                    <td>{formatDate(rec.endDate)}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rec.reason}>
                      {rec.reason || '--'}
                    </td>
                    <td>
                      <span className={getStatusClass(rec.status)}>
                        {rec.status}
                      </span>
                    </td>
                    {isAdminOrHR && (
                      <td>
                        {rec.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleApprove(rec._id)}
                              disabled={actionLoading}
                              style={{
                                padding: '0.35rem 0.75rem',
                                backgroundColor: 'var(--success)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                boxShadow: '0 2px 5px rgba(16, 185, 129, 0.2)',
                                transition: 'transform 0.2s ease'
                              }}
                              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                              onMouseOut={(e) => e.target.style.transform = 'none'}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(rec._id)}
                              disabled={actionLoading}
                              style={{
                                padding: '0.35rem 0.75rem',
                                backgroundColor: 'var(--danger)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                boxShadow: '0 2px 5px rgba(239, 68, 68, 0.2)',
                                transition: 'transform 0.2s ease'
                              }}
                              onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                              onMouseOut={(e) => e.target.style.transform = 'none'}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Processed</div>
                        )}
                      </td>
                    )}
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

export default Leaves;
