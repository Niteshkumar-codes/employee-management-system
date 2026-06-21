import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToggle, setRetryToggle] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
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

        if (!data.isEmployee) {
          const employeeResponse = await apiService.getEmployees();
          setRecentEmployees(employeeResponse.data.slice(0, 5));
        }
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'badge badge--success';
      case 'Rejected':
        return 'badge badge--danger';
      default:
        return 'badge badge--warning';
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'EM';

  const totalDepartmentCount = stats?.departmentStats?.reduce((sum, item) => sum + item.count, 0) || 0;

  // Add custom icons to each card depending on accent/label
  const summaryCards = stats
    ? stats.isEmployee
      ? [
          {
            label: 'Present Days',
            value: stats.attendanceStats?.present ?? 0,
            note: `Half days ${stats.attendanceStats?.halfDay ?? 0} · Absent ${stats.attendanceStats?.absent ?? 0}`,
            accent: 'green',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            )
          },
          {
            label: 'Pending Leaves',
            value: stats.leaveStats?.pending ?? 0,
            note: 'Awaiting approval',
            accent: 'amber',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            )
          },
          {
            label: 'Approved Leaves',
            value: stats.leaveStats?.approved ?? 0,
            note: 'Confirmed time off',
            accent: 'blue',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )
          },
          {
            label: 'Total Requests',
            value: stats.leaveStats?.total ?? 0,
            note: `Rejected ${stats.leaveStats?.rejected ?? 0}`,
            accent: 'purple',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            )
          }
        ]
      : [
          {
            label: 'Total Employees',
            value: stats.employeeStats?.total ?? 0,
            note: `Active ${stats.employeeStats?.active ?? 0} · Inactive ${stats.employeeStats?.inactive ?? 0}`,
            accent: 'blue',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )
          },
          {
            label: "Today's Attendance",
            value: stats.todayAttendance?.present ?? 0,
            note: `Absent ${stats.todayAttendance?.absent ?? 0} · Unmarked ${stats.todayAttendance?.unmarked ?? 0}`,
            accent: 'green',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )
          },
          {
            label: 'Pending Leaves',
            value: stats.leaveStats?.pending ?? 0,
            note: `Approved ${stats.leaveStats?.approved ?? 0}`,
            accent: 'amber',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            )
          },
          {
            label: 'Active Employees',
            value: stats.employeeStats?.active ?? 0,
            note: `${stats.employeeStats?.inactive ?? 0} inactive members`,
            accent: 'purple',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            )
          }
        ]
    : [];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__content">
          <span className="eyebrow">EMS Console</span>
          <h1>Welcome Back, {user?.name ? user.name.split(' ')[0] : 'User'}</h1>
          <p className="dashboard-hero__text">
            Review real-time directory logs, examine department metrics, mark daily check-in/outs, and manage employee leave requests.
          </p>
        </div>

        <div className="dashboard-hero__side">
          <div className={`status-chip ${isOfflineMode ? 'status-chip--warning' : 'status-chip--online'}`}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isOfflineMode ? '#f59e0b' : '#10b981' }}></span>
            {isOfflineMode ? 'Demo Fallback Database' : 'Cloud Server Connection Live'}
          </div>
          <div className="profile-summary">
            <div className="profile-summary__avatar">{initials}</div>
            <div>
              <p className="profile-summary__name">{user?.name || 'EMS User'}</p>
              <p className="profile-summary__role">{user?.role ? user.role.toUpperCase() : 'USER'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-actions">
        <Link to="/employees" className="dashboard-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          Employees Directory
        </Link>
        <Link to="/attendance" className="dashboard-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Attendance Logs
        </Link>
        <Link to="/leaves" className="dashboard-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Leave Applications
        </Link>
        <Link to="/profile" className="dashboard-action dashboard-action--primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Corporate Profile
        </Link>
      </section>

      {error && (
        <div className="alert alert--error">
          <div className="alert__title">Failed to load console data</div>
          <div>{error}</div>
          <button className="alert__button" onClick={() => setRetryToggle((prev) => !prev)}>
            Retry Connection
          </button>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading corporate indicators...</p>
        </div>
      ) : (
        stats && (
          <>
            <section className="stats-grid">
              {summaryCards.map((card) => (
                <article className="stat-card" key={card.label}>
                  <div className="stat-card__main-info">
                    <div>
                      <p className="stat-card__label">{card.label}</p>
                      <h2 className="stat-card__value">{card.value ?? 0}</h2>
                    </div>
                    <div className={`stat-card__icon-wrapper stat-card__icon-wrapper--${card.accent}`}>
                      {card.icon}
                    </div>
                  </div>
                  <p className={`stat-card__note stat-card__note--${card.accent}`}>{card.note}</p>
                </article>
              ))}
            </section>

            {!stats.isEmployee && (
              <div className="dashboard-grid dashboard-grid--two">
                <section className="section-card">
                  <div className="section-card__header">
                    <div>
                      <h2>Department Distribution</h2>
                      <p>Company headcount categorized by department.</p>
                    </div>
                    <span className="section-badge">{totalDepartmentCount} Employees</span>
                  </div>
                  
                  <div className="chart-list">
                    {stats.departmentStats.map((dept) => {
                      const percent = totalDepartmentCount
                        ? Number(((dept.count / totalDepartmentCount) * 100).toFixed(0))
                        : 0;
                      return (
                        <div key={dept.department} className="chart-item">
                          <div className="chart-item__info">
                            <p className="chart-item__label">{dept.department}</p>
                            <p className="chart-item__meta">{dept.count} members ({percent}%)</p>
                          </div>
                          <div className="chart-bar">
                            <div className="chart-bar__fill" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="section-card">
                  <div className="section-card__header">
                    <div>
                      <h2>Recent Employees</h2>
                      <p>Latest additions to the registry directory.</p>
                    </div>
                    <span className="section-badge">New Joiners</span>
                  </div>

                  <div className="employee-list">
                    {recentEmployees.length > 0 ? (
                      recentEmployees.map((employee) => (
                        <article className="employee-card" key={employee._id || employee.email}>
                          <div>
                            <p className="employee-card__name">{employee.name}</p>
                            <p className="employee-card__meta">{employee.designation} · {employee.department}</p>
                          </div>
                          <span className={`employee-card__status employee-card__status--${employee.status}`}>
                            {employee.status}
                          </span>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">No employee records registered yet.</div>
                    )}
                  </div>
                </section>
              </div>
            )}

            <section className="section-card section-card--wide">
              <div className="section-card__header">
                <div>
                  <h2>Recent Leave Requests</h2>
                  <p>Corporate time-off and medical leave logs across your team workspace.</p>
                </div>
                <span className="section-badge">Latest Records</span>
              </div>

              {!stats.recentLeaves || stats.recentLeaves.length === 0 ? (
                <div className="empty-state">No leave applications registered.</div>
              ) : (
                <div className="table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        {!stats.isEmployee && <th>Employee Details</th>}
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentLeaves.map((leave) => (
                        <tr key={leave._id || leave.leaveType}>
                          {!stats.isEmployee && (
                            <td>
                              <div className="table-employee">
                                <strong>{leave.employee?.name || 'Unknown'}</strong>
                                <span>{leave.employee?.department} · {leave.employee?.designation}</span>
                              </div>
                            </td>
                          )}
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{leave.leaveType}</td>
                          <td>{formatDate(leave.startDate)}</td>
                          <td>{formatDate(leave.endDate)}</td>
                          <td title={leave.reason} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                            {leave.reason || '--'}
                          </td>
                          <td>
                            <span className={getStatusClass(leave.status)}>{leave.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )
      )}
    </div>
  );
};

export default Dashboard;
