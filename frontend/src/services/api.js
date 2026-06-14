import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const setBackendOffline = (offline) => {
  try { localStorage.setItem('backendOffline', offline ? 'true' : 'false'); } catch (e) {}
};

const getBackendOffline = () => {
  try { return localStorage.getItem('backendOffline') === 'true'; } catch (e) { return false; }
};

// Intercept axios responses to track backend availability globally.
axios.interceptors.response.use(
  (response) => {
    setBackendOffline(false);
    return response;
  },
  (error) => {
    if (!error.response) setBackendOffline(true);
    return Promise.reject(error);
  }
);

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const isBackendOffline = (err) => {
  // If we got a response from the server (even an error status), the backend is online/available.
  // If we didn't get any response (network timeout, connection refused), the backend is offline.
  const offline = !err.response;
  if (offline) {
    console.warn('Backend appears offline: no response received from', API_BASE_URL, err.message);
  } else {
    console.log('Backend request completed with status', err.response.status, 'for', err.config?.url);
  }
  return offline;
};

// Mock in-memory state for offline presentation
let mockEmployees = [
  { _id: 'e1', employeeId: 'EMP001', name: 'Alice Cooper', email: 'employee@ems.com', department: 'Engineering', designation: 'Software Engineer', status: 'active', phone: '9876543210', salary: 75000, joiningDate: '2025-01-15' },
  { _id: 'e2', employeeId: 'EMP002', name: 'Bob Dylan', email: 'bob@ems.com', department: 'Design', designation: 'UI Designer', status: 'active', phone: '9876543211', salary: 65000, joiningDate: '2025-03-10' },
  { _id: 'e3', employeeId: 'EMP003', name: 'Charlie Brown', email: 'charlie@ems.com', department: 'Marketing', designation: 'Marketing Exec', status: 'active', phone: '9876543212', salary: 50000, joiningDate: '2025-05-20' },
  { _id: 'e4', employeeId: 'EMP004', name: 'Jane Doe', email: 'admin@ems.com', department: 'Management', designation: 'System Admin', status: 'active', phone: '9876543213', salary: 90000, joiningDate: '2024-08-01' },
  { _id: 'e5', employeeId: 'EMP005', name: 'John Smith', email: 'hr@ems.com', department: 'HR', designation: 'HR Manager', status: 'active', phone: '9876543214', salary: 70000, joiningDate: '2024-11-12' },
  { _id: 'e6', employeeId: 'EMP006', name: 'Evan Peters', email: 'evan@ems.com', department: 'Engineering', designation: 'QA Lead', status: 'inactive', phone: '9876543215', salary: 60000, joiningDate: '2025-02-18' }
];

let mockAttendance = [
  { _id: 'a1', date: '2026-06-07', employee: { _id: 'e1', name: 'Alice Cooper', email: 'employee@ems.com', employeeId: 'EMP001' }, checkIn: '2026-06-07T09:00:00.000Z', checkOut: '2026-06-07T17:00:00.000Z', status: 'Present' },
  { _id: 'a2', date: '2026-06-07', employee: { _id: 'e2', name: 'Bob Dylan', email: 'bob@ems.com', employeeId: 'EMP002' }, checkIn: '2026-06-07T09:15:00.000Z', checkOut: '2026-06-07T17:30:00.000Z', status: 'Present' },
  { _id: 'a3', date: '2026-06-07', employee: { _id: 'e3', name: 'Charlie Brown', email: 'charlie@ems.com', employeeId: 'EMP003' }, checkIn: null, checkOut: null, status: 'Absent' },
  { _id: 'a4', date: '2026-06-06', employee: { _id: 'e1', name: 'Alice Cooper', email: 'employee@ems.com', employeeId: 'EMP001' }, checkIn: '2026-06-06T09:05:00.000Z', checkOut: '2026-06-06T17:00:00.000Z', status: 'Present' },
  { _id: 'a5', date: '2026-06-06', employee: { _id: 'e5', name: 'John Smith', email: 'hr@ems.com', employeeId: 'EMP005' }, checkIn: '2026-06-06T08:55:00.000Z', checkOut: '2026-06-06T17:05:00.000Z', status: 'Present' }
];

let mockLeaves = [
  { _id: 'l1', employee: { _id: 'e1', name: 'Alice Cooper', email: 'employee@ems.com', employeeId: 'EMP001' }, leaveType: 'Sick Leave', startDate: '2026-06-10', endDate: '2026-06-12', reason: 'Fever and cold', status: 'Pending', createdAt: '2026-06-07T12:00:00.000Z' },
  { _id: 'l2', employee: { _id: 'e2', name: 'Bob Dylan', email: 'bob@ems.com', employeeId: 'EMP002' }, leaveType: 'Annual Leave', startDate: '2026-06-15', endDate: '2026-06-20', reason: 'Family vacation', status: 'Pending', createdAt: '2026-06-07T10:00:00.000Z' },
  { _id: 'l3', employee: { _id: 'e3', name: 'Charlie Brown', email: 'charlie@ems.com', employeeId: 'EMP003' }, leaveType: 'Casual Leave', startDate: '2026-06-01', endDate: '2026-06-02', reason: 'Personal work', status: 'Approved', createdAt: '2026-06-01T08:00:00.000Z' }
];

// Helper to determine if we are logged in with mock token
const getLoggedInMockUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      const token = localStorage.getItem('token');
      if (token && token.startsWith('mock-')) {
        return u;
      }
    } catch (e) {
      console.error('Error parsing user storage:', e);
    }
  }
  return null;
};

export const apiService = {
  // 1. LOGIN
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      console.log('POST /api/auth/login succeeded', response.status, response.data?.email);
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        console.error('POST /api/auth/login failed with server response:', err.response?.status, err.response?.data);
        throw err;
      }
      console.warn('Backend login failed (offline), using fallback mock credentials', err.message);
      let mockUser = {
        _id: 'e1',
        name: 'Alice Cooper',
        email: email,
        role: 'employee',
        token: 'mock-employee-token'
      };

      if (email.toLowerCase().includes('admin')) {
        mockUser = {
          _id: 'e4',
          name: 'Jane Doe (Admin)',
          email: email,
          role: 'admin',
          token: 'mock-admin-token'
        };
      } else if (email.toLowerCase().includes('hr')) {
        mockUser = {
          _id: 'e5',
          name: 'John Smith (HR)',
          email: email,
          role: 'hr',
          token: 'mock-hr-token'
        };
      }

      try { localStorage.setItem('backendOffline', 'true'); } catch (e) {}
      return { data: mockUser, isMock: true };
    }
  },

  // 2. DASHBOARD SUMMARY
  getDashboardSummary: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/summary`, { headers: getHeaders() });
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        throw err;
      }
      console.warn('Backend getDashboardSummary failed (offline), using mock data', err);
      try { localStorage.setItem('backendOffline', 'true'); } catch(e) {}
      
      const loggedUser = getLoggedInMockUser() || { role: 'employee', email: 'employee@ems.com', name: 'Alice Cooper' };
      const isEmployee = loggedUser.role === 'employee';

      if (isEmployee) {
        const empProfile = mockEmployees.find(e => e.email === loggedUser.email) || mockEmployees[0];
        const empAttendance = mockAttendance.filter(a => a.employee?._id === empProfile._id || a.employee === empProfile._id);
        
        let present = 0, absent = 0, halfDay = 0;
        empAttendance.forEach(a => {
          if (a.status === 'Present') present++;
          else if (a.status === 'Absent') absent++;
          else if (a.status === 'Half-Day') halfDay++;
        });

        const empLeaves = mockLeaves.filter(l => l.employee?._id === empProfile._id || l.employee === empProfile._id);
        const pending = empLeaves.filter(l => l.status === 'Pending').length;
        const approved = empLeaves.filter(l => l.status === 'Approved').length;
        const rejected = empLeaves.filter(l => l.status === 'Rejected').length;
        
        return {
          data: {
            isEmployee: true,
            profileCompleted: true,
            profile: empProfile,
            attendanceStats: { present, absent, halfDay },
            leaveStats: { pending, approved, rejected, total: empLeaves.length },
            recentLeaves: empLeaves.slice(-5)
          },
          isMock: true
        };
      } else {
        const total = mockEmployees.length;
        const active = mockEmployees.filter(e => e.status === 'active').length;
        const inactive = total - active;

        const todayStr = new Date().toISOString().split('T')[0];
        const todayAttendance = mockAttendance.filter(a => a.date === todayStr);
        let present = todayAttendance.filter(a => a.status === 'Present').length;
        let absent = todayAttendance.filter(a => a.status === 'Absent').length;
        let halfDay = todayAttendance.filter(a => a.status === 'Half-Day').length;
        let unmarked = Math.max(active - todayAttendance.length, 0);

        const pending = mockLeaves.filter(l => l.status === 'Pending').length;
        const approved = mockLeaves.filter(l => l.status === 'Approved').length;
        const rejected = mockLeaves.filter(l => l.status === 'Rejected').length;

        const depts = {};
        mockEmployees.forEach(e => {
          depts[e.department] = (depts[e.department] || 0) + 1;
        });
        const departmentStats = Object.keys(depts).map(dept => ({
          department: dept,
          count: depts[dept]
        }));

        return {
          data: {
            isEmployee: false,
            employeeStats: { total, active, inactive },
            todayAttendance: { present, absent, halfDay, unmarked },
            leaveStats: { pending, approved, rejected },
            departmentStats,
            recentLeaves: mockLeaves.slice(-5)
          },
          isMock: true
        };
      }
    }
  },

  // 3. EMPLOYEES
  getEmployees: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`, { headers: getHeaders() });
      console.log('GET /api/employees succeeded', response.status, response.data?.length !== undefined ? `${response.data.length} employees` : 'no employee count');
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        console.error('GET /api/employees failed with server response:', err.response?.status, err.response?.data);
        throw err;
      }
      console.warn('Backend getEmployees failed (offline), using mock data', err.message);
      try { localStorage.setItem('backendOffline', 'true'); } catch(e) {}
      return { data: mockEmployees, isMock: true };
    }
  },

  createEmployee: async (payload) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/employees`, payload, { headers: getHeaders() });
      console.log('POST /api/employees succeeded', response.status, response.data);
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        console.error('POST /api/employees failed with server response:', err.response?.status, err.response?.data);
        throw err;
      }
      console.warn('Backend createEmployee failed (offline), adding to mock data locally:', err.message);
      const newEmp = {
        _id: 'e_' + Math.random().toString(36).substr(2, 9),
        ...payload
      };
      mockEmployees.unshift(newEmp);
      return { data: newEmp, isMock: true };
    }
  },

  // 4. ATTENDANCE
  getAttendanceRecords: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance`, { headers: getHeaders() });
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        throw err;
      }
      console.warn('Backend getAttendanceRecords failed (offline), using mock data', err);
      try { localStorage.setItem('backendOffline', 'true'); } catch(e) {}
      return {
        data: {
          total: mockAttendance.length,
          page: 1,
          limit: 25,
          records: mockAttendance
        },
        isMock: true
      };
    }
  },

  getAttendanceByEmployee: async (employeeId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/employee/${employeeId}`, { headers: getHeaders() });
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        throw err;
      }
      console.warn('Backend getAttendanceByEmployee failed (offline), using mock data', err);
      try { localStorage.setItem('backendOffline', 'true'); } catch(e) {}
      const records = mockAttendance.filter(a => a.employee?._id === employeeId || a.employee === employeeId);
      return { data: records, isMock: true };
    }
  },

  markAttendance: async (payload) => {
    try {
      console.log('POST /api/attendance payload:', payload);
      const response = await axios.post(`${API_BASE_URL}/attendance`, payload, { headers: getHeaders() });
      console.log('POST /api/attendance response:', response.status, response.data);
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        console.error('POST /api/attendance/mark error response:', err.response?.status, err.response?.data);
        throw err;
      }
      console.warn('Backend markAttendance failed (offline), updating mock data locally', err.message);
      const { employee, date, checkIn, checkOut, status } = payload;
      
      const empObj = mockEmployees.find(e => e._id === employee) || { _id: employee, name: 'Alice Cooper', email: 'employee@ems.com', employeeId: 'EMP001' };
      const normalizedDate = date ? date.split('T')[0] : new Date().toISOString().split('T')[0];
      
      let existing = mockAttendance.find(a => (a.employee?._id === employee || a.employee === employee) && a.date === normalizedDate);
      
      if (existing) {
        if (checkIn) existing.checkIn = checkIn;
        if (checkOut) existing.checkOut = checkOut;
        if (status) existing.status = status;
      } else {
        existing = {
          _id: 'a_' + Math.random().toString(36).substr(2, 9),
          date: normalizedDate,
          employee: empObj,
          checkIn: checkIn || null,
          checkOut: checkOut || null,
          status: status || 'Present'
        };
        mockAttendance.push(existing);
      }
      return { data: existing, isMock: true };
    }
  },

  // 5. LEAVES
  getLeaveRequests: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leaves`, { headers: getHeaders() });
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        throw err;
      }
      console.warn('Backend getLeaveRequests failed (offline), using mock data', err);
      try { localStorage.setItem('backendOffline', 'true'); } catch(e) {}
      return {
        data: {
          total: mockLeaves.length,
          page: 1,
          limit: 25,
          records: mockLeaves
        },
        isMock: true
      };
    }
  },

  applyLeave: async (payload) => {
    try {
      console.log('POST /api/leaves payload:', payload);
      const response = await axios.post(`${API_BASE_URL}/leaves`, payload, { headers: getHeaders() });
      console.log('POST /api/leaves response:', response.status, response.data);
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        console.error('POST /api/leaves error response:', err.response?.status, err.response?.data);
        throw err;
      }
      console.warn('Backend applyLeave failed (offline), adding to mock data locally', err.message);
      try { localStorage.setItem('backendOffline', 'true'); } catch(e) {}

      const loggedUser = getLoggedInMockUser() || { role: 'employee', email: 'employee@ems.com', name: 'Alice Cooper', _id: 'e1' };
      const empObj = mockEmployees.find(e => e.email === loggedUser.email) || mockEmployees[0];

      const newLeave = {
        _id: 'l_' + Math.random().toString(36).substr(2, 9),
        employee: empObj,
        leaveType: payload.leaveType,
        startDate: payload.startDate,
        endDate: payload.endDate,
        reason: payload.reason,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      mockLeaves.push(newLeave);
      return { data: newLeave, isMock: true };
    }
  },

  approveLeave: async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/leaves/${id}/approve`, {}, { headers: getHeaders() });
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        throw err;
      }
      console.warn('Backend approveLeave failed (offline), updating mock data locally', err);
      try { localStorage.setItem('backendOffline', 'true'); } catch(e) {}
      const leave = mockLeaves.find(l => l._id === id);
      if (leave) {
        leave.status = 'Approved';
      }
      return { data: leave, isMock: true };
    }
  },

  rejectLeave: async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/leaves/${id}/reject`, {}, { headers: getHeaders() });
      return { data: response.data, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        throw err;
      }
      console.warn('Backend rejectLeave failed (offline), updating mock data locally', err);
      try { localStorage.setItem('backendOffline', 'true'); } catch(e) {}
      const leave = mockLeaves.find(l => l._id === id);
      if (leave) {
        leave.status = 'Rejected';
      }
      return { data: leave, isMock: true };
    }
  },

  getProfile: async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('No user logged in.');
      const user = JSON.parse(userStr);
      
      const response = await axios.get(`${API_BASE_URL}/employees`, { headers: getHeaders() });
      const allEmployees = response.data;
      const emp = allEmployees.find(e => e.email === user.email);
      if (emp) {
        return { data: { ...user, ...emp }, isMock: false };
      }
      return { data: user, isMock: false };
    } catch (err) {
      if (!isBackendOffline(err)) {
        throw err;
      }
      console.warn('Backend getProfile failed (offline), using mock profile', err);
      try { localStorage.setItem('backendOffline', 'true'); } catch(e) {}
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : { role: 'employee', email: 'employee@ems.com', name: 'Alice Cooper' };
      const emp = mockEmployees.find(e => e.email === user.email) || mockEmployees[0];
      return { data: { ...user, ...emp }, isMock: true };
    }
  }
};
