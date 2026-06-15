import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
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

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Session expired or authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const { data, isMock } = await apiService.getDashboardSummary();
        setStats(data);
        setIsOfflineMode(isMock);
      } catch (err) {
        console.error('Dashboard API Error:', err);
        let errMsg = 'Failed to fetch dashboard data. Please try again.';
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

    fetchStats();
  }, [retryToggle]);

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

  return (
    <div className="dashboard-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        marginBottom: '2rem',
        position: 'relative'
      }}>
        {isOfflineMode && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fef3c7',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            ⚡ Demo Mode
          </div>
        )}
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '2rem', fontWeight: 'bold' }}>
          Dashboard Summary
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '1.05rem' }}>
          Welcome back, <strong style={{ color: '#2563eb' }}>{user?.name || 'User'}</strong>! Here is your portal overview.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          border: '1px solid #fca5a5',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            ⚠️ Error Loading Dashboard
          </div>
          <div>{error}</div>
          <button
            onClick={() => setRetryToggle(prev => !prev)}
            style={{
              alignSelf: 'flex-start',
              padding: '0.5rem 1rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Retry Fetching Data
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
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
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Fetching statistics, please wait...</p>
        </div>
      ) : stats ? (
        <>
          {/* Statistics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {!stats.isEmployee ? (
              // Admin/HR View
              <>
                {/* Total Employees */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      👥 Total Employees
                    </span>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#0f172a', fontWeight: 'bold' }}>
                      {stats.employeeStats?.total ?? 0}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    Active: <strong style={{ color: '#16a34a' }}>{stats.employeeStats?.active ?? 0}</strong> | Inactive: <strong style={{ color: '#dc2626' }}>{stats.employeeStats?.inactive ?? 0}</strong>
                  </div>
                </div>

                {/* Active Employees */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🟢 Active Employees
                    </span>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#16a34a', fontWeight: 'bold' }}>
                      {stats.employeeStats?.active ?? 0}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    Employees with active working status
                  </div>
                </div>

                {/* Today's Attendance */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📅 Today's Attendance
                    </span>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#2563eb', fontWeight: 'bold' }}>
                      {stats.todayAttendance?.present ?? 0}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    Absent: <strong style={{ color: '#dc2626' }}>{stats.todayAttendance?.absent ?? 0}</strong> | Unmarked: <strong style={{ color: '#eab308' }}>{stats.todayAttendance?.unmarked ?? 0}</strong>
                  </div>
                </div>

                {/* Pending Leaves */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ⏳ Pending Leaves
                    </span>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#ea580c', fontWeight: 'bold' }}>
                      {stats.leaveStats?.pending ?? 0}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    Approved: <strong style={{ color: '#16a34a' }}>{stats.leaveStats?.approved ?? 0}</strong> | Rejected: <strong style={{ color: '#dc2626' }}>{stats.leaveStats?.rejected ?? 0}</strong>
                  </div>
                </div>
              </>
            ) : (
              // Employee View
              <>
                {/* Present Days */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📅 My Present Days
                    </span>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#16a34a', fontWeight: 'bold' }}>
                      {stats.attendanceStats?.present ?? 0}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    Half days: <strong style={{ color: '#ea580c' }}>{stats.attendanceStats?.halfDay ?? 0}</strong> | Absent: <strong style={{ color: '#dc2626' }}>{stats.attendanceStats?.absent ?? 0}</strong>
                  </div>
                </div>

                {/* Pending Leaves */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ⏳ My Pending Leaves
                    </span>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#ea580c', fontWeight: 'bold' }}>
                      {stats.leaveStats?.pending ?? 0}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    Awaiting manager review
                  </div>
                </div>

                {/* Approved Leaves */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ✅ My Approved Leaves
                    </span>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#16a34a', fontWeight: 'bold' }}>
                      {stats.leaveStats?.approved ?? 0}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    Days of approved time off
                  </div>
                </div>

                {/* Total Leaves Requested */}
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      📋 Total Requests
                    </span>
                    <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#2563eb', fontWeight: 'bold' }}>
                      {stats.leaveStats?.total ?? 0}
                    </h2>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    Approved: {stats.leaveStats?.approved ?? 0} | Rejected: {stats.leaveStats?.rejected ?? 0}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Employee Details / Profile Section (if Employee role) */}
          {stats.isEmployee && stats.profile && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              padding: '2rem',
              marginBottom: '3rem'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                👤 Corporate Profile Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Full Name</span>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#0f172a', fontWeight: '500' }}>{stats.profile.name || '--'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Email Address</span>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#0f172a', fontWeight: '500' }}>{stats.profile.email || '--'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Department</span>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#0f172a', fontWeight: '500' }}>{stats.profile.department || '--'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Designation</span>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#0f172a', fontWeight: '500' }}>{stats.profile.designation || '--'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Department Breakdown Section (for Admin/HR only) */}
          {!stats.isEmployee && stats.departmentStats && stats.departmentStats.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              padding: '2rem',
              marginBottom: '3rem'
            }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                📊 Department Distribution
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {stats.departmentStats.map((dept, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <strong style={{ color: '#0f172a' }}>{dept.department || 'Other'}</strong>
                    <span style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px'
                    }}>
                      {dept.count} {dept.count === 1 ? 'employee' : 'employees'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Leave Requests Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            padding: '2rem'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📋 Recent Leave Requests</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>Showing last 5 requests</span>
            </h3>
            
            {!stats.recentLeaves || stats.recentLeaves.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No recent leave requests found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.9rem', fontWeight: '600' }}>
                      {!stats.isEmployee && <th style={{ padding: '0.75rem' }}>Employee</th>}
                      <th style={{ padding: '0.75rem' }}>Leave Type</th>
                      <th style={{ padding: '0.75rem' }}>Start Date</th>
                      <th style={{ padding: '0.75rem' }}>End Date</th>
                      <th style={{ padding: '0.75rem' }}>Reason</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentLeaves.map((leave, idx) => (
                      <tr key={leave._id || idx} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#334155' }}>
                        {!stats.isEmployee && (
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{leave.employee?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{leave.employee?.department} • {leave.employee?.designation}</div>
                          </td>
                        )}
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{leave.leaveType}</td>
                        <td style={{ padding: '0.75rem' }}>{formatDate(leave.startDate)}</td>
                        <td style={{ padding: '0.75rem' }}>{formatDate(leave.endDate)}</td>
                        <td style={{ padding: '0.75rem', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
                          {leave.reason || '--'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={getStatusStyle(leave.status)}>
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
