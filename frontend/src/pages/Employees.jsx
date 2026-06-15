import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToggle, setRetryToggle] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

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
    // Generate a default employee ID based on current timestamp for quick entry
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
        phone: '9876543210', // default mock phone
        department,
        designation,
        salary: 50000,       // default mock salary
        joiningDate: new Date().toISOString(),
        status
      };
      
      const { data, isMock } = await apiService.createEmployee(payload);
      console.log('Employee creation result:', data);
      setIsOfflineMode(isMock);
      setSuccessMsg('Employee created successfully!');
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

  const getStatusStyle = (status) => {
    const isAct = status?.toLowerCase() === 'active';
    return {
      backgroundColor: isAct ? '#e6fffa' : '#fff5f5',
      color: isAct ? '#047487' : '#c53030',
      border: isAct ? '1px solid #b2f5ea' : '1px solid #feb2b2',
      padding: '0.25rem 0.6rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      display: 'inline-block',
      textTransform: 'capitalize'
    };
  };

  return (
    <div className="employees-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ margin: 0, color: '#0f172a', fontWeight: 'bold' }}>Employees Directory</h1>
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
        <button
          onClick={handleOpenModal}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
        >
          Add Employee
        </button>
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
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            ⚠️ Error Loading Employees
          </div>
          <div>{error}</div>
          <button
            onClick={() => setRetryToggle(prev => !prev)}
            style={{
              alignSelf: 'flex-start',
              padding: '0.4rem 0.8rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              marginTop: '0.5rem',
              fontSize: '0.85rem'
            }}
          >
            Retry Fetching Data
          </button>
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
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Fetching employees, please wait...</p>
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
                <th style={{ padding: '0.75rem' }}>Employee ID</th>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Department</th>
                <th style={{ padding: '0.75rem' }}>Designation</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
                    No employee records found.
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => (
                  <tr key={emp._id || index} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem', color: '#334155' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '500', color: '#0f172a' }}>{emp.employeeId}</td>
                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{emp.name}</td>
                    <td style={{ padding: '0.75rem' }}>{emp.email}</td>
                    <td style={{ padding: '0.75rem' }}>{emp.department}</td>
                    <td style={{ padding: '0.75rem' }}>{emp.designation}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={getStatusStyle(emp.status)}>
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
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 'bold' }}>👤 Add New Employee</h3>
            
            {addError && (
              <div style={{
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                border: '1px solid #fca5a5'
              }}>
                ⚠️ {addError}
              </div>
            )}

            <form onSubmit={handleSaveEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Employee ID *</label>
                <input
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="e.g. EMP001"
                  required
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@company.com"
                  required
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: 'white' }}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Designation *</label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: 'white' }}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#334155' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: 'white' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={addLoading}
                  style={{
                    padding: '0.6rem 1.25rem',
                    backgroundColor: '#e2e8f0',
                    color: '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#cbd5e1'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  style={{
                    padding: '0.6rem 1.25rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                  {addLoading ? 'Saving...' : 'Save Employee'}
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
