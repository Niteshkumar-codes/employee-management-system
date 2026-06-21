import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService } from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToggle, setRetryToggle] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Modal form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Software Engineer');
  const [status, setStatus] = useState('active');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const location = useLocation();

  // Dispatch employees list update for in-memory global search
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ems-data-employees', { detail: employees }));
  }, [employees]);

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
  }, [location, employees]);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Session expired or authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const { data, isMock } = await apiService.getEmployees();
        console.log('Employees fetched from backend. Record count:', data?.length);
        setEmployees(data);
        setIsOfflineMode(isMock);
      } catch (err) {
        console.error('Employees API Error:', err);
        let errMsg = 'Failed to fetch employees. Please try again.';
        if (err.response) {
          errMsg = err.response.data?.message || err.response.data?.error || `Server Error (${err.response.status}).`;
        } else if (err.message) {
          errMsg = err.message;
        }
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [retryToggle]);

  const handleOpenModal = () => {
    setEmpId('EMP' + Math.floor(Math.random() * 9000 + 1000));
    setName('');
    setEmail('');
    setDepartment('Engineering');
    setDesignation('Software Engineer');
    setStatus('active');
    setAddError('');
    setSuccessMsg('');
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    if (!empId || !name || !email || !department || !designation) {
      setAddError('Please fill in all required fields.');
      return;
    }

    setAddLoading(true);
    setAddError('');
    setSuccessMsg('');
    try {
      const payload = {
        employeeId: empId,
        name,
        email,
        phone: '9876543210',
        department,
        designation,
        salary: 50000,
        joiningDate: new Date().toISOString(),
        status
      };
      
      const { data, isMock } = await apiService.createEmployee(payload);
      console.log('Employee creation result:', data);
      setIsOfflineMode(isMock);
      setSuccessMsg('Employee created successfully!');
      
      const event = new CustomEvent('ems-notification', {
        detail: {
          type: 'employee',
          text: `New employee added: ${name} (${designation} - ${department})`,
          timestamp: Date.now()
        }
      });
      window.dispatchEvent(event);

      setShowAddModal(false);
      setRetryToggle(prev => !prev);
    } catch (err) {
      console.error('Employee create API Error:', err);
      let errMsg = 'Failed to add employee.';
      if (err.response) {
        errMsg = err.response.data?.message || err.response.data?.error || `Server Error (${err.response.status}).`;
      } else if (err.message) {
        errMsg = err.message;
      }
      setAddError(errMsg);
    } finally {
      setAddLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const isAct = status?.toLowerCase() === 'active';
    return isAct ? 'badge badge--success' : 'badge badge--danger';
  };

  // Client-side filtering logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = selectedDepartment === 'All' || emp.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="section-card section-card--wide" style={{ animation: 'fade-in-up 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>Employees Directory</h1>
          {isOfflineMode && <span className="badge badge--warning">Demo Fallback Mode</span>}
        </div>
        <button
          onClick={handleOpenModal}
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
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Employee
        </button>
      </div>

      {successMsg && (
        <div className="badge badge--success" style={{ padding: '0.75rem 1rem', width: '100%', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.9rem' }}>
          <span>✅</span> {successMsg}
        </div>
      )}

      {error && (
        <div className="alert" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            ⚠️ Error Loading Employees
          </div>
          <div>{error}</div>
          <button className="alert__button" onClick={() => setRetryToggle(prev => !prev)}>
            Retry Connection
          </button>
        </div>
      )}

      {/* Modern Search & Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        backgroundColor: 'var(--background)',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)'
      }}>
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '260px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by name, ID, email, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '2.5rem',
              width: '100%'
            }}
          />
        </div>

        {/* Department Filter */}
        <div style={{ minWidth: '200px' }}>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            style={{ width: '100%', cursor: 'pointer' }}
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Management">Management</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Fetching directory roster, please wait...</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '500' }}>
                    No employee records match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, index) => (
                  <tr key={emp._id || index} id={emp._id || emp.employeeId}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{emp.employeeId}</td>
                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>
                      <span className="badge badge--info">{emp.department}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{emp.designation}</td>
                    <td>
                      <span className={getStatusClass(emp.status)}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal Overlay */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem',
          animation: 'fade-in-up 0.25s ease'
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 800 }}>👤 Register Employee</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {addError && (
              <div className="badge badge--danger" style={{ padding: '0.75rem 1rem', width: '100%', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                ⚠️ {addError}
              </div>
            )}

            <form onSubmit={handleSaveEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Employee ID *</label>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="e.g. EMP001"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@company.com"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Designation *</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Senior Engineer">Senior Engineer</option>
                  <option value="UI Designer">UI Designer</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="HR Specialist">HR Specialist</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="QA Lead">QA Lead</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={addLoading}
                  style={{
                    padding: '0.625rem 1.25rem',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'var(--background)'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  style={{
                    padding: '0.625rem 1.25rem',
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
                  {addLoading ? 'Registering...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
