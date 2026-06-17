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
        return 'pill pill--approved';
      case 'Rejected':
        return 'pill pill--rejected';
      default:
        return 'pill pill--pending';
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
    : 'EM';

  const totalDepartmentCount = stats?.departmentStats?.reduce((sum, item) => sum + item.count, 0) || 0;

  const summaryCards = stats
    ? stats.isEmployee
      ? [
          {
            label: 'Present Days',
            value: stats.attendanceStats?.present ?? 0,
            note: `Half days ${stats.attendanceStats?.halfDay ?? 0} · Absent ${stats.attendanceStats?.absent ?? 0}`,
            accent: 'green'
          },
          {
            label: 'Pending Leaves',
            value: stats.leaveStats?.pending ?? 0,
            note: 'Awaiting approval',
            accent: 'amber'
          },
          {
            label: 'Approved Leaves',
            value: stats.leaveStats?.approved ?? 0,
            note: 'Confirmed time off',
            accent: 'blue'
          },
          {
            label: 'Total Requests',
            value: stats.leaveStats?.total ?? 0,
            note: `Rejected ${stats.leaveStats?.rejected ?? 0}`,
            accent: 'purple'
          }
        ]
      : [
          {
            label: 'Total Employees',
            value: stats.employeeStats?.total ?? 0,
            note: `Active ${stats.employeeStats?.active ?? 0} · Inactive ${stats.employeeStats?.inactive ?? 0}`,
            accent: 'blue'
          },
          {
            label: "Today's Attendance",
            value: stats.todayAttendance?.present ?? 0,
            note: `Absent ${stats.todayAttendance?.absent ?? 0} · Unmarked ${stats.todayAttendance?.unmarked ?? 0}`,
            accent: 'green'
          },
          {
            label: 'Pending Leaves',
            value: stats.leaveStats?.pending ?? 0,
            note: `Approved ${stats.leaveStats?.approved ?? 0}`,
            accent: 'amber'
          },
          {
            label: 'Active Employees',
            value: stats.employeeStats?.active ?? 0,
            note: `${stats.employeeStats?.inactive ?? 0} inactive`,
            accent: 'purple'
          }
        ]
    : [];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero__content">
          <span className="eyebrow">Welcome back</span>
          <h1>Professional EMS Control Center</h1>
          <p className="dashboard-hero__text">
            Modern employee management insights with fast navigation, smart reporting, and clear next
            actions.
          </p>
        </div>

        <div className="dashboard-hero__side">
          <div className={`status-chip ${isOfflineMode ? 'status-chip--warning' : 'status-chip--online'}`}>
            {isOfflineMode ? 'Demo Mode' : 'Live Dashboard'}
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
          View Employees
        </Link>
        <Link to="/attendance" className="dashboard-action">
          Attendance Tracker
        </Link>
        <Link to="/leaves" className="dashboard-action">
          Leave Requests
        </Link>
        <Link to="/profile" className="dashboard-action dashboard-action--primary">
          My Profile
        </Link>
      </section>

      {error && (
        <div className="alert alert--error">
          <div className="alert__title">Error loading dashboard</div>
          <div>{error}</div>
          <button className="alert__button" onClick={() => setRetryToggle((prev) => !prev)}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        stats && (
          <>
            <section className="stats-grid">
              {summaryCards.map((card) => (
                <article className="stat-card" key={card.label}>
                  <div>
                    <p className="stat-card__label">{card.label}</p>
                    <h2 className="stat-card__value">{card.value ?? 0}</h2>
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
                      <p>Team breakdown by department.</p>
                    </div>
                    <span className="section-badge">{totalDepartmentCount} employees</span>
                  </div>
                  <div className="chart-list">
                    {stats.departmentStats.map((dept) => {
                      const percent = totalDepartmentCount
                        ? Number(((dept.count / totalDepartmentCount) * 100).toFixed(0))
                        : 0;
                      return (
                        <div key={dept.department} className="chart-item">
                          <div>
                            <p className="chart-item__label">{dept.department}</p>
                            <p className="chart-item__meta">{dept.count} employees</p>
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
                      <p>Latest joiners and team members.</p>
                    </div>
                    <span className="section-badge">Top 5</span>
                  </div>

                  <div className="employee-list">
                    {recentEmployees.length > 0 ? (
                      recentEmployees.map((employee) => (
                        <article className="employee-card" key={employee._id || employee.email}>
                          <div>
                            <p className="employee-card__name">{employee.name}</p>
                            <p className="employee-card__meta">{employee.designation} · {employee.department}</p>
                          </div>
                          <span className={`employee-card__status employee-card__status--${employee.status}`}>{employee.status}</span>
                        </article>
                      ))
                    ) : (
                      <div className="empty-state">No recent employees available.</div>
                    )}
                  </div>
                </section>
              </div>
            )}

            <section className="section-card section-card--wide">
              <div className="section-card__header">
                <div>
                  <h2>Recent Leave Requests</h2>
                  <p>Review the most recent leave activity across the organization.</p>
                </div>
                <span className="section-badge">Latest 5</span>
              </div>

              {!stats.recentLeaves || stats.recentLeaves.length === 0 ? (
                <div className="empty-state">No recent leave requests found.</div>
              ) : (
                <div className="table-wrap">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        {!stats.isEmployee && <th>Employee</th>}
                        <th>Leave Type</th>
                        <th>Start</th>
                        <th>End</th>
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
                          <td>{leave.leaveType}</td>
                          <td>{formatDate(leave.startDate)}</td>
                          <td>{formatDate(leave.endDate)}</td>
                          <td title={leave.reason}>{leave.reason || '--'}</td>
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
