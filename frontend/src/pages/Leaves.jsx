import { useEffect, useState } from 'react';
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
  const [isOfflineMode, setIsOfflineMode] = useState(() => {
    try { return localStorage.getItem('backendOffline') === 'true'; } catch (e) { return false; }
  });
  
  // Apply Leave form state
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchLeaves = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, isMock } = await apiService.getLeaveRequests();
        let allRecords = data.records || data || [];
        
        // If logged-in user is an employee, filter list to their own requests
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
      setShowApplyForm(false);
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      setRetryToggle(prev => !prev);
    } catch (err) {
      console.error('Leaves.jsx apply error:', err);
      // Show precise backend message when available
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
      const { isMock } = await apiService.approveLeave(id);
      setIsOfflineMode(isMock);
      setSuccessMsg('Leave request approved!');
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
      const { isMock } = await apiService.rejectLeave(id);
      setIsOfflineMode(isMock);
      setSuccessMsg('Leave request rejected!');
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return {
          backgroundColor: '#e6fffa',
          color: '#047487',
          border: '1px solid #b2f5ea',
          padding: '0.25rem 0.6rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
          display: 'inline-block'
        };
      case 'Rejected':
        return {
          backgroundColor: '#fff5f5',
          color: '#c53030',
          border: '1px solid #feb2b2',
          padding: '0.25rem 0.6rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
          display: 'inline-block'
        };
      case 'Pending':
      default:
        return {
          backgroundColor: '#fffaf0',
          color: '#dd6b20',
          border: '1px solid #fbd38d',
          padding: '0.25rem 0.6rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
          display: 'inline-block'
        };
    }
  };

  const isEmployee = user?.role === 'employee';
  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="leaves-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, color: '#0f172a', fontWeight: 'bold' }}>Leave Requests</h1>
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
        
        {isEmployee && (
          <button
            onClick={() => setShowApplyForm(prev => !prev)}
            style={{
              padding: '0.5rem 1rem',
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
            {showApplyForm ? 'Close Form' : 'Apply for Leave'}
          </button>
        )}
      </div>

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

      {/* Apply Leave Form */}
      {isEmployee && showApplyForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a' }}>📝 Apply for Leave</h3>
          <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for requesting leave..."
                required
                style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit' }}
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              style={{
                alignSelf: 'flex-start',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      {/* Leave Requests Table */}
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
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Fetching leave requests, please wait...</p>
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
                {!isEmployee && <th style={{ padding: '0.75rem' }}>Employee</th>}
                <th style={{ padding: '0.75rem' }}>Leave Type</th>
                <th style={{ padding: '0.75rem' }}>Start Date</th>
                <th style={{ padding: '0.75rem' }}>End Date</th>
                <th style={{ padding: '0.75rem' }}>Reason</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                {isAdminOrHR && <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrHR ? 7 : isEmployee ? 5 : 6} style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                records.map((rec, index) => (
                  <tr key={rec._id || index} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#334155' }}>
                    {!isEmployee && (
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: '500', color: '#0f172a' }}>{rec.employee?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {rec.employee?.employeeId || 'N/A'}</div>
                      </td>
                    )}
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{rec.leaveType}</td>
                    <td style={{ padding: '0.75rem' }}>{formatDate(rec.startDate)}</td>
                    <td style={{ padding: '0.75rem' }}>{formatDate(rec.endDate)}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rec.reason}>
                      {rec.reason || '--'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={getStatusStyle(rec.status)}>
                        {rec.status}
                      </span>
                    </td>
                    {isAdminOrHR && (
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {rec.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleApprove(rec._id)}
                              disabled={actionLoading}
                              style={{
                                padding: '0.3rem 0.6rem',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '500'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(rec._id)}
                              disabled={actionLoading}
                              style={{
                                padding: '0.3rem 0.6rem',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '500'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Processed</span>
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
